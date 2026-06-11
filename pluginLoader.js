import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './lib/logger.js';

const cmdSettingsPath = path.join(process.cwd(), 'database', 'cmd.json');

function loadCmdSettings() {
    if (!fs.existsSync(cmdSettingsPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(cmdSettingsPath, 'utf8'));
    } catch { return {}; }
}

function saveCmdSettings(data) {
    const dir = path.dirname(cmdSettingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cmdSettingsPath, JSON.stringify(data, null, 2));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PluginLoader {
    constructor() {
        this.plugins = new Map();
        this.aliases = new Map();
        this.pendingReloads = new Map();
        this.failedPlugins = []; // daftar plugin gagal
    }
    
    getCommandByAlias(alias) {
        for (let [cmd, plugin] of this.plugins) {
            if (cmd === alias) return cmd;
            if (plugin.aliases && plugin.aliases.includes(alias)) return cmd;
        }
        return null;
    }

    getAllJSFiles(dir, arrayOfFiles = []) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                this.getAllJSFiles(fullPath, arrayOfFiles);
            } else if (file.endsWith('.js') && !file.startsWith('_')) {
                arrayOfFiles.push(fullPath);
            }
        }
        return arrayOfFiles;
    }

    async loadPluginFromFile(filePath, retryCount = 0) {
        try {
            const fileUrl = pathToFileURL(filePath).href + '?t=' + Date.now();
            const module = await import(fileUrl);
            const plugin = module.default;
            if (!plugin || typeof plugin !== 'object') {
                throw new Error('Plugin does not have a default export object');
            }
            const command = plugin.command;
            if (!command) {
                throw new Error('Plugin does not have a command property');
            }
            // Hapus yang lama jika ada
            if (this.plugins.has(command)) {
                const old = this.plugins.get(command);
                if (old.aliases) {
                    for (const alias of old.aliases) {
                        if (this.aliases.get(alias) === command) this.aliases.delete(alias);
                    }
                }
                this.plugins.delete(command);
            }
            this.plugins.set(command, {
                ...plugin,
                file: filePath,
            });
            if (plugin.aliases && Array.isArray(plugin.aliases)) {
                for (const alias of plugin.aliases) {
                    this.aliases.set(alias, command);
                }
            }
            return true;
        } catch (err) {
            if (retryCount < 3) {
                await new Promise(resolve => setTimeout(resolve, 150));
                return this.loadPluginFromFile(filePath, retryCount + 1);
            }
            const relativePath = path.relative(path.join(__dirname, 'plugins'), filePath);
            this.failedPlugins.push({
                file: relativePath,
                error: err.message
            });
            for (const [cmd, p] of this.plugins.entries()) {
                if (p.file === filePath) {
                    this.plugins.delete(cmd);
                    break;
                }
            }
            return false;
        }
    }

    async loadAllPlugins() {
        const pluginsDir = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsDir)) {
            logger.warn('PLUGINS', 'Plugins folder not found, please create plugins/ folder.');
            return;
        }
        this.failedPlugins = [];
        const files = this.getAllJSFiles(pluginsDir);
        let successCount = 0;
        for (const file of files) {
            const ok = await this.loadPluginFromFile(file);
            if (ok) successCount++;
        }
        
        if (this.failedPlugins.length === 0) {
            logger.success('PLUGINS', `Successfully loaded all plugins (${successCount} plugins)`);
        } else {
            logger.warn('PLUGINS', `Plugin load: ${successCount} success, ${this.failedPlugins.length} failed`);
            for (const fail of this.failedPlugins) {
                logger.error('PLUGINS', `${fail.file}: ${fail.error}`);
            }
        }
    }

    startWatching() {
        const pluginsDir = path.join(__dirname, 'plugins');
        if (!fs.existsSync(pluginsDir)) return;
        fs.watch(pluginsDir, { recursive: true }, (eventType, filename) => {
            if (!filename || !filename.endsWith('.js')) return;
            const fullPath = path.join(pluginsDir, filename);
            if (this.pendingReloads.has(fullPath)) {
                clearTimeout(this.pendingReloads.get(fullPath));
            }
            const timeout = setTimeout(async () => {
                this.pendingReloads.delete(fullPath);
                if (!fs.existsSync(fullPath)) {
                    for (const [cmd, plugin] of this.plugins.entries()) {
                        if (plugin.file === fullPath) {
                            this.plugins.delete(cmd);
                            logger.info('PLUGINS', `Unloaded plugin: ${cmd} (file deleted)`);
                            break;
                        }
                    }
                    return;
                }
                const relativePath = path.relative(pluginsDir, fullPath);
                const ok = await this.loadPluginFromFile(fullPath);
                if (!ok) {
                    logger.error('PLUGINS', `Failed to reload plugin: ${relativePath}`);
                } else {
                    logger.success('PLUGINS', `Reloaded: ${relativePath}`);
                }
            }, 300);
            this.pendingReloads.set(fullPath, timeout);
        });
        logger.info('PLUGINS', 'Auto-reload enabled (debounced & retry)');
    }

    getPlugin(cmd) {
        if (this.plugins.has(cmd)) return this.plugins.get(cmd);
        const originalCmd = this.aliases.get(cmd);
        if (originalCmd) return this.plugins.get(originalCmd);
        return null;
    }

    async execute(command, context) {
        const plugin = this.getPlugin(command);
        if (!plugin) return false;
        
        const mainCmd = plugin.command;
        const cmdSettings = loadCmdSettings();
        const settings = cmdSettings[mainCmd] || {};
        
        // 1. Cek maintenance
        if (settings.maintenance && !context.isCreator) {
            await context.reply(L('system.cmd.maintenance'));
            return true;
        }
        
        // 2. Cek disabled
        if (settings.disabled) {
            await context.reply(L('system.cmd.disabled', mainCmd, settings.disabledReason || '-'));
            return true;
        }
        
        // 3. Cek ban per user
        if (settings.banned && settings.banned[context.sender]) {
            const ban = settings.banned[context.sender];
            if (ban.expired > Date.now()) {
                const remaining = Math.ceil((ban.expired - Date.now()) / 1000);
                const hours = Math.floor(remaining / 3600);
                const minutes = Math.floor((remaining % 3600) / 60);
                const seconds = remaining % 60;
                const timeStr = `${hours}h ${minutes}m ${seconds}s`;
                await context.reply(L('system.cmd.banned', mainCmd, timeStr, ban.reason));
                return true;
            } else {
                delete settings.banned[context.sender];
                saveCmdSettings(cmdSettings);
            }
        }
        
        // 4. Min Trust
        if (settings.minTrust && context.user?.trustFactor !== undefined && context.user.trustFactor < settings.minTrust) {
            await context.reply(L('system.cmd.lowTrust'));
            return true;
        }
        
        // Cooldown
        if (settings.cooldown) {
            const key = `${command}_${context.sender}`;
            const now = Date.now();
            if (!global.__cmdCooldown) global.__cmdCooldown = {};
            const last = global.__cmdCooldown[key] || 0;
            const remain = (last + settings.cooldown * 1000) - now;
            if (remain > 0) {
                await context.reply(L('system.cmd.cooldown', Math.ceil(remain/1000)));
                return true;
            }
            global.__cmdCooldown[key] = now;
        }
        
        // Biaya Yen
        if (settings.costYen && context.user?.yen !== undefined) {
            if (context.user.yen < settings.costYen) {
                await context.reply(L('system.cmd.noYen'));
                return true;
            }
            context.user.yen -= settings.costYen;
            if (typeof context.saveRPG === 'function') context.saveRPG();
        }
        
        // Lanjut eksekusi plugin
        try {
            await plugin.run(context);
            return true;
        } catch (err) {
            console.error(`Error plugin ${plugin.command}:`, err);
            await context.reply(L('system.cmd.error', err.message));
            return true;
        }
    }

    async onMessage(context) {
        for (const [cmd, plugin] of this.plugins) {
            if (plugin.onMessage && typeof plugin.onMessage === 'function') {
                try {
                    await plugin.onMessage(context);
                } catch (err) {
                    console.error(`Error in onMessage plugin ${cmd}:`, err);
                }
            }
        }
    }
}

export default PluginLoader;