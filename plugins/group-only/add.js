    export default {
    command: 'add',
    category: 'group',
    get description() { return L('plugins.add.desc'); },
    syntax: 'add <number>',
    subcommand: '',
    aliases: [],
    async run(context) {
        const { m, reply, naze, text, quoted, prefix, isGroup, isAdmin, isBotAdmin, store, fkontak } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        if (!text && !quoted) return reply(L('plugins.add.usage'));
        const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : quoted?.sender;
        const findJid = naze.findJidByLid(numbersOnly.replace(/[^0-9]/g, '') + '@lid', store);
        const klss = numbersOnly.replace(/[^0-9]/g, '') + (findJid ? '@lid' : '@s.whatsapp.net');
        const nmrnya = naze.findJidByLid(klss, store, true);
        try {
            await naze.groupParticipantsUpdate(m.chat, [nmrnya], 'add').then(async (res) => {
                for (let i of res) {
                    let invv = await naze.groupInviteCode(m.chat);
                    const statusMessages = {
                        200: L('plugins.add.success', nmrnya.split('@')[0]),
                        401: L('plugins.add.blocked'),
                        409: L('plugins.add.alreadyIn'),
                        500: L('plugins.add.full')
                    };
                    if (statusMessages[i.status]) {
                        return reply(statusMessages[i.status]);
                    } else if (i.status == 408) {
                        await reply(L('plugins.add.leftRecently', nmrnya.split('@')[0]));
                        await reply(L('plugins.add.inviteMsg', m.sender.split('@')[0]), { detectLink: true, chat: nmrnya, quoted: fkontak }).catch((err) => reply('Undangan gagal dikirim.'));
                    } else if (i.status == 403) {
                        let a = i.content.content[0].attrs;
                        await naze.sendGroupInviteV4(m.chat, nmrnya, a.code, a.expiration, m.metadata.subject, L('plugins.add.inviteMsg', m.sender.split('@')[0]), null, { mentions: [m.sender] });
                        await reply(L('plugins.add.privateSent', nmrnya.split('@')[0]));
                    } else reply(L('plugins.add.failed', i.status));
                }
            });
        } catch (e) {
            reply(global.mess.fail);
        }
    }
};