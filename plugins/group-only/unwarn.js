export default {
    command: 'unwarn',
    category: 'group',
    get description() { return L('plugins.group.unwarnDesc'); },
    syntax: 'unwarn <tag/reply/number>',
    subcommand: '',
    aliases: ['delwarn', 'unwarning', 'delwarning'],
    async run(context) {
        const { m, reply, naze, text, quoted, db, isGroup, isAdmin, isBotAdmin, store, prefix, command } = context;
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

        if (db.groups[m.chat]?.warn?.[nmrnya]) {
            delete db.groups[m.chat].warn[nmrnya];
            reply(L('plugins.group.unwarnSuccess'));
        } else {
            reply(L('plugins.group.unwarnEmpty'));
        }
    }
};