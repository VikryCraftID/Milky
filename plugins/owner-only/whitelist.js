import { jidNormalizedUser } from 'baileys';
import { syncGroupAdmins } from '../../lib/security.js';

export default {
    command: 'register',
    category: 'owner',
    description: 'Mengaktifkan bot dalam grup tertentu.',
    syntax: 'register <group_url> <group_owner_number> <boolean>',
    aliases: ['whitelist', 'allow'],
    isOwner: true,
    async run(context) {
        const { m, naze, reply, args, prefix, command, store, isGroup } = context;

        if (isGroup) return reply(global.mess.private);

        if (args.length < 3) {
            return reply(L('plugins.whitelist.invalidSyntax'));
        }

        let groupJid = args[0];
        const ownerNumber = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        const isAllowed = args[2].toLowerCase() === 'true';

        // Jika input URL, ambil ID-nya
        if (groupJid.includes('chat.whatsapp.com/')) {
            const code = groupJid.split('chat.whatsapp.com/')[1];
            try {
                const info = await naze.groupGetInviteInfo(code);
                groupJid = info.id;
            } catch (e) {
                return reply(L('plugins.whitelist.failUrl'));
            }
        }

        if (!groupJid.endsWith('@g.us')) {
            return reply(L('plugins.whitelist.invalidId'));
        }

        // Simpan ke whitelist
        if (isAllowed) {
            if (!global.db.whitelist.includes(groupJid)) {
                global.db.whitelist.push(groupJid);
            }
            
            // Inisialisasi data grup jika belum ada
            if (!global.db.groups[groupJid]) {
                global.db.groups[groupJid] = {
                    whitelist: true,
                    setupDone: false,
                    groupOwner: ownerNumber,
                    modes: { security: true, rpg: true },
                    security: { antilink: true, antikudeta: true },
                    admins: {}
                };
            } else {
                global.db.groups[groupJid].whitelist = true;
                global.db.groups[groupJid].groupOwner = ownerNumber;
            }

            // Sinkronisasi admin langsung saat registrasi
            await syncGroupAdmins(naze, groupJid, global.db.groups[groupJid], store);
            
            // Pastikan pemilik grup masuk dalam daftar admin (sebagai admin 'lama')
            if (global.db.groups[groupJid].admins) {
                global.db.groups[groupJid].admins[ownerNumber] = { role: 'old', since: Date.now() };
            }
            
            // Notifikasi ke owner (pelaksana command)
            reply(L('plugins.whitelist.success', groupJid, ownerNumber.split('@')[0]), { mentions: [ownerNumber] });

            // Notifikasi ke Grup
            await naze.sendMessage(groupJid, { 
                text: L('system.groupNotRegistered') 
            }).catch(() => {});

            // Notifikasi ke Owner Grup (Private)
            const metadata = await naze.groupMetadata(groupJid).catch(() => ({ subject: 'Grup' }));
            const subject = metadata.subject || 'Grup';
            await naze.sendMessage(ownerNumber, {
                text: L('plugins.whitelist.notifyOwner', ownerNumber.split('@')[0], subject),
                mentions: [ownerNumber]
            }).catch(() => {});

        } else {
            // Remove from whitelist
            global.db.whitelist = global.db.whitelist.filter(id => id !== groupJid);
            if (global.db.groups[groupJid]) global.db.groups[groupJid].whitelist = false;
            reply(L('plugins.whitelist.removed'));
        }
    }
};
