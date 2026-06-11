import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cmdSettingsPath = path.join(process.cwd(), 'database', 'cmd.json');

function loadCmdSettings() {
    try {
        return JSON.parse(fs.readFileSync(cmdSettingsPath, 'utf8'));
    } catch {
        return {};
    }
}

export default {
    command: 'help',
    category: 'misc',
    get description() { return L('misc.help.desc'); },
    syntax: 'help [command/category]',
    subcommand: '',
    aliases: ['menu'],
    async run(context) {
        const { m, reply, args, prefix, isCreator, command } = context;

        // Category display names (Localized)
        const categoryNames = {
            group: L('misc.help.categories.group'),
            user: L('misc.help.categories.user'),
            economy: L('misc.help.categories.economy'),
            minigame: L('misc.help.categories.minigame'),
            gacha: L('misc.help.categories.gacha'),
            owner: L('misc.help.categories.owner'),
            misc: L('misc.help.categories.misc'),
            tools: L('misc.help.categories.tools'),
            ai: L('misc.help.categories.ai'),
            search: L('misc.help.categories.search'),
            download: L('misc.help.categories.download'),
            stalker: L('misc.help.categories.stalker'),
            anime: L('misc.help.categories.anime')
        };

        const query = args[0]?.toLowerCase();
        const pluginLoader = global._pluginLoader;
        
        if (!pluginLoader) return reply(L('owner.cmd.noLoader'));

        // Cek jika command yang dipanggil adalah salah satu alias menu kategori
        const categoryMap = {
            botmenu: 'user',
            groupmenu: 'group',
            searchmenu: 'search',
            downloadmenu: 'download',
            quotesmenu: 'quotes',
            toolsmenu: 'tools',
            aimenu: 'ai',
            randommenu: 'random',
            stalkermenu: 'stalker',
            animemenu: 'anime',
            gamemenu: 'minigame',
            funmenu: 'misc',
            ownermenu: 'owner'
        };

        const targetCategory = categoryMap[command] || (Object.values(categoryMap).includes(query) ? query : null);

        // ========== DAFTAR COMMAND (GENERAL ATAU PER KATEGORI) ==========
        if (!query || targetCategory) {
            const categories = {};
            const cmdSettings = loadCmdSettings();
            
            for (const [cmd, plugin] of pluginLoader.plugins) {
                if (plugin.isOwner && !isCreator) continue;
                
                const cat = plugin.category || 'misc';
                // Filter jika ada kategori target
                if (targetCategory && cat !== targetCategory) continue;

                const settings = cmdSettings[cmd] || {};

                // Jika didisable dan bukan owner, hilangkan dari list
                if (settings.disabled && !isCreator) continue;

                if (!categories[cat]) categories[cat] = [];
                
                let display = cmd;
                // Jika disabled (hanya terlihat oleh owner) atau maintenance, dimiringkan
                if (settings.disabled || settings.maintenance) {
                    display = `_~${cmd}~_`;
                }
                categories[cat].push(display);
            }
            
            // Localized Title
            const title = targetCategory 
                ? L('misc.help.labels.categoryMenu', (categoryNames[targetCategory] || targetCategory).replace('- ', ''))
                : L('misc.help.labels.allCommands');

            let text = L('misc.help.title', title) + '\n\n';
            const sortedCategories = Object.entries(categories).sort((a, b) => b[1].length - a[1].length);
            
            if (sortedCategories.length === 0 && targetCategory) return reply(L('misc.help.catNotFound', targetCategory));

            for (const [cat, cmds] of sortedCategories) {
                const name = categoryNames[cat] || cat;
                text += `${name}\n`;
                text += `> ` + cmds.sort().join(', ') + '\n\n';
            }
            text += L('misc.help.usage', prefix);
            return reply(text);
        }

        // ========== DETAIL COMMAND ==========
        const plugin = pluginLoader.getPlugin(query);
        if (!plugin) return reply(L('owner.cmd.notFound', query));
        if (plugin.isOwner && !isCreator) return reply(L('mess.owner'));
        
        const settings = loadCmdSettings()[plugin.command] || {};
        const isDisabled = settings.disabled;
        const isMaintenance = settings.maintenance;
        const cooldown = settings.cooldown || 0;
        const minTrust = settings.minTrust || 0;
        const costYen = settings.costYen || 0;
        const aliases = plugin.aliases?.length ? `\n- *Alias:* ${plugin.aliases.join(', ')}` : '';
        const syntax = plugin.syntax || `${prefix}${plugin.command}`;
        const description = plugin.description || L('misc.help.noDesc');
        
        let text = L('misc.help.detailTitle') + '\n\n';
        text += `- *${L('misc.help.labels.command')}*: ${plugin.command}${aliases}\n`;
        text += `- *${L('misc.help.labels.usage')}*: ${prefix}${syntax}\n`;
        if (plugin.subcommand) text += `- *${L('misc.help.labels.subcommand')}*: ${plugin.subcommand}\n`;
        if (cooldown > 0) text += `- *${L('misc.help.labels.cooldown')}*: ${cooldown} ${L('misc.help.labels.seconds')}\n`;
        if (minTrust > 0) text += `- *${L('misc.help.labels.trust')}*: ${minTrust}%\n`;
        if (costYen > 0) text += `- *${L('misc.help.labels.cost')}*: ${costYen}¥\n\n`;
        
        if (isDisabled) text += `*${L('misc.help.labels.disabled')}*\n`;
        else if (isMaintenance) text += `${L('misc.help.labels.maintenance')}\n`;
        
        text += `\n${description}`;
        
        await reply(text);
    }
};