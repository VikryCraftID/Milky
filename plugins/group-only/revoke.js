export default {
    command: 'revoke',
    category: 'group',
    get description() { return L('plugins.group.revokeDesc'); },
    syntax: 'revoke',
    subcommand: '',
    aliases: ['newlink', 'newurl'],
    async run(context) {
        const { m, reply, naze, isGroup, isAdmin, isBotAdmin } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        await naze.groupRevokeInvite(m.chat).then(() => {
            reply(L('plugins.group.revokeSuccess'));
        }).catch(() => reply(global.mess.fail));
    }
};