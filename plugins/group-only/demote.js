export default {
    command: 'demote',
    category: 'group',
    get description() { return L('plugins.group.demoteDesc'); },
    syntax: 'demote <tag/reply/number>',
    subcommand: '',
    async run(context) {
        const { m, reply, naze, text, quoted, isGroup, isAdmin, isBotAdmin, store, prefix } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);

        let targetJid = null;
        if (quoted?.sender) targetJid = quoted.sender;
        else if (m.mentionedJid?.length) targetJid = m.mentionedJid[0];
        else if (text?.trim()) {
            const numbersOnly = text.replace(/\D/g, '');
            if (numbersOnly) targetJid = numbersOnly + '@s.whatsapp.net';
        }
        if (!targetJid) return reply(L('system.usage', prefix, command));

        const findJid = naze.findJidByLid(targetJid.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = targetJid.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = naze.findJidByLid(klss, store, true) || targetJid;

        await naze.groupParticipantsUpdate(m.chat, [nmrnya], 'demote')
            .then(() => reply(global.mess.done))
            .catch(() => reply(global.mess.fail));
    }
};