import { getRPGUser, reincarnateUser } from '../../lib/rpg.js';

export default {
    command: 'rein',
    category: 'user',
    get description() { return L('rpg.rein.desc'); },
    syntax: 'rein',
    aliases: ['reincarnation', 'reinkarnasi', 'rebirth'],
    async run(context) {
        const { m, reply, naze, sender, pushName, prefix, command, args } = context;
        const user = getRPGUser(sender, pushName);
        
        if (user.level < 8) {
            return reply(L('rpg.rein.minLevel'));
        }

        // Handle Konfirmasi via Button (atau manual flag)
        if (args[0] === '--confirm') {
            const result = reincarnateUser(sender);
            if (!result.success) return reply(L('rpg.rein.failed', result.msg));
            
            return await reply(L('rpg.rein.success', user.name, result.role));
        }

        if (args[0] === '--cancel') {
            return reply(L('rpg.rein.canceled'));
        }

        // Kirim Pesan Konfirmasi dengan Tombol
        let confirmText = L('rpg.rein.confirmTitle');
        
        await naze.sendButtonMsg(m.chat, {
            text: confirmText,
            footer: L('rpg.rein.confirmFooter'),
            buttons: [
                { buttonId: `${prefix + command} --confirm`, buttonText: { displayText: L('rpg.rein.btnConfirm') }, type: 1 },
                { buttonId: `${prefix + command} --cancel`, buttonText: { displayText: L('rpg.rein.btnCancel') }, type: 1 }
            ]
        }, { quoted: m });
    }
};
