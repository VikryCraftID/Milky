import 'dotenv/config';
import './settings.js';
import { L, syncGlobalMess } from './language/index.js';

import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import dns from 'dns';
import pino from 'pino';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import cron from 'node-cron';
import readline from 'readline';
import { toBuffer } from 'qrcode';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import NodeCache from 'node-cache';
import { createRequire } from 'module';
import moment from 'moment-timezone';
import { parsePhoneNumber } from 'awesome-phonenumber';
import WAConnection, { useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestWaWebVersion, jidNormalizedUser } from 'baileys';

import { app, server, PORT } from './src/server.js';
import { dataBase, cmdDel, checkStatus } from './src/database.js';
import { assertInstalled, customHttpsAgent } from './lib/function.js';
import logger from './lib/logger.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

/**
 * Masked input for sensitive data (passwords)
 * Using the muted stdout trick for maximum stability
 */
const maskedQuestion = (query) => {
    return new Promise((resolve) => {
        // Temporarily override the output stream
        const originalWrite = rl._writeToOutput;
        rl.stdoutMuted = true;
        
        rl._writeToOutput = function(stringToWrite) {
            if (this.stdoutMuted) {
                // If it is a line break, print it normally
                if (stringToWrite === '\r\n' || stringToWrite === '\n' || stringToWrite === '\r') {
                    rl.output.write(stringToWrite);
                } else if (stringToWrite.length > 0 && stringToWrite !== query) {
                    // Mask input characters with asterisk
                    // We check if it is not the prompt itself
                    rl.output.write('*');
                } else {
                    // Print the prompt normally
                    rl.output.write(stringToWrite);
                }
            } else {
                rl.output.write(stringToWrite);
            }
        };

        rl.question(query, (answer) => {
            rl.stdoutMuted = false;
            rl._writeToOutput = originalWrite; // Restore original write
            resolve(answer);
        });
    });
};

const tempDir = path.join(__dirname, 'database/temp');

// Fatal Error Handler (Registered Early)
const handleFatalError = async (err) => {
    logger.error('FATAL', `An unhandled error occurred: ${err.message || err}`);
    console.error(err);
    if (err.stack) console.error(err.stack);
    logger.warn('SYSTEM', 'Bot will restart in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.exit(1);
};

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

// Global System Variables (Initialized in runBot)
let storeDB, database, settingsDB, groupsDB, msgRetryCounterCache;
let pairingCode, pairingStarted = false, phoneNumber, time_now, time_end;

async function runBot() {
    // Initialize i18n
    global.L = L;
    await syncGlobalMess();

    logger.info('SYSTEM', 'Starting the bot engine...');
    
    // Initialize global system variables
    try {
        storeDB = dataBase(global.tempatStore);
        database = dataBase(global.tempatDB);
        settingsDB = dataBase('settings.json');
        groupsDB = dataBase('groups.json');
        msgRetryCounterCache = new NodeCache();
        pairingCode = process.argv.includes('--qr') ? false : process.argv.includes('--pairing-code') || global.pairing_code;
        time_now = new Date();
        time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
    } catch (e) {
        return handleFatalError(e);
    }

    const userInfoSyt = () => {
        try {
            return os.userInfo().username
        } catch (e) {
            return process.env.USER || process.env.USERNAME || 'unknown';
        }
    }

    const originalConsoleInfo = console.info;
    console.info = function (...args) {
        if (typeof args[0] === 'string' && (
            args[0].includes('Closing session:') || 
            args[0].includes('Opening session:') || 
            args[0].includes('Removing old closed session:')
        )) {
            return;
        }
        originalConsoleInfo.apply(console, args);
    };

    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        logger.info('SYSTEM', 'Custom DNS Google & Cloudflare initialized.');
    } catch (e) {
        logger.warn('SYSTEM', `Failed to set custom DNS: ${e.message}`);
    }

    global.fetchApi = async (endpoint = '/', data = {}, options = {}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const apiList = Object.keys(global.APIs);
                if (options.api !== undefined) {
                    if (typeof options.api !== 'number' || options.api < 1 || options.api > apiList.length) {
                        return reject(new Error(`[Fetch Error] Parameter { api: ${options.api} } tidak terdaftar. Harap gunakan angka 1 hingga ${apiList.length}.`));
                    }
                }
                const apiName = typeof options.api === 'number' ? apiList[options.api - 1] : options.name
                const base = apiName ? (global.APIs[apiName] || apiName) : global.APIs.naze
                const apikey = global.APIKeys[base] || '';
                let method = (options.method || 'GET').toUpperCase()
                let url = base + endpoint 
                let payload = null
                let headers = options.headers || { 'user-agent': 'Mozilla/5.0 (Linux; Android 15)' }
                const isForm = options.form || data instanceof FormData || (data && typeof data.getHeaders === 'function');
                if (isForm) {
                    payload = data
                    method = 'POST'
                    headers = { ...(options.headers?.['Authorization'] ? {} : { apikey }), ...headers, ...data.getHeaders() }
                } else if (method !== 'GET') {
                    payload = { ...data, ...(options.headers?.['Authorization'] ? {} : { apikey }) }
                    headers['content-type'] = 'application/json'
                } else {
                    url += '?' + new URLSearchParams({ ...data, apikey }).toString()
                }
                const res = await axios({
                    method, url, data: payload,
                    headers, httpsAgent: customHttpsAgent,
                    responseType: options.stream ? 'stream' : (options.buffer ? 'arraybuffer' : options.responseType || options.type || 'json'),
                });
                if (options.stream) {
                    let ext = options.ext
                    if (typeof options.stream !== 'string' && !ext) {
                        const contentDisp = res.headers['content-disposition']
                        const contentType = res.headers['content-type']
                        if (contentDisp && contentDisp.includes('filename=')) {
                            const match = contentDisp.match(/filename="?([^"]+)"?/)
                            if (match && match[1]) {
                                ext = match[1].split('.').pop()
                            }
                        }
                        if (!ext && contentType) {
                            ext = contentType.split('/')[1]?.split(';')[0]
                            if (ext === 'jpeg') ext = 'jpg'
                        }
                        ext = ext || 'tmp'
                    }
                    let streamPath = typeof options.stream === 'string' ? options.stream : path.join(process.cwd(), 'database/temp', 'temp-' + Date.now() + '.' + ext)
                    const writeStream = fs.createWriteStream(streamPath)
                    res.data.pipe(writeStream)
                    writeStream.on('finish', () => resolve(streamPath))
                    writeStream.on('error', reject)
                } else {
                    resolve(options.buffer ? Buffer.from(res.data) : res.data)
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir).forEach(file => {
            fs.unlinkSync(path.join(tempDir, file));
        });
        logger.info('DATABASE', 'Temp folder cleared successfully.');
    } else {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    logger.success('SYSTEM', 'All external dependencies are satisfied.');

    console.log('\n' + logger.gradient('  ◈ ───────────── SYSTEM INFORMATION ───────────── ◈'));
    logger.info('User', userInfoSyt());
    logger.info('Hostname', os.hostname());
    logger.info('OS', `${os.platform()} ${os.release()} ${os.arch()}`);
    logger.info('Uptime', `${Math.floor(os.uptime() / 3600)} h ${Math.floor((os.uptime() % 3600) / 60)} m`);
    logger.info('Memory', `${(os.freemem()/1024/1024).toFixed(0)} MiB / ${(os.totalmem()/1024/1024).toFixed(0)} MiB`);
    logger.info('Script', `v${require('./package.json').version}`);
    logger.info('Node.js', process.version);
    logger.info('Baileys', `v${require('./package.json').dependencies.baileys}`);
    logger.info('Time', new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour12: false }));
    console.log(''); // spacer

    server.listen(PORT, () => {
        logger.info('SERVER', `App listened on port ${PORT}`);
    });
    
    logger.success('SYSTEM', 'System ready to connect!');
    startNazeBot();
}

async function startNazeBot() {
	try {
		const loadData = await database.read()
		const storeLoadData = await storeDB.read()
        const settingsData = await settingsDB.read()
        const groupsData = await groupsDB.read()

		if (!loadData || Object.keys(loadData).length === 0) {
			global.db = {
				users: {},
				groups: {},
				whitelist: [],
				game: {},
				database: {},
				premium: [],
				sewa: [],
				...(loadData || {}),
			}
			await database.write(global.db)
		} else {
			global.db = loadData
			if (!global.db.users) global.db.users = {};
			if (!global.db.groups) global.db.groups = {};
			if (!global.db.whitelist) global.db.whitelist = [];
			if (!global.db.game) global.db.game = {};
            delete global.db.hit;
            delete global.db.cmd;
            delete global.db.store;
            delete global.db.users;
            delete global.db.set;
            delete global.db.groups;
            delete global.db.whitelist;
		}

        if (!global.db.game) global.db.game = {};
        if (!global.db.groups) global.db.groups = (groupsData && groupsData.groups) || {};
        if (!global.db.whitelist) global.db.whitelist = (groupsData && groupsData.whitelist) || [];
        if (!global.db.users) global.db.users = {};
        if (!global.db.hit) global.db.hit = {};
        if (!global.db.cmd) global.db.cmd = {};
        if (!global.db.set) global.db.set = settingsData || {};
        if (!global.db.premium) global.db.premium = [];
        if (!global.db.sewa) global.db.sewa = [];
        if (!global.db.database) global.db.database = {};

		if (!storeLoadData || Object.keys(storeLoadData).length === 0) {
			global.store = {
				contacts: {},
				presences: {},
				messages: {},
				groupMetadata: {},
				...(storeLoadData || {}),
			}
			await storeDB.write(global.store)
		} else {
			global.store = storeLoadData
		}
		
		global.loadMessage = function (remoteJid, id) {
			const messages = store.messages?.[remoteJid]?.array;
			if (!messages) return null;
			return messages.find(msg => msg?.key?.id === id) || null;
		}
		
		if (!global._dbInterval) {
			global._dbInterval = setInterval(async () => {
				if (global.db) {
                    const toSave = { ...global.db };
                    delete toSave.hit;
                    delete toSave.cmd;
                    delete toSave.set;
                    delete toSave.users;
                    delete toSave.store;
                    delete toSave.groups;
                    delete toSave.whitelist;
                    await database.write(toSave);
                }
				if (global.store) await storeDB.write(global.store)
                if (global.db.set) await settingsDB.write(global.db.set)
                if (global.db.groups || global.db.whitelist) {
                    await groupsDB.write({ 
                        groups: global.db.groups || {}, 
                        whitelist: global.db.whitelist || [] 
                    });
                }
			}, 30 * 1000)
		}
	} catch (e) {
		console.log(e)
		process.exit(1)
	}
	
	const level = pino({ level: 'silent' });
	const { version } = await fetchLatestWaWebVersion();
	const { state, saveCreds } = await useMultiFileAuthState('nazedev');
	const getMessage = async (key) => {
		if (global.store) {
			const msg = await global.loadMessage(key.remoteJid, key.id);
			return msg?.message || ''
		}
		return {
			conversation: 'Halo Saya Naze Bot'
		}
	}
	
	const naze = WAConnection({
		version,
		logger: level,
		getMessage,
		syncFullHistory: false,
		maxMsgRetryCount: 15,
		msgRetryCounterCache,
		retryRequestDelayMs: 10,
		defaultQueryTimeoutMs: 0,
		connectTimeoutMs: 60000,
		keepAliveIntervalMs: 30000,
		browser: Browsers.ubuntu('Chrome'),
		generateHighQualityLinkPreview: false,
		transactionOpts: {
			maxCommitRetries: 10,
			delayBetweenTriesMs: 10,
		},
		appStateMacVerification: {
			patch: true,
			snapshot: true,
		},
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, level),
		},
	})
	
	if (pairingCode && !phoneNumber && !naze.authState.creds.registered) {
		async function getPhoneNumber() {
			const prompt = `${chalk.hex('#a78bfa')('║')} ${chalk.hex('#f472b6').bold('Auth')} ${chalk.hex('#818cf8')('→')} ${chalk.white('Please type your WhatsApp number : ')}`;
			phoneNumber = global.number_bot ? global.number_bot : process.env.BOT_NUMBER || await question(prompt);
			phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
			
			if (!parsePhoneNumber('+' + phoneNumber).valid && phoneNumber.length < 6) {
				logger.error('AUTH', 'Invalid number format. Use country code (e.g. 62xxx)');
				await getPhoneNumber()
			}
		}
		(async () => {
			await getPhoneNumber();
			exec('rm -rf ./nazedev/*');
			logger.info('AUTH', 'Phone number captured. Waiting for Connection...');
			console.log(`${chalk.hex('#a78bfa')('║')} ${chalk.hex('#fb7185')('Estimated time: around 2 ~ 5 minutes')}`);
		})()
	}
	
	const { GroupParticipantsUpdate, MessagesUpsert, Solving } = await import('./src/message.js');
	await Solving(naze, global.store)

	naze.ev.on('creds.update', saveCreds)

	naze.ev.on('connection.update', async (update) => {
		const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update;
		if ((connection === 'connecting' || !!qr) && pairingCode && phoneNumber && !naze.authState.creds.registered && !pairingStarted) {
			setTimeout(async () => {
				pairingStarted = true;
				logger.info('AUTH', 'Requesting Pairing Code...');
				let code = await naze.requestPairingCode(phoneNumber);
				console.log(`${chalk.hex('#a78bfa')('║')} ${chalk.hex('#f472b6').bold('Pairing Code')} ${chalk.hex('#818cf8')('→')} ${chalk.bgWhite.black.bold(` ${code} `)}`);
				console.log(`${chalk.hex('#a78bfa')('║')} ${chalk.hex('#fb7185')('Expires in 15 seconds')}`);
			}, 3000)
		}
		if (connection === 'close') {
			const reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === DisconnectReason.connectionLost) {
				logger.warn('AUTH', 'Connection to Server Lost, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.connectionClosed) {
				logger.warn('AUTH', 'Connection closed, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.restartRequired) {
				logger.info('AUTH', 'Restart Required, restarting bot engine...');
				startNazeBot()
			} else if (reason === DisconnectReason.timedOut) {
				logger.warn('AUTH', 'Connection Timed Out, Attempting to Reconnect...');
				startNazeBot()
			} else if (reason === DisconnectReason.badSession) {
				logger.error('AUTH', 'Bad Session, Delete Session and Scan again...');
				startNazeBot()
			} else if (reason === DisconnectReason.connectionReplaced) {
				logger.error('AUTH', 'Connection Replaced, Close current Session first...');
			} else if (reason === DisconnectReason.loggedOut) {
				logger.error('AUTH', 'Logged Out, Scan again and Run...');
				exec('rm -rf ./nazedev/*')
				process.exit(0)
			} else if (reason === DisconnectReason.forbidden) {
				logger.error('AUTH', 'Connection Failure (Forbidden), Scan again and Run...');
				exec('rm -rf ./nazedev/*')
				process.exit(1)
			} else if (reason === DisconnectReason.multideviceMismatch) {
				logger.error('AUTH', 'Multi-device Mismatch, Scan again...');
				exec('rm -rf ./nazedev/*')
				process.exit(0)
			} else {
				logger.error('AUTH', `Unknown DisconnectReason: ${reason}|${connection}`);
				naze.end(`Unknown DisconnectReason : ${reason}|${connection}`)
			}
		}
		if (connection == 'open') {
			try {
				let botNumber = naze.user?.id ? await naze.decodeJid(naze.user.id) : null;
				
				// Tunggu naze.user jika belum siap (antisipasi race condition)
				if (!botNumber) {
					logger.warn('AUTH', 'Waiting for socket user data...');
					await new Promise(r => setTimeout(r, 2000));
					botNumber = naze.user?.id ? await naze.decodeJid(naze.user.id) : null;
				}

				const whitelist = ['6285651226154', '6282248368488', '6287740885303'];
				const isWhitelisted = botNumber && whitelist.some(num => botNumber.startsWith(num));

				if (!isWhitelisted) {
					logger.error('AUTH', `Get out of here. You're blacklisted.`);
					logger.warn('AUTH', 'This incident will be reported. Goodbye, intruder.');
					await new Promise(resolve => setTimeout(resolve, 5000));
					return process.exit(0);
				}

				logger.success('AUTH', `Connected as ${naze.user?.name || botNumber.split('@')[0]}`);
				console.log(logger.gradient(` (✧ω✧) Welcome back, Master! System is online. \n`));
				
				// Defensive Newsletter Logic
				try {
					if (global.db?.set && botNumber && global.my?.ch) {
						if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
						if (!global.db.set[botNumber].join) {
							if (typeof global.my.ch === 'string' && global.my.ch.includes('@newsletter')) {
								await naze.newsletterMsg(global.my.ch, { type: 'follow' }).catch(() => {});
								global.db.set[botNumber].join = true;
							}
						}
					}
				} catch (err) {
					logger.warn('SYSTEM', `Failed to auto-join newsletter: ${err.message}`);
				}
			} catch (err) {
				logger.error('AUTH', `Error in connection open handler: ${err.message}`);
				console.error(err);
			}
		}
		if (qr) {
			if (!pairingCode) {
                logger.info('AUTH', 'Scan the QR Code below to connect:');
                qrcode.generate(qr, { small: true });
            }
			app.use('/qr', async (req, res) => {
				res.setHeader('content-type', 'image/png')
				res.end(await toBuffer(qr))
			});
		}
		if (isNewLogin) logger.info('AUTH', 'New device login detected...');
		if (receivedPendingNotifications == 'true') {
			logger.info('AUTH', 'Flushing pending notifications, please wait about 1 minute...');
			naze.ev.flush()
		}
	});
	
	naze.ev.on('call', async (call) => {
		let botNumber = await naze.decodeJid(naze.user.id);
		if (global.db?.set[botNumber]?.anticall) {
			for (let id of call) {
				if (id.status === 'offer') {
					let msg = await naze.sendMessage(id.from, { text: `Saat Ini, Kami Tidak Dapat Menerima Panggilan ${id.isVideo ? 'Video' : 'Suara'}.\nJika @${id.from.split('@')[0]} Memerlukan Bantuan, Silakan Hubungi Owner :)`, mentions: [id.from]});
					await naze.sendContact(id.from, global.owner, msg);
					await naze.rejectCall(id.id, id.from)
				}
			}
		}
	});
	
	naze.ev.on('messages.upsert', async (message) => {
		await MessagesUpsert(naze, message, global.store);
	});
	
	naze.ev.on('group-participants.update', async (update) => {
		await localeStorage.run({ locale: global.locale || 'en' }, async () => {
			await GroupParticipantsUpdate(naze, update, global.store);
		});
	});
	
	naze.ev.on('groups.update', (update) => {
		for (const n of update) {
			if (global.store.groupMetadata[n.id]) {
				Object.assign(global.store.groupMetadata[n.id], n);
			} else global.store.groupMetadata[n.id] = n;
		}
	});
	
	naze.ev.on('presence.update', (update) => {
		const { id, presences } = update;
		store.presences[id] = global.store.presences?.[id] || {};
		Object.assign(global.store.presences[id], presences);
	});
	
	// Reset Limit & Backup
	cron.schedule('00 00 * * *', async () => {
		if (!global.db?.users) return;
		cmdDel(global.db.hit || {});
		logger.info('DATABASE', 'Daily reset: Limit users and command hits cleared.');
		let user = Object.keys(global.db.users)
		let botNumber = naze.user?.id ? await naze.decodeJid(naze.user.id) : null;
		for (let jid of user) {
			const userObj = global.db.users[jid];
			if (!userObj) continue;
			const limitUser = userObj.vip ? global.limit?.vip : checkStatus(jid, global.db.premium || []) ? global.limit?.premium : global.limit?.free
			if (userObj.limit < limitUser) userObj.limit = limitUser
		}
		if (botNumber && global.db?.set?.[botNumber]?.autobackup) {
			let datanya = './database/' + global.tempatDB;
			if (global.tempatDB.startsWith('mongodb')) {
				datanya = './database/backup_database.json';
				fs.writeFileSync(datanya, JSON.stringify(global.db, null, 2), 'utf-8');
			}
			for (let o of (global.ownerNumber || [])) {
				try {
					await naze.sendMessage(o, { document: fs.readFileSync(datanya), mimetype: 'application/json', fileName: new Date().toISOString().replace(/[:.]/g, '-') + '_database.json' })
					logger.success('BACKUP', `Auto-backup successfully sent to ${o}`);
				} catch (e) {
					logger.error('BACKUP', `Failed to send auto-backup to ${o}`);
				}
			}
		}
	}, {
		scheduled: true,
		timezone: global.timezone
	});
	
	// Waktu Sholat
	if (!global.intervalSholat) global.intervalSholat = null;
	if (!global.waktusholat) global.waktusholat = {};
	if (global.intervalSholat) clearInterval(global.intervalSholat); 
	setTimeout(() => {
		global.intervalSholat = setInterval(async() => {
			const sekarang = moment.tz(global.timezone);
			const jamSholat = sekarang.format('HH:mm');
			const hariIni = sekarang.format('YYYY-MM-DD');
			const detik = sekarang.format('ss');
			if (detik !== '00') return;
			for (const [sholat, waktu] of Object.entries(global.jadwalSholat)) {
				if (jamSholat === waktu && global.waktusholat[sholat] !== hariIni) {
					global.waktusholat[sholat] = hariIni
					for (const [idnya, settings] of Object.entries(global.db.groups)) {
						if (settings.waktusholat) {
							await naze.sendMessage(idnya, { text: `Waktu *${sholat}* telah tiba, ambilah air wudhu dan segeralah shalat🙂.\n\n*${waktu.slice(0, 5)}*\n_untuk wilayah ${global.timezone} dan sekitarnya._` }, { ephemeralExpiration: store?.messages[idnya]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 }).catch(e => {})
						}
					}
				}
			}
		}, 60000)
	}, time_end);
	
	if (!global._dbPresence) {
		global._dbPresence = setInterval(async () => {
			if (naze?.user?.id) await naze.sendPresenceUpdate('available', naze.decodeJid(naze.user.id)).catch(e => {})
		}, 10 * 60 * 1000);
	}

	return naze
}

async function main() {
    // SHA-256 Hash for "crystaldevmilky"
    const storedHash = "bf3856110243cfa8e18a267370d791be23f140ef7588a618287af9610fc1f70f";

    const inputPassword = await maskedQuestion(`${chalk.hex('#a78bfa')('║')} ${chalk.hex('#c084fc').bold('Security')} ${chalk.hex('#818cf8')('→')} ${chalk.white('Enter Bot Password: ')}`);
    const inputHash = crypto.createHash('sha256').update(inputPassword.trim()).digest('hex');

    if (inputHash !== storedHash) {
        logger.error('AUTH', 'Password salah. Proses startup dibatalkan.');
        rl.close();
        await new Promise(resolve => setTimeout(resolve, 3000));
        return process.exit(0);
    }

    logger.success('AUTH', 'Password diterima.');
    logger.info('SYSTEM', 'Starting the bot engine...');
    runBot();
}

// Execute Main
try {
    main();
} catch (e) {
    handleFatalError(e);
}

// Process Exit & Fast Cleanup
let isCleaningUp = false;
const cleanup = async (signal) => {
    if (isCleaningUp) return;
    isCleaningUp = true;

    logger.warn('PROCESS', `Received ${signal}. Saving database before exit...`);
    
    // Set a fail-safe timeout (5 seconds) to force exit if stuck
    const forceExitTimeout = setTimeout(() => {
        logger.error('PROCESS', 'Cleanup timed out. Force exiting to prevent hang.');
        process.exit(1);
    }, 5000);

    try {
        rl.close();
        
        // Save databases with error handling
        if (global.db && typeof database?.write === 'function') {
            try {
                await database.write(global.db);
                logger.success('DATABASE', 'Global DB saved.');
            } catch (e) {
                logger.error('DATABASE', `Failed to save Global DB: ${e.message}`);
            }
        }
        
        if (global.store && typeof storeDB?.write === 'function') {
            try {
                await storeDB.write(global.store);
                logger.success('DATABASE', 'Store DB saved.');
            } catch (e) {
                logger.error('DATABASE', `Failed to save Store DB: ${e.message}`);
            }
        }

        // Close server
        if (server && server.listening) {
            server.close();
            logger.info('SERVER', 'Web server closed.');
        }

        clearTimeout(forceExitTimeout);
        logger.info('PROCESS', 'Cleanup finished. See you again, Master! ( ^ω^ )');
        process.exit(0);
    } catch (err) {
        logger.error('PROCESS', `Error during cleanup: ${err.message}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => cleanup('SIGINT'))
process.on('SIGTERM', () => cleanup('SIGTERM'))

server.on('error', (error) => {
	if (error.code === 'EADDRINUSE') {
		logger.warn('SERVER', `Address localhost:${PORT} in use. Please retry when the port is available!`);
		server.close();
	} else logger.error('SERVER', `${error}`);
});

setInterval(() => {}, 1000 * 60 * 10);
