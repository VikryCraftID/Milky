import { getRPGUser, getXPNeed, getAchievements, getRolesData } from '../../lib/rpg.js';
import { renderProfileCard } from '../../lib/design.js';
import logger from '../../lib/logger.js';

// ========== PLUGIN STATUS ==========
export default {
    command: 'status',
    category: 'user',
    get description() { return L('rpg.status.desc'); },
    syntax: 'status',
    subcommand: '',
    aliases: ['profile', 'cek'],
    async run(context) {
        const { m, naze, sender, pushName, reply } = context;
        const user = getRPGUser(sender, pushName);
        
        try {
            const imageBuffer = await renderProfileCard(user, getXPNeed, getAchievements, getRolesData);
            
            await naze.sendMessage(m.chat, {
                image: imageBuffer,
                mimetype: 'image/jpeg',
                caption: '',
                mentions: [sender]
            }, { quoted: m });
        } catch (err) {
            logger.error('RPG', 'Status render error: ' + err.message);
            const need = getXPNeed(user.level);
            const vanity = user.vanity ? `\n🔖 Vanity: @${user.vanity}` : '';
            const bio = user.bio ? `\n📝 Bio: ${user.bio}` : '';
            const text = L('rpg.status.profileBody', 
                user.name, 
                user.role || 'Human', 
                user.userId, 
                user.level, 
                user.xp || 0, 
                need, 
                user.yen?.toFixed(2) || 0, 
                (user.trustFactor || 0).toFixed(2), 
                user.messages || 0, 
                user.commands || 0, 
                user.warns || 0, 
                user.gacha || 0, 
                user.reincarnation || 0, 
                user.achievements || 0,
                vanity,
                bio
            );
            await reply(text);
        }
    }
};