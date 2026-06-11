export default {
    command: 'pin',
    category: 'group',
    get description() { return L('plugins.group.pinDesc'); },
    syntax: 'pin <reply>',
    subcommand: '',
    async run(context) {
        const { m, reply, naze, quoted, isGroup, isAdmin, isBotAdmin } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        const key = quoted ? quoted.key : m.key;
        await naze.sendMessage(m.chat, { pin: { type: 1, time: 2592000, key } });
        // reply(global.mess.done);
    }
};