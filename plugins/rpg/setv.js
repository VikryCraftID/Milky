import { getRPGUser, saveRPG, isVanityUsed } from '../../lib/rpg.js';

function validateVanity(vanity) {
    const min = 3, max = 12;
    if (vanity.length < min || vanity.length > max) return false;
    const regex = /^[a-z0-9\-_?!]+$/i;
    return regex.test(vanity);
}

export default {
    command: 'setv',
    category: 'user',
    get description() { return L('user.setv.desc'); },
    syntax: 'setv <text>',
    subcommand: '',
    aliases: ['setvanity'],
    async run(context) {
        const { reply, args, sender, pushName, prefix } = context;
        const user = getRPGUser(sender, pushName);
        
        const newVanity = args[0] ? args[0].toLowerCase().trim() : '';
        if (!newVanity) return reply(L('system.usage', prefix, command));
        
        if (!validateVanity(newVanity)) {
            return reply(L('user.setv.invalid'));
        }
        
        if (isVanityUsed(newVanity)) {
            return reply(L('user.setv.used', newVanity));
        }
        
        user.vanity = newVanity;
        saveRPG();
        
        reply(L('user.setv.success'));
    }
};