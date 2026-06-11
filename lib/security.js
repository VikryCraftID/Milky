import { jidNormalizedUser } from 'baileys';
import logger from './logger.js';
import { fixBytes } from './function.js';

// Regex link yang sangat agresif
const linkRegex = /((https?:\/\/|www\.)[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+|[a-zA-Z0-9-]+\.(com|net|id|org|co|io|me|ai|xyz|biz|info|link|site|top|shop|online)\b(\/[^\s]*)?)/i;

/**
 * Memastikan daftar admin di database sinkron dengan metadata grup
 */
export async function syncGroupAdmins(naze, chat, groupData, store) {
    if (!groupData.admins) groupData.admins = {};
    
    let metadata = store.groupMetadata[chat] || await naze.groupMetadata(chat).catch(() => null);
    if (!metadata) return;

    const currentAdmins = metadata.participants.filter(p => p.admin);
    const dbAdmins = groupData.admins;

    let syncCount = 0;
    currentAdmins.forEach(p => {
        const jid = jidNormalizedUser(p.id);
        if (!dbAdmins[jid]) {
            dbAdmins[jid] = { role: 'old', since: Date.now() };
            syncCount++;
        }
    });

    if (syncCount > 0) {
        logger.info('SECURITY', `Synced ${syncCount} admins for group ${metadata.subject || chat}`);
    }

    const currentAdminJids = currentAdmins.map(p => jidNormalizedUser(p.id));
    for (const jid in dbAdmins) {
        if (!currentAdminJids.includes(jid)) {
            delete dbAdmins[jid];
        }
    }
}

/**
 * Menangani fitur security berbasis pesan (Antilink, Anti Toxic, dsb)
 */
export async function handleMessageSecurity(context) {
    const { naze, m, groupData, isCreator, budy, body, db, store, badWordsLower } = context;
    if (!m.isGroup) return false;

    // Sinkronisasi admin di latar belakang jika belum ada atau berkala
    if (!groupData.admins || Object.keys(groupData.admins).length === 0) {
        await syncGroupAdmins(naze, m.chat, groupData, store);
    }

    const botNumber = naze.decodeJid(naze.user.id);
    const botLid = naze.decodeJid(naze.user.lid);
    const isBotAdmin = m.isBotAdmin || m.admins?.some(a => [botNumber, botLid].includes(a.id) || [botNumber, botLid].includes(a.phoneNumber));
    const isAdmin = m.isAdmin;

    const security = groupData.security || {};
    const modes = groupData.modes || {};

    if (db.groups[m.chat]?.mute && !isCreator) return true;

    if (!m.key.fromMe && m.mentionedJid?.length === m.metadata?.participants?.length && db.groups[m.chat]?.antihidetag && !isCreator && isBotAdmin && !isAdmin) {
        await naze.sendMessage(m.chat, { delete: m.key });
        await m.reply('*Anti Hidetag Sedang Aktif❗*');
        return true;
    }

    if (!m.key.fromMe && db.groups[m.chat]?.antitagsw && !isCreator && isBotAdmin && !isAdmin) {
        if (m.type === 'groupStatusMentionMessage' || m.message?.groupStatusMentionMessage || m.message?.protocolMessage?.type === 25 || (Object.keys(m.message || {}).length === 1 && Object.keys(m.message)[0] === 'messageContextInfo')) {
            const group = db.groups[m.chat];
            if (!group.tagsw) group.tagsw = {};
            if (!group.tagsw[m.sender]) {
                group.tagsw[m.sender] = 1;
                await m.reply(`Grup ini terdeteksi ditandai dalam Status WhatsApp\n@${m.sender.split('@')[0]}, mohon untuk tidak menandai grup dalam status WhatsApp\nPeringatan ${group.tagsw[m.sender]}/5, akan dikick sewaktu waktu❗`);
            } else if (group.tagsw[m.sender] >= 5) {
                await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                await m.reply(`@${m.sender.split("@")[0]} telah dikeluarkan dari grup\nKarena menandai grup dalam status WhatsApp sebanyak 5x`);
                delete group.tagsw[m.sender];
            } else {
                group.tagsw[m.sender] += 1;
                await m.reply(`Grup ini terdeteksi ditandai dalam Status WhatsApp\n@${m.sender.split('@')[0]}, mohon untuk tidak menandai grup dalam status WhatsApp\nPeringatan ${group.tagsw[m.sender]}/5, akan dikick sewaktu waktu❗`);
            }
            return true;
        }
    }

    if (!m.key.fromMe && db.groups[m.chat]?.antitoxic && !isCreator && isBotAdmin && !isAdmin) {
        if (budy.toLowerCase().split(/\s+/).some(word => badWordsLower.includes(word))) {
            await naze.sendMessage(m.chat, { delete: m.key });
            await naze.relayMessage(m.chat, { extendedTextMessage: { text: `Terdeteksi @${m.sender.split('@')[0]} Berkata Toxic\nMohon gunakan bahasa yang sopan.`, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Toxic❗*'}, ...m.key }}}, {});
            return true;
        }
    }

    if (m.type === 'protocolMessage' && m.msg?.type === 0 && db.groups[m.chat]?.antidelete && !isCreator && isBotAdmin && !isAdmin) {
        if (store?.messages?.[m.chat]?.array) {
            const chats = store.messages[m.chat].array.find(a => a.key.id === m.msg.key.id);
            if (chats?.message) {
                const msgType = Object.keys(chats.message)[0];
                const msgContent = chats.message[msgType];
                if (msgContent.fileSha256 && msgContent.mediaKey) {
                    msgContent.mediaKey = fixBytes(msgContent.mediaKey);
                    msgContent.fileSha256 = fixBytes(msgContent.fileSha256);
                    msgContent.fileEncSha256 = fixBytes(msgContent.fileEncSha256);
                }
                const contextInfo = { mentionedJid: [chats.key.participantAlt || chats.key.participant || chats.sender], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Delete❗*'}, ...chats.key };
                const pesan = msgType === 'conversation' ? { extendedTextMessage: { text: msgContent, contextInfo }} : { [msgType]: { ...msgContent, contextInfo } };
                await naze.relayMessage(m.chat, pesan, {});
            }
        }
    }

    const isAntilinkActive = security.antilink === true;
    if (isAntilinkActive && isBotAdmin && !isAdmin && !isCreator) {
        const textToTest = (budy || body || '').toLowerCase();
        if (linkRegex.test(textToTest)) {
            logger.warn('SECURITY', `Silent delete link in ${m.metadata?.subject || m.chat} from @${m.sender.split('@')[0]}`);
            await naze.sendMessage(m.chat, { delete: m.key }).catch((err) => {
                logger.error('ANTILINK', `Delete failed: ${err.message}`);
            });
            return true; 
        }
    }

    if (db.groups[m.chat]?.antivirtex && !isCreator && isBotAdmin && !isAdmin) {
        if (budy.length > 4500) {
            await naze.sendMessage(m.chat, { delete: m.key });
            await naze.relayMessage(m.chat, { extendedTextMessage: { text: `Terdeteksi @${m.sender.split('@')[0]} Mengirim Virtex..`, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Virtex❗*'}, ...m.key }}}, {});
            await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            return true;
        }
        if (m.msg?.nativeFlowMessage?.messageParamsJson?.length > 3500) {
            await naze.sendMessage(m.chat, { delete: m.key });
            await naze.relayMessage(m.chat, { extendedTextMessage: { text: `Terdeteksi @${m.sender.split('@')[0]} Mengirim Bug..`, contextInfo: { mentionedJid: [m.sender], isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: '*Anti Bug❗*'}, ...m.key }}}, {});
            await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            return true;
        }
    }

    return false;
}

export async function handleParticipantSecurity(naze, update) {
    const { id, participants, action, author } = update;
    const groupData = global.db.groups[id];
    if (!groupData || !groupData.whitelist) return;

    const admins = groupData.admins || {};
    const security = groupData.security || {};

    if (action === 'promote') {
        participants.forEach(p => {
            const jid = jidNormalizedUser(typeof p === 'string' ? p : (p.id || ''));
            // FIX: Jangan timpa data jika admin sudah terdaftar (mencegah reset status Old ke New saat re-promote kudeta)
            if (jid && !admins[jid]) {
                admins[jid] = { role: 'new', since: Date.now() };
            }
        });
    } else if (action === 'demote' && security.antikudeta === true && author) {
        const authorJid = jidNormalizedUser(author);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        for (const jid in admins) {
            if (admins[jid].role === 'new' && (Date.now() - admins[jid].since > thirtyDays)) {
                admins[jid].role = 'old';
            }
        }

        const authorData = admins[authorJid];
        let isKudeta = false;

        if (authorData && authorData.role === 'new') {
            for (const p of participants) {
                const targetJid = jidNormalizedUser(typeof p === 'string' ? p : (p.id || ''));
                const targetData = admins[targetJid];
                if (targetData && targetData.role === 'old') {
                    isKudeta = true;
                    await naze.groupParticipantsUpdate(id, [authorJid], 'demote').catch(() => {});
                    await naze.groupParticipantsUpdate(id, [targetJid], 'promote').catch(() => {});
                    await naze.sendMessage(id, { 
                        text: `*Milky Security*\n\n Kejanggalan terjadi, @${authorJid.split('@')[0]} telah diturunkan menjadi member karena kecurigaan ingin mencoba mengambil alih grup.`, 
                        mentions: [authorJid] 
                    });
                    delete admins[authorJid];
                }
            }
        }

        if (!isKudeta) {
            participants.forEach(p => { 
                const jid = jidNormalizedUser(typeof p === 'string' ? p : (p.id || ''));
                if (jid) delete admins[jid]; 
            });
        }
        return isKudeta;
    }
    return false;
}
