export default {
    command: 'cancel',
    category: 'misc',
    get description() { return L('misc.cancel.desc'); },
    syntax: 'cancel',
    aliases: ['batal'],
    async run(context) {
        const { m, sender, reply } = context;
        let cancelled = false;

        // Daftar session yang harus dibatalkan
        if (global.setupSession && global.setupSession[sender]) {
            delete global.setupSession[sender];
            cancelled = true;
        }
        if (global.reportDB && global.reportDB[sender]) {
            delete global.reportDB[sender];
            cancelled = true;
        }
        if (global.wordleGames && global.wordleGames[sender]) {
            delete global.wordleGames[sender];
            cancelled = true;
        }
        if (global.dailySession && global.dailySession[sender]) {
            delete global.dailySession[sender];
            cancelled = true;
        }

        if (cancelled) {
            return reply(L('misc.cancel.success'));
        } else {
            return reply(L('misc.cancel.noSession'));
        }
    }
};
