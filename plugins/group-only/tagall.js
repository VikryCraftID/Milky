import { pickRandom } from '../../lib/function.js';

export default {
    command: 'tagall',
    category: 'group',
    get description() { return L('plugins.group.tagallDesc'); },
    syntax: 'tagall <message>',
    subcommand: '',
    aliases: [],
    async run(context) {
        const { m, reply, q, isGroup, isAdmin, isBotAdmin } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        const setv = pickRandom(global.listv || '-');
        let teks = L('plugins.group.tagallTitle', q || '-');
        for (let mem of m.metadata.participants) {
            teks += `${setv} @${mem.phoneNumber.split('@')[0]}\n`;
        }
        await reply(teks, { mentions: m.metadata.participants.map(a => a.phoneNumber) });
    }
};