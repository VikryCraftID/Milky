export default {
    command: 'setdesc',
    category: 'group',
    get description() { return L('plugins.group.setdescDesc'); },
    syntax: 'setdesc <text>',
    subcommand: '',
    aliases: ['setdescgc', 'setdesk', 'setdeskgc'],
    async run(context) {
        const { m, reply, naze, text, quoted, isGroup, isAdmin, isBotAdmin, prefix } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        const teksnya = text || quoted?.text;
        if (!teksnya) return reply(L('system.usage', prefix, command));
        await naze.groupUpdateDescription(m.chat, teksnya).catch(() => reply(global.mess.fail));
        reply(global.mess.done);
    }
};