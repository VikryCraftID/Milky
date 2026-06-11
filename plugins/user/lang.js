export default {
    command: 'lang',
    category: 'user',
    get description() { return L('user.lang.desc'); },
    syntax: 'lang <id/en>',
    aliases: ['language', 'setlang'],
    async run(context) {
        const { m, reply, args, sender, prefix, command, user } = context;
        const newLang = args[0]?.toLowerCase();

        if (!newLang || !['id', 'en'].includes(newLang)) {
            return reply(L('system.usage', prefix, command));
        }

        user.lang = newLang;
        
        // Simpan perubahan ke DB
        if (typeof context.saveRPG === 'function') {
            context.saveRPG();
        } else {
            saveRPG();
        }

        await reply(L('user.lang.success', newLang.toUpperCase()));
    }
};