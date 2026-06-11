import { getRPGUser, saveRPG, saveUserImagePNG, getDefaultImage } from '../../lib/rpg.js';
import { downloadContentFromMessage } from 'baileys';
import logger from '../../lib/logger.js';

export default {
    command: 'setbg',
    category: 'user',
    get description() { return L('user.setbg.desc'); },
    syntax: 'setbg <reply/pict>',
    subcommand: '',
    aliases: ['setbackground'],
    async run(context) {
        const { m, reply, naze, quoted, sender, pushName, prefix } = context;
        const user = getRPGUser(sender, pushName);
        
        
        const isImageMessage = m.isMedia && /image/.test(m.mime);
        const isQuotedImage = quoted && /image/.test(quoted.mime);
        
        // Harus reply gambar atau kirim gambar dengan caption
        if (!isImageMessage && !isQuotedImage) {
            return reply(L('system.usage', prefix, command));
        }
        
        try {
            const mediaMsg = isImageMessage ? m.msg : quoted.msg;
            // Download gambar
            const stream = await downloadContentFromMessage(mediaMsg, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            // Simpan ke folder assets/users/bg/
            const filename = await saveUserImagePNG({ buffer, userId: user.userId, type: 'bg' });
            user.bg = filename;
            saveRPG();
            
            reply(L('user.setbg.success'));
        } catch (err) {
            logger.error('RPG', 'setbg error: ' + err.message);
            reply(L('user.setbg.failed'));
        }
    }
};