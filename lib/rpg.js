import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderAchievementCard } from './design.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(process.cwd(), 'database', 'rpg.json');

// Pastikan folder database ada
if (!fs.existsSync(path.join(process.cwd(), 'database'))) {
    fs.mkdirSync(path.join(process.cwd(), 'database'), { recursive: true });
}

// Load atau inisialisasi database
let rpgDB = { users: {}, nextId: 1 };
if (fs.existsSync(dbPath)) {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        rpgDB = JSON.parse(data);
        if (!rpgDB.users) rpgDB.users = {};
        if (!rpgDB.nextId) rpgDB.nextId = 1;

        // Pembersihan otomatis entri kotor (LID, Newsletter, dll)
        let cleaned = false;
        for (let jid in rpgDB.users) {
            if (!jid.endsWith('@s.whatsapp.net')) {
                delete rpgDB.users[jid];
                cleaned = true;
            }
        }
        if (cleaned) {
            // Re-calculate nextId agar urutan ID tidak berantakan
            const currentUsers = Object.values(rpgDB.users);
            if (currentUsers.length > 0) {
                rpgDB.nextId = Math.max(...currentUsers.map(u => u.userId || 0)) + 1;
            } else {
                rpgDB.nextId = 1;
            }
            fs.writeFileSync(dbPath, JSON.stringify(rpgDB, null, 2), 'utf8');
        }
    } catch (e) {
        console.error('Gagal load RPG DB:', e);
    }
}
global.rpgDB = rpgDB;

// Load achievements
const achPath = path.join(process.cwd(), 'database', 'ach.json');
let achievementsData = [];
if (fs.existsSync(achPath)) {
    try {
        achievementsData = JSON.parse(fs.readFileSync(achPath, 'utf8'));
    } catch (e) {
        console.error('Gagal load Achievement DB:', e);
    }
}

// Load roles
const rolesPath = path.join(process.cwd(), 'database', 'roles.json');
let rolesData = { roots: [], evos: {}, tiers: {} };
if (fs.existsSync(rolesPath)) {
    try {
        rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
    } catch (e) {
        console.error('Gagal load Roles DB:', e);
    }
}

export function getAchievements() { return achievementsData; }
export function getRolesData() { return rolesData; }

// Fungsi simpan
export function saveRPG() {
    fs.writeFileSync(dbPath, JSON.stringify(rpgDB, null, 2), 'utf8');
}

// Helper: get user (create if not exist)
export function getRPGUser(jid, pushName = 'New User') {
    // HANYA proses JID standard
    if (!jid || !jid.endsWith('@s.whatsapp.net')) return null;

    if (!rpgDB.users[jid]) {
        const newId = rpgDB.nextId++;
        const isIndo = jid.startsWith('62');
        rpgDB.users[jid] = {
            jid: jid,
            userId: newId,
            name: pushName || 'New User',
            level: 1,
            xp: 0,
            yen: 2,
            trustFactor: 75.0,
            messages: 0,
            commands: 0,
            warns: 0,
            gacha: 0,
            reincarnation: 0,
            achievements: 0,
            achievementsList: [],
            displayAchievement: null,
            role: "Human",
            evoAttempts: 0,
            vanity: '',
            bio: 'Definitely a normal person.',
            avatar: '',
            bg: '',
            flag: isIndo ? 'id' : 'gb',
            lang: isIndo ? 'id' : 'en',
            daily: { date: null, type: null },
            gtInv: [],
            gtPity: 0,
            createdAt: Date.now()
        };
        saveRPG();
    }
    const user = rpgDB.users[jid];
    // Auto-update lang for existing users without lang property
    if (user.lang === undefined) {
        user.lang = jid.startsWith('62') ? 'id' : 'en';
        saveRPG();
    }
    if (user.achievementsList === undefined) user.achievementsList = [];
    if (user.displayAchievement === undefined) user.displayAchievement = null;
    if (user.gtInv === undefined) user.gtInv = [];
    if (user.gtPity === undefined) user.gtPity = 0;
    if (user.role === undefined) user.role = "Human";
    if (user.evoAttempts === undefined) user.evoAttempts = 0;
    return user;
}

export async function giveAchievement(jid, achId, context) {
    const user = getRPGUser(jid);
    const achievement = achievementsData.find(a => a.id === achId);
    if (!achievement) return false;
    
    if (user.achievementsList.includes(achId)) return false;
    
    user.achievementsList.push(achId);
    user.achievements = user.achievementsList.length;
    if (!user.displayAchievement) user.displayAchievement = achId;
    
    saveRPG();
    
    if (context && context.reply) {
        try {
            const buffer = await renderAchievementCard(user, achievement);
            await context.reply({
                image: buffer,
                caption: L('system.achievement', jid.split('@')[0], achievement.name),
                mentions: [jid]
            });
        } catch (err) {
            console.error('Achievement render error:', err);
            await context.reply(L('system.achievement', jid.split('@')[0], achievement.name));
        }
    }
    return true;
}

// Logic: Reincarnation
export function reincarnateUser(jid) {
    const user = getRPGUser(jid);
    if (user.level < 8) return { success: false, msg: L('system.reincarnateMin') };
    
    const roots = rolesData.roots;
    const totalWeight = roots.reduce((s, r) => s + r.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = roots[0];
    for (const r of roots) {
        if (random < r.weight) {
            selected = r;
            break;
        }
        random -= r.weight;
    }
    
    user.role = selected.name;
    user.level = 1;
    user.xp = 0;
    user.reincarnation = (user.reincarnation || 0) + 1;
    user.evoAttempts = 0;
    saveRPG();
    return { success: true, role: selected.name, tier: selected.tier };
}

// Logic: Evolution
export function evolveUser(jid) {
    const user = getRPGUser(jid);
    if (user.level < 6) return { success: false, msg: "Minimal level 6 untuk evolusi." };
    if (user.evoAttempts >= 5) return { success: false, msg: "Kamu sudah kehabisan kesempatan evolusi (maks 5x)." };
    
    const possibleEvos = rolesData.evos[user.role] || [];
    if (possibleEvos.length === 0) return { success: false, msg: "Role kamu saat ini tidak memiliki jalur evolusi lebih lanjut." };
    
    user.evoAttempts++;
    
    // Hitung probabilitas sukses
    const random = Math.random() * 100;
    let cumulative = 0;
    let targetEvo = null;
    
    for (const evo of possibleEvos) {
        if (random < (cumulative + evo.prob)) {
            targetEvo = evo;
            break;
        }
        cumulative += evo.prob;
    }
    
    if (targetEvo) {
        // SUKSES
        const oldRole = user.role;
        user.role = targetEvo.to;
        user.level = 1;
        user.xp = 0;
        saveRPG();
        return { success: true, oldRole, newRole: targetEvo.to, tier: targetEvo.tier };
    } else {
        // GAGAL
        user.level = 1;
        user.xp = 0;
        user.yen = (user.yen || 0) + 1.5;
        saveRPG();
        return { success: false, fail: true, msg: "Evolusi gagal! Level kamu direset, tapi kamu mendapat kompensasi 1.5¥." };
    }
}

// Update stats (misal dari pesan/command)
export function updateRPGStats(jid, pushName, { isCmd = false, isMessage = true }, context) {
    const user = getRPGUser(jid, pushName);
    if (isMessage) {
        user.messages = (user.messages || 0) + 1;
        const expGain = Math.floor(Math.random() * 5) + 1;
        user.xp = (user.xp || 0) + expGain;
        const yenGain = +(Math.random() * (0.3 - 0.05) + 0.05).toFixed(2);
        user.yen = (user.yen || 0) + yenGain;
        let tfGain = +(Math.random() * (0.1 - 0.01) + 0.01).toFixed(2);
        let newTf = (user.trustFactor || 0) + tfGain;
        if (newTf > 100) newTf = 100;
        user.trustFactor = newTf;
    }
    if (isCmd) {
        user.commands = (user.commands || 0) + 1;
        user.xp += 2;
        if (user.commands === 1) giveAchievement(jid, 1, context);
    }
    if (user.trustFactor >= 100) giveAchievement(jid, 2, context);
    if (user.yen >= 100) giveAchievement(jid, 3, context);

    let initialLevel = user.level;
    let needed = getXPNeed(user.level);
    let levelsGained = 0;
    while (user.xp >= needed) {
        user.xp -= needed;
        user.level++;
        levelsGained++;
        needed = getXPNeed(user.level);
    }
    if (levelsGained > 0) {
        saveRPG();
        return { leveled: true, oldLevel: initialLevel, newLevel: user.level, levelsGained };
    }
    saveRPG();
    return { leveled: false };
}

export function getXPNeed(level) {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

export function reduceTrustFactor(jid, amount = 0.5) {
    const user = getRPGUser(jid);
    if (!user) return;
    let newTF = (user.trustFactor || 0) - amount;
    if (newTF < 0) newTF = 0;
    user.trustFactor = newTF;
    saveRPG();
    return newTF;
}

export function addYen(jid, amount) {
    const user = getRPGUser(jid);
    user.yen += amount;
    saveRPG();
    return user.yen;
}

export function spendYen(jid, amount) {
    const user = getRPGUser(jid);
    if (user.yen < amount) return false;
    user.yen -= amount;
    saveRPG();
    return true;
}

export function findRPGUserByQuery(query) {
    const lowerQuery = String(query).toLowerCase();
    for (const jid in rpgDB.users) {
        const u = rpgDB.users[jid];
        if (String(u.userId) === lowerQuery) return u;
        if (u.vanity && u.vanity.toLowerCase() === lowerQuery) return u;
    }
    return null;
}

export function findRPGUserByJid(jid) {
    if (!jid) return null;
    const normalJid = jid.includes('@s.whatsapp.net') ? jid : jid.split('@')[0] + '@s.whatsapp.net';
    return rpgDB.users[normalJid] || null;
}

export function isVanityUsed(vanity) {
    const allUsers = Object.values(rpgDB.users);
    return allUsers.some(u => u.vanity && u.vanity.toLowerCase() === vanity.toLowerCase());
}

export function setUserName(jid, newName) {
    const user = getRPGUser(jid);
    user.name = newName;
    saveRPG();
}

export async function saveUserImagePNG({ buffer, userId, type }) {
    const folder = path.join(__dirname, '..', 'assets', 'users', type);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const filename = `${type}${userId}.png`;
    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, buffer);
    return filename;
}

export function getDefaultImage(type) {
    return `default.png`;
}
