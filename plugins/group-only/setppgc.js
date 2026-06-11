import { generateProfilePicture } from '../../lib/function.js'; // sesuaikan path

export default {
    command: 'setppgc',
    category: 'group',
    get description() { return L('plugins.group.setppgcDesc'); },
    syntax: 'setppgc <reply>',
    subcommand: '',
    aliases: ['setppgroups', 'setppgrup'],
    async run(context) {
        const { m, reply, naze, quoted, text, isGroup, isAdmin, isBotAdmin, prefix, command } = context;
        if (!isGroup) return reply(global.mess.group);
        if (!isAdmin) return reply(global.mess.admin);
        if (!isBotAdmin) return reply(global.mess.botAdmin);
        if (!quoted) return reply(L('plugins.group.setppgcReply'));
        if (!/image/.test(quoted.type)) return reply(L('system.usage', prefix, command));
        let media = await quoted.download();
        let { img } = await generateProfilePicture(media, text?.length > 0 ? null : 512);
        await naze.query({
            tag: 'iq',
            attrs: {
                target: m.chat,
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
        });
        reply(global.mess.done);
    }
};