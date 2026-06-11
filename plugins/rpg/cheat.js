import { getRPGUser, saveRPG, findRPGUserByQuery } from '../../lib/rpg.js';
import fs from 'fs';
import path from 'path';

const gtListPath = path.join(process.cwd(), 'database', 'gt-list.json');
let gtList = [];
try {
    gtList = JSON.parse(fs.readFileSync(gtListPath, 'utf8'));
} catch (e) {}

export default {
    command: 'c',
    category: 'owner',
    get description() { return L('rpg.cheat.desc'); },
    syntax: '.c <subcommand> <field/type> <amount/id> [target]',
    subcommand: 'set, add, give',
    aliases: ['cheat'],
    isOwner: true,
    async run(context) {
        const { m, reply, args, prefix, command, sender, pushName } = context;
        if (args.length < 2) {
            return reply(L('system.usage', prefix, command));
        }

        const mode = args[0].toLowerCase();

        // ========== SUBCOMMAND: GIVE ==========
        if (mode === 'give') {
            if (args.length < 3) return reply(L('system.usage', prefix, command));
            
            const type = args[1].toLowerCase();
            const idInput = args[2].toUpperCase();
            
            // Mencari target user (Logic: explicit > reply > self)
            let targetUser;
            const targetQuery = args[3];
            if (targetQuery) {
                targetUser = findRPGUserByQuery(targetQuery);
                if (!targetUser) return reply(L('rpg.cheat.userNotFound'));
            } else if (m.quoted && m.quoted.sender) {
                targetUser = getRPGUser(m.quoted.sender);
            } else {
                targetUser = getRPGUser(sender, pushName);
            }

            if (type === 'gt') {
                const card = gtList.find(c => (c.displayId && c.displayId.toUpperCase() === idInput) || String(c.id) === idInput);
                if (!card) return reply(L('plugins.gt.notFound'));
                
                if (!targetUser.gtInv) targetUser.gtInv = [];
                targetUser.gtInv.push({ id: card.id, stars: card.stars });
                saveRPG();
                
                return reply(L('rpg.cheat.give', card.name, card.stars, targetUser.name, targetUser.userId));
            } else {
                return reply("Tipe tidak valid. Saat ini hanya mendukung 'gt'.");
            }
        }

        // ========== SUBCOMMAND: SET/ADD ==========
        if (!['set', 'add'].includes(mode)) {
            return reply(L('rpg.cheat.invalidMode'));
        }

        if (args.length < 3) return reply(L('system.usage', prefix, command));

        const fieldRaw = args[1].toLowerCase();
        const amount = Number(args[2]);
        if (isNaN(amount)) return reply(L('rpg.cheat.invalidAmount'));
        if (mode === 'set' && amount < 0) return reply(L('rpg.cheat.invalidAmountNeg'));

        const fieldMap = {
            yen: 'yen',
            xp: 'xp',
            exp: 'xp',
            level: 'level',
            lvl: 'level',
            msg: 'messages',
            message: 'messages',
            messages: 'messages',
            cmd: 'commands',
            command: 'commands',
            commands: 'commands',
            warn: 'warns',
            warns: 'warns',
            gacha: 'gacha',
            reinc: 'reincarnation',
            reincarnation: 'reincarnation',
            tf: 'trustFactor',
            trust: 'trustFactor',
            trustfactor: 'trustFactor',
            role: 'role'
        };

        const field = fieldMap[fieldRaw];
        if (!field) {
            return reply(L('rpg.cheat.invalidField'));
        }

        // Cari target user
        let targetUser;
        const targetQuery = args[3];
        if (targetQuery) {
            targetUser = findRPGUserByQuery(targetQuery);
            if (!targetUser) return reply(L('rpg.cheat.userNotFound'));
        } else if (m.quoted && m.quoted.sender) {
            targetUser = getRPGUser(m.quoted.sender);
        } else {
            targetUser = getRPGUser(m.sender, m.pushName);
        }

        // Proses perubahan
        if (field === 'level') {
            let newLevel = mode === 'set' ? amount : (targetUser.level || 1) + amount;
            newLevel = Math.max(1, Math.floor(newLevel));
            targetUser.level = newLevel;
        } else if (field === 'trustFactor') {
            let newTf = mode === 'set' ? amount : (targetUser.trustFactor || 0) + amount;
            newTf = Math.min(100, Math.max(0, newTf));
            targetUser.trustFactor = newTf;
        } else {
            if (mode === 'set') {
                targetUser[field] = amount;
            } else {
                targetUser[field] = (targetUser[field] || 0) + amount;
            }
            const intFields = ['xp', 'messages', 'commands', 'warns', 'gacha', 'reincarnation'];
            if (intFields.includes(field)) {
                targetUser[field] = Math.max(0, Math.floor(targetUser[field]));
            }
            if (field === 'yen') targetUser[field] = Math.max(0, targetUser[field]);
        }

        saveRPG();

        const modeWords = { set: L('rpg.cheat.modes.set'), add: L('rpg.cheat.modes.add') };
        const action = modeWords[mode] || mode;
        const fieldDisplay = field.charAt(0).toUpperCase() + field.slice(1);
        const userName = targetUser.name;
        const userId = targetUser.userId;
        const vanity = targetUser.vanity ? ` (@${targetUser.vanity})` : '';
        const newValue = targetUser[field];
        const amountText = mode === 'set' ? `${L('rpg.cheat.labels.to')} ${newValue}` : `${L('rpg.cheat.labels.by')} ${amount} (Total: ${newValue})`;

        await reply(L('rpg.cheat.success', action, fieldDisplay, userName, userId, vanity, amountText));
    }
};