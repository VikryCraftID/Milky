import { getRPGUser, saveRPG } from '../../lib/rpg.js';

function validateName(name) {
    const min = 3, max = 16;
    if (name.length < min || name.length > max) return false;
    const regex = /^[a-zA-Z0-9.!?,\-+_#$| ]+$/;
    return regex.test(name);
}

export default {
    command: 'setn',
    category: 'user',
    get description() { return L('user.setn.desc'); },
    syntax: 'setn <text>',
    subcommand: '',
    aliases: ['setname'],
    async run(context) {
        const { reply, args, sender, pushName, prefix } = context;
        const user = getRPGUser(sender, pushName);
        
        const newName = args.join(' ').trim();
        if (!newName) return reply(L('system.usage', prefix, command));
        
        if (!validateName(newName)) {
            return reply(L('user.setn.invalid'));
        }
        
        user.name = newName;
        saveRPG();
        
        reply(L('user.setn.success'));
    }
};