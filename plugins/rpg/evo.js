import { getRPGUser, evolveUser, getRolesData } from '../../lib/rpg.js';

export default {
    command: 'evo',
    category: 'user',
    get description() { return L('rpg.evo.desc'); },
    syntax: 'evo',
    aliases: ['evolve', 'evolusi'],
    async run(context) {
        const { m, reply, naze, sender, pushName, prefix, command, args } = context;
        const user = getRPGUser(sender, pushName);
        const rolesData = getRolesData();
        
        if (user.level < 6) {
            return reply(L('rpg.evo.minLevel'));
        }

        if (user.evoAttempts >= 5) {
            return reply(L('rpg.evo.noAttempts'));
        }

        const possibleEvos = rolesData.evos[user.role] || [];
        if (possibleEvos.length === 0) {
            return reply(L('rpg.evo.noPath', user.role));
        }

        // Handle Konfirmasi via Button (atau manual flag)
        if (args[0] === '--confirm') {
            const result = evolveUser(sender);
            
            if (result.success) {
                return reply(L('rpg.evo.success', user.name, result.newRole));
            } else if (result.fail) {
                return reply(L('rpg.evo.failReward', user.name));
            } else {
                return reply(L('rpg.evo.failed', result.msg));
            }
        }

        if (args[0] === '--cancel') {
            return reply(L('rpg.evo.canceled'));
        }

        // Tahap pertama: Info probabilitas dan Konfirmasi Button
        let confirmText = L('rpg.evo.confirmTitle');
        confirmText += L('rpg.evo.confirmPaths');
        
        let totalProb = 0;
        possibleEvos.forEach(evo => {
            confirmText += L('rpg.evo.confirmPathRow', evo.to, evo.tier, evo.prob);
            totalProb += evo.prob;
        });
        
        const failProb = Math.max(0, 100 - totalProb).toFixed(1);
        confirmText += L('rpg.evo.confirmFailProb', failProb);
        
        await naze.sendButtonMsg(m.chat, {
            text: confirmText,
            footer: L('rpg.evo.footer', user.evoAttempts),
            buttons: [
                { buttonId: `${prefix + command} --confirm`, buttonText: { displayText: L('rpg.evo.btnConfirm') }, type: 1 },
                { buttonId: `${prefix + command} --cancel`, buttonText: { displayText: L('rpg.evo.btnCancel') }, type: 1 }
            ]
        }, { quoted: m });

    }
};
