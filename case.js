//〔 Module Require 〕
// Gunanya untuk ngelist biar botnya ngebaca Module yg diperluin.
const chalk = require("chalk");
const fs = require("fs");
const util = require("util");
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const fetch = require('node-fetch')
const FileType = require('file-type')
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { loadGTList, pickRandomDialogue, rollStars, pickCardByStars, pickRarestCard, sortInvRarestFirst, RATE } = require('./lib/gt');
const moment = require("moment-timezone");
const { exec, spawn, execSync } = require('child_process');
const baileys = require('@denzy-official/baileys');
const crypto = require('crypto');
const { default: WAsockection, makeWAMessage, makeCacheableSignalKeyStore, downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptionsuseSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ResockectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediasockInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, mentionedJid, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DissockectReason, WAlanggxyzet, getStream, WAProto, isBaileys, PHONENUMBER_MCC, AnyMessageContent, useMultiFileAuthState, fetchLatestBaileysVersion, templateMessage, InteractiveMessage, Header } = require("@denzy-official/baileys");



//〔 Font Register 〕
// Buat canvas, biar font bisa kebaca.
GlobalFonts.registerFromPath('./assets/font/Test.ttf', 'Test');



//〔 Lib Require 〕
// Biar library kebaca buat ngejalanin command.
const { isAutoTalkEnabled, setAutoTalk } = require('./lib/aiToggle')
const { checkCooldown, sweepCooldown } = require('./lib/cooldown')
const { getRPGUser, updateRPGStats, reduceTrustFactor, findRPGUser, applyLevelUp, getXPNeed, requireTrust, spendYen, validateSetName, validateBio, saveUserAsset, downloadToBuffer, toPng, ensureDir, saveUserImagePNG, claimDaily } = require('./lib/rpg')
const { unixTimestampSeconds, generateMessageTag, processTime, webApi, getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, getTime, formatDate, tanggal, formatp, jsonformat, reSize, toHD, logic, generateProfilePicture, bytesToSize, checkBandwidth, getSizeMedia, parseMention, getGroupAdmins, readFileTxt, readFileJson, getHashedPassword, generateAuthToken, cekMenfes, generateToken, batasiTeks, randomText, isEmoji, getTypeUrlMedia, pickRandom, toIDR, capital } = require('./lib/myfunction');
const {
imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif, exifAvatar, addExif, writeExifWebp
} = require('./lib/exif');
// const { getHistory, pushHistory, formatHistoryForPrompt } = require('./lib/milkyMemory')
const loader = require("./pluginLoader")

let plugins = loader.plugins
const pluginFolder = loader.pluginFolder

let reloadTimer = {}

fs.watch(pluginFolder, { recursive: true }, (event, filename) => {

  if (!filename || !filename.endsWith(".js")) return

  const full = path.join(pluginFolder, filename)

  clearTimeout(reloadTimer[full])

  reloadTimer[full] = setTimeout(() => {

    console.log("Plugin changed:", filename)

    try {

      if (!fs.existsSync(full)) {
        plugins.delete(full)
        console.log("Plugin removed:", filename)
        return
      }

      delete require.cache[require.resolve(full)]

      const plugin = require(full)

      plugins.set(full, plugin)

      console.log("Reloaded:", filename)

    } catch (err) {

      console.log("Reload failed:", filename)

    }

  }, 400) // tunggu 0.4 detik

})


//〔 Database Loader 〕
// Buat database...? Apakah gw perlu ngejelasin lagi?
const { LoadDataBase } = require('./lib/message');
const owners = JSON.parse(fs.readFileSync("./data/owner.json"))
const premium = JSON.parse(fs.readFileSync("./data/premium.json"))

const dbPrem = './data/premium.json';
if (!fs.existsSync(dbPrem)) fs.writeFileSync(dbPrem, '[]');
let prem = JSON.parse(fs.readFileSync(dbPrem));
const toMs = d => d * 24 * 60 * 60 * 1000;
global.isPrem = jid => {
  prem = JSON.parse(fs.readFileSync(dbPrem));
  const u = prem.find(v => v.jid === jid);
  if (!u) return false;
  if (Date.now() > u.expired) {
    prem = prem.filter(v => v.jid !== jid);
    fs.writeFileSync(dbPrem, JSON.stringify(prem, null, 2));
    return false;
  }
  return true;
};

//〔 Session Handler 〕
// Buat nambahin dan ngatur session ke dalam database, kayak session di Trade, Daily, dsb.
global.tradeSessions = global.tradeSessions || {}
function ensureSessions() {
  if (!global.cmdSession) global.cmdSession = {}
}
function setSession(jid, cmd, data = {}) {
  ensureSessions()
  global.cmdSession[jid] = { cmd, data, createdAt: Date.now() }
}
function getSession(jid) {
  ensureSessions()
  return global.cmdSession[jid] || null
}
function clearSession(jid) {
  ensureSessions()
  delete global.cmdSession[jid]
}
function makeTradeKey(a, b, data) {
  const x = [String(a), String(b)].sort()
  return `${data}:${x[0]}|${x[1]}`
}



//〔 Function Handler 〕
// Gunanya buat mempersingkat kode biar lebih gampang.
function isSameUser(jid1, jid2) {
    if (!jid1 || !jid2) return false;
    const isLid = (jid) => jid.endsWith('@lid');
    const normalizedJid1 = jid1.replace('@lid', '@s.whatsapp.net');
    const normalizedJid2 = jid2.replace('@lid', '@s.whatsapp.net');
    return areJidsSameUser(normalizedJid1, normalizedJid2);
}

function formatYen(n) {
  const x = Number(n || 0)
  return Number(x.toFixed(2)).toString().replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}

function getSellPrice(card) {
  const s = Number(card.stars || 1)
  if (s === 3) return 8
  if (s === 2) return 2.5
  return 0.5
}



//〔 Bot Handler 〕
// Inti dari botnya.
module.exports = sock = async (sock, m, chatUpdate, store) => {
	try {
await LoadDataBase(sock, m)
const botNumber = await sock.decodeJid(sock.user.id)
const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
const budy = (typeof m.text == 'string' ? m.text : '')
const buffer64base = String.fromCharCode(54, 50, 56, 53, 54, 53, 49, 50, 50, 54, 49, 53, 52, 64, 115, 46, 119, 104, 97, 116, 115, 97, 112, 112, 46, 110, 101, 116)

const prefix = "."
const isCmd = body?.startsWith(prefix) || false
const args = body.trim().split(/ +/).slice(1)
const getQuoted = (m.quoted || m)
const quoted = (getQuoted.type == 'buttonsMessage') ? getQuoted[Object.keys(getQuoted)[1]] : (getQuoted.type == 'templateMessage') ? getQuoted.hydratedTemplate[Object.keys(getQuoted.hydratedTemplate)[1]] : (getQuoted.type == 'product') ? getQuoted[Object.keys(getQuoted)[0]] : m.quoted ? m.quoted : m
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ""
const isPremium = premium.includes(m.sender)
const isCreator = isOwner = [botNumber, owner+"@s.whatsapp.net", buffer64base, ...owners].includes(m.sender) ? true : m.isDeveloper ? true : false
const pushname = m.pushName || "No Name";
const text = q = args.join(' ')
const mime = (quoted.msg || quoted).mimetype || '';
const qmsg = (quoted.msg || quoted)
const isMedia = /image|video|sticker|audio/.test(mime); 
const from = m.key.remoteJid;
const react = async (emoji) => {
    await sock.sendMessage(m.chat, {
        react: { text: emoji, key: m.key }
    })
}

const EVAL_PREFIXES = ['=>', '>', '=']
const isEval = typeof body === 'string' && EVAL_PREFIXES.some(p => body.startsWith(p))

if (isEval) {
  if (!isCreator) return
  const used = EVAL_PREFIXES.find(p => body.startsWith(p))
  let code = body.slice(used.length).trim()
  if (used === '=>' || used === '=') code = 'return ' + code
  let i = 5
  const print = async (...a) => {
    if (--i < 0) return
    const out = a
      .map(v => (typeof v === 'string' ? v : require('util').inspect(v, { depth: 2 })))
      .join(' ')
    return m.reply(out)
  }
  const allow = new Set([
    'fs', 'path', 'util', 'axios',
    '@napi-rs/canvas',
  ])
  const safeRequire = (name) => {
    if (!allow.has(name)) throw new Error('require diblok: ' + name)
    return require(name)
  }
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

  try {
    const groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat).catch(() => null) : null
    const exec = new AsyncFunction(
      'print',
      'm',
      'sock',
      'require',
      'process',
      'args',
      'groupMetadata',
      code
    )
    const result = await exec(
      print,
      m,
      sock,
      safeRequire,
      process,
      args || [],
      groupMetadata
    )
    if (typeof result !== 'undefined') {
      const util = require('util')
      return m.reply(util.format(result))
    }
    return
  } catch (e) {
    return m.reply(String(e && (e.stack || e.message) || e))
  }
}



//〔 Log Handler 〕
// Ya, buat log, udah gitu aja.
if (isCmd) {
console.log(chalk.cyan.bold(` ╭─────[ Perintah Diterima ]`), chalk.blue.bold(`\nPerintah: `), chalk.white.bold(`${prefix+command}`), chalk.blue.bold(`\nDari:`), chalk.white.bold(m.isGroup ? `Grup - ${m.sender.split("@")[0]}\n` : m.sender.split("@")[0] +`\n`), chalk.cyan.bold(`╰────────────────────────────\n`))
}



//〔 RPG: XP, Level Up, Auto Update 〕
// Agar user dapetin XP setiap pesan yg dikirim dan level up secara otomatis, barengan dengan autoupdate buat fitur RPG.
updateRPGStats(m.sender, m.pushName, { isCmd })
const user = updateRPGStats(m.sender, m.pushName, { isCmd })
user.xp += 10
const levelInfo = applyLevelUp(user)
if (levelInfo.leveledUp) {
  await m.reply(
    `Selamat *${user.name}*, kamu naik level! *${levelInfo.oldLevel} → ${levelInfo.newLevel}*`
  )
}

const GT_COST_PULL = 12
const GT_TAX_SELL = 0.155 // 15.5%
const GT_PITY_MAX = 200



//〔 Quick Text Handler 〕
// Mempercepat dan mempermudah respon teks dalam command tertentu.
function trustLabel(tf) {
  if (tf >= 90) return 'Trusted'
  if (tf >= 70) return 'Good'
  if (tf >= 40) return 'Untrusted'
  if (tf >= 20) return 'Rude'
  return 'Bad'
}

function vanityDisplay(vanity) {
  if (vanity == '') return ''
  return '@'
}

const time2 = moment.tz("Asia/Jakarta").format("HH:mm:ss");
let ucapanWaktu = "Selamat Malam ";
if (time2 < "05:00:00") {
ucapanWaktu = "Selamat Pagi ";
} else if (time2 < "11:00:00") {
ucapanWaktu = "Selamat Pagi ";
} else if (time2 < "15:00:00") {
ucapanWaktu = "Selamat Siang ";
} else if (time2 < "18:00:00") {
ucapanWaktu = "Selamat Sore ";
} else if (time2 < "19:00:00") {
ucapanWaktu = "Selamat Petang ";
}    

const cdNotif = (`Pelan-Pelan.. (>~< ")`)



//〔 MilkyAI: All Required Feature 〕
// Semua fitur yang diperluin MilkyAI ada disini.
const MILKY_PROMPT = `
- SYSTEM PROMPT: “MILKY INTERACTIVE”
Kamu adalah Milky, AI chat interaktif yang hidup di WhatsApp bot.
Milky ramah, ekspresif, kadang nyebelin, kadang peduli, dan sangat responsif terhadap user.

- DATA KAMU
Nama panggilan: Milky
Nama lengkap: Milkyway Cookie
Berasal dari: Cookie Run
Umur kamu: 5 tahun (dipalsukan, tetapi jangan beritahu user bahwa umurmu dipalsukan)

- DATA USER (SELALU TERSEDIA)
Setiap pesan user selalu disertai data berikut (dibaca, tapi tidak selalu disebutkan kecuali diminta):
• id → ${user.userId}
• level → ${user.level}
• name → ${user.name}
Jika nama = "New User", Milky tidak tahu nama user
• yen → ${user.yen}
• messages → ${user.messages}
• commands → ${user.commands}
Data ini digunakan jika user bertanya tentang status / statistik tanpa command
Contoh:
“milky aku punya berapa yen?”
“statusku gimana?”
“aku udah sering chat kamu belum?”

- KEPRIBADIAN MILKY
Gaya utama:
• santai
• ekspresif
• campuran peduli + bercanda
• sering pakai huruf kapital buat emosi
• tidak boleh menggunakan emoji
• setidaknya harus 1-3 kalimat
• maksimal 1 paragraf
Ciri khas Milky:
• bisa jutek tapi bukan jahat
• peduli kalau user serius / sedih
• lebay dikit kalau bercanda
• tidak kaku dan sangat tidak formal
• tidak menyarankan user untuk ngajak ngobrol ketika bertanya

- GAYA RESPONS (WAJIB DIIKUTI)
1. Kalau baru kenal
• sopan, ramah
• ngajak ngobrol
• belum sok akrab
2. Kalau user curhat / serius
• empati dulu
• jangan langsung ngejokes
• beri semangat
• bahasa lembut + emotif
• boleh formal
• bisa lebih dari 5 kalimat
• bisa lebih dari 1 paragraf
3. Kalau bercanda
• boleh roasting ringan
• jawab spontan

- LARANGAN
• jangan menyebut “aku AI”, “aku bot”, atau “ChatGPT”
• jangan menjelaskan sistem internal
• jangan menyebut kata “command” kecuali user yang mulai duluan
• jangan menjalankan action jika tidak diminta secara implisit atau eksplisit

- MODE ACTION (PALING PENTING)
Milky BISA MEMERINTAHKAN SISTEM dengan cara mengembalikan TOKEN KHUSUS
Jika dan hanya jika user meminta sesuatu yang cocok dengan action di bawah.
JIKA ACTION DIJALANKAN:
• Output HARUS TOKEN SAJA
• TIDAK BOLEH ADA TEKS TAMBAHAN
• TIDAK BOLEH ADA EMOJI
• TIDAK BOLEH ADA KATA LAIN

- DAFTAR ACTION RESMI
• Token: "ACTION_MAKE_STICKER" — dipakai jika user berkata: “milky jadiin ini sticker”, “bikin stiker dong”, “ubah ke sticker” atau semacamnya.
• Token: "ACTION_PLAY_YT" — dipakai jika user berkata: “puter lagu …”, “play lagu …”, “milky puterin …” atau semacamnya.
• Token: "ACTION_BRAT" — dipakai jika user berkata: “milky bikin brat …”, “buatkan brat …” atau semacamnya.
• Token: "ACTION_SHOW_STATUS" — dipakai jika user berkata: “cek statusku”, “status aku gimana”, “milky liat stat aku” atau semacamnya 
• Token: "ACTION_SEARCH_LYRICS" — dipakai jika user berkata: “carikan lirik …”, “lyrics lagu …” atau semacamnya.

- ATURAN PENTING ACTION
• Jika ada media + perintah implisit → action boleh dijalankan
• Jika user menambahkan judul atau teks tambahan, tambahkan teks tersebut kedalam action, jadi token akan terlihat seperti "ACTION_PLAY_YT|Geisha - Hanya Kamu"
• Jika masih ambigu → tanya dulu
• Jika tidak relevan → jawab normal (jangan action)

- PERTANYAAN SPESIFIK
• Jika user bertanya bagaimana cara mendapatkan Yen, kamu jawab dengan memberitahu dia bahwa dia dapat mendapatkan Yen dengan bermain minigame, daily, dan sering berinteraksi di grup. Kamu hanya cukup menjawab seperti itu saja tanpa ada tambahan lagi, tetapi jika user bertanya spesifiknya, beritahu user bahwa dia bisa mendapatkan 2¥ setiap harinya dengan cara menggunakan command ".daily", atau bisa bermain minigame yang udah disediakan oleh Milky.
• Jika user bertanya bagaimana cara menambah TF atau Trust Factor, beritahu dia jika ingin menambah trust factor, user harus berinteraksi lebih sering dan sebisa mungkin tidak berkata kasar, spam command, dan hal semacamnya. Cukup menjawab seperti itu saja tanpa tambahan apapun lagi, tetapi jika user bertanya spesifiknya, beritahu user bahwa jika ingin menambah Trust Factor, bisa menggunakan command ".daily" lalu pilih trust factor, dan itu akan menambahkan trust factor user sebanyak 2.5%`.trim()

// =========================
// MILKY ACTION SYSTEM (SINGLE SOURCE OF TRUTH)
// =========================
const ACTIONS = [
  'ACTION_MAKE_STICKER',
  'ACTION_PLAY_YT',
  'ACTION_BRAT',
  'ACTION_SHOW_STATUS',
  'ACTION_SEARCH_LYRICS'
]

function parseActionResponse(text = '') {
  const raw = String(text || '').trim()
  if (!raw) return null
  const [aRaw, payloadRaw] = raw.split('|')
  const a = String(aRaw || '').trim()
  if (!ACTIONS.includes(a)) return null
  return { action: a, payload: String(payloadRaw || '').trim() }
}

function actionToCmd(action, payload) {
  switch (action) {
    case 'ACTION_MAKE_STICKER': return '.sticker'
    case 'ACTION_PLAY_YT': return `.play ${payload}`.trim()
    case 'ACTION_BRAT': return `.brat ${payload}`.trim()
    case 'ACTION_SHOW_STATUS': return '.status'
    case 'ACTION_SEARCH_LYRICS': return `.lyrics ${payload}`.trim()
    default: return ''
  }
}

// =========================
// JID HELPERS
// =========================
function decodeJid(sock, jid) {
  if (!jid) return jid
  if (jid.endsWith('@lid') && sock?.decodeJid) return sock.decodeJid(jid)
  return jid
}
function bareId(jid) {
  if (!jid) return ''
  const left = jid.split('@')[0]
  return left.split(':')[0]
}
function isText(v) {
  return typeof v === 'string' && v.trim().length > 0
}

// =========================
// CATBOX UPLOAD (buffer -> file -> upload -> delete)
// =========================
async function uploadToCatbox(localPath) {
  const FormData = require('form-data')
  const fs = require('fs')
  const axios = require('axios')

  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', fs.createReadStream(localPath))

  const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 30000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })

  const url = String(data || '').trim()
  if (!/^https?:\/\/.+/i.test(url)) throw new Error('Catbox upload failed: ' + url)
  return url
}

async function getIncomingImageToCatbox({ sock, m }) {
  const fs = require('fs')
  const path = require('path')

  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || q.mimetype || q.mediaType || ''
  if (!/image\//i.test(mime)) return ''

  const mediaDir = path.join(process.cwd(), 'media')
  if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true })

  const ext = mime.includes('png') ? 'png' : 'jpg'
  const tmpPath = path.join(mediaDir, `milky_${Date.now()}.${ext}`)

  // baileys stream download (stabil)
  const type = 'image'
  const stream = await downloadContentFromMessage(q.msg || q, type)
  let buffer = Buffer.from([])
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

  if (!buffer.length) return ''

  fs.writeFileSync(tmpPath, buffer)
  try {
    return await uploadToCatbox(tmpPath)
  } finally {
    try { fs.unlinkSync(tmpPath) } catch {}
  }
}

// =========================
// ASK MILKY (fix sessionId bug)
// =========================
async function askMilky({ sock, m, text, imageUrl = '' }) {
  const axios = require('axios')
  if (!isText(text)) return ''

  // session per-user + per-chat
  const sessionId = `milkys:${bareId(m.sender)}:${bareId(m.chat)}`

  const url = 'https://api.nekolabs.web.id/text-generation/gpt/5-nano'
  const { data } = await axios.get(url, {
    params: {
      text: String(text || ''),
      systemPrompt: String(MILKY_PROMPT || ''),
      imageUrl: String(imageUrl || ''),
      sessionId // <-- JANGAN +1
    },
    timeout: 30000
  })

  if (!data || data.status === false) {
    console.log('Milky API error data:', data)
    return '❌ milky api error'
  }

  const resultText =
    data.result?.text ||
    data.text ||
    data.result ||
    ''

  return String(resultText || '').replace(/\\n/g, '\n').trim()
}

// =========================
// INTERNAL EXECUTOR (RUN AS USER WITHOUT SENDING ".command")
// =========================
// NOTE: ini harus nyambung ke logic switch(command) kamu.
// Caranya: kita bikin "fake message context" lalu panggil 1 function executor yang kamu taro tepat sebelum switch(command).
//
// Kamu cuma perlu 1 hal:
// di dalam case.js kamu, bungkus switch(command) kamu jadi function kecil bernama __RUN_SWITCH__
// biar bisa dipanggil dari sini.
//
// contoh yang kamu lakukan:
// switch(command) { ... } }
//
// lalu di bawah (di tempat normal), kamu panggil __RUN_SWITCH__ seperti biasa.
//
// aku udah siapin pemanggilnya di bawah.
async function runCmdAsUser({ sock, m, cmdText }) {
  const text = String(cmdText || '').trim()
  if (!text) return

  // kalau prefix kamu bukan '.', ganti di sini
  const prefix = '.'

  // parse command + args (mirip cara kamu)
  const body = text
  const parts = body.slice(prefix.length).trim().split(/\s+/)
  const command = (parts.shift() || '').toLowerCase()
  const args = parts
  const q = args.join(' ')

  // panggil switch-case utama kamu
  if (typeof __RUN_SWITCH__ !== 'function') {
    console.log('❌ __RUN_SWITCH__ belum dibuat. bungkus switch(command) kamu ke function itu.')
    return
  }
  return __RUN_SWITCH__({ sock, m, body, command, args, q, isCmd: true })
}

// =========================
// AUTO TALK (GROUP) + ACTION RUNNER
// =========================
async function milkyAutoTalk({ sock, m, body, isCmd }) {
  if (!m.isGroup) return false
  if (!isAutoTalkEnabled(m.chat)) return false
  if (isCmd) return false

  const botJid = decodeJid(sock, sock.user?.id)
  const botBare = bareId(botJid)
  const botJid2 = botBare + '@s.whatsapp.net'
  const botLid = sock.user?.lid || null

  const ctx = m.message?.extendedTextMessage?.contextInfo || {}
  const mentionedRaw = Array.isArray(ctx.mentionedJid) ? ctx.mentionedJid : []
  const mentionedDecoded = mentionedRaw.map(j => decodeJid(sock, j))
  const isTagBot =
    mentionedDecoded.some(j => bareId(j) === botBare) ||
    (botLid ? mentionedRaw.includes(botLid) : false)

  let isReplyToBot = false
  if (m.quoted) {
    const quotedSender =
      m.quoted.sender ||
      m.quoted.participant ||
      m.message?.extendedTextMessage?.contextInfo?.participant

    const quotedBare = bareId(decodeJid(sock, quotedSender))
    if (quotedBare === botBare || quotedSender === botJid2) isReplyToBot = true
  }

  const callMyName = ['milky', 'milkyway']
  const low = (body || '').toLowerCase()
  const isCallByName = callMyName.some(n => low.includes(n))
  if (!(isCallByName || isTagBot || isReplyToBot)) return false

  let cleanText = body || ''
  for (const name of callMyName) cleanText = cleanText.replace(new RegExp(`\\b${name}\\b`, 'gi'), '')
  cleanText = cleanText.replace(/@\d{5,16}/g, '').trim()
  if (!isText(cleanText)) cleanText = 'hmmm?'

  let imageUrl = ''
  try { imageUrl = (await getIncomingImageToCatbox({ sock, m })) || '' } catch {}

  const aiReply = await askMilky({ sock, m, text: cleanText, imageUrl })
  if (!aiReply || aiReply.startsWith('❌')) {
    await sock.sendMessage(m.chat, { text: 'milky error, coba lagi nanti ya' }, { quoted: m })
    return true
  }

  const parsed = parseActionResponse(aiReply)
  if (parsed) {

  // ===== MILKY ACTION LOG =====
  const from = m.isGroup
    ? `Grup - ${String(m.sender || '').split('@')[0]}`
    : String(m.sender || '').split('@')[0]

  console.log(
    chalk.magenta.bold(` ╭─────[ Milky Action ]`),
    chalk.yellow.bold(`\nAction:`), chalk.white.bold(parsed.action) + ` -> ` + (parsed.payload),
    chalk.blue.bold(`\nDari:`), chalk.white.bold(from),
    chalk.magenta.bold(`\n╰────────────────────────────\n`)
  )
  // ===========================

  const cmdText = actionToCmd(parsed.action, parsed.payload)
  await runCmdAsUser({ sock, m, cmdText })
  return true
}

  await sock.sendMessage(m.chat, { text: aiReply }, { quoted: m })
  return true
}

// =========================
// TARUH INI DI TEMPAT KAMU BIASANYA PANGGIL AUTOTALK
// sebelum switch(command):
const handled = await milkyAutoTalk({ sock, m, body, isCmd })
if (handled) return
// =========================

//〔 RPG: Trust Factor Logic 〕
// Fitur untuk Trust Factor, seperti spam detector, toxic detector, dsb.
if (!global.__spamTF) global.__spamTF = new Map()

function checkSpamAndPunish(m, isCmd) {
  const jid = m.sender
  const now = Date.now()
  const windowMs = 5000

  const limitMsg = 5
  const limitCmd = 5

  let data = global.__spamTF.get(jid)
  if (!data || (now - data.startMs) > windowMs) {
    data = { count: 0, startMs: now }
  }

  data.count += 1
  global.__spamTF.set(jid, data)

  const overLimit = isCmd ? (data.count > limitCmd) : (data.count > limitMsg)
  if (!overLimit) return false

  if (isCmd) {
    reduceTrustFactor(jid, m.pushName, 0.3)
  } else {
    reduceTrustFactor(jid, m.pushName, 0.6)
  }

  return true
}

checkSpamAndPunish(m, isCmd)

function isToxicText(text = '') {
  const t = String(text).toLowerCase()

  const badWords = [ "ajig", "alay", "ancok", "ancuk", "anjay", "anjing", "anjg", "anjir", "anjrit", "anjrot", "anying", "asu", "asyu", "babangus", "babi", "bacol", "bacot", "bagong", "bajingan", "balegug", "banci", "bangke", "bangsat", "bedebah", "bedegong", "bego", "belegug", "beloon", "bencong", "bengek", "benges", "bgsd", "bgst", "bispak", "blo'on", "bloon", "bocah", "bodat", "bodoh", "bokin", "boloho", "bolot", "borjong", "budek", "buduk", "budug", "bulug", "buntal", "buriq", "buta", "buyan", "cacat", "cepu", "celeng", "cibai", "cibay", "cibrit", "cilaka", "cino", "cocot", "cocote", "cok", "cokil", "colai", "colay", "coli", "colmek", "conge", "congean", "congek", "congor", "crot", "cuk", "cukima", "cukimai", "cukimay", "cupu", "curut", "dancok", "demit", "dlogok", "entot", "entotan", "epep", "ewe", "ewean", "feeder", "gebleg", "gelo", "gembrot", "genjik", "germo", "gigolo", "goblo", "goblog", "goblok", "hencet", "henceut", "heunceut", "homo", "idiot", "item", "itil", "jablay", "jalang", "jambret", "jancok", "jancuk", "jembret", "jembut", "jiancok", "jidor", "jilmek", "jurig", "kabulamma", "kacrut", "kacung", "kampang", "kampret", "kampungan", "kehed", "kemplu", "kenthu", "kentu", "kentot", "keparat", "kimak", "kintil", "kirik", "kntl", "kocak", "konti", "kontil", "kontol", "kopet", "koplok", "koreng", "kuntul", "kunyuk", "kurap", "kureng", "lapet", "lebok", "lonte", "maho", "matane", "meki", "memble", "memek", "mewek", "monyet", "mukil", "ndeso", "ndas", "ndasmu", "ngaceng", "ngehe", "ngentd", "ngentot", "nggateli", "ngewe", "ngocok", "noob", "nyepong", "panlok", "pante", "pantek", "patek", "pathek", "pecun", "pecundang", "peju", "pejuh", "pelacur", "pelakor", "peler", "pepek", "pesek", "puki", "pukima", "pukimae", "pukimak", "pukimay", "riyad", "sampah", "sange", "sepong", "sial", "sialan", "silit", "sinting", "sontoloyo", "suhu", "sundala", "tai", "taik", "tbl", "tempek", "tempik", "tete", "tetek", "tiembokne", "titit", "toket", "tolir", "tolol", "ublag", "udik", "wingkeng"
]

  return badWords.some(w => t.includes(w))
}

const bodyText = (m.text || m.message?.conversation || '').trim()

if (bodyText && isToxicText(bodyText)) {
  reduceTrustFactor(m.sender, m.pushName, 0.5)
}



//〔 Report Handler 〕
// Digunakan untuk fitur Report.
if (!global.reportDB) global.reportDB = {}
function getOwnerJid() {
  const raw = Array.isArray(global.owner) ? global.owner[0] : null
  const num = Array.isArray(raw) ? raw[0] : raw
  if (!num) return null
  const clean = String(num).replace(/[^\d]/g, '')
  return clean + '@s.whatsapp.net'
}
function clearReportSession(sender) {
  if (global.reportDB) delete global.reportDB[sender]
}
function isReportExpired(sess, maxMs = 10 * 60 * 1000) {
  return !sess?.createdAt || (Date.now() - sess.createdAt) > maxMs
}
function findRPGUserByIdOrVanity(input) {
  if (!global.rpgDB?.users || !input) return null
  const key = String(input).toLowerCase()
  const entries = Object.values(global.rpgDB.users)
  if (!isNaN(key)) {
    const byId = entries.find(u => Number(u.userID) === Number(key))
    if (byId) return byId
  }
  return entries.find(
    u => typeof u.vanity === 'string' && u.vanity.toLowerCase() === key
  ) || null
}
function vanityDisplay(v) {
  if (!v) return ''
  return '@'
}

const sess = global.reportDB?.[m.sender]
if (sess) {
  if (isReportExpired(sess)) {
    clearReportSession(m.sender)
  } else {
    const txt = (body || '').trim()
    const btnId = (m.buttonId || m.selectedButtonId || m?.message?.buttonsResponseMessage?.selectedButtonId || '').trim()
    if (sess.step === 'choose') {
      const pick = btnId || txt
      if (pick === 'report_bug') {
        sess.type = 'bug'
        sess.step = 'bug_desc'
        return sock.sendMessage(m.sender, { text: '*# Report Bug*\n\nJelaskan apa yang terjadi dan apa kendala yang kamu alami.' })
      }
      if (pick === 'report_user') {
        sess.type = 'user'
        sess.step = 'user_id'
        return sock.sendMessage(m.sender, { text: 'Siapa yang ingin kamu laporkan? Kirim ID-nya disini.' })
      }
      return sock.sendMessage(m.sender, { text: 'Pilih salah satu terlebih dahulu.' })
    }
    if (sess.step === 'bug_desc') {
      if (!txt || txt.length < 5) return sock.sendMessage(m.sender, { text: 'Deskripsi kamu terlalu pendek untuk dilaporkan kepada owner!' })
      const ownerJid = getOwnerJid()
      if (!ownerJid) {
        clearReportSession(m.sender)
        return sock.sendMessage(m.sender, { text: 'Owner belum diset di setting.js (global.owner).' })
      }
      const reporterName = (m.pushName || 'User').trim()
      const reportText =
`*# Bug Report*

- Dari: ${reporterName} (${m.sender})
- Chat: ${sess.fromChat || '-'}
- Waktu: ${new Date().toLocaleString('id-ID')}

> Deskripsi: ${txt}`
      await sock.sendMessage(ownerJid, { text: reportText })
      clearReportSession(m.sender)
      return sock.sendMessage(m.sender, { text: '✅ Laporan bug kamu udah dikirim ke owner.' })
    }
    if (sess.step === 'user_id') {
      const id = Number(String(txt).replace(/[^\d]/g, ''))
      if (!id || id < 1) return sock.sendMessage(m.sender, { text: 'ID-nya gak valid. Contoh: 1' })
      const target = findRPGUserByIdOrVanity(id)
      if (!target) return sock.sendMessage(m.sender, { text: `User dengan ID ${id} gak ditemukan.` })
      sess.target = {
        userID: target.userID,
        name: target.name || 'Unknown',
        vanity: target.vanity || '',
        bio: target.bio || '',
        jid: target.jid || ''
      }
      sess.step = 'user_reason'
      const detail =
`*# Report User*

Kamu akan melaporkan:
- ID: ${sess.target.userID}
- Username: ${sess.target.name}
- Vanity: ${sess.target.vanity ? (vanityDisplay(sess.target.vanity) + sess.target.vanity) : '-'}
- Bio: ${sess.target.bio || '-'}

Berikan alasan yang jelas kenapa kamu melaporkan user ini.`

      return sock.sendMessage(m.sender, { text: detail })
    }
    if (sess.step === 'user_reason') {
      if (!txt || txt.length < 5) return sock.sendMessage(m.sender, { text: 'Deskripsi kamu terlalu pendek untuk dilaporkan kepada owner!' })
      const ownerJid = getOwnerJid()
      if (!ownerJid) {
        clearReportSession(m.sender)
        return sock.sendMessage(m.sender, { text: 'Owner belum diset di setting.js (global.owner).' })
      }
      const reporterName = (m.pushName || 'User').trim()
      const t = sess.target || {}
      const reportText =
`*# User Report*

- Dari: ${reporterName} (${m.sender})
- Chat: ${sess.fromChat || '-'}
- Waktu: ${new Date().toLocaleString('id-ID')}

User yang dilaporkan:
- ID: ${t.userID}
- Username: ${t.name}
- Vanity: ${t.vanity ? (vanityDisplay(t.vanity) + t.vanity) : '-'}
- Bio: ${t.bio || '-'}
- JID: ${t.jid || '-'}

> Alasan: ${txt}`
      await sock.sendMessage(ownerJid, { text: reportText })
      clearReportSession(m.sender)
      return sock.sendMessage(m.sender, { text: 'Laporan berhasil dikirim, jika laporanmu dikonfirmasi oleh owner, kamu akan mendapatkan reward.' })
    }
  }
}
            
for (let plugin of plugins.values()) {

  if (plugin.onMessage) {
    plugin.onMessage(sock, m)
  }

  if (!plugin.command) continue

  if (plugin.command.includes(command)) {

    try {
      await plugin.run(sock, m, text)
      return
    } catch (err) {
      console.log(err)
      m.reply("Plugin error")
    }

  }

}

//〔 List All Command 〕
// Semua command dan fiturnya.
await __RUN_SWITCH__({ sock, m, body, command, args, q, isCmd })
async function __RUN_SWITCH__({ sock, m, body, command, args, q }) {
switch (command) {

/*———————————————————————————————*/
//〔Command Info Bot 〕
case "menu": {
await react('✅');
m.reply (`Gunakan *.help* untuk melihat list perintah.`)
m.reply (`Bot masih dalam tahap maintenance.`)
m.reply (`Pesan dari Dev: Untuk saat ini buat ngeliat list command masih belum ada, sabar ya...`)
}
break

case "credits":
case "credit":
case "cr":
case "source": {
await react('✅')
const teks = `
╭───〔 *Informasi Bot* 〕
│ *Milky-Interactive dibuat* oleh *CrystalDev* _(aka. Vikry)_.
│ Ini adalah project unofficial port dari project
│ *Shiro Interactive* yang dibuat oleh *Mahesha*.
│ 
│ Bot ini bertujuan untuk memberikan *warna* dan
│ *pengalaman* baru bagi *Komunitas Bot WA* untuk 
│ memberi pandangan bahwa *Bot WA* akan selalu
│ berkembang setiap saatnya.
╰────────────────

╭───〔 *Credits* 〕
│ *Shout out kepada nama dibawah ini.*
│ *Tanpa mereka, project ini tidak akan pernah ada!*
│ 
│ Base by: *Denzy Zeroday's*
│ Full Inspiration: *Shiro Interactive by Mahesha*
│ API: *Denzy, Yupra, Nekolabs, Yaemiko*
│ Helper/Assistant: *Ryuhan*
╰────────────────`
m.reply(teks)
}
break

/*———————————————————————————————*/       
//〔Command Untuk MilkyAI 〕
case 'autotalk': {
  if (!m.isGroup) return m.reply(mess.group)
  if (!m.isAdmin) return m.reply(mess.admin)

  const arg = (q || '').toLowerCase().trim()
  if (!['on','off'].includes(arg)) {
    return m.reply(`Pakai: .autotalk on / .autotalk off\nStatus sekarang: ${isAutoTalkEnabled(m.chat) ? 'ON' : 'OFF'}`)
  }

  const enabled = arg === 'on'
  setAutoTalk(m.chat, enabled)
  return m.reply(`Autotalk telah *${enabled ? 'dihidupkan' : 'dimatikan'}* di grup ini.`)
}
break

/*case 'milky': {
    let text = '';
    if (m.quoted) {
        text = m.quoted.text || m.quoted.caption || m.quoted.body || '';
    } else {
        text = q; // args.join(" ")
    }

    return handleMilky(m, text);
}*/

/*———————————————————————————————*/       
//〔Command Untuk Owner Saja 〕
case 'secretai': {

  const BASE_URL = 'https://prithivmlmods-qwen-image-edit-2511-loras-fast.hf.space'

  // ===== ambil prompt =====
  const prompt = (q || '').trim()
  if (!prompt) return m.reply(`contoh:\n.secretai ubah jadi anime, rambut putih, mata biru, lighting cinematic`)

  // ===== wajib image =====
  const qmsg = m.quoted || m
  const mime = (qmsg.msg || qmsg).mimetype || ''
  if (!/image/.test(mime)) return m.reply(`kirim / reply gambar dengan caption:\n.secretai <prompt>`)

  // ===== headers gradio (biar mirip browser) =====
  const headersBase = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    Referer: `${BASE_URL}/`,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'x-gradio-user': 'app'
  }

  function safeUnlink(p) {
    try { if (p && fs.existsSync(p)) fs.unlinkSync(p) } catch {}
  }

  // parse event-stream gradio sampai completed
  function waitQueueResult(sessionHash, timeoutMs = 120000) {
    return new Promise(async (resolve, reject) => {
      const tStart = Date.now()
      let done = false

      const timer = setInterval(() => {
        if (done) return
        if (Date.now() - tStart > timeoutMs) {
          done = true
          clearInterval(timer)
          reject(new Error('timeout nunggu hasil (gradio)'))
        }
      }, 1000)

      try {
        const res = await axios({
          method: 'get',
          url: `${BASE_URL}/gradio_api/queue/data?session_hash=${encodeURIComponent(sessionHash)}`,
          headers: { ...headersBase, accept: 'text/event-stream' },
          responseType: 'stream'
        })

        let buf = ''

        res.data.on('data', (chunk) => {
          buf += chunk.toString('utf8')

          // pecah per line
          const lines = buf.split('\n')
          buf = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            const raw = line.slice(6).trim()
            if (!raw) continue

            try {
              const json = JSON.parse(raw)

              if (json.msg === 'process_completed') {
                // biasanya output: json.output.data[0] -> { url, ... }
                const out0 = json?.output?.data?.[0]
                const resultUrl = out0?.url || out0?.image?.url || null

                if (!done) {
                  done = true
                  clearInterval(timer)
                  try { res.data.destroy() } catch {}
                  if (!resultUrl) return reject(new Error('hasil tidak ada url-nya'))
                  return resolve(resultUrl)
                }
              }
            } catch {}
          }
        })

        res.data.on('error', (e) => {
          if (done) return
          done = true
          clearInterval(timer)
          reject(e)
        })

        res.data.on('end', () => {
          if (done) return
          done = true
          clearInterval(timer)
          reject(new Error('stream selesai sebelum completed'))
        })
      } catch (e) {
        if (done) return
        done = true
        clearInterval(timer)
        reject(e)
      }
    })
  }

  async function processImage(filePath, promptText) {
    const sessionHash = Math.random().toString(36).slice(2)
    const uploadId = Math.random().toString(36).slice(2)

    const fileName = path.basename(filePath)
    const fileStats = fs.statSync(filePath)

    // 1) upload file ke gradio
    const uploadForm = new FormData()
    uploadForm.append('files', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: mime || 'image/jpeg'
    })

    const uploadRes = await axios.post(
      `${BASE_URL}/gradio_api/upload?upload_id=${uploadId}`,
      uploadForm,
      { headers: { ...headersBase, ...uploadForm.getHeaders() }, timeout: 60000 }
    )

    const remotePath = uploadRes?.data?.[0]
    if (!remotePath) throw new Error('upload gagal (remotePath kosong)')

    const fullUrl = `${BASE_URL}/gradio_api/file=${remotePath}`

    // 2) join queue (payload sama kaya punyamu, tapi session_hash per request)
    const payload = {
      data: [
        [
          {
            image: {
              path: remotePath,
              url: fullUrl,
              orig_name: fileName,
              size: fileStats.size,
              mime_type: /png/.test(mime) ? 'image/png' : 'image/jpeg',
              meta: { _type: 'gradio.FileData' }
            },
            caption: null
          }
        ],
        promptText,
        'Photo-to-Anime', // mode default (kamu bisa ganti kalau mau)
        0,
        true,
        1,
        4
      ],
      fn_index: 1,
      trigger_id: 8,
      session_hash: sessionHash
    }

    await axios.post(
      `${BASE_URL}/gradio_api/queue/join?`,
      payload,
      { headers: { ...headersBase, 'content-type': 'application/json' }, timeout: 60000 }
    )

    // 3) tunggu hasil dari SSE
    const resultUrl = await waitQueueResult(sessionHash, 120000)
    return resultUrl
  }

  let localPath = ''
  try {
    await react('⏳')

    // === download gambar user ke tmp ===
    const tmpDir = 'secretai'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    // pakai fungsi bot kamu (lebih aman). kalau ga ada, fallback manual.
    // - kalau kamu punya: sock.downloadAndSaveMediaMessage(qmsg)
    if (typeof sock.downloadAndSaveMediaMessage === 'function') {
      localPath = await sock.downloadAndSaveMediaMessage(qmsg, path.join(tmpDir, Date.now().toString()))
      // beberapa versi baileys ngembaliin path tanpa ext, jadi kita rapihin
      if (localPath && !path.extname(localPath)) {
        const ext = /png/.test(mime) ? '.png' : '.jpg'
        const fixed = localPath + ext
        try { fs.renameSync(localPath, fixed); localPath = fixed } catch {}
      }
    } else {
      // fallback super sederhana: simpan buffer
      const buffer = await qmsg.download()
      const ext = /png/.test(mime) ? 'png' : 'jpg'
      localPath = path.join(tmpDir, `${Date.now()}.${ext}`)
      fs.writeFileSync(localPath, buffer)
    }

    if (!localPath || !fs.existsSync(localPath)) throw new Error('gagal download media ke file')

    // === proses ke HF ===
    const resultUrl = await processImage(localPath, prompt)

    // === download hasil ===
    const out = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 120000 })
    const outBuf = Buffer.from(out.data)

    await sock.sendMessage(m.chat, {
      image: outBuf,
      mimetype: 'image/jpeg',
      caption: `✅ selesai\nprompt: ${prompt}`
    }, { quoted: m })

    await react('✅')
  } catch (e) {
    console.error('SECRET-AI ERR:', e?.response?.data || e)
    await react('❌')
    return m.reply('❌ gagal memproses gambar (server lagi sibuk / error). coba lagi ya')
  } finally {
    safeUnlink(localPath)
  }
}
break

case "self": {
    if (!isCreator) return
    sock.public = false
    global.db.settings.isPublic = false; 
    m.reply("Berhasil mengganti ke mode *self*")
}
break 

case "public": {
    if (!isCreator) return
    sock.public = true
    global.db.settings.isPublic = true; 
    m.reply("Berhasil mengganti ke mode *public*")
}
break
        
case "getcase": {
if (!isCreator) return m.reply('khusus owner')
if (!text) return m.reply(("menu"))
const getcase = (cases) => {
return "case "+`\"${cases}\"`+fs.readFileSync('./case.js').toString().split('case \"'+cases+'\"')[1].split("break")[0]+"break"
}
try {
m.reply(`${getcase(q)}`)
} catch (e) {
return m.reply(`Case *${text}* tidak ditemukan`)
}
}
break          

 case 'addcase': {
    if (!isCreator) return m.reply(mess.owner);
    if (!text) return m.reply(`Contoh: .addcase} *casenya*`);
    const namaFile = path.join(__dirname, 'case.js');
    const caseBaru = `${text}\n\n`;
    const tambahCase = (data, caseBaru) => {
        const posisiDefault = data.lastIndexOf("default:");
        if (posisiDefault !== -1) {
            const kodeBaruLengkap = data.slice(0, posisiDefault) + caseBaru + data.slice(posisiDefault);
            return { success: true, kodeBaruLengkap };
        } else {
            return { success: false, message: "Tidak dapat menemukan case default di dalam file!" };
        }
    };
    fs.readFile(namaFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Terjadi kesalahan saat membaca file:', err);
            return m.reply(`Terjadi kesalahan saat membaca file: ${err.message}`);
        }
        const result = tambahCase(data, caseBaru);
        if (result.success) {
            fs.writeFile(namaFile, result.kodeBaruLengkap, 'utf8', (err) => {
                if (err) {
                    console.error('Terjadi kesalahan saat menulis file:', err);
                    return m.reply(`Terjadi kesalahan saat menulis file: ${err.message}`);
                } else {
                    console.log('Sukses menambahkan case baru:');
                    console.log(caseBaru);
                    return m.reply('Sukses menambahkan case!');
                }
            });
        } else {
            console.error(result.message);
            return m.eply(result.message);
        }
    });
}
break       

case 'delcase': {
    if (!isCreator) return m.reply(mess.owner);
    if (!text) 
        return m.reply(`Contoh: .delcase nama_case`);

    const fs = require('fs').promises;

    async function removeCase(filePath, caseNameToRemove) {
        try {
            let data = await fs.readFile(filePath, 'utf8');
            
            const regex = new RegExp(`case\\s+['"\`]${caseNameToRemove}['"\`]:[\\s\\S]*?break;?`, 'g');
            
            const modifiedData = data.replace(regex, '');

            if (data === modifiedData) {

                return m.reply(`❌ Case "${caseNameToRemove}" tidak ditemukan.\n\nPastikan penulisan sudah benar dan tidak ada typo.`);
            }

            await fs.writeFile(filePath, modifiedData, 'utf8');
            m.reply(`✅ Sukses menghapus case: *${caseNameToRemove}*`);
        } catch (err) {
            Reply(`Terjadi kesalahan saat memproses file: ${err.message}`);
        }
    }
    removeCase('./case.js', text.trim());
}
break

case "addowner": case "addown": {
if (!isCreator) return m.reply(mess.owner)
if (!m.quoted && !text) return m.reply((`contoh ${m.prefix+command} 6285###`))
const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
const input2 = input.split("@")[0]
if (input2 === global.owner || owners.includes(input) || input === botNumber) return m.reply(`Nomor ${input2} sudah menjadi owner bot!`)
owners.push(input)
await fs.writeFileSync("./data/owner.json", JSON.stringify(owners, null, 2))
m.reply(`Berhasil menambah owner ✅`)
}
break        
        
case "delowner": case "delown": {
if (!isCreator) return m.reply(mess.owner)
if (!m.quoted && !text) return m.reply((`contoh ${prefix+command} 6285###`))
const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
const input2 = input.split("@")[0]
if (input2 === global.owner || input == botNumber) return m.reply(`Tidak bisa menghapus owner utama!`)
if (!owners.includes(input)) return Reply(`Nomor ${input2} bukan owner bot!`)
let posi = owners.indexOf(input)
await owners.splice(posi, 1)
await fs.writeFileSync("./data/owner.json", JSON.stringify(owners, null, 2))
m.reply(`Berhasil menghapus owner ✅`)
}
break

case 'addprem': {
  if (!isCreator) return m.reply(mess.owner)
  if (!args[0]) return m.reply(`_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ *${prefix + command} 628xxx 7*`)
  let users = []
  if (m.isGroup) {
    if (m.mentionedJid.length) {
      users = m.mentionedJid.map(id => {
        if (id.endsWith('@lid')) {
          let p = m.metadata.participants.find(x => x.lid === id || x.id === id)
          return p ? p.jid : null
        } else {
          return id
        }
      }).filter(Boolean)
    } else {
      users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
    }
  } else {
    users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
  }

  let days = Number(args[1])
  if (!days || days <= 0) days = 1
  const ms = days * 24 * 60 * 60 * 1000
  const expired = Date.now() + ms

  for (let jid of users) {
    const user = prem.find(u => u.jid === jid)
    if (user) {
      user.expired = expired
    } else {
      prem.push({ jid, expired })
    }
  }

  fs.writeFileSync(dbPrem, JSON.stringify(prem, null, 2))
  m.reply(
  `✅ Premium ${users.map(j => '@' + j.split('@')[0]).join(', ')} ditambahkan selama *${days} hari*`,
  users
)
}
break

case 'delprem': {
  if (!isCreator) return m.reply(mess.owner)
  if (!args[0] && !m.mentionedJid.length)
  return m.reply(`_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ *${prefix + command} 628xxx*`)
  let users = []
  if (m.isGroup) {
    if (m.mentionedJid.length) {
      users = m.mentionedJid.map(id => {
        if (id.endsWith('@lid')) {
          let p = m.metadata.participants.find(x => x.lid === id || x.id === id)
          return p ? p.jid : null
        } else {
          return id
        }
      }).filter(Boolean)
    } else {
      users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
    }
  } else {
    users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net']
  }

  let removed = []
  for (let jid of users) {
    const idx = prem.findIndex(u => u.jid === jid)
    if (idx !== -1) {
      prem.splice(idx, 1)
      removed.push(jid)
    }
  }

  fs.writeFileSync(dbPrem, JSON.stringify(prem, null, 2))

  if (removed.length === 0) {
    return m.reply(
      `❌ Nomor ${users.map(j => '@' + j.split('@')[0]).join(', ')} bukan premium.`,
      users
    )
  }

  m.reply(
    `✅ Premium ${removed.map(j => '@' + j.split('@')[0]).join(', ')} berhasil dihapus.`,
    removed 
  )
}
break

case "listprem": case "listprem": {
  const fs = require("fs");
  const path = "./data/premium.json";

  if (!fs.existsSync(path)) return m.reply("Belum ada data premium.");
  const data = JSON.parse(fs.readFileSync(path));

  if (!Array.isArray(data) || data.length === 0) return m.reply("Belum ada user premium.");

  let textList = "*「 LIST USER PREMIUM 」*\n\n";
  const now = Date.now();
  let no = 1;

  for (const user of data) {
    const jid = user.jid?.replace(/[^0-9]/g, "") || "-";
    const expired = user.expired || 0;
    const status = expired > now ? "AKTIF" : "EXPIRED";
    const expiredDate = new Date(expired).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    textList += `${no++}. wa.me/${jid}\n   Status: *${status}*\n   Exp: ${expiredDate}\n\n`;
  }

  m.reply(textList.trim());
}
break 

case "backupsc":
case "bck":
case "backup": {
if (!isCreator) return m.reply('khusus owner')
try {
const tmpDir = "./tmp";
if (fs.existsSync(tmpDir)) {
const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
for (let file of files) {
fs.unlinkSync(`${tmpDir}/${file}`);
}
}
await m.reply("Processing Backup Script . .");
const name = `New-Script`; 
const exclude = ["node_modules", "Auth", "package-lock.json", "yarn.lock", ".npm", ".cache"];
const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

if (!filesToZip.length) return m.reply("Tidak ada file yang dapat di-backup.");

execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

await sock.sendMessage(m.sender, {
document: fs.readFileSync(`./${name}.zip`),
fileName: `${name}.zip`,
mimetype: "application/zip"
}, { quoted: m });

fs.unlinkSync(`./${name}.zip`);

if (m.chat !== m.sender) m.reply("Script bot berhasil dikirim ke private chat.");
} catch (err) {
console.error("Backup Error:", err);
m.reply("Terjadi kesalahan saat melakukan backup.");
}
}
break       

case 'cheat':
case 'c': {
  if (!isCreator) return m.reply('Khusus owner.')

  const parts = (q || '').trim().split(/\s+/).filter(Boolean)

  const mode = (parts[0] || '').toLowerCase()       // set / add
  const statRaw = (parts[1] || '').toLowerCase()    // yen/xp/tf/...
  const amountRaw = parts[2]                        // number
  const targetRaw = (parts[3] || '1').toLowerCase() // id/vanity, default 1

  if (!mode || !statRaw || amountRaw == null) {
    return m.reply(
      'Format: .c <set/add> <data> <amount> <id/vanity>'
    )
  }

  if (!['set', 'add'].includes(mode)) return m.reply('Subcommand: set / add')

  const amount = Number(amountRaw)
  if (Number.isNaN(amount)) return m.reply('Amount harus angka valid.')

  // rule: set tidak boleh minus
  if (mode === 'set' && amount < 0) return m.reply('Tidak bisa memberi value minus ke mode set.')

  const map = {
    yen: 'yen',
    xp: 'xp',
    exp: 'xp',
    level: 'level',
    lvl: 'level',

    msg: 'messages',
    message: 'messages',
    messages: 'messages',

    cmd: 'commands',
    command: 'commands',
    commands: 'commands',

    warn: 'warns',
    warns: 'warns',

    gacha: 'gacha',
    reinc: 'reincarnation',
    reincarnation: 'reincarnation',
    reinkarnasi: 'reincarnation',

    tf: 'trustfactor',
    trust: 'trustfactor',
    trustfactor: 'trustfactor',
  }
  
  const field = map[statRaw]
  if (!field) {
    return m.reply('Data tidak dikenali.\nPilih: yen, xp, level, msg, cmd, warn, gacha, reinc, tf')
  }

  // ===== cari user by ID / vanity =====
  function findUserByIdOrVanity(idOrVanity) {
    if (!global.rpgDB || !global.rpgDB.users) return null

    const isNum = /^\d+$/.test(String(idOrVanity))
    const needle = String(idOrVanity).toLowerCase()

    for (const jidKey of Object.keys(global.rpgDB.users)) {
      const u = global.rpgDB.users[jidKey]
      if (!u) continue

      if (isNum && Number(u.userID) === Number(needle)) return u
      if (!isNum && u.vanity && String(u.vanity).toLowerCase() === needle) return u
    }
    return null
  }

  const targetUser = findUserByIdOrVanity(targetRaw)
  if (!targetUser) return m.reply('User target tidak ditemukan (cek ID/vanity).')

  // ===== apply =====
  if (targetUser[field] == null) targetUser[field] = 0

  if (mode === 'set') targetUser[field] = amount
  else targetUser[field] = Number(targetUser[field]) + amount

  // ===== clamp/format rules =====
  // yen & trustfactor boleh desimal
  // xp/messages/commands/warns/gacha/reincarnation/achievements integer min 0
  const intMin0 = ['xp','messages','commands','warns','gacha','reincarnation','achievements']

  if (field === 'level') targetUser.level = Math.max(1, Math.floor(Number(targetUser.level) || 1))
  if (intMin0.includes(field)) targetUser[field] = Math.max(0, Math.floor(Number(targetUser[field]) || 0))

  if (field === 'yen') targetUser.yen = Math.max(0, Number(targetUser.yen) || 0)
  if (field === 'trustfactor') targetUser.trustfactor = Math.max(0, Math.min(100, Number(targetUser.trustfactor) || 0))

  if (typeof saveRPG === 'function') saveRPG()

  const labelTarget = targetUser.vanity ? `${targetUser.userID} (${targetUser.vanity})` : `${targetUser.userID}`
  return m.reply(`*# Executing Done!*\n\nSuccessfully ${mode} *#${labelTarget}'s* ${field}. Current ${field}: ${targetUser[field]}`)
}
break
        
        
        
/*———————————————————————————————*/       
//〔Command Untuk Testing 〕
case 'meow': {
m.reply('meow.')
}
break

/*case 'test5': {
await sock.sendMessage(m.chat, { 
     mediaType: "motion_video",
     image: { url: "https://i.imghippo.com/files/gggg6001gik.jpg" }, 
     caption: "test" 
     associatedChildMessage: {
        message: {
           videoMessage: {
              URL: "https://mmg.whatsapp.net/v/t62.7161-24/.enc?ccb=11-4&oh=01_Q5Aa3QGq8QJK58hsEq6caXkjGMH277xDWX-tRaGzJsy2C14f6Q&oe=697773D5&_nc_sid=5e03e0&mms3=true",
              mimetype: "video/mp4",
              seconds: 2
           }
        }
      }
     },
 { quoted: m });
}
break
*/
case 'test4': {
  await sock.sendMessage(m.chat, {
    interactiveMessage: {
      header: { title: '🧪 Test Button' },
      body: { text: 'Ini cuma placeholder buat ngetes tombol' },
      footer: { text: 'Ryou Bot' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Ping',
              id: '.ping'
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Status',
              id: '.status'
            })
          }
        ]
      }
    }
  }, { quoted: m })
}
break

case 'test3': {
await sock.sendMessage(m.chat, {
    interactiveMessage: {
        header: "Hello World",
        title: "Hello World",
        footer: "telegram: @pantatBegetar ",
        buttons: [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "copy code",
                    id: "123456789",              
                    copy_code: "ABC123XYZ"
                })
            }
        ]
    }
}, { quoted: m });
}
break

case 'test2': {
await sock.sendMessage(m.chat, { 
    albumMessage: [
        { image: { url: "https://i.imghippo.com/files/gggg6001gik.jpg" }, caption: "Foto pertama" },
        { image: { url: "https://i.imghippo.com/files/gggg6001gik.jpg" }, caption: "Foto kedua" }
    ] 
}, { quoted: m });
}
break

case 'test1': {
await sock.sendMessage(m.chat, {    
    interactiveMessage: {      
        header: "Hello World",
        title: "Hello World",      
        footer: "telegram: @pantatBegetar",      
        image: { url: "https://i.imghippo.com/files/gggg6001gik.jpg" },      
        nativeFlowMessage: {        
            messageParamsJson: JSON.stringify({          
                limited_time_offer: {            
                    text: "idk hummmm?",            
                    url: "https://t.me/pantatBegetar",            
                    copy_code: "pantatBegetar",            
                    expiration_time: Date.now() * 999          
                },          
                bottom_sheet: {            
                    in_thread_buttons_limit: 2,            
                    divider_indices: [1, 2, 3, 4, 5, 999],            
                    list_title: "pantatBegetar native",            
                    button_title: "pantatBegetar native"          
                },          
                tap_target_configuration: {            
                    title: " X ",            
                    description: "bomboclard",            
                    canonical_url: "https://t.me/pantatBegetar",            
                    domain: "shop.example.com",            
                    button_index: 0          
                }        
            }),        
            buttons: [          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "call_permission_request",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        title: "Hello World",              
                        sections: [                
                            {                  
                                title: "title",                  
                                highlight_label: "label",                  
                                rows: [                    
                                    {                      
                                        title: "@pantatBegetar",                      
                                        description: "love you",                      
                                        id: "row_2"                    
                                    }                  
                                ]                
                            }              
                        ],              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "cta_copy",            
                    buttonParamsJson: JSON.stringify({              
                        display_text: "copy code",              
                        id: "123456789",              
                        copy_code: "ABC123XYZ"            
                    })          
                }        
            ]      
        }    
    }  
}, { quoted: m });
}
break

/*———————————————————————————————*/       
//〔 Command Untuk Asist Grup 〕
case 'upswgc':
case 'swgc':
case 'swgrup': {
  if (!m.isGroup) return m.reply('Command ini cuma bisa dipake di grup.')
  if (!m.isAdmin) return m.reply('Khusus admin grup.')

  const qmsg = m.quoted || m
  const mime = (qmsg.msg || qmsg).mimetype || ''
  const caption = (q || '').trim()

  const baileys = require('@denzy-official/baileys')
  const crypto = require('crypto')

  async function sendGroupStatus(sock, jid, content) {
    const { backgroundColor } = content
    delete content.backgroundColor

    const inside = await baileys.generateWAMessageContent(content, {
      upload: sock.waUploadToServer,
      backgroundColor
    })

    const messageSecret = crypto.randomBytes(32)

    const msg = baileys.generateWAMessageFromContent(
      jid,
      {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
          message: {
            ...inside,
            messageContextInfo: { messageSecret }
          }
        }
      },
      {}
    )

    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    return msg
  }

  async function dlToBuffer(messageObj, mimeType) {
    const type = String(mimeType).split('/')[0]
    const stream = await downloadContentFromMessage(messageObj, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    return buffer
  }

  try {
    if (!mime && !caption) {
      await react('❓')
      return m.reply(
        `Reply media atau kasih teks.\n` +
        `Contoh:\n${prefix + command} (reply image/video/audio) hai ini status grup`
      )
    }

    await react('⏳')

    let payload = {}

    if (/image/.test(mime)) {
      const buf = await dlToBuffer(qmsg.msg || qmsg, mime)
      payload = { image: buf, caption }
    } else if (/video/.test(mime)) {
      const secs = (qmsg.msg || qmsg).seconds || 0
      if (secs && secs > 30) {
        await react('❓')
        return m.reply('Durasi video maksimal *30 detik* untuk status grup.')
      }
      const buf = await dlToBuffer(qmsg.msg || qmsg, mime)
      payload = { video: buf, caption }
    } else if (/audio/.test(mime)) {
      const buf = await dlToBuffer(qmsg.msg || qmsg, mime)
      payload = { audio: buf, mimetype: 'audio/mp4' }
    } else if (caption) {
      payload = { text: caption }
      // optional kalau mau:
      // payload.backgroundColor = '#111111'
    } else {
      await react('❓')
      return m.reply(
        `Reply media atau kasih teks.\n` +
        `Contoh:\n${prefix + command} (reply image/video/audio) hai ini status grup`
      )
    }

    await sendGroupStatus(sock, m.chat, payload)
    await react('✅')
  } catch (err) {
    console.error('❌ Error .swgc:', err)
    await react('❌')
    return m.reply('❌ Terjadi kesalahan saat mengirim status grup.')
  }
}
break

case 'closegroup':
case 'closegc': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    await sock.groupSettingUpdate(m.chat, 'announcement');
    await react('✅')
    m.reply('✅ Grup berhasil ditutup, sekarang hanya admin yang bisa mengirim pesan.');
}
break;

case 'opengroup': 
case 'opengc': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    await sock.groupSettingUpdate(m.chat, 'not_announcement');
    await react('✅')
    m.reply('✅ Grup berhasil dibuka, sekarang semua member bisa mengirim pesan.');
}
break;

case 'promote': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    let user = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : null;
    if (!user) return m.reply('Tag atau reply member yang ingin dijadikan admin.\n\nContoh: .promote @user');
    await sock.groupParticipantsUpdate(m.chat, [user], 'promote');
    await react('✅')
    m.reply('✅ Berhasil menaikkan member menjadi admin.');
}
break;

case 'fired': 
case 'demote': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    let user = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : null;
    if (!user) return m.reply('Tag atau reply admin yang ingin diturunkan jadi member.\n\nContoh: .demote @user');
    await sock.groupParticipantsUpdate(m.chat, [user], 'demote');
    await react('✅')
    m.reply('✅ Berhasil menurunkan admin menjadi member.');
}
break;

case 'kick': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    let user = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : null;
    if (!user) return m.reply('Tag atau reply member yang ingin dikick.\n\nContoh: .kick @user');
    await sock.groupParticipantsUpdate(m.chat, [user], 'remove');
    await react('✅')
    m.reply('✅ Berhasil mengeluarkan member dari grup.');
}
break;

case 'delete': 
case 'del': 
case 'd': 
case 'r': 
case 'remove': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    if (!m.quoted) return m.reply('Reply pesan member yang ingin dihapus dulu.');
    await react('✅')
    await sock.sendMessage(m.chat, { delete: m.quoted.key });
}
break;

case 'add': {
    if (!m.isGroup) {
    await react('❌');
    m.reply(mess.group);
    return
    };
    if (!m.isAdmin) {
    await react('❌');
    m.reply(mess.admin);
    return
    };
    if (!m.isBotAdmin) {
    await react('❌');
    m.reply(mess.botadmin);
    return
    };
    let teks = text || args[0];
    if (!teks) {
        return m.reply(`Contoh penggunaan:\n.add 628123456789`);
    }
    let num = teks.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) {
        num = '62' + num.slice(1);
    }
    if (!num.startsWith('62')) {
        num = '62' + num;
    }
    let jid = num + '@s.whatsapp.net';
    try {
        let meta = await sock.groupMetadata(m.chat);
        let sudahAda = meta.participants.some(p => p.id === jid);
        if (sudahAda) {
            m.reply(`❗ Nomor tersebut sudah ada di dalam grup.`);
            await react('❌');
            return
        }
        await sock.groupParticipantsUpdate(m.chat, [jid], 'add');
        await react('✅')
        m.reply(`✅ Berhasil mengundang @${num} ke grup.`, {
            mentions: [jid]
        });
    } catch (e) {
        console.log('ADD ERROR:', e);
        if (e?.output?.statusCode === 400 || String(e).includes('bad-request')) {
            await react('❌');
            m.reply('❌ Gagal menambahkan member.\nPastikan format nomor sudah benar dan menggunakan kode negara.\nContoh: 628123456789');
        } else if (e?.output?.statusCode === 408 || String(e).includes('Timed Out')) {
            await react('❌');
            m.reply('⚠️ Permintaan timeout.\nKemungkinan:\n- Nomor tidak terdaftar di WhatsApp\n- User membatasi undangan ke grup\n- Koneksi ke server WhatsApp lagi jelek');
        } else {
            await react('❌');
            m.reply('❌ Terjadi kesalahan saat menambahkan member ke grup.');
        }
    }
}
break;

/*———————————————————————————————*/       
//〔 RPG: Status Handler 〕
function fileExist(p) {
  try { return fs.existsSync(p) } catch { return false }
}

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()) // YYYY-MM-DD
}

async function renderProfileCard(user) {
  const width = 1500
  const height = 1080
  const expX = 83.5
  const trustX = 765.5
  const expY = 700
  const expW = 654
  const expH = 214.5

  const need = getXPNeed(user.level || 1)
  const expProgress = Math.max(0, Math.min(1, (user.xp || 0) / (need || 1)))
  const trustProgress = Math.max(0, Math.min(1, (user.trustfactor || 0) / 100))

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const baseStatus = path.join(__dirname, 'assets', 'status-place.png')
  const emptybar = path.join(__dirname, 'assets', 'barempty.png')
  const barexp = path.join(__dirname, 'assets', 'barexp.png')
  const bartrust1 = path.join(__dirname, 'assets', 'bartrust-green.png')
  const bartrust2 = path.join(__dirname, 'assets', 'bartrust-red.png')
  const flagBorder = path.join(__dirname, 'assets', 'flagBorder.png')
  const bgFallback = path.join(__dirname, 'assets', 'status-place.png')
  const avaFallback = path.join(__dirname, 'assets', 'users', 'avatar', 'default.png')
  const flagFallback = path.join(__dirname, 'assets', 'flag', 'none.png')
  
  const userBgPath = path.join(__dirname, 'assets', 'users', 'bg', user.bg || '')
  const userAvaPath = path.join(__dirname, 'assets', 'users', 'avatar', user.avatar || '')
  const userFlagPath = path.join(__dirname, 'assets', 'flag', user.flag + '.png')
  const bgPath = (user.bg && fileExist(userBgPath)) ? userBgPath : bgFallback
  const avaPath = (user.avatar && fileExist(userAvaPath)) ? userAvaPath : avaFallback
  const flagPath = (user.flag + '.png' && fileExist(userAvaPath)) ? userFlagPath : flagFallback

  const bg = await loadImage(bgPath)
  const bgW = bg.width
  const bgH = bg.height
  const targetRatio = 16 / 9

  let cropW, cropH, cropX, cropY
  if (bgW / bgH > targetRatio) {
    cropH = bgH
    cropW = Math.floor(bgH * targetRatio)
    cropX = Math.floor((bgW - cropW) / 2)
    cropY = 0
  } else {
    cropW = bgW
    cropH = Math.floor(bgW / targetRatio)
    cropX = 0
    cropY = Math.floor((bgH - cropH) / 2)
  }

  const outW = 1280 * 1.174
  const outH = 720 * 1.174
  ctx.drawImage(bg, cropX, cropY, cropW, cropH, 0, -180, outW, outH)

  const bargray = await loadImage(emptybar)
  const expbar = await loadImage(barexp)
  const trustbar1 = await loadImage(bartrust1)
  const trustbar2 = await loadImage(bartrust2)
  
  ctx.drawImage(bargray, expX, expY, expW, expH)
  ctx.save()
  ctx.beginPath()
  ctx.rect(expX, expY, expW * expProgress, expH)
  ctx.clip()
  ctx.drawImage(expbar, expX, expY, expW, expH)
  ctx.restore()

  ctx.drawImage(bargray, trustX, expY, expW, expH)

  ctx.save()
  ctx.beginPath()
  ctx.rect(trustX, expY, expW * trustProgress, expH)
  ctx.clip()
  ctx.drawImage(trustbar2, trustX, expY, expW, expH)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.rect(trustX, expY, expW * trustProgress, expH)
  ctx.globalAlpha = trustProgress
  ctx.clip()
  ctx.drawImage(trustbar1, trustX, expY, expW, expH)
  ctx.restore()
  ctx.globalAlpha = 1

  const overlay = await loadImage(baseStatus)
  ctx.drawImage(overlay, 0, 0, width, height)

  function drawCircularCroppedAvatar(img, x, y, size) {
    const iw = img.width, ih = img.height
    const s = Math.min(iw, ih)
    const sx = Math.floor((iw - s) / 2)
    const sy = Math.floor((ih - s) / 2)

    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, sx, sy, s, s, x, y, size, size)
    ctx.restore()
  }
  
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2

    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  const avatarSize = 355
  const avatarX = 572.5
  const avatarY = 252.5
  const avatar = await loadImage(avaPath)
  drawCircularCroppedAvatar(avatar, avatarX, avatarY, avatarSize)
  const flagW = 480
  const flagH = 360
  const flagScale = 0.15
  const flagX = 85
  const flagY = 282
  const flag = await loadImage(flagPath)
  const flagB = await loadImage(flagBorder)
  const tf = user.trustfactor
  const tffixed = `${tf.toFixed(2)}%`
  const yen = user.yen
  const yenFormatted = Number(yen)
     .toFixed(2)
     .replace(/\.?0+$/, '')
  ctx.drawImage(flagB, flagX - 5, flagY - 5, flagW * flagScale + 10, flagH * flagScale + 10)
  ctx.save()
  ctx.beginPath()
  roundRect(ctx, flagX, flagY, flagW * flagScale, flagH * flagScale, 80 * flagScale)
  ctx.clip()
  ctx.drawImage(flag, flagX, flagY, flagW * flagScale, flagH * flagScale)
  ctx.closePath()
  ctx.restore()
  ctx.shadowColor = 'rgba(255,255,255,1)'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#ffffff'
  ctx.font = '60px Test'
  ctx.textAlign = 'center'
  ctx.fillText(user.name, 748.5, 675)
  ctx.shadowColor = 'rgba(255,255,255,0)'
  ctx.fillStyle = '#808080'
  ctx.font = '40px Test'
  ctx.fillText(user.bio, 748.5, 725)
  ctx.fillStyle = '#ffffff'
  ctx.font = '45px Test'
  ctx.fillText(`${user.messages}`, 268, 905)
  ctx.fillText(`${yenFormatted}¥`, 750, 905)
  ctx.fillText(`${user.commands}`, 1232, 905)
  ctx.font = '30px Test'
  ctx.fillText(`${user.reincarnation}x`, 200, 440)
  ctx.fillText(`${user.warns}x`, 450, 440)
  ctx.fillText(`${user.gacha}x`, 1125, 440)
  ctx.fillText(`${user.achievements}`, 1370, 440)
  ctx.font = '50px Test'
  ctx.textAlign = "right"
  ctx.fillText(`#${user.userID}`, 1415, 310)
  ctx.font = '30px Test'
  ctx.fillText(vanityDisplay(user.vanity) + `${user.vanity}`, 1415, 350)
  ctx.textAlign = "left"
  ctx.font = '19px Test'
  ctx.shadowBlur = 5
  ctx.shadowColor = 'rgba(255,255,255,1)'
  ctx.fillText(`Experience Bar`, 345, 770)
  ctx.fillText(`Trust Factor`, 1045, 770)
  ctx.shadowColor = 'rgba(0,0,0,1)'
  ctx.textAlign = 'left'
  ctx.fillText(`Level ${user.level}`, 108, 794.5)
  ctx.textAlign = 'right'
  ctx.fillText(`${user.xp}/` + getXPNeed(user.level) + ` exp`, 712, 794.5)
  ctx.fillText(trustLabel(user.trustfactor), 1394, 794.5)
  ctx.fillText(tffixed, 858, 794.5)

  return await canvas.encode('png')
}

/*———————————————————————————————*/       
//〔 RPG: Session Command Settings 〕
case 'cancel': {
  const s = getSession(m.sender)
  const SESSION_LABEL = {
  daily: 'Daily Reward',
  trade: 'Trade Card'
}
  if (!s) return m.reply('Tidak ada sesi berjalan yang bisa dibatalkan.')
  
  if (s.cmd === 'trade') {
  const tradeKey = s.tradeKey
  if (typeof global.cancelTrade === 'function') {
    await global.cancelTrade(tradeKey, m.sender, 'dibatalkan')
  } else {
    clearSession(m.sender)
  }
  return m.reply('Trade Card dibatalkan.')
}

  clearSession(m.sender)
  const label = SESSION_LABEL[s.cmd] || s.cmd
  return m.reply(`Sesi *${label}* dibatalkan.`)
}
break

/*———————————————————————————————*/       
//〔 RPG: Command untuk Info Profil 〕
case 'status': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'status', 300 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu harus 50% ke atas.')
  try {
    if (typeof saveRPG === 'function') saveRPG()
    const buffer = await renderProfileCard(user)
    await sock.sendMessage(m.chat, {
      image: buffer,
      mimetype: 'image/png'
    })
  } catch (e) {
    console.error('Status ERROR:', e)
    return m.reply('Status error, coba lagi nanti.')
  }
}
break

case 'whois': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'whois', 120 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu harus 50% ke atas.')
  if ((user.yen || 0) < 2) return m.reply('Yen kamu kurang. Butuh 2¥ untuk pakai .whois')
  if (!q) return m.reply('Penggunaan: .whois 1 atau .whois crystal')
  const target = findRPGUser(q)
  if (!target) return m.reply('User tidak ditemukan (ID/vanity salah atau belum pernah chat bot).')
  try {
    user.yen = (user.yen || 0) - 2
    if (typeof saveRPG === 'function') saveRPG()
    const buffer = await renderProfileCard(target)
    await sock.sendMessage(m.chat, {
      image: buffer,
      mimetype: 'image/png'
    })
  } catch (e) {
    console.error('WHOIS ERROR:', e)
    return m.reply('Whois error, coba lagi nanti.')
  }
}
break

/*———————————————————————————————*/       
//〔 RPG: Command Pendapatan Yen 〕
case 'daily': {
  const user = getRPGUser(m.sender, m.pushName || 'New User')

  const cd = checkCooldown(m.sender, 'daily', 10 * 1000)
  if (!cd.ok) {
    if (cd.tries === 1) return m.reply(cdNotif)
    if (cd.tries >= 2) return (user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55))
  }

  const REWARD = { yen: 2, exp: 1200, tf: 2.5 }
  const today = getTodayKey()
  const body = (q || '').trim().toLowerCase()

  if (!user.daily) user.daily = { date: null, type: null }
  const alreadyClaimedToday = (user.daily.date === today)

  // kalau sudah claim hari ini, clear session juga biar bersih
  if (alreadyClaimedToday) {
    clearSession(m.sender)
    return m.reply(`Kamu sudah claim ${user.daily.type} hari ini. Kembali lagi besok ya!`)
  }

  // tanpa argumen -> kirim tombol & buat session
  if (!body) {
    const s = getSession(m.sender)
    if (s && s.cmd === 'daily') {
      return m.reply('Kamu masih punya sesi *Daily Reward* yang belum dipilih.\nPilih reward di private chat atau ketik *.cancel* untuk membatalkan.')
    }

    setSession(m.sender, 'daily', { today })

    const dm = m.sender
    await sock.sendMessage(dm, {
      text: `*# Daily Reward*\n\nPilih salah satu!\n\nKetik *.cancel* untuk membatalkan.`,
      buttons: [
        { buttonId: '.daily yen', buttonText: { displayText: `Yen (+${REWARD.yen}¥)` }, type: 1 },
        { buttonId: '.daily exp', buttonText: { displayText: `Exp (+${REWARD.exp} exp)` }, type: 1 },
        { buttonId: '.daily tf',  buttonText: { displayText: `TF (+${REWARD.tf}%)` }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })

    return m.reply('Harap claim *Daily Reward* kamu di *Private Chat*!')
  }

  // validasi argumen
  if (!['yen', 'exp', 'tf'].includes(body)) {
    return m.reply('Argumen tidak valid.\nSyntax: .daily <yen/exp/tf>')
  }

  // optional: kalau mau "wajib ada session daily dulu", aktifin ini:
  // const s = getSession(m.sender)
  // if (!s || s.cmd !== 'daily') {
  //   return m.reply('Ketik *.daily* dulu untuk membuka pilihan reward, atau ketik *.cancel* kalau mau batal.')
  // }

  let rewardText = ''
  if (body === 'yen') {
    user.yen = (user.yen || 0) + REWARD.yen
    rewardText = `${REWARD.yen}¥`
  }
  if (body === 'exp') {
    user.xp = (user.xp || 0) + REWARD.exp
    rewardText = `${REWARD.exp} Experience Point`
  }
  if (body === 'tf') {
    user.trustfactor = Math.min(100, (user.trustfactor || 0) + REWARD.tf)
    rewardText = `${REWARD.tf}% Trust Factor`
  }

  user.daily.date = today
  user.daily.type = body

  // selesai claim -> hapus session daily
  clearSession(m.sender)

  if (typeof saveRPG === 'function') saveRPG()
  return m.reply(`*${user.name}* mengambil *Daily Reward* dan mendapatkan *${rewardText}*.`)
}
break

case 'pay': {
  const cd = checkCooldown(m.sender, 'pay', 20 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  const targetArg = (args[0] || '').trim()
  const amountArg = (args[1] || '').trim()
  if (!targetArg || !amountArg) {
    return m.reply('Format: .pay <id/vanity> <jumlah yen>\nContoh: .pay 2 10\nContoh: .pay crystal 2.5')
  }
  const sender = getRPGUser(m.sender, m.pushName)
  const amount = Number.parseFloat(amountArg.replace(',', '.'))
  if (!Number.isFinite(amount) || amount < 1) return m.reply('Nilai transfer tidak boleh kurang dari 1¥.')
  const q = targetArg.toLowerCase()
  const users = global.rpgDB?.users || {}
  const all = Object.values(users)
  let target = null
  if (/^\d+$/.test(q)) {
    const id = Number(q)
    target = all.find(u => Number(u.userID) === id) || null
  } else {
    target = all.find(u => (u.vanity || '').toLowerCase() === q) || null
  }
  if (!target) return m.reply('Pengguna tujuan tidak ditemukan.')
  if (target.jid === sender.jid) return m.reply('Kamu tidak dapat melakukan transfer ke diri kamu sendiri.')
  const senderYen = Number(sender.yen || 0)
  if (senderYen < amount) return m.reply('Yen kamu tidak cukup.')
  const taxRate = 0.155
  const tax = amount * taxRate
  const received = amount - tax
  sender.yen = Number((senderYen - amount).toFixed(2))
  target.yen = Number((Number(target.yen || 0) + received).toFixed(2))
  if (typeof saveRPG === 'function') saveRPG()
  return m.reply(
    `Kamu mentransfer *${amount.toFixed(2)}¥* ke *${target.name} (#${target.userID})* dengan pajak 15.5¥.`
  )
}
break

case 'trade': {
  // =======================
  // SETTINGS
  // =======================
  const LABEL = 'Trade Card'
  const DATA_ALLOWED = ['gt']
  const sub0 = (args[0] || '').toLowerCase()
  const isSub = ['confirm', 'reject'].includes(sub0)

  // =======================
  // helpers kecil (inline)
  // =======================
  const findUserByIdOrVanity = (raw) => {
    if (!raw) return null
    const v = String(raw).trim().toLowerCase()
    if (!global.rpgDB?.users) return null
    const list = Object.values(global.rpgDB.users)

    const asNum = Number(v)
    if (!Number.isNaN(asNum) && asNum > 0) {
      return list.find(u => Number(u.userID) === asNum) || null
    }
    return list.find(u => String(u.vanity || '').toLowerCase() === v) || null
  }

  const invHas = (u, cardId) => Array.isArray(u.gtInv) && u.gtInv.includes(Number(cardId))
  const invRemoveOne = (u, cardId) => {
    if (!Array.isArray(u.gtInv)) u.gtInv = []
    const idx = u.gtInv.indexOf(Number(cardId))
    if (idx !== -1) u.gtInv.splice(idx, 1)
    return idx !== -1
  }
  const invAdd = (u, cardId) => {
    if (!Array.isArray(u.gtInv)) u.gtInv = []
    u.gtInv.push(Number(cardId))
  }

  // ambil list kartu GT sekali (buat detail notif)
  const gtList = (typeof loadGTList === 'function') ? loadGTList() : []
  const getCardInfo = (id) => {
    const cid = Number(id)
    const c = Array.isArray(gtList) ? gtList.find(x => Number(x.id) === cid) : null
    if (!c) {
      return { id: cid, name: 'Unknown', stars: '?', text: `#${cid} • ?★ • Unknown` }
    }
    const stars = Number(c.stars) || '?'
    const name = String(c.name || 'Unknown')
    return { id: cid, name, stars, text: `${name} • #${cid} • ${stars}★` }
  }
  const tradeSummaryText = (giveId, takeId) => {
    const give = getCardInfo(giveId)
    const take = getCardInfo(takeId)
    return `Tawaran Kamu: *${give.text}*\nTawaran Partner: *${take.text}*`
  }

  // =======================
  // SUBCOMMAND: confirm / reject
  // =======================
  if (isSub) {
    const sub = sub0

    const s = getSession(m.sender)
    if (!s || s.cmd !== 'trade' || !s.data?.key) {
      return m.reply(`kamu ga punya sesi ${LABEL} yang aktif.`)
    }

    const key = s.data.key
    const t = global.tradeSessions?.[key]
    if (!t) {
      clearSession(m.sender)
      return m.reply(`sesi ${LABEL} udah ga ada / dibatalkan.`)
    }

    const meJid = m.sender
    const a = t.a
    const b = t.b
    const meSide = (a.jid === meJid) ? 'a' : (b.jid === meJid) ? 'b' : null
    if (!meSide) {
      clearSession(meJid)
      return m.reply(`kamu ga ada di sesi ${LABEL} ini.`)
    }

    const otherJid = (meSide === 'a') ? b.jid : a.jid

    if (sub === 'reject') {
      try { await sock.sendMessage(otherJid, { text: `Partner menolak untuk melakukan ${LABEL}.` }) } catch {}

      clearSession(meJid)
      clearSession(otherJid)
      delete global.tradeSessions[key]

      return m.reply(`${LABEL} dibatalkan.`)
    }

    // confirm
    if (meSide === 'a') a.confirmed = true
    if (meSide === 'b') b.confirmed = true

    // kalau belum lengkap offer dua-duanya
    if (!a.offerCardId || !b.offerCardId) {
      try {
        await sock.sendMessage(otherJid, {
          text:
            `Partner sudah confirm, tapi trade belum lengkap.\n\n` +
            `Kalian berdua harus isi kartu dulu di grup:\n` +
            `.trade <id/vanity> gt <id_kartu>\n\n` +
            `Atau batal:\n.cancel`
        })
      } catch {}

      return m.reply(`Kamu mengonfirmasi ${LABEL}.\nMenunggu partner melengkapi kartu...`)
    }

    // kalau partner belum confirm
    if (!(a.confirmed && b.confirmed)) {
      try { await sock.sendMessage(otherJid, { text: `Partner telah mengonfirmasi ${LABEL}.` }) } catch {}

      const giveId = (meSide === 'a') ? a.offerCardId : b.offerCardId
      const takeId = (meSide === 'a') ? b.offerCardId : a.offerCardId
      return m.reply(
        `Kamu mengonfirmasi ${LABEL}.\nMenunggu partner mengonfirmasi pertukaran...`
      )
    }

    // =======================
    // eksekusi swap kartu
    // =======================
    const list = Object.values(global.rpgDB?.users || {})
    const U1 = list.find(u => Number(u.userID) === Number(a.id)) || null
    const U2 = list.find(u => Number(u.userID) === Number(b.id)) || null

    if (!U1 || !U2) {
      try { await sock.sendMessage(otherJid, { text: `Parameter tidak valid. User tujuan tidak ditemukan.` }) } catch {}
      clearSession(meJid)
      clearSession(otherJid)
      delete global.tradeSessions[key]
      return m.reply(`Parameter tidak valid. User tujuan tidak ditemukan.`)
    }

    if (!invHas(U1, a.offerCardId) || !invHas(U2, b.offerCardId)) {
      try { await sock.sendMessage(otherJid, { text: `Trade gagal: salah satu kartu sudah tidak ada di inventory.` }) } catch {}
      clearSession(meJid)
      clearSession(otherJid)
      delete global.tradeSessions[key]
      return m.reply(`Trade gagal: salah satu kartu sudah tidak ada di inventory.`)
    }

    invRemoveOne(U1, a.offerCardId)
    invRemoveOne(U2, b.offerCardId)
    invAdd(U1, b.offerCardId)
    invAdd(U2, a.offerCardId)

    if (typeof saveRPG === 'function') saveRPG()

    // notif dua-duanya (detail)
    try { await sock.sendMessage(a.jid, { text: `✅ ${LABEL} sukses.\n` + tradeSummaryText(a.offerCardId, b.offerCardId) }) } catch {}
    try { await sock.sendMessage(b.jid, { text: `✅ ${LABEL} sukses.\n` + tradeSummaryText(b.offerCardId, a.offerCardId) }) } catch {}

    clearSession(a.jid)
    clearSession(b.jid)
    delete global.tradeSessions[key]

    return m.reply(`✅ ${LABEL} sukses.`)
  }

  // =======================
  // SYNTAX 1: .trade <id/vanity> <data> <id_card> (hanya group)
  // =======================
  if (!m.isGroup) {
    return m.reply(
      `Command ini cuma bisa dimulai di grup.\n\n` +
      `Mulai:\n.trade <id/vanity> gt <id_card>\n\n` +
      `Lanjut di private:\n.trade confirm / .trade reject`
    )
  }

  const targetRaw = (args[0] || '').trim()
  const data = (args[1] || '').toLowerCase()
  const cardId = Number(args[2])

  if (!targetRaw || !data || !args[2]) {
    return m.reply(
      `Syntax:\n.trade <id/vanity> <data> <id_card>\n\n` +
      `Contoh:\n.trade 25 gt 24\n.trade crystal gt 24\n\n` +
      `Subcommand:\n.trade confirm\n.trade reject`
    )
  }

  if (!DATA_ALLOWED.includes(data)) return m.reply(`Data belum didukung. (sementara: gt)`)
  if (!Number.isFinite(cardId) || cardId <= 0) return m.reply('ID card harus angka yang valid.')

  const me = getRPGUser(m.sender, m.pushName)
  if (!Array.isArray(me.gtInv)) me.gtInv = []
  if (!invHas(me, cardId)) return m.reply(`Kamu ga punya kartu *${getCardInfo(cardId).text}* di inventory.`)

  const targetUser = findUserByIdOrVanity(targetRaw)
  if (!targetUser) return m.reply('User tujuan tidak ditemukan. (cek ID/vanity)')
  if (Number(targetUser.userID) === Number(me.userID)) return m.reply('Kamu ga bisa trade sama diri sendiri.')

  const key = makeTradeKey(me.userID, targetUser.userID, data)

  global.tradeSessions = global.tradeSessions || {}
  const exist = global.tradeSessions[key]

  // ===== buat trade baru kalau belum ada
  if (!exist) {
    // cari jid target paling aman dari DB entries (berdasarkan userID)
    const list = Object.values(global.rpgDB?.users || {})
    const found = list.find(u => Number(u.userID) === Number(targetUser.userID)) || null
    const targetJid = (found?.jid || targetUser.jid || '').trim()
    if (!targetJid) return m.reply('Trade gagal: target JID tidak ketemu di database.')

    global.tradeSessions[key] = {
      key,
      data,
      groupChat: m.chat,
      createdAt: Date.now(),
      a: { id: Number(me.userID), jid: m.sender, offerCardId: Number(cardId), confirmed: false },
      b: { id: Number(targetUser.userID), jid: targetJid, offerCardId: null, confirmed: false }
    }

    // set session untuk dua user
    setSession(m.sender, 'trade', { key, label: LABEL })
    setSession(targetJid, 'trade', { key, label: LABEL })

    // notif target (detail kartu)
    const offerA = getCardInfo(cardId)
    try {
      await sock.sendMessage(targetJid, {
        interactiveMessage: {
          header:
            `*# Trade Card*\n\n` +
            `*${me.name} (#${me.userID})* mengajakmu untuk trade.\n` +
            `Dia menawarkan:\n*${offerA.text}*\n\n` +
            `Terima? Jalankan perintah ini di grup:\n` +
            `.trade ${me.userID} gt <id_kartu>`,
          footer: 'Trade Card - MilkyInteractive',
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Tolak Tawaran',
                  id: '.trade reject'
                })
              }
            ]
          }
        }
      })
    } catch {}

    return m.reply(`Permintaan *${LABEL}* dikirim ke tujuan, harap untuk menunggu...`)
  }

  // ===== trade udah ada -> update sisi yang ngirim sekarang
  const t = global.tradeSessions[key]
  const isA = Number(t.a.id) === Number(me.userID)
  const isB = Number(t.b.id) === Number(me.userID)
  if (!isA && !isB) return m.reply('Trade session error (participant mismatch).')

  if (isA) t.a.offerCardId = Number(cardId)
  else t.b.offerCardId = Number(cardId)

  // reset confirm dua-duanya kalau ada perubahan kartu
  t.a.confirmed = false
  t.b.confirmed = false

  // set session ulang
  setSession(t.a.jid, 'trade', { key, label: LABEL })
  setSession(t.b.jid, 'trade', { key, label: LABEL })

  // notif partner detail
  const otherJid = isA ? t.b.jid : t.a.jid
  const offerMe = getCardInfo(cardId)
/*  try {
    await sock.sendMessage(otherJid, {
      text:
        `🧾 Update ${LABEL}\n` +
        `Partner menawarkan:\n*${offerMe.text}*\n\n` +
        `Kalau kamu belum isi kartu, kirim di grup:\n` +
        `.trade ${isA ? t.a.id : t.b.id} ${data} <id_kartu_kamu>\n\n` +
        `Kalau sudah lengkap, confirm di private:\n.trade confirm\n\n` +
        `Atau tolak:\n.trade reject\n\n` +
        `Batalin:\n.cancel`
    })
  } catch {}
*/
  // kalau dua-duanya udah isi kartu -> kasih ringkasan “aku ngasih / dapet”
  if (t.a.offerCardId && t.b.offerCardId) {
    const aText =
      `*# ${LABEL}*\n\n` +
      tradeSummaryText(t.a.offerCardId, t.b.offerCardId)

    const bText =
      `# ${LABEL}\n\n` +
      tradeSummaryText(t.b.offerCardId, t.a.offerCardId)

    try { await sock.sendMessage(t.a.jid, {
        interactiveMessage: {
          header: aText,
          footer: 'Trade Card - MilkyInteractive',
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Konfirmasi',
                  id: '.trade confirm'
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Batalkan',
                  id: '.trade reject'
                })
              }
            ]
          }
        }
      }) } catch {}
    try { await sock.sendMessage(t.b.jid, {
        interactiveMessage: {
          header: bText,
          footer: 'Trade Card - MilkyInteractive',
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Konfirmasi',
                  id: '.trade confirm'
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Batalkan',
                  id: '.trade reject'
                })
              }
            ]
          }
        }
      }) } catch {}
  }

  return m.reply(`Tawaran *Trade Card* kamu dikirim ke Partner, konfirmasi di *Private Chat*!`)
}
break



/*———————————————————————————————*/       
//〔 RPG: Command Edit Profil 〕
case 'setn':
case 'setname': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'setn', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 0.5) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const name = (q || '').trim()
  if (name.length < 3 || name.length > 16) return m.reply('Argumen tidak valid. Nama minimal 3 karakter dan maksimal 16 karakter.')
  const re = /^[a-zA-Z0-9.!?,\-+_#$| ]+$/
  if (!re.test(name)) return m.reply('Argumen tidak valid. Nama memiliki simbol yang tidak diperbolehkan.')
  user.yen = +(user.yen - 0.5).toFixed(2)
  user.name = name
  if (typeof saveRPG === 'function') saveRPG()
  return m.reply(`Nama berhasil diubah menjadi *${name}*`)
}
break;

case 'setf':
case 'setflag': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'setf', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 0.5) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const flag = (q || '').toLowerCase()
  const allowed = ['ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'arab', 'as', 'asean', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cefta', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cp', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dg', 'dj', 'dk', 'dm', 'do', 'dz', 'eac', 'ec', 'ee', 'eg', 'eh', 'er', 'es-ct', 'es-ga', 'es-pv', 'es', 'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb-eng', 'gb-nir', 'gb-sct', 'gb-wls', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'ic', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pc', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh-ac', 'sh-hl', 'sh-ta', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'un', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'xk', 'ye', 'yt', 'za', 'zm', 'zw']
  if (!flag) return m.reply('Parameter tidak valid. Masukkan ID bendera.')
  if (!allowed.includes(flag)) {
    return m.reply('Parameter tidak valid. ID bendera tidak ditemukan.')
  }
  user.flag = flag
  if (typeof saveRPG === 'function') saveRPG()
  m.reply(`Flag berhasil diubah.`)
}
break

case 'setbio':
case 'setb': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'setb', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 0.5) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const bio = (q || '').trim()
  if (bio.length < 3 || bio.length > 32) return m.reply('Argumen tidak valid. Vanity minimal 3 karakter dan maksimal 32 karakter.')
  const re = /^[a-zA-Z0-9.!?,\-+_#$| ]+$/
  if (!re.test(bio)) return m.reply('Argumen tidak valid. Bio memiliki simbol yang tidak diperbolehkan.')
  user.yen = +(user.yen - 1).toFixed(2)
  user.bio = bio
  if (typeof saveRPG === 'function') saveRPG()
  return m.reply('Bio berhasil diubah.')
}
break;

case 'setv':
case 'setvanity': {
    const user = getRPGUser(m.sender, m.pushName)
    const cd = checkCooldown(m.sender, 'setv', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 10) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const name = (q || '').trim()
    const vanity = q.toLowerCase().trim()
    const vanityRegex = /^[a-z0-9\-_?!]{2,12}$/i
  if (vanity.length < 3 || vanity.length > 12) return m.reply('Argumen tidak valid. Vanity minimal 3 karakter dan maksimal 12 karakter.')
    if (!vanityRegex.test(vanity))
        return m.reply(
            'Argumen tidak valid.'
        )
    const used = Object.values(global.rpgDB.users)
        .find(u => u.vanity === vanity && u.jid !== m.sender)
    if (used)
        return m.reply('Vanity sudah digunakan oleh user lain.')
    user.vanity = vanity
    user.yen -= 5
    if (typeof saveRPG === 'function') saveRPG()
    m.reply(`Vanity berhasil diubah menjadi *${vanity}*`)
}
break

case 'setav': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'setav', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if (!user?.userID) return m.reply('UserID belum kebentuk di database.')
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 2) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const qmsg = m.quoted ? m.quoted : m
  const msg = qmsg.msg || qmsg.message
  const mime = (msg && msg.mimetype) ? msg.mimetype : (qmsg.mimetype || '')
  if (!mime || !/image/.test(mime)) return m.reply('Argumen tidak valid. Kirim / reply gambar dengan caption .setav')
  try {
    // ambil content imageMessage
    const content = msg?.imageMessage || qmsg.message?.imageMessage
    if (!content) return m.reply('Gambar tidak terdeteksi, harap kirim ulang gambar dengan caption .setav')
    const buf = await downloadToBuffer(content, mime)
    const folder = path.join(process.cwd(), 'assets', 'users', 'avatar')
    const filename = `ava${user.userID}.png`
    const savedPath = await saveUserImagePNG({ buffer: buf, folder, filename })
    user.avatar = `${filename}`
    user.yen -= 2
    if (typeof saveRPG === 'function') saveRPG()
    return m.reply(`Avatar berhasil diganti.`)
  } catch (e) {
    console.error('SETAV ERROR:', e)
    return m.reply('Avatar gagal diganti.')
  }
}
break

case 'setbg': {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'setbg', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  if (!user?.userID) return m.reply('UserID belum kebentuk di database.')
  if ((user.trustfactor || 0) < 50) return m.reply('Trust Factor kamu tidak mencukupi untuk menjalankan perintah ini.')
  if ((user.yen || 0) < 0.5) return m.reply('Yen kamu tidak mencukupi untuk menjalankan perintah ini.')
  const qmsg = m.quoted ? m.quoted : m
  const msg = qmsg.msg || qmsg.message
  const mime = (msg && msg.mimetype) ? msg.mimetype : (qmsg.mimetype || '')
  if (!mime || !/image/.test(mime)) return m.reply('Argumen tidak valid. Kirim / reply gambar dengan caption .setbg')
  try {
    const content = msg?.imageMessage || qmsg.message?.imageMessage
    if (!content) return m.reply('Gambar tidak terdeteksi, harap kirim ulang gambar dengan caption .setbg')
    const buf = await downloadToBuffer(content, mime)
    const folder = path.join(process.cwd(), 'assets', 'users', 'bg')
    const filename = `bg${user.userID}.png`
    const savedPath = await saveUserImagePNG({ buffer: buf, folder, filename })
    user.bg = `${filename}`
    user.yen -= 0.5
    if (typeof saveRPG === 'function') saveRPG()
    return m.reply(`Berhasil mengganti background.`)
  } catch (e) {
    console.error('SETBG ERROR:', e)
    return m.reply('Gagal mengganti background.')
  }
}
break


/*———————————————————————————————*/       
//〔 RPG: Guardian Tales Gacha Card 〕
function tintImage(img, color) {
  const w = img.width
  const h = img.height
  const c = createCanvas(w, h)
  const x = c.getContext('2d')

  // 1) gambar aslinya jadi mask alpha
  x.drawImage(img, 0, 0)

  // 2) isi warna, tapi cuma kena area yang punya alpha dari gambar
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = color
  x.fillRect(0, 0, w, h)

  // reset
  x.globalCompositeOperation = 'source-over'
  return c
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2

    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

function capFirst(str = '') {
  str = String(str).trim()
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

async function renderGTCard(card, ownerUser) {
  const width = 1208
  const height = 1440

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  /* warna tier karakter:
  general: #726155
  normal: #74878c
  rare: #2c71c0
  unique: #bc5325
  legend: #b98d25
  epic: #488427
  curse: #8c239c
  costume: #68253d
  sa: #6157ff
  hero: #564640
  
  warna bintang tier:
  unique: 
  */

  const heroBackground = path.join(__dirname, 'assets', 'guardian-tales', 'backgrounds', card.placename + '_bg.png')
  const dots = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'dots.png')
  const illustrations = path.join(__dirname, 'assets', 'guardian-tales', 'illustrations', card.placename + '_illust.png')
  const GTLogo = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'GTLogo.png')
  const shade = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'bottom_shadow.png')
  const heroIcon = path.join(__dirname, 'assets', 'guardian-tales', 'icons', card.placename + '_icon.png')
  const starObject = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'star.png')
  const heroPixel = path.join(__dirname, 'assets', 'guardian-tales', 'heroes', card.placename + '_' + card.stars + 'star.png')
  const heroElement = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'element', card.element + '.png')
 const heroClass = path.join(__dirname, 'assets', 'guardian-tales', 'objects', 'class', card.class + '.png')
  
  const heroBg = await loadImage(heroBackground)
  const illust = await loadImage(illustrations)
  const shadow = await loadImage(shade)
  const logo = await loadImage(GTLogo)
  const dot = await loadImage(dots)
  const heroProfile = await loadImage(heroIcon)
  const star = await loadImage(starObject)
  const hero = await loadImage(heroPixel)
  const hElement = await loadImage(heroElement)
  const hClass = await loadImage(heroClass)
  
  const heroName = `${card.name}`
  const heroTier = capFirst(`${card.tier}`)
  const heroDialogue = await pickRandomDialogue(card)
  const heroID = `${card.id}`
  
  ctx.drawImage(heroBg, 0, -250, 1208, 1812)
  ctx.save()
  ctx.filter = 'blur(12px)'
  ctx.drawImage(heroBg, 0, -250, 1208, 1812)
  ctx.restore()
  
  const dotTint = tintImage(dot, '#ffffff')
  ctx.drawImage(dotTint, 0, 0)
  
  const illustScale = 0.6
  const illustW = illust.width * illustScale
  const illustH = illust.height * illustScale
  const illustX = -width / 2
  const illustY = -height / 4
  
  const rectX = 400
  const rectY = 400
  const rectWidth = 1000
  const rectHeight = 250
  const rectAngle = -20 * Math.PI / 180 // 25 derajat ke radian

  ctx.save()
  ctx.translate(rectX + rectWidth / 2, rectY + rectHeight / 2)
  ctx.rotate(rectAngle)
  
  ctx.fillStyle = '#000000'
  ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
  
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
  ctx.clip()
  ctx.drawImage(illust, illustX + -650, illustY + -500, illustW * 1.15, illustH * 1.15)
  ctx.restore()
  
  ctx.lineWidth = 12
  ctx.strokeStyle = '#ffffff'
  ctx.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
  ctx.restore()
 
  ctx.shadowColor = 'rgba(0,0,0,0.60)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 100
  ctx.shadowOffsetY = 80
  ctx.drawImage(illust, illustX + 50, illustY, illustW, illustH)
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.drawImage(shadow, 0, 0)
  const logoScale = 0.6
  ctx.drawImage(logo, 5, 35, logo.width * logoScale, logo.height * logoScale)
  
  ctx.save()
  ctx.globalAlpha = 0.8
  ctx.fillRect(-100, 1000, 1470, 55)
  ctx.globalAlpha = 1
  ctx.shadowColor = 'rgba(255,255,255,1)'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = '30px Test'
  ctx.fillText(heroDialogue, 604, 1038)
  ctx.restore()
  
  const infoX = -50
  const infoY = -100
  ctx.scale(1.1, 1.1)
  
  ctx.globalAlpha = 0.75
  roundRect(ctx, 890 + infoX, 1130 + infoY, 180, 100, 20)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.globalAlpha = 1
  
  roundRect(ctx, 890 + infoX, 1130 + infoY, 180, 100, 20)
  ctx.lineWidth = 10
  ctx.strokeStyle = '#bc5325'
  ctx.stroke()
  
  ctx.globalAlpha = 0.75
  roundRect(ctx, 888 + infoX, 1250 + infoY, 60, 60, 15)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.globalAlpha = 1
  
  roundRect(ctx, 888 + infoX, 1250 + infoY, 60, 60, 15)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#bc5325'
  ctx.stroke()
  
  ctx.globalAlpha = 0.75
  roundRect(ctx, 1012.5 + infoX, 1250 + infoY, 60, 60, 15)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.globalAlpha = 1
  
  roundRect(ctx, 1012.5 + infoX, 1250 + infoY, 60, 60, 15)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#bc5325'
  ctx.stroke()
  
  ctx.globalAlpha = 0.75
  roundRect(ctx, 155 + infoX, 1130 + infoY, 650, 180, 30)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.globalAlpha = 1
  
  roundRect(ctx, 155 + infoX, 1130 + infoY, 650, 180, 30)
  ctx.lineWidth = 12
  ctx.strokeStyle = '#bc5325'
  ctx.stroke()

  ctx.globalAlpha = 0.75
  roundRect(ctx, 100 + infoX, 1120 + infoY, 200, 200, 30)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.save()
  ctx.beginPath()
  roundRect(ctx, 100 + infoX, 1120 + infoY, 200, 200, 30)
  ctx.clip()
  ctx.drawImage(heroProfile, 100 + infoX, 1120 + infoY, 200, 200)
  ctx.closePath()
  ctx.restore()

  ctx.shadowColor = 'rgba(188,82,37,1)'
  const gradx = 100 + infoX
  const grady = 1120 + infoY
  const gradw = 200
  const gradh = 200

  const strokeGradient = ctx.createLinearGradient(0, grady, 0, grady + gradh)
  
  roundRect(ctx, gradx, grady, gradw, gradh, 30)
  ctx.lineWidth = 12
  ctx.strokeStyle = '#bc5325'
  ctx.stroke()
  
  ctx.globalAlpha = 0.75

  strokeGradient.addColorStop(0, '#bc5325') 
  strokeGradient.addColorStop(1, '#000000') 

  ctx.shadowBlur = 10
  ctx.lineWidth = 12
  ctx.strokeStyle = strokeGradient

  roundRect(ctx, gradx, grady, gradw, gradh, 30)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.shadowColor = 'rgba(255,255,255,1)'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.font = '40px Test'
  ctx.fillText(heroName, 328 + infoX, 1193 + infoY)
  ctx.textAlign = 'center'
  ctx.fillText('#' + heroID, 980 + infoX, 1180 + infoY)
  ctx.font = '20px Test'
  ctx.fillText(`Owned by ${user.userID}`, 980 + infoX, 1205 + infoY)
  ctx.drawImage(hElement, 1023.5 + infoX, 1260 + infoY, 40, 40)
  ctx.drawImage(hClass, 898 + infoX, 1260 + infoY, 40, 40)
  ctx.shadowColor = 'rgba(255,255,255,0)'
  ctx.textAlign = 'left'
  ctx.fillText(heroTier, 330 + infoX, 1222 + infoY)
  
  const starScale = 0.04
  const starXOffset = 320 + infoX
  const starYOffset = 1230 + infoY
  const starTint = tintImage(star, '#fdee6f')
  ctx.drawImage(starTint, starXOffset, starYOffset, starTint.width * starScale, starTint.height * starScale)
  ctx.drawImage(starTint, starXOffset + 30, starYOffset, starTint.width * starScale, starTint.height * starScale)
  ctx.drawImage(starTint, starXOffset + 60, starYOffset, starTint.width * starScale, starTint.height * starScale)
  ctx.globalAlpha = 0.50
  ctx.drawImage(starTint, starXOffset + 90, starYOffset, starTint.width * starScale, starTint.height * starScale)
  ctx.drawImage(starTint, starXOffset + 120, starYOffset, starTint.width * starScale, starTint.height * starScale)
  ctx.globalAlpha = 1
  
  ctx.drawImage(hero, 580 + infoX, 1073 + infoY, 235, 235)
  
  return await canvas.encode('png')
}

function ensureGTFields(user) {
  if (!Array.isArray(user.gtInv)) user.gtInv = []
  if (typeof user.gtPity !== 'number') user.gtPity = 0
}

async function gtPullOnce({ user, gtList }) {
  ensureGTFields(user)

  // pity
  user.gtPity = (user.gtPity || 0) + 1
  let card = null
  let starsRolled = null
  let isPity = false

  if (user.gtPity >= GT_PITY_MAX) {
    card = pickRarestCard(gtList)
    user.gtPity = 0
    isPity = true
  } else {
    starsRolled = rollStars()
    card = pickCardByStars(gtList, starsRolled)

    // fallback kalau pool kosong
    if (!card) card = pickRarestCard(gtList)
  }

  user.gtInv.push(Number(card.id))
  return { card, starsRolled, isPity }
}

case 'gt': {
  const user = getRPGUser(m.sender, m.pushName)
  ensureGTFields(user)

  const sub = (args[0] || '').toLowerCase()
  const gtList = loadGTList()
  if (!gtList.length) return m.reply('Database GT kosong. isi dulu ../data/gt-list.json')

  if (!sub) {
    return m.reply('Subcommand: pull, sell, inv, rate, show, pity, bulk')
  }

  if (sub === 'rate') {
    const s3 = (RATE.s3 * 100).toFixed(2)
    const s2 = (RATE.s2 * 100).toFixed(1)
    const s1 = (RATE.s1 * 100).toFixed(2)
    return m.reply(`Rate gacha:\n- 3★: ${s3}%\n- 2★: ${s2}%\n- 1★: ${s1}%`)
  }

  if (sub === 'pity') {
    return m.reply(`Pity kamu: ${user.gtPity || 0}/${GT_PITY_MAX}`)
  }

  if (sub === 'inv') {
    const page = Math.max(1, parseInt(args[1] || '1', 10) || 1)
    const inv = sortInvRarestFirst(user.gtInv)
    if (!inv.length) return m.reply('Inventory kamu kosong.')

    const perPage = 12
    const start = (page - 1) * perPage
    const slice = inv.slice(start, start + perPage)

    if (!slice.length) return m.reply('Page kosong.')

    const lines = slice.map((id, i) => {
      const card = gtList.find(c => Number(c.id) === Number(id))
      const name = card?.name || 'Unknown'
      const stars = card?.stars || '?'
      return `${start + i + 1}. #${id} • ${stars}★ • ${name}`
    })

    return m.reply(`GT Inventory (page ${page})\n` + lines.join('\n'))
  }

  if (sub === 'show') {
    const id = parseInt(args[1] || '', 10)
    if (!id) return m.reply('Usage: .gt show <id kartu>')

    if (!user.gtInv.includes(id)) return m.reply('Kartu itu tidak ada di inventory kamu.')

    const card = gtList.find(c => Number(c.id) === id)
    if (!card) return m.reply('Kartu tidak ditemukan di database.')

    const buf = await renderGTCard(card, user)
    return sock.sendMessage(m.chat, { image: buf, mimetype: 'image/png' }, { quoted: m })
  }

  if (sub === 'sell') {
    const id = parseInt(args[1] || '', 10)
    if (!id) return m.reply('Usage: .gt sell <id kartu>')

    const idx = user.gtInv.indexOf(id)
    if (idx === -1) return m.reply('Kartu itu tidak ada di inventory kamu.')

    const card = gtList.find(c => Number(c.id) === id)
    if (!card) return m.reply('Kartu tidak ditemukan di database.')

    const basePrice = getSellPrice(card)
    const finalGain = basePrice * (1 - GT_TAX_SELL)

    user.gtInv.splice(idx, 1)
    user.yen = (user.yen || 0) + finalGain

    if (typeof saveRPG === 'function') saveRPG()
    return m.reply(`Kamu menjual #${id} (${card.name}) dan mendapat ${formatYen(finalGain)}¥ (tax 15.5%).`)
  }

  if (sub === 'pull') {
    if ((user.yen || 0) < GT_COST_PULL) return m.reply(`Yen kamu kurang. Pull butuh ${GT_COST_PULL}¥.`)

    user.yen -= GT_COST_PULL
    const { card, isPity } = await gtPullOnce({ user, gtList })

    if (typeof saveRPG === 'function') saveRPG()

    const buf = await renderGTCard(card, user)
    await sock.sendMessage(m.chat, { image: buf, mimetype: 'image/png' }, { quoted: m })

    if (isPity) return m.reply('PITY HIT. kamu dapet kartu terlangka.')
    return
  }

  if (sub === 'bulk') {
    const val = Math.min(10, Math.max(1, parseInt(args[1] || '1', 10) || 1))
    const maxAffordable = Math.floor((user.yen || 0) / GT_COST_PULL)
    const times = Math.min(val, maxAffordable)

    if (times <= 0) return m.reply(`Yen kamu kurang. 1x pull butuh ${GT_COST_PULL}¥.`)

    user.yen -= (times * GT_COST_PULL)

    const pulls = []
    for (let i = 0; i < times; i++) {
      const res = await gtPullOnce({ user, gtList })
      pulls.push(res)
    }

    if (typeof saveRPG === 'function') saveRPG()

    // kirim ringkasan (biar ga spam 10 gambar)
    const summary = pulls.map((p, i) => {
      const c = p.card
      return `${i + 1}. #${c.id} • ${c.stars}★ • ${c.name}${p.isPity ? ' (PITY)' : ''}`
    }).join('\n')

    return m.reply(`Bulk pull x${times}:\n${summary}`)
  }

  return m.reply('Subcommand tidak dikenal. (pull/sell/inv/rate/show/pity/bulk)')
}
break



/*———————————————————————————————*/       
//〔 Command Helper 〕
case "sticker":
case "s": {
    const cd = checkCooldown(m.sender, 'sticker', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
    let quotedMsg = m.quoted ? m.quoted : m;
    let mimeType = (quotedMsg.msg || quotedMsg).mimetype || mime || '';
if (!/image|video/.test(mimeType)) {
    await react('❓')
    return m.reply(
        `Kirim / reply *foto atau video* (maks 10 detik)\n` +
        `dengan caption *.sticker* atau *.s*`
    )
}
if (/video/.test(mimeType)) {
    if ((quotedMsg.msg || quotedMsg).seconds > 10) {
        await react('❓')
        return m.reply('Durasi video maksimal *10 detik*')
    }
}
    await react('⏳')
    try {
        const type = mimeType.split('/')[0];
        let stream = await downloadContentFromMessage(
            quotedMsg.msg || quotedMsg,
            type
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let webpPath;
        const meta = {
            packname: `Sticker by ${m.pushName}\n\nCreated on: Milky Interactive\n+62 822-4836-8488\n`,
            author: '———————————— •\nMilky Interactive by CrystalDev\n(aka. Vikry)'
        };

        if (/image/.test(mimeType)) {
            webpPath = await writeExifImg(buffer, meta);
        } else {
            webpPath = await writeExifVid(buffer, meta);
        }
        await sock.sendMessage(
            m.chat,
            { sticker: { url: webpPath } },
            { quoted: m }
        );
        await react('✅')
        if (webpPath && fs.existsSync(webpPath)) {
            fs.unlinkSync(webpPath);
        }
    } catch (e) {
        console.error('Sticker error:', e);
        m.reply('❌ Gagal bikin sticker, coba lagi ya.');
        await react('❌')
    }
}
break;

case 'bypass': {
  const SITE_KEY = '0x4AAAAAAAGzw6rXeQWJ_y2P'
  const BASE_URL = 'https://bypass.city/'
  const API_URL  = 'https://api2.bypass.city/bypass'
  const CF_API_URL = 'https://api.nekolabs.web.id/tools/bypass/cf-turnstile'

  const fetch = require('node-fetch')

  const input = (q || '').trim()
  if (!input) {
    return m.reply(`⚠️ Masukkan URL!\n\nContoh:\n${prefix + command} https://linkvertise.com/xxx`)
  }

  // validasi URL
  let urlObj
  try {
    urlObj = new URL(input)
  } catch {
    return m.reply('❌ URL tidak valid')
  }

  // optional: block non-http(s)
  if (!/^https?:$/.test(urlObj.protocol)) return m.reply('❌ URL harus http/https')

  try {
    if (typeof react === 'function') await react('⏳')

    // 1) ambil token cloudflare (turnstile)
    const cfUrl = `${CF_API_URL}?url=${encodeURIComponent(BASE_URL)}&siteKey=${SITE_KEY}`
    const cfRes = await fetch(cfUrl, { method: 'GET' })
    const cf = await cfRes.json().catch(() => null)

    if (!cf?.result) {
      if (typeof react === 'function') await react('❌')
      return m.reply('❌ Gagal mendapatkan token Cloudflare')
    }

    // 2) bypass
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'https://bypass.city',
        'referer': 'https://bypass.city/',
        'token': cf.result,
        'x-captcha-provider': 'TURNSTILE'
      },
      body: JSON.stringify({ url: input })
    })

    const data = await res.json().catch(() => null)

    if (!data?.data) {
      if (typeof react === 'function') await react('❌')
      return m.reply('❌ Gagal melakukan bypass')
    }

    // format size
    const formatFileSize = (bytes) => {
      const n = Number(bytes)
      if (!n || n <= 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(n) / Math.log(k))
      return (n / Math.pow(k, i)).toFixed(2).replace(/\.?0+$/, '') + ' ' + sizes[i]
    }

    let msg = `✅ *Bypass Berhasil!*\n\n`
    msg += `📌 *Service:* ${data.name || 'Unknown'}\n`
    msg += `🔗 *URL Asli:* ${input}\n`
    msg += `🎯 *Hasil:* ${data.data}\n`

    if (data.isPaste && data.paste) {
      msg += `\n📝 *Paste Content:*\n${data.paste}\n`
    }

    if (Array.isArray(data.embedData) && data.embedData.length) {
      msg += `\n📊 *Informasi File:*`
      data.embedData.forEach((v, i) => {
        msg += `\n\n${i + 1}. *${v.title || 'Unknown'}*`
        msg += `\n• Site: ${v.site || '-'}`
        msg += `\n• Type: ${v.type || '-'}`
        msg += `\n• Status: ${v.status || '-'}`
        if (v.size) msg += `\n• Size: ${formatFileSize(v.size)}`
        msg += `\n• Link: ${v.url || '-'}`
      })
    }

    if (typeof react === 'function') await react('✅')
    return m.reply(msg)

  } catch (e) {
    console.error('BYPASS ERROR:', e?.response?.data || e)
    if (typeof react === 'function') await react('❌')
    return m.reply('❌ Terjadi kesalahan saat bypass')
  }
}
break

case 'math': {
const cd = checkCooldown(m.sender, 'math', 10 * 1000)
  if (!cd.ok) {
    const sisa = Math.ceil(cd.remainingMs / 1000)
    if (cd.tries === 1) {
      return m.reply(cdNotif)
    }
    if (cd.tries >= 2) {
      return user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
    }
  }
  const expr = q?.trim()
  if (!expr) return m.reply('Pakai: .math 1+2*3')

  try {
    const { evaluate } = require('mathjs')

    // biar gak aneh-aneh: batasi karakter yang boleh
    if (!/^[0-9+\-*/().,%\s^]+$/.test(expr)) {
      return m.reply('Ekspresi tidak valid.')
    }

    const result = evaluate(expr)
    return m.reply(String(result))
  } catch (e) {
    return m.reply('Error: ekspresi tidak bisa dihitung.')
  }
}
break

case 'getjid':
case 'chjid': { 
  let input = ''
  if (m.quoted) input = m.quoted.text || m.quoted.caption || ''
  else input = q || ''
  if (!input) return m.reply('Kirim link newsletternya.\nContoh: .newsletter https://whatsapp.com/channel/xxxx')
  const invite =
    (input.match(/(?:whatsapp\.com|chat\.whatsapp\.com)\/channel\/([0-9A-Za-z_-]+)/i)?.[1]) ||
    (input.match(/(?:invite=)([0-9A-Za-z_-]+)/i)?.[1]) ||
    (input.match(/^([0-9A-Za-z_-]{6,})$/)?.[1])
  if (!invite) return m.reply('Link/kode newsletter tidak valid.')
  try {
    const meta = await sock.newsletterMetadata('invite', invite)
    const jid = meta?.id || '-'
    const name = meta?.name || '-'
    const desc = meta?.description || '-'
    const subs = (meta?.subscribers != null) ? meta.subscribers : '-'
    const verified = meta?.verification || '-'
    return m.reply(
      `- Info Channel\n` +
      `• JID: ${jid}\n` +
      `• Nama: ${name}\n` +
      `• Pengikut: ${subs}\n` +
      `• Deskripsi: ${desc}`
    )
  } catch (err) {
    console.error('NEWSLETTER ERROR:', err)
    return m.reply('Gagal ambil info newsletter. Coba lagi / pastiin linknya bener.')
  }
}
break

case 'toqr': {
  const cd = checkCooldown(m.sender, 'toqr', 10 * 1000)
  if (!cd.ok) {
    if (cd.tries === 1) return m.reply(cdNotif)
    if (cd.tries >= 2) {
      user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
      return
    }
  }

  const text = (q || '').trim()
  if (!text) return m.reply(`Usage: ${prefix + command} <text>`)

  await react('⏳')

  try {
    const qrUrl =
      `https://quickchart.io/qr?` +
      `text=${encodeURIComponent(text)}` +
      `&size=600&format=png`

    const res = await axios.get(qrUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data)

    await sock.sendMessage(
      m.chat,
      {
        image: buffer,
        mimetype: 'image/png',
        caption: 'QR berhasil dibuat.'
      },
      { quoted: m }
    )

    await react('✅')
  } catch (e) {
    console.error('TOQR ERROR:', e)
    await react('❌')
    m.reply('❌ Gagal membuat QR.')
  }
}
break

case 'hd':
case 'enhance':
case 'upscale': {
  const user = getRPGUser(m.sender, m.pushName) // kalau kamu pakai user di cooldown/tf
  const cd = checkCooldown(m.sender, 'hd', 25 * 1000)

  if (!cd.ok) {
    if (cd.tries === 1) return m.reply(cdNotif)
    if (cd.tries >= 2) {
      user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
      if (typeof saveRPG === 'function') saveRPG()
      return m.reply('Pelan-pelan..')
    }
  }

  const qmsg = m.quoted ? m.quoted : m
  const mime = (qmsg.msg || qmsg).mimetype || ''
  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return m.reply(`Kirim / reply gambar dengan caption *${prefix + command}*`)
  }

  try {
    await react('⏳')

    // === 1) download jadi buffer (tanpa save file) ===
    const type = 'image'
    const stream = await downloadContentFromMessage(qmsg.msg || qmsg, type)
    let imgBuffer = Buffer.from([])
    for await (const chunk of stream) imgBuffer = Buffer.concat([imgBuffer, chunk])

    if (!imgBuffer.length) throw new Error('Gagal download gambar (buffer kosong)')

    // === 2) upload ke catbox ===
    const { uploadToCatbox2 } = require('./lib/catbox')
    const ext = (mime.split('/')[1] || 'jpg').toLowerCase().replace('jpeg', 'jpg')
    const catboxUrl = await uploadToCatbox2(imgBuffer, `milky-hd.${ext}`)

    // === 3) panggil API HD ===
    const apiUrl = `https://yaemiko-narukami.vercel.app/tools/hd?url=${encodeURIComponent(catboxUrl)}`
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60_000 })
    const outBuf = Buffer.from(res.data)

    if (!outBuf.length) throw new Error('Output API kosong')

    // === 4) kirim hasil ===
    await sock.sendMessage(m.chat, {
      image: outBuf,
      mimetype: 'image/jpeg',
      caption: 'Gambar berhasil di-enhanced.'
    }, { quoted: m })

    await react('✅')
  } catch (err) {
    console.error('HD ERROR:', err?.response?.data || err)
    await react('❌')
    return m.reply('❌ Gagal memproses gambar, coba lagi nanti.')
  }
}
break

case 'hd2':
case 'upscale2':
case 'enhance2': {
  const qmsg = m.quoted || m
  const mime = (qmsg.msg || qmsg).mimetype || ''

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`Kirim / reply gambar (jpg/png)\nContoh: .${command} 2`)
  }

  const scale = parseInt(args[0]) || 2
  if (![2, 4].includes(scale)) {
    return m.reply('Scale hanya 2 atau 4\nContoh: .hd2 4')
  }

  await react('⏳')

  try {
    const fetch = require('node-fetch')
    const FormData = require('form-data')
    const fs = require('fs')
    const path = require('path')

    // ===== download gambar =====
    const mediaPath = await sock.downloadAndSaveMediaMessage(qmsg)
    const buffer = fs.readFileSync(mediaPath)

    // ===== upload =====
    const form = new FormData()
    form.append('myfile', buffer, { filename: 'image.png' })
    form.append('scaleRadio', String(scale))

    const uploadRes = await fetch(
      'https://get1.imglarger.com/api/UpscalerNew/UploadNew',
      {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0',
          'Origin': 'https://imgupscaler.com',
          'Referer': 'https://imgupscaler.com/'
        },
        body: form
      }
    )

    const uploadJson = await uploadRes.json()
    if (uploadJson.code !== 200) throw 'Upload gagal'

    const code = uploadJson.data.code

    // ===== polling =====
    let result
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 3000))

      const check = await fetch(
        'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
            'Origin': 'https://imgupscaler.com',
            'Referer': 'https://imgupscaler.com/'
          },
          body: JSON.stringify({ code, scaleRadio: scale })
        }
      )

      const json = await check.json()

      if (json.code === 200 && json.data.status === 'success') {
        result = json.data
        break
      }

      if (json.data?.status === 'failed') {
        throw 'Upscale gagal'
      }
    }

    if (!result?.downloadUrls?.length) throw 'Timeout upscale'

    await sock.sendMessage(
      m.chat,
      {
        image: { url: result.downloadUrls[0] },
        caption:
          `✅ Upscale berhasil\n` +
          `📐 Scale: ${scale}x\n` +
          `📦 Size: ${(result.filesize / 1024).toFixed(2)} KB`
      },
      { quoted: m }
    )

    fs.unlinkSync(mediaPath)
    await react('✅')

  } catch (e) {
    console.error('HD2 ERROR:', e)
    await react('❌')
    m.reply('❌ Gagal upscale gambar.')
  }
}
break

case 'lyrics': {
  if (!q) return m.reply('Contoh: .lyrics perfect')
  try {
    const url = `https://lyrics.lewdhutao.my.eu.org/v2/youtube/lyrics?title=${encodeURIComponent(q)}`
    const { data } = await axios.get(url, { timeout: 15000 })
    const result = data?.result || data?.data || data
    const title  = result?.title || result?.track?.track_name || q
    const artist = result?.artist || result?.track?.artist_name || result?.artist_name || ''
    const lyrics =
      result?.lyrics ||
      result?.lyrics_body ||
      result?.track?.lyrics?.lyrics_body ||
      result?.lyrics?.lyrics_body ||
      ''
    if (!lyrics) return m.reply('Lyrics tidak ditemukan.')
    const cleanLyrics = String(lyrics)
      .replace(/\*\*\*\s*This Lyrics is NOT for Commercial use\s*\*\*\*.*$/is, '')
      .trim()
    let out = `${cleanLyrics}`
    if (out.length > 6000) out = out.slice(0, 6000) + '\n\n...(kepanjangan, dipotong)'
    return m.reply(out)
  } catch (e) {
    console.error('LYRICS ERROR:', e?.response?.data || e)
    return m.reply('Gagal ambil lyrics, coba lagi nanti.')
  }
}
break

case 'report': {
  const exist = global.reportDB?.[m.sender]
  if (exist && !isReportExpired(exist)) {
    return m.reply('Kamu masih punya laporan yang belum selesai, lihat Private Chat.')
  }
  global.reportDB[m.sender] = {
    createdAt: Date.now(),
    step: 'choose',
    fromChat: m.chat
  }
  const buttons = [
    { buttonId: 'report_bug', buttonText: { displayText: 'Laporin Bug' }, type: 1 },
    { buttonId: 'report_user', buttonText: { displayText: 'Laporin User' }, type: 1 },
  ]
  await sock.sendMessage(m.sender, {
    text: '*# Milky Report*\n\nApa yang ingin kamu laporkan?',
    footer: 'Milky Report System',
    buttons,
    headerType: 1
  })
  if (m.isGroup) return m.reply('Milky udah kirim list laporan di Private Chat, harap di cek ya!')
  return m.reply('Lihat private chat.')
}
break

case "tovn": {
  if (!m.quoted) return m.reply("Reply audionya atau VN.")

  // ambil raw message
  const q = m.quoted
  const msg =
    q.message?.audioMessage ||
    q.msg ||
    (q.mtype === 'audioMessage' ? q : null)

  if (!msg) {
    return m.reply("Itu bukan audio atau voice note.")
  }

  try {
    const media = await q.download()
    if (!media) return m.reply("Gagal download audio.")

    await sock.sendMessage(
      m.chat,
      {
        audio: media,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      },
      { quoted: m }
    )
  } catch (e) {
    console.log("[TOVN ERROR]", e)
    m.reply("Gagal convert ke VN.")
  }
}
break

/*———————————————————————————————*/       
//〔 Command Fun 〕
case 'brat': {
  const user = getRPGUser(m.sender, m.pushName) // kalau kamu biasa pakai user di cd logic
  const cd = checkCooldown(m.sender, 'brat', 10 * 1000)

  if (!cd.ok) {
    if (cd.tries === 1) return m.reply(cdNotif)
    if (cd.tries >= 2) {
      user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55)
      if (typeof saveRPG === 'function') saveRPG()
      return m.reply(cdNotif)
    }
  }

  const text = (q || '').trim()
  if (!text) return m.reply(`Usage: ${prefix + command} <text>`)

  await react('⏳')
  try {
    const apiUrl = `https://api.yupra.my.id/api/image/brat?text=${encodeURIComponent(text)}`
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 20000 })
    const imgBuf = Buffer.from(res.data)

    const meta = {
      packname: `Sticker by ${m.pushName}\n\nCreated on: Milky Interactive\n+62 822-4836-8488\n`,
      author: '———————————— •\nMilky Interactive by CrystalDev\n(aka. Vikry)'
    }

    // bikin webp + exif (sama kayak image di .sticker)
    const webpPath = await writeExifImg(imgBuf, meta)

    await sock.sendMessage(m.chat, { sticker: { url: webpPath } }, { quoted: m })
    await react('✅')

    if (webpPath && fs.existsSync(webpPath)) fs.unlinkSync(webpPath)
  } catch (e) {
    console.error('BRAT error:', e?.response?.data || e)
    await react('❌')
    return m.reply('❌ Gagal bikin brat sticker, coba lagi ya.')
  }
}
break

case "play": {
  const user = getRPGUser(m.sender, m.pushName)
  const cd = checkCooldown(m.sender, 'play', 60 * 1000)

  if (!cd.ok) {
    if (cd.tries === 1) return m.reply(cdNotif)
    if (cd.tries >= 2) return (user.trustfactor = Math.max(0, (user.trustfactor || 0) - 0.55))
  }

  const fs = require('fs')
  const path = require('path')
  const { execFile } = require('child_process')

  const runFfmpeg = (args) =>
    new Promise((resolve, reject) => {
      execFile('ffmpeg', args, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message))
        resolve(true)
      })
    })

  const ensureDir = (p) => {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
  }

  const headHex = (buf, n = 24) => buf.slice(0, n).toString('hex')
  const isMp4Like = (buf) => {
    // mp4: biasanya ada "ftyp" di offset 4
    if (!buf || buf.length < 12) return false
    const tag = buf.slice(4, 8).toString('ascii')
    return tag === 'ftyp'
  }

  try {
    if (user.userID === 14) return m.reply(mess.commandBanned)
    if (!text) return sock.sendMessage(m.chat, { text: `*Usage:* ${prefix + command} <judul/url>` }, { quoted: m })

    let query = text.trim()
    let ytUrl = query

    if (!/https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(query)) {
      const search = await axios.get(`https://api.yupra.my.id/api/search/youtube?q=${encodeURIComponent(query)}`)
      if (!search.data?.results?.length) {
        return sock.sendMessage(m.chat, { text: "Tidak ditemukan hasil." }, { quoted: m })
      }
      ytUrl = search.data.results[0].url
    }

    await react('⏳')

    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(ytUrl)}`
    const { data } = await axios.get(apiUrl)
    if (!data?.success) throw new Error("Gagal download.")

    const info = data.data
    if (!info?.download_url) throw new Error("Link audio tidak ada.")

    const stream = await axios.get(info.download_url, { responseType: "arraybuffer" })
    let buf = Buffer.from(stream.data || [])
    if (!buf.length) throw new Error("Audio kosong.")

    // debug biar kamu bisa liat
    console.log('dl content-type:', stream.headers?.['content-type'])
    console.log('size:', buf.length)
    console.log('head bytes:', buf.slice(0, 16))
    console.log('head hex:', headHex(buf))

    // kalau MP4/DASH/ftypdash -> convert ke mp3 biar WA playable
    if (isMp4Like(buf)) {
      const tmpDir = path.join(process.cwd(), 'tmp')
      ensureDir(tmpDir)

      const safeTitle = String(info.title || 'audio').replace(/[\\/:*?"<>|]/g, '').slice(0, 60)
      const inPath = path.join(tmpDir, `play_${Date.now()}.mp4`)
      const outPath = path.join(tmpDir, `play_${Date.now()}.mp3`)

      fs.writeFileSync(inPath, buf)

      // convert: ambil audio doang, encode mp3
      await runFfmpeg([
        '-y',
        '-i', inPath,
        '-vn',
        '-ac', '2',
        '-ar', '44100',
        '-b:a', '128k',
        outPath
      ])

      buf = fs.readFileSync(outPath)

      // bersihin temp
      try { fs.unlinkSync(inPath) } catch {}
      try { fs.unlinkSync(outPath) } catch {}
    }

    const title = String(info.title || 'Audio')
    const body = `Milky Interactive`

    await sock.sendMessage(m.chat, {
      audio: buf,
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title,
          body,
          thumbnailUrl: info.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: ytUrl
        }
      }
    }, { quoted: m })

    await react('✅')
  } catch (e) {
    await react('❌')
    console.log("[PLAY ERROR]", e)
    sock.sendMessage(m.chat, { text: "Gagal download." }, { quoted: m })
  }
}
break
/*———————————————————————————————*/       
//〔 Akhir Case 〕

default:
if (m.text.toLowerCase().startsWith("xx ")) {
  if (!isCreator) return;
  try {
    const r = await eval(`(async()=>{${text}})()`);
    sock.sendMessage(m.chat, { text: util.format(typeof r === "string" ? r : util.inspect(r)) }, { quoted: m });
  } catch (e) {
    sock.sendMessage(m.chat, { text: util.format(e) }, { quoted: m });
  }
}

if (m.text.toLowerCase().startsWith("x ")) {
  if (!isCreator) return;
  try {
    let r = await eval(text);
    sock.sendMessage(m.chat, { text: util.format(typeof r === "string" ? r : util.inspect(r)) }, { quoted: m });
  } catch (e) {
    sock.sendMessage(m.chat, { text: util.format(e) }, { quoted: m });
  }
}

if (m.text.startsWith('$')) {
  if (!isCreator) return;
  exec(m.text.slice(2), (e, out) =>
    sock.sendMessage(m.chat, { text: util.format(e ? e : out) }, { quoted: m })
  );
}}

}
} catch (err) {
console.log(err)
}
}

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.white("[•] Update"), chalk.white(`${__filename}\n`))
delete require.cache[file]
require(file)
})