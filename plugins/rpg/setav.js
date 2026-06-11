import { getRPGUser, saveRPG, saveUserImagePNG, getDefaultImage } from '../../lib/rpg.js';
import { downloadContentFromMessage } from 'baileys';
import logger from '../../lib/logger.js';

export default {
    command: 'setav',
    category: 'user',
    get description() { return L('user.setav.desc'); },
    syntax: 'setav <reply/pict>',
    subcommand: '',
    aliases: ['setavatar', 'setava'],
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
            
            // Simpan ke folder assets/users/avatar/
            const filename = await saveUserImagePNG({ buffer, userId: user.userId, type: 'avatar' });
            user.avatar = filename;
            saveRPG();
            
            reply(L('user.setav.success'));
        } catch (err) {
            logger.error('RPG', 'setav error: ' + err.message);
            reply(L('user.setav.failed'));
        }
    }
};