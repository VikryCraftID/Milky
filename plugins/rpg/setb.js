import { getRPGUser, saveRPG } from '../../lib/rpg.js';

function validateBio(bio) {
    const min = 3, max = 32;
    if (bio.length < min || bio.length > max) return false;
    const regex = /^[a-zA-Z0-9.!?,\-+_#$| ]+$/;
    return regex.test(bio);
}

export default {
    command: 'setb',
    category: 'user',
    get description() { return L('user.setb.desc'); },
    syntax: 'setb <text>',
    subcommand: '',
    aliases: ['setbio', 'setabout'],
    async run(context) {
        const { reply, args, sender, pushName, prefix } = context;
        const user = getRPGUser(sender, pushName);
        
        const newBio = args.join(' ').trim();
        if (!newBio) return reply(L('system.usage', prefix, command));
        
        if (!validateBio(newBio)) {
            return reply(L('user.setb.invalid'));
        }
        
        user.bio = newBio;
        saveRPG();
        
        reply(L('user.setb.success'));
    }
};