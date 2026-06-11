import { getRPGUser, saveRPG } from './rpg.js';

const spamMap = new Map();

export function handleTrust({ body, m, isCmd }) {
    if (!m || !m.sender) return null;
    
/*
    const ownerList = global.owner || [];
    const isOwner = ownerList.some(owner => {
        const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net';
        return ownerJid === m.sender;
    });
    if (isOwner) return null;
*/

    const jid = m.sender;
    const now = Date.now();
    let rec = spamMap.get(jid);
    const windowMs = 5000;

    if (!rec || (now - rec.start) > windowMs) {
        rec = { start: now, count: 1, isCmd: isCmd };
    } else {
        rec.count++;
    }
    spamMap.set(jid, rec);

    const limitMsg = 5;
    const limitCmd = 5;
    let punish = 0;
    let reason = '';

    if (isCmd && rec.count > limitCmd && rec.count === limitCmd + 1) {
        punish = 0.8;
        reason = '⚠️ Spam command! Trust Factor -0.3%';
    } else if (!isCmd && rec.count > limitMsg && rec.count === limitMsg + 1) {
        punish = 1.4;
        reason = '⚠️ Spam pesan! Trust Factor -0.6%';
    }

    if (punish > 0) {
        const user = getRPGUser(jid);
        let tf = user.trustFactor || 0;
        tf = Math.max(0, tf - punish);
        user.trustFactor = tf;
        saveRPG();
        return { punish: true, reason };
    }

    // Toxic detection
    let messageText = body || '';
    if (!messageText && m.text) messageText = m.text;
    if (!messageText && m.body) messageText = m.body;
    const lowerText = messageText.toLowerCase();
    
    const toxicWords = [
"ajig", "alay", "ancok", "ancuk", "anjing", "anjg", "anjir", "anjrit", "anjrot", "anying", "asu", "asyu", "babangus", "babi", "bacol", "bacot", "bagong", "bajingan", "balegug", "banci", "bangke", "bangsat", "bedebah", "bedegong", "bego", "belegug", "beloon", "bencong", "bengek", "benges", "bgsd", "bgst", "bispak", "blo'on", "bloon", "bocah", "bodat", "bodoh", "bokin", "boloho", "bolot", "borjong", "budek", "buduk", "budug", "bulug", "buntal", "buriq", "buta", "buyan", "cacat", "cepu", "celeng", "cibai", "cibay", "cibrit", "cilaka", "cino", "cocot", "cocote", "cok", "cokil", "colai", "colay", "coli", "colmek", "conge", "congean", "congek", "congor", "crot", "cuk", "cukima", "cukimai", "cukimay", "cupu", "curut", "dancok", "demit", "dlogok", "entot", "entotan", "epep", "ewe", "ewean", "feeder", "gebleg", "gelo", "gembrot", "genjik", "germo", "gigolo", "goblo", "goblog", "goblok", "hencet", "henceut", "heunceut", "homo", "idiot", "item", "itil", "jablay", "jalang", "jambret", "jancok", "jancuk", "jembret", "jembut", "jiancok", "jidor", "jilmek", "jurig", "kabulamma", "kacrut", "kacung", "kampang", "kampret", "kampungan", "kehed", "kemplu", "kenthu", "kentu", "kentot", "keparat", "kimak", "kintil", "kirik", "kntl", "kocak", "konti", "kontil", "kontol", "kopet", "koplok", "koreng", "kuntul", "kunyuk", "kurap", "kureng", "lapet", "lebok", "lonte", "maho", "matane", "meki", "memble", "memek", "mewek", "monyet", "mukil", "ndeso", "ndas", "ndasmu", "ngaceng", "ngehe", "ngentd", "ngentot", "nggateli", "ngewe", "ngocok", "noob", "nyepong", "panlok", "pante", "pantek", "patek", "pathek", "pecun", "pecundang", "peju", "pejuh", "pelacur", "pelakor", "peler", "pepek", "pesek", "puki", "pukima", "pukimae", "pukimak", "pukimay", "riyad", "sampah", "sange", "sepong", "sial", "sialan", "silit", "sinting", "sontoloyo", "suhu", "sundala", "tai", "taik", "tbl", "tempek", "tempik", "tete", "tetek", "tiembokne", "titit", "toket", "tolir", "tolol", "ublag", "udik", "wingkeng"
    ];
    
    if (toxicWords.some(word => lowerText.includes(word))) {
        const user = getRPGUser(jid);
        let tf = user.trustFactor || 0;
        tf = Math.max(0, tf - 0.8);
        user.trustFactor = tf;
        saveRPG();
        return { punish: true, reason: '🤬 Kata toxic terdeteksi! Trust Factor -0.5%' };
    }

    return null;
}