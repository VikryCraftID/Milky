import { getRPGUser, saveRPG } from '../../lib/rpg.js';

// Daftar kode flag yang valid (contoh dari bot lama, bisa disesuaikan)
const validFlags = [
    'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'arab', 'as', 'asean', 'at', 'au', 'aw', 'ax', 'az',
    'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz',
    'ca', 'cc', 'cd', 'cefta', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cp', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz',
    'de', 'dg', 'dj', 'dk', 'dm', 'do', 'dz',
    'eac', 'ec', 'ee', 'eg', 'eh', 'er', 'es-ct', 'es-ga', 'es-pv', 'es', 'et', 'eu',
    'fi', 'fj', 'fk', 'fm', 'fo', 'fr',
    'ga', 'gb-eng', 'gb-nir', 'gb-sct', 'gb-wls', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy',
    'hk', 'hm', 'hn', 'hr', 'ht', 'hu',
    'ic', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it',
    'je', 'jm', 'jo', 'jp',
    'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz',
    'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly',
    'ma', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz',
    'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz',
    'om',
    'pa', 'pc', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py',
    'qa',
    're', 'ro', 'rs', 'ru', 'rw',
    'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh-ac', 'sh-hl', 'sh-ta', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv', 'sx', 'sy', 'sz',
    'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz',
    'ua', 'ug', 'um', 'un', 'us', 'uy', 'uz',
    'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu',
    'wf', 'ws',
    'xk',
    'ye', 'yt',
    'za', 'zm', 'zw'
];

export default {
    command: 'setf',
    category: 'user',
    description: 'Mengatur bendera profil dengan ID bendera. Kalau kamu bingung dengan ID bendera, kamu bisa Google dengan keyword "ID bendera <negara>", ID bendera biasanya 2 huruf atau 2 huruf tapi terpisah kayak gini (id-id).',
    syntax: 'setf <id>',
    subcommand: '',
    aliases: ['setflag', 'setcountry'],
    async run(context) {
        const { m, reply, args, sender, pushName, prefix } = context;
        const user = getRPGUser(sender, pushName);
        
        const flag = args[0]?.toLowerCase();
        if (!flag) {
            return reply(L('system.usage', prefix, command));
        }
        
        if (!validFlags.includes(flag)) {
            return reply(L('system.usage', prefix, command));
        }
        
        user.flag = flag;
        saveRPG();
        
        reply(L('user.setf.success', flag.toUpperCase()));
    }
};