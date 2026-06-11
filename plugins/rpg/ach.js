import { getRPGUser, getAchievements, saveRPG } from '../../lib/rpg.js';

export default {
    command: 'ach',
    category: 'user',
    get description() { return L('rpg.ach.desc'); },
    syntax: 'ach <id_achievement>',
    aliases: ['achievement', 'achievements'],
    async run(context) {
        const { m, args, sender, pushName, prefix, command } = context;
        const user = getRPGUser(sender, pushName);
        const achievements = getAchievements();
        
        if (args.length === 0) {
            let text = L('rpg.ach.title') + '\n\n';
            achievements.forEach(ach => {
                const has = user.achievementsList.includes(ach.id);
                const isDisplay = user.displayAchievement === ach.id;
                text += `${isDisplay ? '✅' : has ? '⭐' : '🔒'} *ID: ${ach.id}* - ${ach.name}\n`;
                text += `   Tier: ${ach.stars} Bintang (${ach.color})\n`;
                if (has) text += `   ${L('rpg.ach.has')}\n`;
                else text += `   ${L('rpg.ach.notHas')}\n`;
                text += `\n`;
            });
            text += L('rpg.ach.usage', prefix, command);
            return m.reply(text);
        }
        
        const achId = parseInt(args[0]);
        if (isNaN(achId)) return m.reply(L('rpg.ach.nan'));
        
        const achievement = achievements.find(a => a.id === achId);
        if (!achievement) return m.reply(L('rpg.ach.notFound', achId));
        
        if (!user.achievementsList.includes(achId)) {
            return m.reply(L('rpg.ach.notEarned', achievement.name));
        }
        
        user.displayAchievement = achId;
        saveRPG();
        
        m.reply(L('rpg.ach.success', achievement.name));
    }
};
