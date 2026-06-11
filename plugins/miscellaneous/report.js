import { findRPGUserByQuery, getRPGUser, saveRPG } from '../../lib/rpg.js';
import { jidNormalizedUser } from 'baileys';

if (!global.reportDB) global.reportDB = {};
if (!global.ownerReportSession) global.ownerReportSession = {};

function getOwnerJid() {
    const raw = Array.isArray(global.owner) ? global.owner[0] : global.owner;
    const num = Array.isArray(raw) ? raw[0] : raw;
    if (!num) return null;
    const clean = String(num).replace(/[^\d]/g, '');
    return clean + '@s.whatsapp.net';
}

function clearReportSession(sender) {
    if (global.reportDB) delete global.reportDB[sender];
}

function isReportExpired(sess, maxMs = 10 * 60 * 1000) {
    return !sess?.createdAt || (Date.now() - sess.createdAt) > maxMs;
}

function vanityDisplay(v) {
    if (!v) return '';
    return '@';
}

async function sendWithCancel(naze, jid, text, footer = L('misc.report.chooseFooter')) {
    return await naze.sendButtonMsg(jid, {
        text,
        footer,
        buttons: [
            { buttonId: 'report_cancel', buttonText: { displayText: L('misc.report.btnCancel') }, type: 1 }
        ],
        headerType: 1
    });
}

export default {
    command: 'report',
    category: 'user',
    get description() { return L('misc.report.desc'); },
    syntax: 'report',
    aliases: ['lapor', 'bug'],
    async run(context) {
        const { m, naze, reply, sender, isGroup } = context;

        if (isGroup) return reply(global.mess.private);

        const exist = global.reportDB?.[sender];
        if (exist && !isReportExpired(exist)) {
            return reply(L('misc.report.activeSession'));
        }

        global.reportDB[sender] = {
            createdAt: Date.now(),
            step: 'choose',
            fromChat: m.chat
        };

        const buttons = [
            { buttonId: 'report_bug', buttonText: { displayText: L('misc.report.btnBug') }, type: 1 },
            { buttonId: 'report_user', buttonText: { displayText: L('misc.report.btnUser') }, type: 1 },
            { buttonId: 'report_cancel', buttonText: { displayText: L('misc.report.btnCancel') }, type: 1 },
        ];

        await naze.sendButtonMsg(sender, {
            text: L('misc.report.chooseTitle'),
            footer: L('misc.report.chooseFooter'),
            buttons,
            headerType: 1
        });
    },
    
    async onMessage(context) {
        const { m, naze, text, command, reply, isCreator } = context;
        const sender = m.sender;
        
        // --- 1. HANDLE OWNER REVIEW SESSION ---
        if (global.ownerReportSession[sender]) {
            const osess = global.ownerReportSession[sender];
            const input = text.trim();
            const btnId = m.body?.trim();

            // Step A: Memilih Konfirmasi/Tolak
            if (osess.step === 'pick_status') {
                const choice = btnId || input.toLowerCase();
                if (choice.includes('confirm_report') || choice.includes('konfirmasi')) {
                    osess.status = 'accepted';
                    osess.step = 'input_message';
                    return reply(L('misc.report.ownerReviewConfirm'));
                } else if (choice.includes('reject_report') || choice.includes('tolak')) {
                    osess.status = 'rejected';
                    osess.step = 'input_message';
                    return reply(L('misc.report.ownerReviewReject'));
                }
            }

            // Step B: Input Pesan Feedback
            if (osess.step === 'input_message') {
                osess.feedback = input;
                if (osess.status === 'accepted') {
                    osess.step = 'input_reward';
                    return reply(L('misc.report.ownerRewardSyntax'));
                } else {
                    // Selesai untuk penolakan
                    const reporter = osess.reporter;
                    let msg = L('misc.report.notifyReject', osess.feedback);
                    await naze.sendMessage(reporter, { text: msg });
                    delete global.ownerReportSession[sender];
                    return reply(L('misc.report.ownerRejectSuccess'));
                }
            }

            // Step C: Input Reward (Hanya jika accepted)
            if (osess.step === 'input_reward') {
                const parts = input.split('|');
                if (parts.length < 3) return reply(L('misc.report.ownerInvalidSyntax'));
                
                const [ryen, rexp, rtf] = parts.map(v => parseFloat(v.trim()) || 0);
                const reporter = osess.reporter;
                const user = getRPGUser(reporter);
                
                // Beri reward
                user.yen = (user.yen || 0) + ryen;
                user.xp = (user.xp || 0) + rexp;
                user.trustFactor = Math.min(100, (user.trustFactor || 0) + rtf);
                saveRPG();

                let rewardMsg = '';
                if (ryen > 0) rewardMsg += `\n- Yen: +${ryen}¥`;
                if (rexp > 0) rewardMsg += `\n- Exp: +${rexp}`;
                if (rtf > 0) rewardMsg += `\n- Trust Factor: +${rtf}%`;

                let msg = L('misc.report.notifyAccept', osess.feedback, rewardMsg ? `\nReward dari Owner:${rewardMsg}` : '');
                
                await naze.sendMessage(reporter, { text: msg });
                delete global.ownerReportSession[sender];
                return reply(L('misc.report.ownerAcceptSuccess'));
            }
        }

        // --- 2. HANDLE USER REPORT SESSION ---
        const sess = global.reportDB?.[sender];
        if (!sess) return;
        if (m.chat !== sender) return;

        if (isReportExpired(sess)) {
            clearReportSession(sender);
            return;
        }

        const txt = (text || '').trim();
        const btnId = m.body?.trim();

        if (command === 'cancel' || btnId === 'report_cancel' || txt.toLowerCase() === 'cancel') {
            clearReportSession(sender);
            return naze.sendMessage(sender, { text: L('misc.report.cancel') });
        }

        if (sess.step === 'choose') {
            const pick = btnId || txt;
            if (pick === 'report_bug') {
                sess.type = 'bug';
                sess.step = 'bug_desc';
                return sendWithCancel(naze, sender, L('misc.report.bugDesc'));
            }
            if (pick === 'report_user') {
                sess.type = 'user';
                sess.step = 'user_id';
                return sendWithCancel(naze, sender, L('misc.report.userDesc'));
            }
        }

        if (sess.step === 'bug_desc') {
            if (!txt || txt.length < 5) return sendWithCancel(naze, sender, L('misc.report.tooShort'));
            const ownerJid = getOwnerJid();
            if (!ownerJid) {
                clearReportSession(sender);
                return naze.sendMessage(sender, { text: L('misc.report.noOwner') });
            }
            const reporterName = (m.pushName || 'User').trim();
            const reportText = `${L('misc.report.labels.headerBug')}\n\n- Dari: ${reporterName} (${sender})\n- Chat: ${sess.fromChat || '-'}\n- Waktu: ${new Date().toLocaleString('id-ID')}\n\n> Deskripsi: ${txt}`;
            
            // Kirim ke owner dengan tombol review
            await naze.sendButtonMsg(ownerJid, {
                text: reportText,
                footer: L('misc.report.labels.footerReview'),
                buttons: [
                    { buttonId: `confirm_report`, buttonText: { displayText: L('misc.report.labels.btnConfirm') }, type: 1 },
                    { buttonId: `reject_report`, buttonText: { displayText: L('misc.report.labels.btnReject') }, type: 1 }
                ]
            });
            
            // Buat sesi review untuk owner
            global.ownerReportSession[ownerJid] = {
                reporter: sender,
                step: 'pick_status'
            };

            clearReportSession(sender);
            return naze.sendMessage(sender, { text: L('misc.report.success') });
        }

        if (sess.step === 'user_id') {
            const id = String(txt).replace(/[^\d]/g, '');
            if (!id || id < 1) return sendWithCancel(naze, sender, L('misc.report.userIdInvalid'));
            
            const target = findRPGUserByQuery(id);
            if (!target) return sendWithCancel(naze, sender, L('misc.report.userNotFound', id));
            
            sess.target = {
                userID: target.userId,
                name: target.name || 'New User',
                vanity: target.vanity || '',
                bio: target.bio || '',
                jid: target.jid || '-'
            };
            sess.step = 'user_reason';
            const detail = L('misc.report.userReason', sess.target.userID, sess.target.name, sess.target.vanity ? (vanityDisplay(sess.target.vanity) + sess.target.vanity) : '-', sess.target.bio || '-');
            return sendWithCancel(naze, sender, detail);
        }

        if (sess.step === 'user_reason') {
            if (!txt || txt.length < 5) return sendWithCancel(naze, sender, L('misc.report.tooShort'));
            const ownerJid = getOwnerJid();
            if (!ownerJid) {
                clearReportSession(sender);
                return naze.sendMessage(sender, { text: L('misc.report.noOwner') });
            }
            const reporterName = (m.pushName || 'New User').trim();
            const t = sess.target || {};
            const reportText = `${L('misc.report.labels.headerUser')}\n\n- Dari: ${reporterName}\n- Pengguna: ${sess.fromChat || '-'}\n- Waktu: ${new Date().toLocaleString('id-ID')}\n\nUser yang dilaporkan:\n- ID: #${t.userID}\n- Username: ${t.name}\n- JID: ${t.jid || '-'}\n\n> Alasan: ${txt}`;
            
            // Kirim ke owner dengan tombol review
            await naze.sendButtonMsg(ownerJid, {
                text: reportText,
                footer: L('misc.report.labels.footerReview'),
                buttons: [
                    { buttonId: `confirm_report`, buttonText: { displayText: L('misc.report.labels.btnConfirm') }, type: 1 },
                    { buttonId: `reject_report`, buttonText: { displayText: L('misc.report.labels.btnReject') }, type: 1 }
                ]
            });

            // Buat sesi review untuk owner
            global.ownerReportSession[ownerJid] = {
                reporter: sender,
                step: 'pick_status'
            };

            clearReportSession(sender);
            return naze.sendMessage(sender, { text: L('misc.report.success') });
        }
    }
};