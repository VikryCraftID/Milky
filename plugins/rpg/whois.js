import { getRPGUser, findRPGUserByQuery, findRPGUserByJid, saveRPG, getXPNeed, getAchievements, getRolesData } from '../../lib/rpg.js';
import { renderProfileCard } from '../../lib/design.js';
import logger from '../../lib/logger.js';

// ========== PLUGIN WHOIS ==========
export default {
    command: 'whois',
    category: 'user',
    get description() { return L('rpg.whois.desc'); },
    syntax: 'whois <target>',
    subcommand: '',
    aliases: ['profileuser'],
    async run(context) {
        const { m, reply, naze, args, sender, pushName, quoted, prefix, command } = context;
        
        // ======= DETEKSI TARGET =======
        let targetUser = null;
        
        // 1. Reply pesan
        if (quoted && quoted.sender) {
            targetUser = findRPGUserByJid(quoted.sender);
            if (!targetUser) return reply(L('rpg.whois.notRegistered', 'reply'));
        }
        // 2. Tag (mention)
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetUser = findRPGUserByJid(m.mentionedJid[0]);
            if (!targetUser) return reply(L('rpg.whois.notRegistered', 'tag'));
        }
        // 3. Argumen teks (ID atau vanity)
        else if (args.length > 0) {
            const query = args.join(' ').trim();
            targetUser = findRPGUserByQuery(query);
            if (!targetUser) return reply(L('rpg.whois.notFound', query));
        }
        else {
            return reply(L('rpg.whois.usage', prefix));
        }
        // =================================
        saveRPG();
        
        // Render kartu dan kirim
        try {
            const imageBuffer = await renderProfileCard(targetUser, getXPNeed, getAchievements, getRolesData);
            
            await naze.sendMessage(m.chat, {
                image: imageBuffer,
                mimetype: 'image/jpeg',
                caption: ``,
                mentions: [targetUser.jid || m.sender]
            }, { quoted: m });
        } catch (err) {
            logger.error('RPG', 'Whois render error: ' + err.message);
            const need = getXPNeed(target.level);
            const vanity = targetUser.vanity ? `\n🔖 Vanity: @${targetUser.vanity}` : '';
            const bio = targetUser.bio ? `\n📝 Bio: ${targetUser.bio}` : '';
            const text = L('rpg.whois.profileTitle', targetUser.name) + '\n' +
                L('rpg.status.profileBody', 
                    targetUser.name, 
                    targetUser.role || 'Human', 
                    targetUser.userId, 
                    targetUser.level, 
                    targetUser.xp || 0, 
                    need, 
                    targetUser.yen?.toFixed(2) || 0, 
                    (targetUser.trustFactor || 0).toFixed(2), 
                    targetUser.messages || 0, 
                    targetUser.commands || 0, 
                    targetUser.warns || 0, 
                    targetUser.gacha || 0, 
                    targetUser.reincarnation || 0, 
                    targetUser.achievements || 0,
                    vanity,
                    bio
                );
            await reply(text);
        }
    }
};