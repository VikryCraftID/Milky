import { getRPGUser } from '../../lib/rpg.js';

export default {
    command: 'leaderboard',
    category: 'misc',
    get description() { return L('rpg.leaderboard.desc'); },
    syntax: 'leaderboard [yen/level]',
    subcommand: 'yen, level',
    aliases: ['lb'],
    async run(context) {
        const { m, args, reply, db, prefix, command } = context;
        const type = (args[0] || 'yen').toLowerCase();
        
        if (!['yen', 'level', 'money'].includes(type)) {
            return reply(L('rpg.leaderboard.invalid', prefix, command));
        }

        const users = Object.entries(db.users);
        let sorted = [];
        let label = '';
        let field = '';

        if (type === 'level') {
            sorted = users.sort((a, b) => (b[1].level || 0) - (a[1].level || 0)).slice(0, 10);
            label = 'Level';
            field = 'level';
        } else if (type === 'money') {
            sorted = users.sort((a, b) => (b[1].money || 0) - (a[1].money || 0)).slice(0, 10);
            label = 'Balance';
            field = 'money';
        } else {
            // Default: yen
            sorted = users.sort((a, b) => (b[1].yen || 0) - (a[1].yen || 0)).slice(0, 10);
            label = 'Yen';
            field = 'yen';
        }

        let text = L('rpg.leaderboard.title', type.toUpperCase());
        for (let i = 0; i < sorted.length; i++) {
            const [jid, data] = sorted[i];
            const val = field === 'yen' ? (data[field] || 0).toFixed(2) + '¥' : 
                        field === 'money' ? (data[field] || 0).toLocaleString('id-ID') : 
                        (data[field] || 0);
            
            text += L('rpg.leaderboard.row', i + 1, jid.split('@')[0], label, val);
        }
        text += L('rpg.leaderboard.footer', prefix, command);
        
        await reply(text, { mentions: sorted.map(v => v[0]) });
    }
};
