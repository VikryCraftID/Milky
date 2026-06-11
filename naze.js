process.once('uncaughtException', console.error)
process.once('unhandledRejection', console.error)

/*
	* Create By Naze
	* Follow https://github.com/nazedev
	* Whatsapp : https://whatsapp.com/channel/0029VaWOkNm7DAWtkvkJBK43
*/

import './settings.js';
import fs from 'fs';
import os from 'os';
import util from 'util';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import yts from 'yt-search';
import fetch from 'node-fetch';
import FileType from 'file-type';
import { Chess } from 'chess.js';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import webp from 'node-webpmux';
import { createRequire } from 'module';
import speed from 'performance-now';
import moment from 'moment-timezone';
import { performance } from 'perf_hooks';
import PhoneNum from 'awesome-phonenumber';
import { exec, spawn, execSync } from 'child_process';
import { generateWAMessageContent, jidNormalizedUser, getContentType } from 'baileys';

import 'moment/min/locales.js';
import { antiSpam } from './src/antispam.js';
import { GroupUpdate, LoadDataBase } from './src/message.js';
import { JadiBot, StopJadiBot, ListJadiBot } from './src/jadibot.js';
import { cmdAdd, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus, checkExpired } from './src/database.js';
import { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, formatDate, formatp, generateProfilePicture, errorCache, normalize, runUpdate, updateSettings, parseMention, fixBytes, similarity, pickRandom, encodeToLetters, tarBackup } from './lib/function.js';
import { updateRPGStats, reduceTrustFactor, getRPGUser, saveRPG } from './lib/rpg.js';
import { handleTrust } from './lib/trustHandler.js';
import logger from './lib/logger.js';
import { handleMessageSecurity } from './lib/security.js';

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

const locales = moment.locales();
const timez = moment.tz.names();
const menfesTimeouts = new Map();
const settingsPath = path.join(__dirname, 'settings.js');

const fileContent = fs.readFileSync(__filename, 'utf-8');
const casesArray = [...fileContent.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(match => match[1]);

const naze = async (naze, m, msg, store) => {
    // Abaikan Status WA secara absolut di awal
    if (m.key.remoteJid === 'status@broadcast' || m.chat === 'status@broadcast') return;

    return await localeStorage.run({ sender: m.sender }, async () => {
	const db = global.db || {};
	global.db.cases = global.db.cases || casesArray;
	const cases = global.db.cases;

    // Pembersihan Database dari entri kotor (LID, Newsletter, dll)
    if (db.users) {
        let dbCleaned = false;
        for (let jid in db.users) {
            if (!jid.endsWith('@s.whatsapp.net')) {
                const standardJid = naze.findJidByLid(jid, store, true);
                if (standardJid && standardJid.endsWith('@s.whatsapp.net')) {
                    // Merge data ke JID standard jika tersedia
                    db.users[standardJid] = { ...(db.users[standardJid] || {}), ...db.users[jid] };
                }
                delete db.users[jid];
                dbCleaned = true;
            }
        }
        // Save jika ada perubahan pada database utama
        if (dbCleaned && typeof database?.write === 'function') database.write(db);
    }

	await LoadDataBase(naze, m);
    if (m.fromMe) return; // abaikan pesan dari bot sendiri
	
	const botNumber = naze.decodeJid(naze.user.id);
	
	// Read Database
	const sewa = db.sewa || []
	const premium = db.premium || []
	const set = db.set?.[botNumber] || { log: true, author: 'CrystalDev', botname: 'Milky' };
	
	// Database Game
	let suit = db.game.suit
	let chess = db.game.chess
	let chat_ai = db.game.chat_ai
	let menfes = db.game.menfes
	let tekateki = db.game.tekateki
	let tictactoe = db.game.tictactoe
	let tebaklirik = db.game.tebaklirik
	let kuismath = db.game.kuismath
	let blackjack = db.game.blackjack
	let tebaklagu = db.game.tebaklagu
	let tebakkata = db.game.tebakkata
	let family100 = db.game.family100
	let susunkata = db.game.susunkata
	let tebakbom = db.game.tebakbom
	let ulartangga = db.game.ulartangga
	let tebakkimia = db.game.tebakkimia
	let caklontong = db.game.caklontong
	let tebakangka = db.game.tebakangka
	let tebaknegara = db.game.tebaknegara
	let tebakgambar = db.game.tebakgambar
	let tebakbendera = db.game.tebakbendera
	
	const ownerNumber = set.owner = [...new Set([...global.owner, botNumber.split('@')[0], ...set?.owner || []])];
	
	try {
		await GroupUpdate(naze, m, store);
		
		const body = ((m.type === 'conversation') ? m.message.conversation :
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
		(m.type == 'protocolMessage') ? (m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.protocolMessage?.editedMessage?.conversation || m.message.protocolMessage?.editedMessage?.imageMessage?.caption || m.message.protocolMessage?.editedMessage?.videoMessage?.caption || '') : '') || '';
		
		const budy = (typeof m.text == 'string' ? m.text : '')
		const isCreator = global.isOwner = ownerNumber.some(owner => {
			const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net';
			const findJid = naze.findJidByLid(jidNormalizedUser(ownerJid), store, true);
			if (!findJid) return false
			return findJid === m.sender
		});
		const symbolMatch = body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi);
		const emojiMatch = body.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]/gi); 
		const listMatch = global.listprefix.find(a => body?.startsWith(a));
		// Deteksi prefix dan command secara langsung (lebih andal)
        const validPrefixes = global.listprefix || ['.', '!', '/', '#'];
        let usedPrefix = null;
        for (let p of validPrefixes) {
            if (body.startsWith(p)) {
                usedPrefix = p;
                break;
            }
        }
const isCmd = usedPrefix !== null;
const prefix = usedPrefix || (isCreator ? '.' : '¿'); // fallback
const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
const args = isCmd ? body.slice(prefix.length).trim().split(/ +/).slice(1) : [];
const text = args.join(' ');

// --- MESSAGE LOGGING ---
if (set.log && m.message && m.key.remoteJid !== 'status@broadcast') {
    const senderName = m.pushName || (isCreator ? 'Owner' : 'Anonim');
    const senderNumber = m.sender.split('@')[0];
    let chatType = 'PC';
    let chatName = m.chat;
    if (m.isGroup) {
        chatType = 'GC';
        chatName = m.metadata?.subject || m.chat;
    } else if (m.chat.endsWith('@newsletter')) {
        chatType = 'NL';
        chatName = 'Newsletter';
    }
    
    let messageContent = budy || '';
    if (!messageContent) {
        const msgType = m.type;
        switch (msgType) {
            case 'imageMessage': messageContent = '📷 Image'; break;
            case 'videoMessage': messageContent = '🎥 Video'; break;
            case 'audioMessage': messageContent = '🎵 Audio'; break;
            case 'stickerMessage': messageContent = '🖼️ Sticker'; break;
            case 'documentMessage': messageContent = '📄 Document'; break;
            case 'locationMessage': messageContent = '📍 Location'; break;
            case 'contactMessage': messageContent = '👤 Contact'; break;
            case 'reactionMessage': messageContent = '😀 Reaction'; break;
            default: messageContent = `[${msgType || 'Unknown'}]`;
        }
    } else {
        if (messageContent.length > 100) messageContent = messageContent.substring(0, 100) + '...';
    }
    logger.message(chatType, senderName, senderNumber, chatName, messageContent);
}

// Trust factor handler (spam & toxic)
const trustResult = handleTrust({ body: budy, m, isCmd });

// --- WHITELIST CHECK ---
if (m.isGroup && !global.db.groups[m.chat]) global.db.groups[m.chat] = {};
const groupData = global.db.groups[m.chat];
if (m.isGroup && !global.db.whitelist.includes(m.chat)) {
    if (isCmd) {
        if (command === 'register' || command === 'whitelist' || command === 'allow') {
            // Allow registration command for owner
        } else {
            return m.reply(L('system.groupNotRegistered'));
        }
    } else {
        return; 
    }
}

// --- SETUP CHECK ---
if (m.isGroup && global.db.whitelist.includes(m.chat) && !groupData.setupDone) {
    if (isCmd) {
        if (command === 'setup' || command === 'register' || command === 'whitelist' || command === 'allow' || command === 'cancel') {
            // Allow setup commands
        } else {
            return m.reply(L('system.setupNotDone'));
        }
    } else {
        return;
    }
}

		const detectedPrefix = symbolMatch ? symbolMatch[0] : (emojiMatch ? emojiMatch[0] : listMatch);
		const quoted = m.quoted ? m.quoted : m
		const mime = (quoted.msg || quoted).mimetype || ''
		const qmsg = (quoted.msg || quoted)
		const author = set.author = global.author || 'CrystalDev';
		const packname = set.packname = global.packname || 'By Milky';
		const botname = set.botname = global.botname || 'Milky Interactive';
		const badWordsLower = global.badWords.map(v => v.toLowerCase());
		const locale_day = moment.tz(global.timezone).locale(global.locale).format('dddd');
		const date = moment.tz(global.timezone).locale(global.locale).format('DD/MM/YYYY');
		const date_time = moment.tz(global.timezone).locale(global.locale).format('HH:mm:ss');
		const ucapanWaktu = date_time < '05:00:00' ? 'Selamat Pagi 🌉' : date_time < '11:00:00' ? 'Selamat Pagi 🌄' : date_time < '15:00:00' ? 'Selamat Siang 🏙' : date_time < '18:00:00' ? 'Selamat Sore 🌅' : date_time < '19:00:00' ? 'Selamat Sore 🌃' : date_time < '23:59:00' ? 'Selamat Malam 🌌' : 'Selamat Malam 🌌';
		const almost = 0.66
		const time = Date.now()
		const time_now = new Date()
		const time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
		const readmore = String.fromCharCode(8206).repeat(999)
		const setv = pickRandom(global.listv)
		
		const isVip = isCreator || (db.users[m.sender] ? db.users[m.sender].vip : false)
		const isBan = isCreator || (db.users[m.sender] ? db.users[m.sender].ban : false)
		const isLimit = isCreator || (db.users[m.sender] ? (db.users[m.sender].limit > 0) : false)
		const isPremium = isCreator || checkStatus(m.sender, premium) || false
		const isNsfw = m.isGroup ? db.groups[m.chat].nsfw : false
		
		// Fake
		const fkontak = {
			key: {
				remoteJid: '0@s.whatsapp.net',
				participant: '0@s.whatsapp.net',
				fromMe: false,
				id: 'Naze'
			},
			message: {
				contactMessage: {
					displayName: (m.pushName || author),
					vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${m.pushName || author},;;;\nFN:${m.pushName || author}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
					sendEphemeral: true
				}
			}
		}
	
		// ========== FILTER UNTUK RPG STATS ==========
const ignoreStatsTypes = ['reactionMessage', 'protocolMessage', 'messageContextInfo', 'presenceUpdate'];
const rpgModeActive = m.isGroup ? (groupData.modes?.rpg !== false && groupData.setupDone) : true;
const canUpdateStats = m.isGroup ? (global.db.whitelist.includes(m.chat) && groupData.setupDone) : true;

if (!ignoreStatsTypes.includes(m.type) && canUpdateStats && rpgModeActive) {
    const rpgResult = updateRPGStats(m.sender, m.pushName, { isCmd, isMessage: true }, m);
    if (rpgResult && rpgResult.leveled) {
        const user = getRPGUser(m.sender);
        await m.reply(L('system.levelUp', user.name || 'New User', rpgResult.oldLevel, rpgResult.newLevel));
    }
}
		
		
		// Auto Set Bio
		if (set.autobio) {
			if (new Date() * 1 - set.status > 60000) {
				await naze.updateProfileStatus(`${naze.user.name} | 🎯 Runtime : ${runtime(process.uptime())}`).catch(e => {})
				set.status = new Date() * 1
			}
		}
		
		// Set Mode
		if (!isCreator) {
			if ((set.grouponly === set.privateonly)) {
				if (!naze.public && !m.key.fromMe) return
			} else if (set.grouponly) {
				if (!m.isGroup) return
			} else if (set.privateonly) {
				if (m.isGroup) return
			}
		}
		
		// Group Settings
		if (m.isGroup) {
			const securityContext = {
                naze, m, groupData, isCreator, budy, body, db, store, badWordsLower,
                isBotAdmin: m.isBotAdmin, isAdmin: m.isAdmin
            };
            const securityBlocked = await handleMessageSecurity(securityContext);
            if (securityBlocked) return;
		}
		
		// Auto Read
		if (m.message && m.key.remoteJid !== 'status@broadcast') {
            if ((set.autoread && naze.public) || isCreator) {
                naze.readMessages([m.key]);
            }
        }
		
		// Panggil onMessage untuk plugin yang memerlukan (seperti wordle)
await pluginLoader.onMessage({ m, naze, reply: m.reply.bind(m), sender: m.sender, text: budy, prefix, command });
		
		const hasValidPrefix = global.listprefix.some(p => body.startsWith(p));
const isEvalOrExec = isCreator && /^[<>$]/.test(body);

if (!hasValidPrefix && !isEvalOrExec) {
    return;
}
		
		// Filter Bot & Ban
		if (m.isBot) return
		if (db.users[m.sender]?.ban && !isCreator) return
		
		// Filter Set Api Key
		if (cases.includes(command) && isCmd && (command !== 'setapikey')) {
			const currentKey = global.APIKeys[global.APIs.naze];
			if (currentKey === 'YOUR_API_KEY' || !currentKey.startsWith('nz-')) {
				return m.reply('Silahkan Ganti Apikey yang ada\ndi File settings.js dengan apikey mu\nAgar semua fitur bisa digunakan dengan normal\n\nAmbil Key di : https://naze.biz.id/profile\nKemudian Gunakan Perintah\n.setapikey key_nya');
			}
		}
		
		// Mengetik & Anti Spam & Hit
		if (naze.public && isCmd) {
			if (set.autotyping) {
				await naze.sendPresenceUpdate('composing', m.chat)
			}
			if (cases.includes(command)) {
				cmdAdd(db.hit);
				cmdAddHit(db.hit, command);
			}
			if (set.antispam && antiSpam.isFiltered(m.sender)) {
				console.log(chalk.bgRed('[ SPAM ] : '), chalk.black(chalk.bgHex('#1CFFF7')(`From -> ${m.sender}`), chalk.bgHex('#E015FF')(` In ${m.isGroup ? m.chat : 'Private Chat'}`)))
				return m.reply('「 ❗ 」Beri Jeda 5 Detik Per Command Kak')
			}
		}
		
		if (isCmd && !isCreator) antiSpam.addFilter(m.sender)
		
		// Cmd Media
		let fileSha256;
		if (m.isMedia && m.msg.fileSha256 && db.cmd && (m.msg.fileSha256.toString('base64') in db.cmd)) {
			let hash = db.cmd[m.msg.fileSha256.toString('base64')]
			fileSha256 = hash.text
		}
		
		// Salam
		if (/^a(s|ss)alamu('|)alaikum(| )(wr|)( |)(wb|)$/.test(budy?.toLowerCase())) {
			const jwb_salam = ['Wa\'alaikumusalam','Wa\'alaikumusalam wr wb','Wa\'alaikumusalam Warohmatulahi Wabarokatuh']
			m.reply(pickRandom(jwb_salam))
		}
		
		// Cek Expired
		checkExpired(premium);
		checkExpired(sewa, naze);
		
		// Menfes & Room Ai
		if (!m.isGroup && (!isCmd || isCreator)) {
			if (menfes[m.sender] && m.key.remoteJid !== 'status@broadcast' && m.msg) {
				m.react('✈');
				if (m.type !== 'conversation') m.msg.contextInfo = { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Pesan Dari ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Seseorang'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}
				const pesan = m.type === 'conversation' ? { extendedTextMessage: { text: m.msg, contextInfo: { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Pesan Dari ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Seseorang'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}}} : { [m.type]: m.msg }
				await naze.relayMessage(menfes[m.sender].tujuan, pesan, {});
			}
			if (chat_ai[m.sender] && m.key.remoteJid !== 'status@broadcast') {
				if (!/^(del((room|c|hat)ai)|>|<$)$/i.test(command) && budy) {
					chat_ai[m.sender].push({ role: 'user', content: budy });
					if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
					let hasil;
					try {
						hasil = await fetchApi('/ai/chat4', {
							messages: chat_ai[m.sender],
							prompt: budy
						}, { method: 'POST' });
					} catch (e) {
						hasil = 'Gagal Mengambil Respon, Website sedang gangguan'
					}
					const response = hasil?.result?.message || 'Maaf, saya tidak mengerti.';
					chat_ai[m.sender].push({ role: 'assistant', content: response });
					if (chat_ai[m.sender].length > 20) chat_ai[m.sender].shift();
					await m.reply(response)
				}
			}
		}
		
		const user = getRPGUser(m.sender, m.pushName);
const pluginContext = {
    m, msg, store, naze,
    reply: m.reply.bind(m),
    sender: m.sender,
    pushName: m.pushName,
    args,
    text: text,
    prefix,
    command,
    isCreator,
    isPremium,
    isGroup: m.isGroup,
    isAdmin: m.isAdmin,
    isBotAdmin: m.isBotAdmin,
    db,
    set,
    quoted: m.quoted,
    user: user,
    saveRPG: () => saveRPG()
    // tambahkan properti lain jika diperlukan
};

// --- RPG MODE COMMAND CHECK ---
if (isCmd && m.isGroup && groupData.modes?.rpg === false) {
    const plugin = pluginLoader.getPlugin(command);
    if (plugin) {
        const rpgCategories = ['user', 'economy', 'gacha', 'minigame'];
        if (rpgCategories.includes(plugin.category)) {
            return m.reply(L('system.rpgDisabled'));
        }
    }
}

const executed = await pluginLoader.execute(command, pluginContext);
if (executed) return; // jika plugin menangani, stop di sini

		// Afk
		let mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
		for (let jid of mentionUser) {
			let user = db.users[jid]
			if (!user) continue
			let afkTime = user.afkTime
			if (!afkTime || afkTime < 0) continue
			let reason = user.afkReason || ''
			m.reply(`Jangan tag dia!\nDia sedang AFK ${reason ? 'dengan alasan ' + reason : 'tanpa alasan'}\nSelama ${clockString(new Date - afkTime)}`.trim())
		}
		if (db.users[m.sender].afkTime > -1) {
			let user = db.users[m.sender]
			m.reply(`@${m.sender.split('@')[0]} berhenti AFK${user.afkReason ? ' setelah ' + user.afkReason : ''}\nSelama ${clockString(new Date - user.afkTime)}`)
			user.afkTime = -1
			user.afkReason = ''
		}
		
		switch(fileSha256 || command) {
			// Tempat Add Case
			case '19rujxl1e': {
				console.log('.')
			}
			break
			
			// Owner Menu
			case 'shutdown': case 'off': {
				if (!isCreator) return m.reply(global.mess.owner)
				m.reply(`*[BOT] Process Shutdown...*`).then(() => {
					process.exit(0);
				})
			}
			break
			case 'update': case 'upgrade': {
				if (!isCreator) return m.reply(global.mess.owner)
				m.reply(`*[BOT] Process Update And Upgrade...*`).then(() => {
					try {
						runUpdate();
					} catch (e) {
						process.exit(0);
					}
				})
			}
			break
			case 'byq': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!m.quoted) return m.reply(global.mess.quoted)
				delete m.quoted.chat
				let anya = Object.values(m.quoted.fakeObj())[1]
				m.reply(`const byt = ${JSON.stringify(anya.message, null, 2)}\nnaze.relayMessage(m.chat, byt, {})`)
			}
			break
			case 'setbio': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(global.mess.text)
				naze.setStatus(q)
				m.reply(`*Bio telah di ganti menjadi ${q}*`)
			}
			break
			case 'setppbot': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!/image/.test(quoted.type)) return m.reply(`Reply Image With Caption ${prefix + command}`)
				let media = await quoted.download();
				let { img } = await generateProfilePicture(media, text.length > 0 ? null : 512)
				await naze.query({
					tag: 'iq',
					attrs: {
						to: '@s.whatsapp.net',
						type: 'set',
						xmlns: 'w:profile:picture'
					},
					content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
				});
				m.reply(global.mess.done)
			}
			break
			case 'delppbot': {
				if (!isCreator) return m.reply(global.mess.owner)
				await naze.removeProfilePicture(naze.user.id)
				m.reply(global.mess.done)
			}
			break
			case 'version': case 'versi': case 'v': {
				const pkg = require('./package.json');
				m.reply(`Version : ${pkg.version}`);
			}
			break
			case 'join': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply('Masukkan Link Group!')
				if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return m.reply('Link Invalid!')
				const result = args[0].match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
				if (!result) return m.reply(L('system.invalidUrl'))
				m.reply(L('system.wait'))
				await naze.groupAcceptInvite(result[1]).catch((res) => {
					if (res.data == 400) return m.reply('Grup Tidak Di Temukan❗');
					if (res.data == 401) return m.reply('Bot Di Kick Dari Grup Tersebut❗');
					if (res.data == 409) return m.reply('Bot Sudah Join Di Grup Tersebut❗');
					if (res.data == 410) return m.reply('Url Grup Telah Di Setel Ulang❗');
					if (res.data == 500) return m.reply('Grup Penuh❗');
				})
			}
			break
			case 'leave': {
				if (!isCreator) return m.reply(global.mess.owner)
				await naze.groupLeave(m.chat).then(() => naze.sendFromOwner(ownerNumber, 'Sukses Keluar Dari Grup', m, { contextInfo: { isForwarded: true }})).catch(e => {});
			}
			break
			case 'clearchat': {
				if (!isCreator) return m.reply(global.mess.owner)
				await naze.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }] }, m.chat).catch((e) => m.reply('Gagal Menghapus Chat!'))
				m.reply(global.mess.done)
			}
			break
			case 'getmsgstore': case 'storemsg': {
				if (!isCreator) return m.reply(global.mess.owner)
				let [teks1, teks2] = text.split`|`
				if (teks1 && teks2) {
					const msgnya = await global.loadMessage(teks1, teks2)
					if (msgnya?.message) await naze.relayMessage(m.chat, msgnya.message, {})
					else m.reply('Pesan Tidak Ditemukan!')
				} else m.reply(`Example: ${prefix + command} 123xxx@g.us|3EB0xxx`)
			}
			break
			case 'blokir': case 'block': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
					await naze.updateBlockStatus(numbersOnly, 'block').then((a) => m.reply(global.mess.done)).catch((err) => m.reply(global.mess.fail))
				} else m.reply(`Example: ${prefix + command} 62xxx`)
			}
			break
			case 'listblock': {
				let anu = await naze.fetchBlocklist()
				m.reply(`Total Block : ${anu.length}\n` + anu.map(v => '• ' + v.replace(/@.+/, '')).join`\n`)
			}
			break
			case 'openblokir': case 'unblokir': case 'openblock': case 'unblock': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const numbersOnly = m.isGroup ? (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender) : m.chat
					await naze.updateBlockStatus(numbersOnly, 'unblock').then((a) => m.reply(global.mess.done)).catch((err) => m.reply(global.mess.fail))
				} else m.reply(`Example: ${prefix + command} 62xxx`)
			}
			break
			case 'ban': case 'banned': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx`)
				const findJid = naze.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
				const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				if (db.users[nmrnya] && !db.users[nmrnya].ban) {
					db.users[nmrnya].ban = true
					m.reply(global.mess.done)
				} else m.reply('User tidak terdaftar di database!')
			}
			break
			case 'unban': case 'unbanned': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx`)
				const findJid = naze.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
				const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				if (db.users[nmrnya] && db.users[nmrnya].ban) {
					db.users[nmrnya].ban = false
					m.reply(global.mess.done)
				} else m.reply('User tidak terdaftar di database!')
			}
			break
			case 'addowner': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx`)
				const nmrnya = naze.findJidByLid(text.replace(/[^0-9]/g, ''), store, true)
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				if (set?.owner) {
					if (set.owner.find(a => nmrnya.includes(a))) return m.reply('Nomer Tersebut Sudah Ada Di Owner!')
					set.owner.push(nmrnya.split('@')[0]);
					await updateSettings({
						filePath: settingsPath,
						owner: set.owner
					});
				}
				m.reply(global.mess.done)
			}
			break
			case 'delowner': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx`)
				const nmrnya = naze.findJidByLid(text.replace(/[^0-9]/g, ''), store, true)
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				if (botNumber === nmrnya) return m.reply('Nomer Bot Tidak Boleh dihapus dari owner!')
				let list = set.owner
				const index = list.findIndex(o => o === nmrnya.split('@')[0]);
				if (index === -1) return m.reply('Owner tidak ditemukan di daftar!')
				list.splice(index, 1)
				await updateSettings({
					filePath: settingsPath,
					owner: set.owner
				});
				m.reply(global.mess.done)
			}
			break
			case 'adduang': case 'addmoney': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!args[0] || !args[1] || isNaN(args[1])) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx 1000`)
				if (args[1].length > 15) return m.reply('Jumlah Money Maksimal 15 digit angka!')
				const findJid = naze.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
				const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				if (db.users[nmrnya] && db.users[nmrnya].money >= 0) {
					addMoney(args[1], nmrnya, db)
					m.reply(global.mess.done)
				} else m.reply('User tidak terdaftar di database!')
			}
			break
			case 'addlimit': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!args[0] || !args[1] || isNaN(args[1])) return m.reply(`Kirim/tag Nomernya!\nExample:\n${prefix + command} 62xxx 10`)
				if (args[1].length > 10) return m.reply('Jumlah Limit Maksimal 10 digit angka!')
				const findJid = naze.findJidByLid(args[0].replace(/[^0-9]/g, '') + '@lid', store);
				const klss = args[0].replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
					addLimit(args[1], nmrnya, db)
					m.reply(global.mess.done)
				} else m.reply('User tidak terdaftar di database!')
			}
			break
			case 'listpc': {
				if (!isCreator) return m.reply(global.mess.owner)
				let anu = Object.keys(store.messages).filter(a => a.endsWith('.net') || a.endsWith('lid'));
				let teks = `● *LIST PERSONAL CHAT*\n\nTotal Chat : ${anu.length} Chat\n\n`
				if (anu.length === 0) return m.reply(teks)
				for (let i of anu) {
					if (store.messages?.[i]?.array?.length) {
						let nama = await naze.getName(i);
						teks += `${setv} *Nama :* ${nama}\n${setv} *User :* @${i.split('@')[0]}\n${setv} *Chat :* https://wa.me/${i.split('@')[0]}\n\n=====================\n\n`
					}
				}
				await m.reply(teks)
			}
			break
			case 'listgc': {
				if (!isCreator) return m.reply(global.mess.owner)
				let anu = Object.keys(store.messages).filter(a => a.endsWith('@g.us'));
				let teks = `● *LIST GROUP CHAT*\n\nTotal Group : ${anu.length} Group\n\n`
				if (anu.length === 0) return m.reply(teks)
				for (let i of anu) {
					let metadata;
					try {
						metadata = store.groupMetadata[i]
					} catch (e) {
						metadata = (store.groupMetadata[i] = await naze.groupMetadata(i).catch(e => ({})))
					}
					teks += metadata?.subject ? `${setv} *Nama :* ${metadata.subject}\n${setv} *Admin :* ${metadata.ownerPn ? `@${metadata.ownerPn.split('@')[0]}` : '-' }\n${setv} *ID :* ${metadata.id}\n${setv} *Dibuat :* ${moment(metadata.creation * 1000).tz(global.timezone).format('DD/MM/YYYY HH:mm:ss')}\n${setv} *Member :* ${metadata.participants.length}\n\n=====================\n\n` : ''
				}
				await m.reply(teks)
			}
			break
			case 'creategc': case 'buatgc': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Example:\n${prefix + command} *Nama Gc*`)
				let group = await naze.groupCreate(q, [m.sender])
				let res = await naze.groupInviteCode(group.id)
				await m.reply(`*Link Group :* *https://chat.whatsapp.com/${res}*\n\n*Nama Group :* *${group.subject}*\nSegera Masuk dalam 30 detik\nAgar menjadi Admin`, { detectLink: true })
				await sleep(30000)
				await naze.groupParticipantsUpdate(group.id, [m.sender], 'promote').catch(e => {});
				await naze.sendMessage(group.id, { text: global.mess.done })
			}
			break
			case 'addsewa': case 'sewa': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Example:\n${prefix + command} https://chat.whatsapp.com/xxx | waktu\n${prefix + command} https://chat.whatsapp.com/xxx | 30 hari`)
				let [teks1, teks2] = text.split('|')?.map(x => x.trim()) || [];
				if (!isUrl(teks1) && !teks1.includes('chat.whatsapp.com/')) return m.reply('Link Invalid!')
				const urlny = teks1.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
				if (!urlny) return m.reply('Link Invalid❗')
				try {
					await naze.groupAcceptInvite(urlny[1])
				} catch (e) {
					if (e.data == 400) return m.reply('Grup Tidak Di Temukan❗');
					if (e.data == 401) return m.reply('Bot Di Kick Dari Grup Tersebut❗');
					if (e.data == 410) return m.reply('Url Grup Telah Di Setel Ulang❗');
					if (e.data == 500) return m.reply('Grup Penuh❗');
				}
				await naze.groupGetInviteInfo(urlny[1]).then(a => {
					addExpired({ url: urlny[1], expired: (teks2?.replace(/[^0-9]/g, '') || 30) + 'd', id: a.id }, sewa)
					m.reply('Sukses Menambahkan Sewa Selama ' + (teks2?.replace(/[^0-9]/g, '') || 30) + ' hari\nOtomatis Keluar Saat Waktu Habis!')
				}).catch(e => m.reply('Gagal Menambahkan Sewa!'))
			}
			break
			case 'delsewa': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Example:\n${prefix + command} https://chat.whatsapp.com/xxxx\n Or \n${prefix + command} id_group@g.us`)
				let urlny;
				if (text.includes('chat.whatsapp.com/')) {
					urlny = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)[1]
				} else if (/@g\.us$/.test(text)) {
					urlny = text.trim()
				} else {
					return m.reply('Format tidak valid❗')
				}
				if (checkStatus(urlny, sewa)) {
					await m.reply(global.mess.done)
					await naze.groupLeave(getStatus(urlny, sewa).id).catch(e => {});
					sewa.splice(getPosition(urlny, sewa), 1);
				} else m.reply(`${text} Tidak Terdaftar Di Database\nExample:\n${prefix + command} https://chat.whatsapp.com/xxxx\n Or \n${prefix + command} id_group@g.us`)
			}
			break
			case 'listsewa': {
				if (!isCreator) return m.reply(global.mess.owner)
				let txt = `*------「 LIST SEWA 」------*\n\n`
				for (let s of sewa) {
					txt += `➸ *ID*: ${s.id}\n➸ *Url*: https://chat.whatsapp.com/${s.url}\n➸ *Expired*: ${formatDate(s.expired)}\n\n`
				}
				m.reply(txt)
			}
			break
			case 'addpr': case 'addprem': case 'addpremium': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Example:\n${prefix + command} @tag|waktu\n${prefix + command} @${m.sender.split('@')[0]}|30 hari`)
				let [teks1, teks2] = text.split('|').map(x => x.trim());
				const findJid = naze.findJidByLid(teks1.replace(/[^0-9]/g, '') + '@lid', store);
				const klss = teks1.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				if (teks2) {
					if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
						addExpired({ id: nmrnya, expired: teks2.replace(/[^0-9]/g, '') + 'd' }, premium);
						m.reply(`Sukses ${command} @${nmrnya.split('@')[0]} Selama ${teks2}`)
						db.users[nmrnya].limit += db.users[nmrnya].vip ? global.limit.vip : global.limit.premium
						db.users[nmrnya].money += db.users[nmrnya].vip ? global.money.vip : global.money.premium
					} else m.reply('Nomer tidak terdaftar di BOT !\nPastikan Nomer Pernah Menggunakan BOT!')
				} else m.reply(`Masukkan waktunya!\Example:\n${prefix + command} @tag|waktu\n${prefix + command} @${m.sender.split('@')[0]}|30d\n_d = day_`)
			}
			break
			case 'delpr': case 'delprem': case 'delpremium': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply(`Example:\n${prefix + command} @tag`)
				const findJid = naze.findJidByLid(text.replace(/[^0-9]/g, '') + '@lid', store);
				const klss = text.replace(/[^0-9]/g, '') + (findJid ? '@lid' :  '@s.whatsapp.net')
				const nmrnya = naze.findJidByLid(klss, store, true)
				if (db.users[nmrnya] && db.users[nmrnya].limit >= 0) {
					if (checkStatus(nmrnya, premium)) {
						premium.splice(getPosition(nmrnya, premium), 1);
						m.reply(`Sukses ${command} @${nmrnya.split('@')[0]}`)
						db.users[nmrnya].limit += db.users[nmrnya].vip ? global.limit.vip : global.limit.free
						db.users[nmrnya].money += db.users[nmrnya].vip ? global.money.vip : global.money.free
					} else m.reply(`User @${nmrnya.split('@')[0]} Bukan Premium❗`)
				} else m.reply('Nomer tidak terdaftar di BOT !')
			}
			break
			case 'listpr': case 'listprem': case 'listpremium': {
				if (!isCreator) return m.reply(global.mess.owner)
				let txt = `*------「 LIST PREMIUM 」------*\n\n`
				for (let userprem of premium) {
					txt += `➸ *Nomer*: @${userprem.id.split('@')[0]}\n➸ *Limit*: ${db.users[userprem.id].limit}\n➸ *Money*: ${db.users[userprem.id].money.toLocaleString('id-ID')}\n➸ *Expired*: ${formatDate(userprem.expired)}\n\n`
				}
				m.reply(txt)
			}
			break
			case 'upsw': {
				if (!isCreator) return m.reply(global.mess.owner)
				const statusJidList = Object.keys(db.users)
				const backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
				try {
					if (quoted.isMedia) {
						let media = await naze.downloadAndSaveMediaMessage(qmsg);
						try {
							if (/image|video/.test(quoted.mime)) {
								await naze.sendMessage('status@broadcast', {
									[`${quoted.mime.split('/')[0]}`]: { url: media },
									caption: text || m.quoted?.body || ''
								}, { statusJidList, broadcast: true })
								m.react('✅')
							} else if (/audio/.test(quoted.mime)) {
								await naze.sendMessage('status@broadcast', {
									audio: { url: media },
									mimetype: 'audio/mp4',
									ptt: true
								}, { backgroundColor, statusJidList, broadcast: true })
								m.react('✅')
							} else m.reply('Only Support video/audio/image/text')
						} finally {
							if (fs.existsSync(media)) fs.unlinkSync(media);
						}
					} else if (quoted.text) {
						await naze.sendMessage('status@broadcast', { text: text || m.quoted?.body || '' }, {
							textArgb: 0xffffffff,
							font: Math.floor(Math.random() * 9),
							backgroundColor, statusJidList,
							broadcast: true
						})
						m.react('✅')
					} else m.reply('Only Support video/audio/image/text')
				} catch (e) {
					m.reply(global.mess.fail)
				}
			}
			break
			case 'addcase': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text && !text.startsWith('case')) return m.reply('Masukkan Casenya!')
				fs.readFile(__filename, 'utf8', (err, data) => {
					if (err) {
						console.error('Terjadi kesalahan saat membaca file:', err);
						return;
					}
					const posisi = data.indexOf("case '19rujxl1e':");
					if (posisi !== -1) {
						const codeBaru = data.slice(0, posisi) + '\n' + `${text}` + '\n' + data.slice(posisi);
						fs.writeFile(__filename, codeBaru, 'utf8', (err) => {
							if (err) {
								m.reply('Terjadi kesalahan saat menulis file: ', err);
							} else m.reply(global.mess.done);
						});
					} else m.reply(global.mess.fail);
				});
			}
			break
			case 'getcase': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply('Masukkan Nama Casenya!')
				try {
					const getCase = (cases) => {
						return "case"+`'${cases}'`+fs.readFileSync(__filename).toString().split('case \''+cases+'\'')[1].split("break")[0]+"break"
					}
					m.reply(`${getCase(text)}`)
				} catch (e) {
					m.reply(`case ${text} tidak ditemukan!`)
				}
			}
			break
			case 'delcase': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply('Masukkan Nama Casenya!')
				fs.readFile(__filename, 'utf8', (err, data) => {
					if (err) {
						console.error('Terjadi kesalahan saat membaca file:', err);
						return;
					}
					const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
					const modifiedData = data.replace(regex, '');
					fs.writeFile(__filename, modifiedData, 'utf8', (err) => {
						if (err) {
							console.log(err);
							m.reply(global.mess.fail);
						} else m.reply(global.mess.done);
					});
				});
			}
			break
			case 'backup': {
				if (!isCreator) return m.reply(global.mess.owner)
				switch (args[0]) {
					case 'all':
					let bekup = './database/backup_all.tar.gz';
					tarBackup('./', bekup).then(() => {
						return m.reply({
							document: fs.readFileSync(bekup),
							mimetype: 'application/gzip',
							fileName: 'backup_all.tar.gz'
						})
					}).catch(e => m.reply('Gagal backup: ', + e))
					break
					case 'auto':
					if (set.autobackup) return m.reply('Sudah Aktif Sebelumnya!')
					set.autobackup = true
					m.reply('Sukses Mengaktifkan Auto Backup')
					break
					case 'session':
					await m.reply({
						document: fs.readFileSync('./nazedev/creds.json'),
						mimetype: 'application/json',
						fileName: 'creds.json'
					});
					break
					case 'database':
					let tglnya = new Date().toISOString().replace(/[:.]/g, '-');
					let datanya = './database/' + global.tempatDB;
					if (global.tempatDB.startsWith('mongodb')) {
						datanya = './database/backup_database.json';
						fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
					}
					await m.reply({
						document: fs.readFileSync(datanya),
						mimetype: 'application/json',
						fileName: tglnya + '_database.json'
					})
					break
					default:
					m.reply('Gunakan perintah:\n- backup all\n- backup auto\n- backup session\n- backup database');
				}
			}
			break
			case 'getsession': {
				if (!isCreator) return m.reply(global.mess.owner)
				await m.reply({
					document: fs.readFileSync('./nazedev/creds.json'),
					mimetype: 'application/json',
					fileName: 'creds.json'
				});
			}
			break
			case 'deletesession': case 'delsession': {
				if (!isCreator) return m.reply(global.mess.owner)
				fs.readdir('./nazedev', async function (err, files) {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return m.reply('Unable to scan directory: ' + err);
					}
					let filteredArray = await files.filter(item => ['session-', 'pre-key', 'sender-key', 'app-state'].some(ext => item.startsWith(ext)));					
					let teks = `Terdeteksi ${filteredArray.length} Session file\n\n`
					if(filteredArray.length == 0) return m.reply(teks);
					filteredArray.map(function(e, i) {
						teks += (i+1)+`. ${e}\n`
					})
					if (text && text == 'true') {
						let { key } = await m.reply('Menghapus Session File..')
						await filteredArray.forEach(function (file) {
							fs.unlinkSync('./nazedev/' + file)
						});
						sleep(2000)
						m.reply('Berhasil Menghapus Semua Sampah Session', { edit: key })
					} else m.reply(teks + `\nKetik _${prefix + command} true_\nUntuk Menghapus`)
				});
			}
			break
			case 'deletesampah': case 'delsampah': case 'deletetemp': case 'deltemp': {
				if (!isCreator) return m.reply(global.mess.owner)
				fs.readdir('./database/temp', async function (err, files) {
					if (err) {
						console.error('Unable to scan directory: ' + err);
						return m.reply('Unable to scan directory: ' + err);
					}
					let filteredArray = await files.filter(item => ['gif', 'png', 'bin','mp3', 'mp4', 'jpg', 'webp', 'webm', 'opus', 'jpeg'].some(ext => item.endsWith(ext)));
					let teks = `Terdeteksi ${filteredArray.length} Sampah file\n\n`
					if(filteredArray.length == 0) return m.reply(teks);
					filteredArray.map(function(e, i) {
						teks += (i+1)+`. ${e}\n`
					})
					if (text && text == 'true') {
						let { key } = await m.reply('Menghapus Sampah File..')
						await filteredArray.forEach(function (file) {
							fs.unlinkSync('./database/temp/' + file)
						});
						sleep(2000)
						m.reply('Berhasil Menghapus Semua Sampah', { edit: key })
					} else m.reply(teks + `\nKetik _${prefix + command} true_\nUntuk Menghapus`)
				});
			}
			break
			case 'setmessbot': case 'setbotmessages': {
				if (!isCreator) return m.reply(global.mess.owner)
				const res = await fetchJson('https://raw.githubusercontent.com/nazedev/database/refs/heads/master/bot/lang.json');
				if (res.some(a => a.lang === text)) {
					const selectedLang = res.find(a => a.lang === text);
					await updateSettings({
						filePath: settingsPath,
						newMess: selectedLang.messages
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} en\n*List Lang :*\n${res.map(a => '- ' + a.lang).join('\n')}`)
			}
			break
			case 'setlimitbot': case 'setbotlimit': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (['free','premium','vip'].includes(args[0]) && !isNaN(args[1])) {
					await updateSettings({
						filePath: settingsPath,
						setLimitRole: { role: args[0], value: Number(args[1]) }
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} premium 10000\n*List Membership :*\n- free ${global.limit.free}\n- premium ${global.limit.premium}\n- vip ${global.limit.vip}`)
			}
			break
			case 'setmoneybot': case 'setbotmoney': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (['free','premium','vip'].includes(args[0]) && !isNaN(args[1])) {
					await updateSettings({
						filePath: settingsPath,
						setMoneyRole: { role: args[0], value: Number(args[1]) }
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} premium 10000\n*List Membership :*\n- free ${global.money.free}\n- premium ${global.money.premium}\n- vip ${global.money.vip}`)
			}
			break
			case 'setnamebot': case 'setbotname': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						botname: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} Hitori bot`)
			}
			break
			case 'setpacknamebot': case 'setbotpackname': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						packname: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} By Hitori bot`)
			}
			break
			case 'setauthorbot': case 'setbotauthor': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						author: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} Naze`)
			}
			break
			case 'setlocale': case 'setlocalebot': case 'setbotlocale': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					if (!locales.includes(teksnya)) return m.reply('Locale List:\n' + locales.map(a => '- ' + a).join('\n'))
					await updateSettings({
						filePath: settingsPath,
						locale: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} en`)
			}
			break
			case 'settimezone': case 'settimezonebot': case 'setbottimezone': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					if (!timez.includes(teksnya)) return m.reply('Timezone List:\n' + timez.map(a => '- ' + a).join('\n'))
					await updateSettings({
						filePath: settingsPath,
						timezone: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} Asia/Jakarta`)
			}
			break
			case 'setapikey': case 'setbotapikey': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!text) return m.reply('Mana apikey nya?')
				if (args[0]?.toLowerCase() == 'neo') {
					if (!args[1]?.startsWith('nsk_')) return m.reply('Apikey Tidak Valid!\nAmbil Apikey di : https://app.neosantara.xyz/api-keys');
					let old_key = global.APIKeys[global.APIs.neosantara];
					await updateSettings({
						filePath: settingsPath,
						neosantara: args[1].trim()
					});
					m.reply(`*Apikey telah di ganti dari ${old_key} menjadi ${q}*`)
				} else {
					if (!text.startsWith('nz-')) return m.reply('Apikey Tidak Valid!\nAmbil Apikey di : https://naze.biz.id/profile');
					let old_key = global.APIKeys[global.APIs.naze];
					await updateSettings({
						filePath: settingsPath,
						apikey: text.trim()
					});
					m.reply(`*Apikey telah di ganti dari ${old_key} menjadi ${q}*`)
				}
			}
			break
			case 'addprefix': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						addPrefix: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} textnya`)
			}
			break
			case 'delprefix': case 'removeprefix': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						removePrefix: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} textnya`)
			}
			break
			case 'addtoxic': case 'addbadword': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						addBadword: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} textnya`)
			}
			break
			case 'deltoxic': case 'delbadword': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (text || m.quoted) {
					const teksnya = text ? text : m.quoted.text
					await updateSettings({
						filePath: settingsPath,
						removeBadword: teksnya.trim()
					});
					m.reply(global.mess.done)
				} else m.reply(`Example: ${prefix + command} textnya`)
			}
			break
			case 'sc': case 'script': {
				await m.reply(`https://github.com/nazedev/hitori\n⬆️ Itu Sc nya cuy`, {
					contextInfo: {
						forwardingScore: 10,
						isForwarded: true,
						forwardedNewsletterMessageInfo: {
							newsletterJid: global.my.ch,
							serverMessageId: null,
							newsletterName: 'Join For More Info'
						},
						externalAdReply: {
							title: author,
							body: 'Subscribe My YouTube',
							thumbnail: global.fake.thumbnail,
							mediaType: 2,
							mediaUrl: global.my.yt,
							sourceUrl: global.my.yt,
						}
					}
				})
			}
			break
			case 'donasi': case 'donate': {
				m.reply('Donasi Dapat Melalui Url Dibawah Ini :\nhttps://saweria.co/naze')
			}
			break
			
			// Bot Menu
			case 'owner': case 'listowner': {
				await naze.sendContact(m.chat, ownerNumber, m);
			}
			break
			case 'req': case 'request': {
				if (!text) return m.reply('Mau Request apa ke Owner?')
				await m.reply(`*Request Telah Terkirim Ke Owner*\n_Terima Kasih🙏_`)
				await naze.sendFromOwner(ownerNumber, `Pesan Dari : @${m.sender.split('@')[0]}\nUntuk Owner\n\nRequest ${text}`, m, { contextInfo: { mentionedJid: [m.sender], isForwarded: true }})
			}
			break
			case 'totalfitur': {
				const total = ((fs.readFileSync(__filename).toString()).match(/case '/g) || []).length
				m.reply(`Total Fitur : ${total}`);
			}
			break
			case 'react': {
				naze.sendMessage(m.chat, { react: { text: args[0], key: m.quoted ? m.quoted.key : m.key }})
			}
			break
			case 'tagme': {
				m.reply(`@${m.sender.split('@')[0]}`, { mentions: [m.sender] })
			}
			break
			case 'runtime': case 'tes': case 'bot': {
				if (!args[0] && !args[1]) return m.reply(`*Bot Telah Online Selama*\n*${runtime(process.uptime())}*`);
				switch(args[0]) {
					case 'mode': case 'public': case 'self':
					if (!isCreator) return m.reply(global.mess.owner)
					if (args[1] == 'public' || args[1] == 'all') {
						if (naze.public && set.grouponly && set.privateonly) return m.reply('*Sudah Aktif Sebelumnya*')
						naze.public = set.public = true
						set.grouponly = true
						set.privateonly = true
						m.reply('*Sukses Change To Public Usage*')
					} else if (args[1] == 'self') {
						set.grouponly = false
						set.privateonly = false
						naze.public = set.public = false
						m.reply('*Sukses Change To Self Usage*')
					} else if (args[1] == 'group') {
						set.grouponly = true
						set.privateonly = false
						m.reply('*Sukses Change To Group Only*')
					} else if (args[1] == 'private') {
						set.grouponly = false
						set.privateonly = true
						m.reply('*Sukses Change To Private Only*')
					} else m.reply('Mode self/public/group/private/all')
					break
					case 'log': case 'anticall': case 'autobio': case 'autoread': case 'autotyping': case 'readsw': case 'multiprefix': case 'antispam': case 'didyoumean':
					if (!isCreator) return m.reply(global.mess.owner)
					if (args[1] == 'on') {
						if (set[args[0]]) return m.reply('*Sudah Aktif Sebelumnya*')
						set[args[0]] = true
						m.reply('*Sukses Change To On*')
					} else if (args[1] == 'off') {
						set[args[0]] = false
						m.reply('*Sukses Change To Off*')
					} else m.reply(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} on/off`)
					break
					case 'set': case 'settings':
					let settingsBot = Object.entries(set).map(([key, value]) => {
						let list = key == 'status' ? new Date(value).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (typeof value === 'boolean') ? (value ? 'on🟢' : 'off🔴') : (typeof value === 'object') ? `\n${value.map(a => '- ' + a).join('\n')}` : value;
						return `- ${key.charAt(0).toUpperCase() + key.slice(1)} : ${list}`;
					}).join('\n');
					m.reply(`Settings Bot @${botNumber.split('@')[0]}\n${settingsBot}\n\nExample: ${prefix + command} mode`);
					break
					case 'author': case 'authorprefix':
					if (!isCreator) return m.reply(global.mess.owner)
					if (args[1] == 'on') {
						set.authorPrefix = '.';
						m.reply(global.mess.done)
					} else if (args[1] == 'off') {
						set.authorPrefix = '';
						m.reply(global.mess.done)
					} else m.reply(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} on/off`)
					break
					default: {
						let menuList = `*⚙️ SETTINGS BOT ⚙️*
					
Select Bot Settings:

*👥 Mode Penggunaan:*
- Mode Bot : *${prefix + command} mode [public/self/group/private]*

*🎛️ Fitur Otomatis (on/off):*
- Anti Call : *${prefix + command} anticall [on/off]*
- Anti Spam : *${prefix + command} antispam [on/off]*
- Auto Bio : *${prefix + command} autobio [on/off]*
- Auto Read : *${prefix + command} autoread [on/off]*
- Auto Typing : *${prefix + command} autotyping [on/off]*
- Read Status/SW : *${prefix + command} readsw [on/off]*

*🛠️ System Settings:*
- Multi Prefix : *${prefix + command} multiprefix [on/off]*
- Did You Mean : *${prefix + command} didyoumean [on/off]*
- Log Console : *${prefix + command} log [on/off]*
- Author Prefix : *${prefix + command} author [on/off]*

*📊 Info & Status:*
- Cek Semua Setting : *${prefix + command} set*
- Cek Runtime Bot : *${prefix + command}*`;
						if (args[0] || args[1]) m.reply(menuList);
					}
				}
			}
			break
			case 'ping': case 'botstatus': case 'statusbot': {
				const used = process.memoryUsage()
				const cpus = os.cpus().map(cpu => {
					cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
					return cpu
				})
				const cpu = cpus.reduce((last, cpu, _, { length }) => {
					last.total += cpu.total
					last.speed += cpu.speed / length
					last.times.user += cpu.times.user
					last.times.nice += cpu.times.nice
					last.times.sys += cpu.times.sys
					last.times.idle += cpu.times.idle
					last.times.irq += cpu.times.irq
					return last
				}, {
					speed: 0,
					total: 0,
					times: {
						user: 0,
						nice: 0,
						sys: 0,
						idle: 0,
						irq: 0
					}
				})
				let timestamp = speed()
				let latensi = speed() - timestamp
				let neww = performance.now()
				let oldd = performance.now()
				let respon = `Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${oldd - neww} _miliseconds_\n\nRuntime : ${runtime(process.uptime())}\n\n💻 Info Server\nRAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}\n\n_NodeJS Memory Usaage_\n${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}\n\n${cpus[0] ? `_Total CPU Usage_\n${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}\n_CPU Core(s) Usage (${cpus.length} Core CPU)_\n${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}`.trim()
				m.reply(respon)
			}
			break
			case 'speedtest': case 'speed': {
				m.reply('Testing Speed...')
				let cp = require('child_process')
				let { promisify } = require('util')
				let exec = promisify(cp.exec).bind(cp)
				let o
				try {
					o = await exec('python3 speed.py --share')
				} catch (e) {
					o = e
				} finally {
					let { stdout, stderr } = o
					if (stdout.trim()) m.reply(stdout)
					if (stderr.trim()) m.reply(stderr)
				}
			}
			break
			case 'afk': {
				let user = db.users[m.sender]
				user.afkTime = + new Date
				user.afkReason = text
				m.reply(`@${m.sender.split('@')[0]} Telah Afk${text ? ': ' + text : ''}`)
			}
			break
			case 'readviewonce': case 'readviewone': case 'rvo': {
				if (!m.quoted) return m.reply(global.mess.quoted)
				try {
					if (m.quoted.msg.viewOnce) {
						delete m.quoted.chat
						m.quoted.msg.viewOnce = false
						await m.reply({ forward: m.quoted })
					} else m.reply(`Reply view once message\nExample: ${prefix + command}`)
				} catch (e) {
					m.reply('Media Tidak Valid!')
				}
			}
			break
			case 'inspect': {
				if (!text) return m.reply('Masukkan Link Grup atau Saluran!')
				let _grup = /chat.whatsapp.com\/([\w\d]*)/;
				let _saluran = /whatsapp\.com\/channel\/([\w\d]*)/;
				if (_grup.test(text)) {
					await naze.groupGetInviteInfo(text.match(_grup)[1]).then((_g) => {
						let teks = `*[ INFORMATION GROUP ]*\n\nName Group: ${_g.subject}\nGroup ID: ${_g.id}\nCreate At: ${new Date(_g.creation * 1000).toLocaleString()}${_g.owner ? ('\nCreate By: ' + _g.owner) : '' }\nLinked Parent: ${_g.linkedParent}\nRestrict: ${_g.restrict}\nAnnounce: ${_g.announce}\nIs Community: ${_g.isCommunity}\nCommunity Announce:${_g.isCommunityAnnounce}\nJoin Approval: ${_g.joinApprovalMode}\nMember Add Mode: ${_g.memberAddMode}\nDescription ID: ${'`' + _g.descId + '`'}\nDescription: ${_g.desc}\nParticipants:\n`
						_g.participants.forEach((a) => {
							teks += a.admin ? `- Admin: @${a.id.split('@')[0]} [${a.admin}]\n` : ''
						})
						m.reply(teks)
					}).catch((e) => {
						if ([400, 406].includes(e.data)) return m.reply('Grup Tidak Di Temukan❗');
						if (e.data == 401) return m.reply('Bot Di Kick Dari Grup Tersebut❗');
						if (e.data == 410) return m.reply('Url Grup Telah Di Setel Ulang❗');
					});
				} else if (_saluran.test(text) || text.endsWith('@newsletter') || !isNaN(text)) {
					await naze.newsletterMsg(text.match(_saluran)[1]).then((n) => {
						m.reply(`*[ INFORMATION CHANNEL ]*\n\nID: ${n.id}\nState: ${n.state.type}\nName: ${n.thread_metadata.name.text}\nCreate At: ${new Date(n.thread_metadata.creation_time * 1000).toLocaleString()}\nSubscriber: ${n.thread_metadata.subscribers_count}\nVerification: ${n.thread_metadata.verification}\nDescription: ${n.thread_metadata.description.text}\n`)
					}).catch((e) => m.reply('Saluran Tidak Di Temukan❗'))
				} else m.reply('Hanya mendukung tautan grup atau saluran!')
			}
			break
			case 'addmsg': {
				if (!m.quoted) return m.reply('Reply Pesan Yang Ingin Disave Di Database')
				if (!text) return m.reply(`Example : ${prefix + command} file name`)
				let msgs = db.database
				if (text.toLowerCase() in msgs) return m.reply(`'${text}' telah terdaftar di list pesan`)
				msgs[text.toLowerCase()] = m.quoted
				delete msgs[text.toLowerCase()].chat
				m.reply(`Berhasil menambahkan pesan di list pesan sebagai '${text}'\nAkses dengan ${prefix}getmsg ${text}\nLihat list Pesan Dengan ${prefix}listmsg`)
			}
			break
			case 'delmsg': case 'deletemsg': {
				if (!text) return m.reply('Nama msg yg mau di delete?')
				let msgs = db.database
				if (text == 'allmsg') {
					db.database = {}
					m.reply('Berhasil menghapus seluruh msg dari list pesan')
				} else {
					if (!(text.toLowerCase() in msgs)) return m.reply(`'${text}' tidak terdaftar didalam list pesan`)
					delete msgs[text.toLowerCase()]
					m.reply(`Berhasil menghapus '${text}' dari list pesan`)
				}
			}
			break
			case 'getmsg': {
				if (!text) return m.reply(`Example : ${prefix + command} file name\n\nLihat list pesan dengan ${prefix}listmsg`)
				let msgs = db.database
				if (!(text.toLowerCase() in msgs)) return m.reply(`'${text}' tidak terdaftar di list pesan`)
				await naze.relayMessage(m.chat, msgs[text.toLowerCase()], {})
			}
			break
			case 'listmsg': {
				let seplit = Object.entries(db.database).map(([nama, isi]) => { return { nama, message: getContentType(isi) }})
				let teks = '「 LIST DATABASE 」\n\n'
				for (let i of seplit) {
					teks += `${setv} *Name :* ${i.nama}\n${setv} *Type :* ${i.message?.replace(/Message/i, '')}\n───────────────\n`
				}
				m.reply(teks)
			}
			break
			case 'setcmd': case 'addcmd': {
				if (!m.quoted) return m.reply(global.mess.quoted)
				if (!m.quoted.fileSha256) return m.reply('SHA256 Hash Missing!')
				if (!text) return m.reply(`Example : ${prefix + command} CMD Name`)
				let hash = m.quoted.fileSha256.toString('base64')
				if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('You have no permission to change this sticker command')
				global.db.cmd[hash] = {
					creator: m.sender,
					locked: false,
					at: + new Date,
					text
				}
				m.reply(global.mess.done)
			}
			break
			case 'delcmd': {
				if (!m.quoted) return m.reply(global.mess.quoted)
				if (!m.quoted.fileSha256) return m.reply('SHA256 Hash Missing!')
				let hash = m.quoted.fileSha256.toString('base64')
				if (global.db.cmd[hash] && global.db.cmd[hash].locked) return m.reply('You have no permission to change this sticker command')
				delete global.db.cmd[hash];
				m.reply(global.mess.done)
			}
			break
			case 'listcmd': {
				let teks = `*List Hash*\nInfo: *bold* hash is Locked\n${Object.entries(global.db.cmd).map(([key, value], index) => `${index + 1}. ${value.locked ? `*${key}*` : key} : ${value.text}`).join('\n')}`.trim()
				naze.sendText(m.chat, teks, m);
			}
			break
			case 'lockcmd': case 'unlockcmd': {
				if (!isCreator) return m.reply(global.mess.owner)
				if (!m.quoted) return m.reply(global.mess.quoted)
				if (!m.quoted.fileSha256) return m.reply('SHA256 Hash Missing!')
				let hash = m.quoted.fileSha256.toString('base64')
				if (!(hash in global.db.cmd)) return m.reply('You have no permission to change this sticker command')
				global.db.cmd[hash].locked = !/^un/i.test(command)
			}
			break
			case 'q': case 'quoted': {
				if (!m.quoted) return m.reply(global.mess.quoted)
				if (text) {
					delete m.quoted.chat
					await m.reply({ forward: m.quoted })
				} else {
					try {
						const anu = await m.getQuotedObj()
						if (!anu) return m.reply('Format Tidak Tersedia!')
						if (!anu.quoted) return m.reply('Pesan Yang Anda Reply Tidak Mengandung Reply')
						await naze.relayMessage(m.chat, { [anu.quoted.type]: anu.quoted.msg }, {})
					} catch (e) {
						return m.reply('Format Tidak Tersedia!')
					}
				}
			}
			break
			case 'confes': case 'confess': case 'menfes': case 'menfess': {
				if (!isLimit) return m.reply(global.mess.limit)
				if (m.isGroup) return m.reply(global.mess.private)
				if (menfes[m.sender]) return m.reply(`Kamu Sedang Berada Di Sesi ${command}!`)
				if (!text) return m.reply(`Example : ${prefix + command} 62xxxx|Nama Samaran`)
				let [teks1, teks2] = text.split`|`
				if (teks1) {
					const tujuan = teks1.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
					const onWa = await naze.onWhatsApp(tujuan)
					if (!onWa.length > 0) return m.reply(global.mess.onWa)
					menfes[m.sender] = {
						tujuan: tujuan,
						nama: teks2 ? teks2 : 'Orang'
					};
					menfes[tujuan] = {
						tujuan: m.sender,
						nama: 'Penerima',
					};
					const timeout = setTimeout(() => {
						if (menfes[m.sender]) {
							m.reply(`_Waktu ${command} habis_`);
							delete menfes[m.sender];
						}
						if (menfes[tujuan]) {
							naze.sendMessage(tujuan, { text: `_Waktu ${command} habis_` });
							delete menfes[tujuan];
						}
						menfesTimeouts.delete(m.sender);
						menfesTimeouts.delete(tujuan);
					}, 600000);
					menfesTimeouts.set(m.sender, timeout);
					menfesTimeouts.set(tujuan, timeout);
					naze.sendMessage(tujuan, { text: `_${command} connected_\n*Note :* jika ingin mengakhiri ketik _*${prefix}del${command}*_` });
					m.reply(`_Memulai ${command}..._\n*Silahkan Mulai kirim pesan/media*\n*Durasi ${command} hanya selama 10 menit*\n*Note :* jika ingin mengakhiri ketik _*${prefix}del${command}*_`)
					setLimit(m, db)
				} else m.reply(`Masukkan Nomernya!\nExample : ${prefix + command} 62xxxx|Nama Samaran`)
			}
			break
			case 'delconfes': case 'delconfess': case 'delmenfes': case 'delmenfess': {
				if (!menfes[m.sender]) return m.reply(`Kamu Tidak Sedang Berada Di Sesi ${command.split('del')[1]}!`)
				let anu = menfes[m.sender]
				if (menfesTimeouts.has(m.sender)) {
					clearTimeout(menfesTimeouts.get(m.sender));
					menfesTimeouts.delete(m.sender);
				}
				if (menfesTimeouts.has(anu.tujuan)) {
					clearTimeout(menfesTimeouts.get(anu.tujuan));
					menfesTimeouts.delete(anu.tujuan);
				}
				naze.sendMessage(anu.tujuan, { text: `Chat Di Akhiri Oleh ${anu.nama ? anu.nama : 'Seseorang'}` })
				m.reply(`Sukses Mengakhiri Sesi ${command.split('del')[1]}!`)
				delete menfes[anu.tujuan];
				delete menfes[m.sender];
			}
			break
			case 'cai': case 'roomai': case 'chatai': case 'autoai': {
				if (m.isGroup) return m.reply(global.mess.private)
				if (chat_ai[m.sender]) return m.reply(`Kamu Sedang Berada Di Sesi ${command}!`)
				if (!text) return m.reply(`Example: ${prefix + command} halo ngab\nWith Prompt: ${prefix + command} halo ngab|Kamu adalah assisten yang siap membantu dalam hal apapun yang ku minta.\n\nUntuk Menghapus room: ${prefix + 'del' + command}`)
				let [teks1, teks2] = text.split`|`
				chat_ai[m.sender] = [{ role: 'system', content: teks2 || '' }, { role: 'user', content: text.split`|` ? teks1 : text || '' }]
				let hasil = await fetchApi('/ai/chat4', {
					messages: chat_ai[m.sender],
					prompt: budy
				}, { method: 'POST' });
				const response = hasil?.result?.message || 'Maaf, saya tidak mengerti.';
				chat_ai[m.sender].push({ role: 'assistant', content: response });
				await m.reply(response)
			}
			break
			case 'delcai': case 'delroomai': case 'delchatai': case 'delautoai': {
				if (!chat_ai[m.sender]) return m.reply(`Kamu Tidak Sedang Berada Di Sesi ${command.split('del')[1]}!`)
				m.reply(`Sukses Mengakhiri Sesi ${command.split('del')[1]}!`)
				delete chat_ai[m.sender];
			}
			break
			case 'jadibot': {
				if (!isPremium) return m.reply(global.mess.prem)
				if (!isLimit) return m.reply(global.mess.limit)
				const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				await JadiBot(naze, nmrnya, m, store)
				m.reply(`Gunakan ${prefix}stopjadibot\nUntuk Berhenti`)
				setLimit(m, db)
			}
			break
			case 'stopjadibot': case 'deljadibot': {
				const nmrnya = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender
				const onWa = await naze.onWhatsApp(nmrnya)
				if (!onWa.length > 0) return m.reply(global.mess.onWa)
				await StopJadiBot(naze, nmrnya, m)
			}
			break
			case 'listjadibot': {
				ListJadiBot(naze, m)
			}
			break
			
			// Tools Menu
			case 'readmore': {
				let teks1 = text.split`|`[0] ? text.split`|`[0] : ''
				let teks2 = text.split`|`[1] ? text.split`|`[1] : ''
				m.reply(teks1 + readmore + teks2)
			}
			break
			case 'getexif': {
				if (!m.quoted) return m.reply(`Reply sticker\nDengan caption ${prefix + command}`)
				if (!/sticker|webp/.test(quoted.type)) return m.reply(`Reply sticker\nDengan caption ${prefix + command}`)
				const img = new webp.Image()
				await img.load(await m.quoted.download())
				if (!img.exif) return m.reply('Stiker ini tidak memiliki metadata/EXIF sama sekali.');
				try {
					const exifData = JSON.parse(img.exif.slice(22).toString());
					m.reply(util.format(exifData))
				} catch (e) {
					m.reply(`Stiker memiliki EXIF, tapi formatnya bukan JSON yang valid:\n\n${img.exif.toString()}`);
				}
			}
			break
			
			default:
			if (budy.startsWith('>')) {
				if (!isCreator) return
				try {
					let evaled = await eval(budy.slice(2))
					if (typeof evaled !== 'string') evaled = util.inspect(evaled)
					await m.reply(evaled)
				} catch (err) {
					await m.reply(String(err))
				}
			}
			if (budy.startsWith('<')) {
				if (!isCreator) return
				try {
					let evaled = await eval(`(async () => { ${budy.slice(2)} })()`)
					if (typeof evaled !== 'string') evaled = util.inspect(evaled)
					await m.reply(evaled)
				} catch (err) {
					await m.reply(String(err))
				}
			}
			if (budy.startsWith('$')) {
				if (!isCreator) return
				if (!text) return
				exec(budy.slice(2), (err, stdout) => {
					if (err) return m.reply(`${err}`)
					if (stdout) return m.reply(stdout)
				})
			}
			if ((!isCmd || isCreator) && budy.toLowerCase() != undefined) {
				if (m.chat.endsWith('broadcast')) return
				if (!(budy.toLowerCase() in db.database)) return
				await naze.relayMessage(m.chat, db.database[budy.toLowerCase()], {})
			}
		}
	} catch (e) {
		console.log(e);
		if (e?.message?.includes('No sessions') || e?.message?.includes('ffmpeg exited with code') || e?.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED' || e?.message?.includes('maxBodyLength limit') || e?.message?.includes('rate-overlimit')) return;
		const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || 'unknown_error';
		const now = Date.now();
		if (!errorCache[errorKey]) errorCache[errorKey] = [];
		errorCache[errorKey] = errorCache[errorKey].filter(ts => now - ts < 600000);
		if (errorCache[errorKey].length >= 3) return;
		errorCache[errorKey].push(now);
		const isAxiosError = e?.isAxiosError || !!e?.response; 
		const statusCode = e?.response?.status || e?.statusCode || e?.data;
		const errorUrl = e?.config?.url || e?.request?.host || '';
		if (statusCode === 500) {
			m.reply('Server API Error: Terjadi gangguan pada server tujuan.');
		} else if (statusCode === 429) {
			if (errorUrl.includes('api.naze.biz.id')) {
				return m.reply('Limit Reached: ' + mess.key);
			} else m.reply('Limit Reached (Sistem/WA): Terlalu banyak permintaan.\nLog error telah dikirim ke pemilik');
		} else if (statusCode === 403) {
			if (isAxiosError) {
				if (errorUrl.includes('api.naze.biz.id')) {
					return m.reply('Akses Khusus Premium!');
				} else m.reply('API Error: Akses ke server API ditolak (403 Forbidden).');
			} else console.log(chalk.yellowBright('[SYSTEM] Akses grup ditolak (Baileys 403 / Forbidden).'));
		} else if (statusCode === 401) {
			if (isAxiosError) {
				if (errorUrl.includes('api.naze.biz.id')) {
					return m.reply('Invalid Apikey!');
				} else m.reply('API Error: Akses ke server API ditolak (401 Unauthorized).');
			} else console.log(chalk.yellowBright('[SYSTEM] Akses ditolak (401 Unauthorized).'));
		} else m.reply('Error: ' + (e?.name || e?.code || e?.message || 'Terjadi kesalahan tidak diketahui') + '\nLog Error Telah dikirim ke Owner\n\n');
		return naze.sendFromOwner(ownerNumber, `Halo sayang, sepertinya ada yang error nih, jangan lupa diperbaiki ya\n\nVersion : *${require('./package.json').version}*\nType : *${m.type || errorKey}*\n\n*Log error:*\n\n` + util.format(e), m, { contextInfo: { isForwarded: true }})
	}
    });
}

export default naze;
