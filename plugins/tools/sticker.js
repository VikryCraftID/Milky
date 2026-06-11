import logger from '../../lib/logger.js';

export default {
    command: 'sticker',
    category: 'tools',
    get description() { return L('tools.sticker.desc'); },
    syntax: 'sticker [--rect] [--ignore]',
    aliases: ['s', 'stiker'],
    async run(context) {
        const { m, naze, reply, quoted, args, prefix, command } = context;
        
        // Cek apakah ada media (direply atau dikirim langsung)
        const isImage = (m.isMedia && /image/.test(m.mime)) || (m.isMedia && /video/.test(m.mime));
        const isQuotedImage = quoted && (/image/.test(quoted.mime) || /video/.test(quoted.mime));
        
        if (!isImage && !isQuotedImage) {
            return reply(L('tools.sticker.invalid', prefix, command));
        }

        // Ambil objek pesan media
        const mediaMsg = isImage ? m.msg : quoted.msg;

        // Cek View Once
        const isIgnore = args.includes('--ignore');
        if (mediaMsg.viewOnce && !isIgnore) {
            reply(L('tools.sticker.viewOnce'));
            await m.react('❌');
            return
        }

        await m.react('⏳');

        try {
            // Download media
            const pathMedia = await naze.downloadAndSaveMediaMessage(isImage ? m : quoted);
            
            // Cek subcommand rectangle (untuk crop 1:1)
            const isRectangle = args.includes('--rect');

            const packname = L('tools.sticker.packname', m.pushName);
            const author = L('tools.sticker.author');

            await naze.sendAsSticker(m.chat, pathMedia, m, {
                packname,
                author,
                isRectangle
            });
            
            await m.react('✅');
        } catch (e) {
            logger.error('TOOLS', 'Sticker Error: ' + e.message);
            await m.react('❌');
            reply(L('tools.sticker.failed'));
        }
    }
};
