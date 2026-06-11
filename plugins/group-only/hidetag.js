export default {
    command: 'hidetag',
    category: 'group',
    get description() { return L('plugins.group.hidetagDesc'); },
    syntax: 'hidetag <text>',
    subcommand: '',
    aliases: ['h'],
    async run(context) {
        const { m, reply, q, isGroup, isAdmin, isBotAdmin } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        await reply(q || '', { mentions: m.metadata.participants.map(a => a.phoneNumber) });
    }
};