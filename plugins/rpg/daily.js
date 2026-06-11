import { getRPGUser, saveRPG } from '../../lib/rpg.js';

if (!global.dailySession) global.dailySession = {};

function getTodayKey() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export default {
    command: 'daily',
    category: 'economy',
    get description() { return L('rpg.daily.desc'); },
    syntax: 'daily [subcommand]',
    subcommand: 'yen, exp, tf',
    aliases: ['claim'],
    async run(context) {
        const { m, reply, naze, args, sender, pushName, prefix, isGroup } = context;
        const user = getRPGUser(sender, pushName);
        const today = getTodayKey();
        const sub = (args[0] || '').toLowerCase();

        // Cek sudah claim hari ini
        if (user.daily && user.daily.date === today) {
            return reply(L('rpg.daily.alreadyClaimed', user.daily.type));
        }

        // Jika tanpa argumen: kirim tombol ke private chat
        if (!sub) {
            if (global.dailySession[sender]) {
                return reply(L('rpg.daily.sessionActive'));
            }

            global.dailySession[sender] = {
                createdAt: Date.now(),
                groupId: isGroup ? m.chat : null
            };

            if (isGroup) {
                await reply(L('rpg.daily.groupNotify'));
            }

            await naze.sendButtonMsg(sender, {
                text: L('rpg.daily.chooseTitle'),
                footer: 'Milky Interactive',
                buttons: [
                    { buttonId: `${prefix}daily yen`, buttonText: { displayText: 'Yen (+2¥)' }, type: 1 },
                    { buttonId: `${prefix}daily exp`, buttonText: { displayText: 'Exp (+1200 exp)' }, type: 1 },
                    { buttonId: `${prefix}daily tf`, buttonText: { displayText: 'TF (+2.5%)' }, type: 1 }
                ]
            }, { quoted: m });

            // Auto timeout 5 menit
            setTimeout(() => {
                if (global.dailySession[sender]) {
                    delete global.dailySession[sender];
                }
            }, 300000);

            return;
        }

        // Proses claim berdasarkan pilihan
        let rewardText = '';
        if (sub === 'yen') {
            user.yen = (user.yen || 0) + 2;
            rewardText = '2¥';
        } else if (sub === 'exp') {
            user.xp = (user.xp || 0) + 1200;
            rewardText = '1200 Experience Point';
        } else if (sub === 'tf') {
            user.trustFactor = Math.min(100, (user.trustFactor || 0) + 2.5);
            rewardText = '2.5% Trust Factor';
        } else {
            return reply(L('system.usage', prefix, command));
        }

        const sess = global.dailySession[sender] || {};
        const groupId = sess.groupId;
        
        user.daily = { date: today, type: sub };
        delete global.dailySession[sender];
        saveRPG();

        await reply(L('rpg.daily.rewardSuccess', user.name, rewardText));

        if (groupId) {
            await naze.sendMessage(groupId, {
                text: L('rpg.daily.rewardNotify', user.name, rewardText),
                mentions: [sender]
            });
        }
    },
    
    async onMessage(context) {
        const { m, sender, command, text, reply } = context;
        if (!global.dailySession[sender]) return;
        
        // Integrasi .cancel
        if (command === 'cancel' || text.toLowerCase() === 'cancel') {
            delete global.dailySession[sender];
            return reply(L('rpg.daily.canceled'));
        }
    }
};
