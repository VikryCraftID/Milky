process.once('uncaughtException', console.error)
process.once('unhandledRejection', console.error)

/*
	* Create By Naze
	* Follow https://github.com/nazedev
	* Whatsapp : https://whatsapp.com/channel/0029VaWOkNm7DAWtkvkJBK43
    * Modified by CrystalDev for Milky Interactive
*/

import './settings.js';
import fs from 'fs';
import os from 'os';
import util from 'util';
import path from 'path';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import moment from 'moment-timezone';
import { exec } from 'child_process';
import { jidNormalizedUser } from 'baileys';

import 'moment/min/locales.js';
import { antiSpam } from './src/antispam.js';
import { GroupUpdate, LoadDataBase } from './src/message.js';
import { cmdAdd, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, checkExpired } from './src/database.js';
import { runtime, sleep, isUrl, formatDate, pickRandom, updateSettings, tarBackup, generateProfilePicture } from './lib/function.js';
import { updateRPGStats, getRPGUser, saveRPG } from './lib/rpg.js';
import { handleTrust } from './lib/trustHandler.js';
import logger from './lib/logger.js';
import { handleMessageSecurity } from './lib/security.js';
import { markPrivateAllowed } from './lib/privateGuard.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import PluginLoader from './pluginLoader.js';
import { localeStorage } from './language/index.js';

// Inisialisasi sekali (gunakan global)
if (!global._pluginLoader) {
    global._pluginLoader = new PluginLoader();
    await global._pluginLoader.loadAllPlugins();
    global._pluginLoader.startWatching();
}
const pluginLoader = global._pluginLoader;

const settingsPath = path.join(__dirname, 'settings.js');
const fileContent = fs.readFileSync(__filename, 'utf-8');
const casesArray = [...fileContent.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]);

const naze = async (naze, m, msg, store) => {
    if (m.key.remoteJid === 'status@broadcast' || m.chat === 'status@broadcast') return;

    return await localeStorage.run({ sender: m.sender }, async () => {
	const db = global.db || {};
	global.db.cases = global.db.cases || casesArray;
	const cases = global.db.cases;

    // Pembersihan Database dari entri kotor
    if (db.users) {
        let dbCleaned = false;
        for (let jid in db.users) {
            if (!jid.endsWith('@s.whatsapp.net')) {
                const standardJid = naze.findJidByLid(jid, store, true);
                if (standardJid && standardJid.endsWith('@s.whatsapp.net')) {
                    db.users[standardJid] = { ...(db.users[standardJid] || {}), ...db.users[jid] };
                }
                delete db.users[jid];
                dbCleaned = true;
            }
        }
        if (dbCleaned && typeof database?.write === 'function') database.write(db);
    }

	await LoadDataBase(naze, m);
    if (m.fromMe) return;

    // Auto-allow private: user pernah DM private ke Milky -> boleh di-DM balik (anti-ban)
    if (!m.isGroup && m.sender?.endsWith('@s.whatsapp.net')) {
        markPrivateAllowed(m.sender);
    }
	
	const botNumber = naze.decodeJid(naze.user.id);
	
	// Read Database
	const sewa = db.sewa || []
	const premium = db.premium || []
	const set = db.set?.[botNumber] || { log: true, author: 'CrystalDev', botname: 'Milky' };
	
	const ownerNumber = set.owner = [...new Set([...global.owner, botNumber.split('@')[0], ...set?.owner || []])];
	
	try {
		await GroupUpdate(naze, m, store);
		
		let body = (m.type === 'conversation') ? m.message.conversation :
		(m.type == 'imageMessage') ? m.message.imageMessage.caption :
		(m.type == 'videoMessage') ? m.message.videoMessage.caption :
		(m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
		(m.type == 'reactionMessage') ? m.message.reactionMessage.text :
		(m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
		(m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
		(m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
		(m.type == 'interactiveResponseMessage'  && m.quoted) ? (m.message.interactiveResponseMessage?.nativeFlowResponseMessage ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : '') :
		(m.type == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || '') :
		(m.type == 'editedMessage') ? (m.message.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') :
		(m.type == 'protocolMessage') ? (m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.protocolMessage?.editedMessage?.conversation || m.message.protocolMessage?.editedMessage?.imageMessage?.caption || m.message.protocolMessage?.editedMessage?.videoMessage?.caption || '') : '';
		
		if (typeof body !== 'string') body = '';
		const budy = (typeof m.text == 'string' ? m.text : '')
		const isCreator = global.isOwner = ownerNumber.some(owner => {
			const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net';
			const findJid = naze.findJidByLid(jidNormalizedUser(ownerJid), store, true);
			return findJid === m.sender
		});

        const validPrefixes = global.listprefix || ['.', '!', '/', '#'];
        let usedPrefix = null;
        for (let p of validPrefixes) {
            if (body.startsWith(p)) {
                usedPrefix = p;
                break;
            }
        }
        
        const isCmd = usedPrefix !== null;
        const prefix = usedPrefix || (isCreator ? '.' : '¿');
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = isCmd ? body.slice(prefix.length).trim().split(/ +/).slice(1) : [];
        const text = args.join(' ');

        // --- SLEEP MODE (owner only) ---
        if (global.milkySleep === undefined) global.milkySleep = false;
        if (global.milkySleep) {
            // Hanya .awake dari owner yang boleh tembus saat sleep
            if (!(isCmd && command === 'awake' && isCreator)) {
                return;
            }
        }

        // --- MESSAGE LOGGING ---
        if (set.log && m.message && m.key.remoteJid !== 'status@broadcast') {
            const senderName = m.pushName || (isCreator ? 'Owner' : 'Anonim');
            const senderNumber = m.sender.split('@')[0];
            let chatType = 'PC', chatName = m.chat;
            if (m.isGroup) { chatType = 'GC'; chatName = m.metadata?.subject || m.chat; }
            else if (m.chat.endsWith('@newsletter')) { chatType = 'NL'; chatName = 'Newsletter'; }
            
            let messageContent = budy || '';
            if (!messageContent) {
                const msgType = m.type;
                messageContent = msgType === 'imageMessage' ? '📷 Image' : msgType === 'videoMessage' ? '🎥 Video' : msgType === 'audioMessage' ? '🎵 Audio' : msgType === 'stickerMessage' ? '🖼️ Sticker' : `[${msgType || 'Unknown'}]`;
            } else if (messageContent.length > 100) messageContent = messageContent.substring(0, 100) + '...';
            logger.message(chatType, senderName, senderNumber, chatName, messageContent);
        }

        // Trust factor handler
        handleTrust({ body: budy, m, isCmd });

        // Whitelist & Setup Checks
        if (m.isGroup) {
            if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
            const groupData = global.db.groups[m.chat];
            if (!global.db.whitelist.includes(m.chat)) {
                if (isCmd && !['register', 'whitelist', 'allow'].includes(command)) return m.reply(L('system.groupNotRegistered'));
                if (!isCmd) return;
            }
            if (global.db.whitelist.includes(m.chat) && !groupData.setupDone) {
                if (isCmd && !['setup', 'register', 'whitelist', 'allow', 'cancel'].includes(command)) return m.reply(L('system.setupNotDone'));
                if (!isCmd) return;
            }
        }

		const quoted = m.quoted ? m.quoted : m
		const qmsg = (quoted.msg || quoted)
		const setv = pickRandom(global.listv)
		const isPremium = isCreator || checkStatus(m.sender, premium) || false
		
		// ========== FILTER UNTUK RPG STATS ==========
        const ignoreStatsTypes = ['reactionMessage', 'protocolMessage', 'messageContextInfo', 'presenceUpdate'];
        const groupData = m.isGroup ? global.db.groups[m.chat] : null;
        const rpgModeActive = m.isGroup ? (groupData?.modes?.rpg !== false && groupData?.setupDone) : true;
        const canUpdateStats = m.isGroup ? (global.db.whitelist.includes(m.chat) && groupData?.setupDone) : true;

        if (!ignoreStatsTypes.includes(m.type) && canUpdateStats && rpgModeActive) {
            const rpgResult = updateRPGStats(m.sender, m.pushName, { isCmd, isMessage: true }, m);
            if (rpgResult && rpgResult.leveled) {
                const user = getRPGUser(m.sender);
                await m.reply(L('system.levelUp', user.name || 'New User', rpgResult.oldLevel, rpgResult.newLevel));
            }
        }
		
		// Auto Bio
		if (set.autobio && (new Date() * 1 - (set.status || 0) > 60000)) {
			await naze.updateProfileStatus(`${naze.user.name} | 🎯 Runtime : ${runtime(process.uptime())}`).catch(e => {})
			set.status = new Date() * 1
		}
		
		// Set Mode
		if (!isCreator) {
			// grouponly & privateonly saling eksklusif; jika keduanya aktif, abaikan (jangan kunci semua chat)
			if (set.grouponly && !set.privateonly && !m.isGroup) return
			if (set.privateonly && !set.grouponly && m.isGroup) return
			if (!naze.public && !m.key.fromMe) return
		}
		
		// Group Settings
		if (m.isGroup) {
			const securityContext = { naze, m, groupData, isCreator, budy, body, db, store, isBotAdmin: m.isBotAdmin, isAdmin: m.isAdmin };
            if (await handleMessageSecurity(securityContext)) return;
		}
		
		// Auto Read
		if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && naze.public) || isCreator) naze.readMessages([m.key]);
        }
		
		// Panggil onMessage untuk plugin
        await pluginLoader.onMessage({ m, naze, reply: m.reply.bind(m), sender: m.sender, text: budy, prefix, command });
		
		if (!global.listprefix.some(p => body.startsWith(p)) && !(isCreator && /^[<>$]/.test(body))) return;
		if (m.isBot || (db.users[m.sender]?.ban && !isCreator)) {
			if (isCmd && !isCreator) logger.warn('SYSTEM', `Command "${command}" dropped from ${m.sender} (isBot=${m.isBot}, banned=${!!db.users[m.sender]?.ban}, id=${m.id})`);
			return
		}
		
		// Mengetik & Anti Spam & Hit
		if (naze.public && isCmd) {
			if (set.autotyping) await naze.sendPresenceUpdate('composing', m.chat)
			if (cases.includes(command)) { cmdAdd(db.hit); cmdAddHit(db.hit, command); }
			if (set.antispam && antiSpam.isFiltered(m.sender)) return m.reply('「 ❗ 」Beri Jeda 5 Detik Per Command Kak')
		}
		if (isCmd && !isCreator) antiSpam.addFilter(m.sender)
		
		// Cmd Media
		let fileSha256;
		if (m.isMedia && m.msg.fileSha256 && db.cmd && (m.msg.fileSha256.toString('base64') in db.cmd)) {
			fileSha256 = db.cmd[m.msg.fileSha256.toString('base64')].text
		}
		
		// Salam
		if (/^a(s|ss)alamu('|)alaikum(| )(wr|)( |)(wb|)$/.test(budy?.toLowerCase())) {
			m.reply(pickRandom(['Wa\'alaikumusalam','Wa\'alaikumusalam wr wb','Wa\'alaikumusalam Warohmatulahi Wabarokatuh']))
		}
		
		// Cek Expired
		checkExpired(premium);
		checkExpired(sewa, naze);
		
		const user = getRPGUser(m.sender, m.pushName);
        const pluginContext = { m, msg, store, naze, reply: m.reply.bind(m), sender: m.sender, pushName: m.pushName, args, text, prefix, command, isCreator, isPremium, isGroup: m.isGroup, isAdmin: m.isAdmin, isBotAdmin: m.isBotAdmin, db, set, quoted: m.quoted, user, saveRPG: () => saveRPG() };

        if (isCmd && m.isGroup && groupData?.modes?.rpg === false) {
            const plugin = pluginLoader.getPlugin(command);
            if (plugin && ['user', 'economy', 'gacha', 'minigame'].includes(plugin.category)) return m.reply(L('system.rpgDisabled'));
        }

        if (await pluginLoader.execute(command, pluginContext)) return;

		// Afk Check
		let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
		for (let jid of mentionUser) {
			let u = db.users[jid]
			if (u?.afkTime > -1) m.reply(`Jangan tag dia!\nDia sedang AFK ${u.afkReason ? 'dengan alasan ' + u.afkReason : 'tanpa alasan'}\nSelama ${runtime((new Date - u.afkTime)/1000)}`.trim())
		}
		if (db.users[m.sender]?.afkTime > -1) {
			let u = db.users[m.sender]
			m.reply(`@${m.sender.split('@')[0]} berhenti AFK${u.afkReason ? ' setelah ' + u.afkReason : ''}\nSelama ${runtime((new Date - u.afkTime)/1000)}`)
			u.afkTime = -1; u.afkReason = ''
		}
		
		switch(fileSha256 || command) {
			case 'shutdown': case 'off': {
				if (!isCreator) return m.reply(L('system.owner'))
				m.reply(`*[BOT] Process Shutdown...*`).then(() => process.exit(0))
			}
			break
			case 'update': case 'upgrade': {
				if (!isCreator) return m.reply(L('system.owner'))
				await m.reply(`*[BOT] Process Update...*`)
				// --autostash: simpan perubahan runtime (mis. database ter-track), pull, lalu terapkan lagi
				exec('git pull --autostash', (err, stdout, stderr) => {
					if (err) return m.reply(`*[BOT] Update gagal:*\n${(stderr || err.message).trim()}`)
					if (/Already up to date|Sudah yang terbaru/i.test(stdout)) return m.reply(`*[BOT] Sudah versi terbaru.*`)
					// Restart via start.js (IPC 'reset'); fallback exit code 2 (start.js juga respawn)
					m.reply(`*[BOT] Update berhasil, merestart...*\n\n${stdout.trim().slice(-800)}`)
						.then(() => { if (process.send) process.send('reset'); else process.exit(2); });
				})
			}
			break
			case 'setppbot': {
				if (!isCreator) return m.reply(L('system.owner'))
				if (!quoted || !/image/.test(quoted.mime)) return m.reply(`Reply Image With Caption ${prefix + command}`)
				let media = await naze.downloadAndSaveMediaMessage(quoted);
				let { img } = await generateProfilePicture(fs.readFileSync(media), text.length > 0 ? null : 512)
				await naze.query({ tag: 'iq', attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' }, content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }] });
				if (fs.existsSync(media)) fs.unlinkSync(media);
				m.react('✅')
			}
			break
			case 'delppbot': {
				if (!isCreator) return m.reply(L('system.owner'))
				await naze.removeProfilePicture(naze.user.id); m.react('✅')
			}
			break
			case 'join': {
				if (!isCreator) return m.reply(L('system.owner'))
				const result = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
				if (!result) return m.reply(L('system.invalidUrl'))
				await naze.groupAcceptInvite(result[1]).then(() => m.react('✅')).catch(() => m.reply('Gagal join grup.'));
			}
			break
			case 'leave': {
				if (!isCreator) return m.reply(L('system.owner'))
				await naze.groupLeave(m.chat).catch(e => {});
			}
			break
			case 'clearchat': {
				if (!isCreator) return m.reply(L('system.owner'))
				await naze.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }] }, m.chat).then(() => m.react('✅'))
			}
			break
			case 'block': case 'blokir': {
				if (!isCreator) return m.reply(L('system.owner'))
				let t = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
				if (t) await naze.updateBlockStatus(t, 'block').then(() => m.react('✅'))
			}
			break
			case 'unblock': case 'openblock': {
				if (!isCreator) return m.reply(L('system.owner'))
				let t = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender
				if (t) await naze.updateBlockStatus(t, 'unblock').then(() => m.react('✅'))
			}
			break
			case 'listblock': {
				let anu = await naze.fetchBlocklist()
				m.reply(`Total Block : ${anu.length}\n` + anu.map(v => '• ' + v.replace(/@.+/, '')).join`\n`)
			}
			break
			case 'addowner': {
				if (!isCreator) return m.reply(L('system.owner'))
				let t = text.replace(/\D/g, ''); if (!t) return;
				if (!set.owner.includes(t)) { set.owner.push(t); await updateSettings({ filePath: settingsPath, owner: set.owner }); m.react('✅'); }
			}
			break
			case 'delowner': {
				if (!isCreator) return m.reply(L('system.owner'))
				let t = text.replace(/\D/g, '');
				set.owner = set.owner.filter(o => o !== t); await updateSettings({ filePath: settingsPath, owner: set.owner }); m.react('✅');
			}
			break
			case 'listpc': {
				if (!isCreator) return m.reply(L('system.owner'))
				let anu = Object.keys(store.messages).filter(a => a.endsWith('.net'));
				m.reply(`● *LIST PC*\nTotal: ${anu.length}\n\n` + anu.map(i => `- @${i.split('@')[0]}`).join('\n'), { mentions: anu });
			}
			break
			case 'listgc': {
				if (!isCreator) return m.reply(L('system.owner'))
				let anu = Object.keys(store.messages).filter(a => a.endsWith('@g.us'));
				m.reply(`● *LIST GC*\nTotal: ${anu.length}\n\n` + anu.map(i => `- ${store.groupMetadata[i]?.subject || i}`).join('\n'));
			}
			break
			case 'backup': {
				if (!isCreator) return m.reply(L('system.owner'))
				let bekup = './database/backup_db.tar.gz';
				tarBackup('./database', bekup).then(() => {
					naze.sendMessage(m.chat, { document: fs.readFileSync(bekup), mimetype: 'application/gzip', fileName: 'backup.tar.gz' }, { quoted: m });
				});
			}
			break
			case 'react': {
				if (args[0]) naze.sendMessage(m.chat, { react: { text: args[0], key: quoted.key }})
			}
			break
			case 'inspect': {
				if (!text) return;
				const res = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
				if (res) {
					const info = await naze.groupGetInviteInfo(res[1]);
					m.reply(util.format(info));
				}
			}
			break
			case 'q': case 'quoted': {
				if (!m.quoted) return;
				const anu = await m.getQuotedObj();
				if (anu?.quoted) await naze.relayMessage(m.chat, { [anu.quoted.type]: anu.quoted.msg }, {});
			}
			break
			
			default:
			if (isCreator && budy.startsWith('>')) {
				try { let evaled = await eval(budy.slice(2)); if (typeof evaled !== 'string') evaled = util.inspect(evaled); m.reply(evaled); } catch (err) { m.reply(String(err)); }
			}
			if (isCreator && budy.startsWith('$')) {
				exec(budy.slice(2), (err, stdout) => { if (err) return m.reply(`${err}`); if (stdout) m.reply(stdout); });
			}
		}
	} catch (e) {
		logger.error('SYSTEM', 'Handler Error: ' + (e?.stack || e?.message || e));
	}
    });
}

export default naze;
