export default {
    command: 'linkgroup',
    category: 'group',
    get description() { return L('plugins.group.linkgroupDesc'); },
    syntax: 'linkgroup',
    subcommand: '',
    aliases: ['linkgrup', 'linkgc', 'urlgroup', 'urlgrup', 'urlgc'],
    async run(context) {
        const { m, reply, naze, store, isGroup, isAdmin, isBotAdmin } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        let response = await naze.groupInviteCode(m.chat);
        let metadata = store.groupMetadata[m.chat] || (store.groupMetadata[m.chat] = await naze.groupMetadata(m.chat));
        await reply(`*${metadata.subject}*\nhttps://chat.whatsapp.com/${response}`, { detectLink: true });
    }
};