import fs from 'fs';
import path from 'path';

const cmdFile = path.join(process.cwd(), 'database', 'cmd.json');

function loadCmd() {
    if (!fs.existsSync(cmdFile)) return {};
    try {
        return JSON.parse(fs.readFileSync(cmdFile, 'utf8'));
    } catch {
        return {};
    }
}

function saveCmd(data) {
    const dir = path.dirname(cmdFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cmdFile, JSON.stringify(data, null, 2));
}

// Konversi durasi seperti "30d1h20m30s" ke milliseconds
function parseDuration(durStr) {
    const regex = /(\d+)([dhms])/g;
    let ms = 0;
    let match;
    while ((match = regex.exec(durStr)) !== null) {
        const val = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 'd': ms += val * 24 * 60 * 60 * 1000; break;
            case 'h': ms += val * 60 * 60 * 1000; break;
            case 'm': ms += val * 60 * 1000; break;
            case 's': ms += val * 1000; break;
        }
    }
    return ms;
}

export default {
    command: 'cmd',
    category: 'owner',
    get description() { return L('owner.cmd.desc'); },
    syntax: 'cmd <path>',
    subcommand: ['list, manage, disable, enable, maintenance, ban, unban'],
    aliases: ['command'],
    isOwner: true,
    async run(context) {
        const { m, reply, args, quoted, sender, prefix, command } = context;
        const sub = args[0]?.toLowerCase();
        let cmdName = args[1]?.toLowerCase();
        
        // Resolve command utama
        if (cmdName && sub !== 'list') {
            const pluginLoader = global._pluginLoader;
            if (!pluginLoader) return reply(L('owner.cmd.noLoader'));
            const plugin = pluginLoader.getPlugin(cmdName);
            if (plugin) cmdName = plugin.command;
            else return reply(L('owner.cmd.notFound', args[1]));
        }
        
        const settings = loadCmd();
        
        // ========== BAN ==========
if (sub === 'ban') {
    if (!cmdName) return reply(L('owner.cmd.usageBan'));
    let targetId = null;
    let durasiStr = null;
    let reason = '';

    // Kasus 1: Reply pesan
    if (quoted && quoted.sender) {
        targetId = quoted.sender;
        durasiStr = args[2];
        reason = args.slice(3).join(' ') || 'Tidak ada alasan';
    }
    // Kasus 2: Mention (tag)
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetId = m.mentionedJid[0];
        durasiStr = args[3];
        reason = args.slice(4).join(' ') || 'Tidak ada alasan';
    }
    // Kasus 3: ID atau vanity sebagai argumen biasa
    else if (args[2]) {
        const findUser = (query) => {
            const users = global.rpgDB?.users || {};
            for (const jid in users) {
                const u = users[jid];
                if (String(u.userId) === query) return jid;
                if (u.vanity && u.vanity.toLowerCase() === query.toLowerCase()) return jid;
            }
            return null;
        };
        const found = findUser(args[2]);
        if (found) {
            targetId = found;
            durasiStr = args[3];
            reason = args.slice(4).join(' ') || 'Tidak ada alasan';
        } else {
            return reply(L('owner.cmd.targetNotFound'));
        }
    } else {
        return reply(L('owner.cmd.usageBan'));
    }

    if (!durasiStr) return reply(L('owner.cmd.invalidDuration'));

    // Parse durasi
    const parseDuration = (durStr) => {
        if (!durStr || typeof durStr !== 'string') return 0;
        durStr = durStr.trim().toLowerCase();
        if (/^\d+[dhms]$/.test(durStr)) {
            const val = parseInt(durStr.slice(0, -1));
            const unit = durStr.slice(-1);
            switch (unit) {
                case 'd': return val * 86400000;
                case 'h': return val * 3600000;
                case 'm': return val * 60000;
                case 's': return val * 1000;
                default: return 0;
            }
        }
        if (/^\d+$/.test(durStr)) return parseInt(durStr) * 1000;
        return 0;
    };
    const durasiMs = parseDuration(durasiStr);
    if (durasiMs <= 0) return reply(L('owner.cmd.invalidDuration'));

    const expired = Date.now() + durasiMs;
    if (!settings[cmdName]) settings[cmdName] = {};
    if (!settings[cmdName].banned) settings[cmdName].banned = {};
    settings[cmdName].banned[targetId] = {
        expired: expired,
        reason: reason,
        bannedAt: Date.now()
    };
    saveCmd(settings);

    const user = global.rpgDB?.users[targetId];
    const userName = user?.name || targetId.split('@')[0];
    return reply(L('owner.cmd.banSuccess', userName, cmdName, durasiStr, reason));
}
        
        // ========== UNBAN ==========
        else if (sub === 'unban') {
            if (!cmdName) return reply(L('owner.cmd.usageUnban'));
            let targetId = null;
            if (quoted && quoted.sender) {
                targetId = quoted.sender;
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetId = m.mentionedJid[0];
            } else if (args[2]) {
                const findUser = (query) => {
                    const users = global.rpgDB?.users || {};
                    for (const jid in users) {
                        const u = users[jid];
                        if (String(u.userId) === query) return jid;
                        if (u.vanity && u.vanity.toLowerCase() === query.toLowerCase()) return jid;
                    }
                    return null;
                };
                const maybeJid = findUser(args[2]);
                if (maybeJid) targetId = maybeJid;
                else return reply(L('owner.cmd.targetNotFound'));
            } else {
                return reply(L('system.usage', prefix, command));
            }
            if (settings[cmdName]?.banned?.[targetId]) {
                delete settings[cmdName].banned[targetId];
                saveCmd(settings);
                return reply(L('owner.cmd.unbanSuccess', cmdName));
            } else {
                return reply(L('owner.cmd.notBanned'));
            }
        }
        
        // ========== MAINTENANCE ==========
        else if (sub === 'maintenance') {
            if (!cmdName) return reply(L('owner.cmd.usageMaint'));
            const state = args[2]?.toLowerCase();
            if (!['on', 'off'].includes(state)) return reply(L('owner.cmd.usageMaint'));
            if (!settings[cmdName]) settings[cmdName] = {};
            settings[cmdName].maintenance = (state === 'on');
            if (state === 'on') {
                const reason = args.slice(3).join(' ') || 'Perintah ini sedang dalam perbaikan. Coba lagi nanti.';
                settings[cmdName].maintenanceReason = reason;
            } else {
                delete settings[cmdName].maintenanceReason;
            }
            saveCmd(settings);
            return reply(state === 'on' ? L('owner.cmd.maintOn', cmdName) : L('owner.cmd.maintOff', cmdName));
        }
        
        if (sub === 'manage') {
            const valueArg = args[2];
            if (!valueArg) return reply(L('system.usage', prefix, command));
            const parts = valueArg.split('|');
            if (parts.length !== 3) return reply(L('system.usage', prefix, command));
            const cd = parseInt(parts[0]);
            const yen = parseFloat(parts[1]);
            const tf = parseInt(parts[2]);
            if (isNaN(cd) || isNaN(yen) || isNaN(tf)) return reply(L('system.usage', prefix, command));
            if (!settings[cmdName]) settings[cmdName] = {};
            settings[cmdName].cooldown = cd;
            settings[cmdName].costYen = yen;
            settings[cmdName].minTrust = tf;
            saveCmd(settings);
            return reply(L('owner.cmd.manageSuccess', cmdName, cd, yen, tf));
        }
        else if (sub === 'disable') {
            const reason = args.slice(2).join(' ') || 'Tidak ada alasan';
            if (!settings[cmdName]) settings[cmdName] = {};
            settings[cmdName].disabled = true;
            settings[cmdName].disabledReason = reason;
            saveCmd(settings);
            return reply(L('owner.cmd.disableSuccess', cmdName, reason));
        }
        else if (sub === 'enable') {
            if (!settings[cmdName]) settings[cmdName] = {};
            settings[cmdName].disabled = false;
            delete settings[cmdName].disabledReason;
            saveCmd(settings);
            return reply(L('owner.cmd.enableSuccess', cmdName));
        }
        else if (sub === 'list') {
            const list = Object.keys(settings).map(cmd => {
                const cfg = settings[cmd];
                return `- ${cmd}: CD = ${cfg.cooldown || '-'}d | Yen = ${cfg.costYen || '-'} | TF = ${cfg.minTrust || '-'}, ${cfg.disabled ? 'Disabled' : 'Enabled'}`;
            }).join('\n');
            return reply(L('owner.cmd.listTitle', list || 'Tidak ada pengaturan tersedia.'));
        }
        
        else {
            return reply(L('system.usage', prefix, command));
        }
    }
};