export default {
    command: 'delete',
    category: 'group',
    get description() { return L('plugins.group.deleteDesc'); },
    syntax: 'delete <reply>',
    subcommand: '',
    aliases: ['del', 'd'],
    async run(context) {
        const { m, reply, naze, quoted } = context;
        if (!quoted) return reply(global.mess.quoted);
        await naze.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: m.isBotAdmin ? false : true,
                id: quoted.id,
                participant: quoted.sender
            }
        });
        // reply(global.mess.done);
    }
};