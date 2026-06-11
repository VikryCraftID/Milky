import { getRPGUser, saveRPG, findRPGUserByQuery } from '../../lib/rpg.js';

// Cooldown sederhana (disimpan di global)
const cooldowns = new Map();

export default {
    command: 'pay',
    category: 'economy',
    get description() { return L('rpg.pay.desc'); },
    syntax: 'pay <target> <amount>',
    subcommand: '',
    aliases: [],
    async run(context) {
        const { m, reply, naze, args, sender, pushName, prefix, command } = context;
        
        const targetArg = (args[0] || '').trim();
        const amountArg = (args[1] || '').trim();
        
        if (!targetArg || !amountArg) {
            return reply(L('system.usage', prefix, command));
        }
        
        const senderUser = getRPGUser(sender, pushName);
        
        const amount = parseFloat(amountArg.replace(',', '.'));
        if (isNaN(amount) || amount < 1) {
            return reply(L('rpg.pay.minAmount'));
        }
        
        const targetUser = findRPGUserByQuery(targetArg);
        if (!targetUser) {
            return reply(L('rpg.pay.targetNotFound'));
        }
        
        if (targetUser.jid === sender) {
            return reply(L('rpg.pay.selfTransfer'));
        }
        
        const senderYen = senderUser.yen || 0;
        if (senderYen < amount) {
            return reply(L('rpg.pay.insufficient'));
        }
        
        const taxRate = 0.155;
        const tax = amount * taxRate;
        const received = amount - tax;
        
        senderUser.yen = senderYen - amount;
        targetUser.yen = (targetUser.yen || 0) + received;
        
        // Pembulatan ke 2 desimal
        senderUser.yen = Math.round(senderUser.yen * 100) / 100;
        targetUser.yen = Math.round(targetUser.yen * 100) / 100;
        
        saveRPG();
        
        const formatYen = (n) => Number(n).toFixed(2).replace(/\.?0+$/, '');
        
        // Notifikasi untuk pengirim
        await reply(L('rpg.pay.success', formatYen(amount), targetUser.name));
        
        // Notifikasi untuk penerima (private chat)
        if (targetUser.jid) {
            await naze.sendMessage(targetUser.jid, {
                text: L('rpg.pay.notify', formatYen(received), senderUser.name)
            }).catch(() => {}); // abaikan error jika private chat tertutup
        }
    }
};