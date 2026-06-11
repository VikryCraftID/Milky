import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRPGUser, saveRPG, findRPGUserByQuery } from '../../lib/rpg.js';
import { renderGTCard, renderGTInventory } from '../../lib/design.js';
import { syncGTDatabase } from '../../lib/gtUpdate.js';
import logger from '../../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gtListPath = path.join(process.cwd(), 'database', 'gt-list.json');

let gtList = [];
try {
    gtList = JSON.parse(fs.readFileSync(gtListPath, 'utf-8'));
} catch (e) {
    logger.error('GACHA', 'Gagal load gt-list.json: ' + e.message);
}

const RATES = { 1: 0.72, 2: 0.25, 3: 0.03 };
const SELL_PRICE = { 1: 7.5, 2: 10, 3: 16.5, 4: 25, 5: 40 };
const PITY_MAX = 200;
const PULL_COST = 12;

function pickCardByStars(stars) {
    const pool = gtList.filter(c => c.stars === stars);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function rollStars() {
    const r = Math.random();
    if (r < RATES[1]) return 1;
    if (r < RATES[1] + RATES[2]) return 2;
    return 3;
}

async function pullOnce(user) {
    let star = rollStars();
    let card = pickCardByStars(star);
    if (!card) card = pickCardByStars(3);
    user.gtPity = (user.gtPity || 0) + 1;
    user.gacha = (user.gacha || 0) + 1;
    let isPity = false;
    if (user.gtPity >= PITY_MAX) {
        card = pickCardByStars(3);
        user.gtPity = 0;
        isPity = true;
    }
    user.gtInv.push({ id: card.id, stars: card.stars });
    saveRPG();
    const fullCard = gtList.find(c => c.id === card.id);
    return { card: { ...fullCard, stars: card.stars }, isPity };
}

function getCardInfo(id, stars, isAscent, isMyth) {
    const base = gtList.find(c => c.id === id);
    if (!base) return null;
    let tier = base.tier;
    if (isAscent) tier = 'ascent';
    if (isMyth || stars === 6) tier = 'myth';
    return { ...base, stars, tier, isAscent, isMyth };
}

export default {
    command: 'gt',
    category: 'gacha',
    get description() { return L('plugins.gt.desc'); },
    syntax: 'gt <subcommand>',
    subcommand: 'pull, bulk, inv, sell, pity, rate, evolve, show, give, update',
    aliases: ['guardiantales', 'gtales'],
    async run(context) {
        const { m, naze, reply, args, sender, pushName, prefix, command, isCreator } = context;
        const user = getRPGUser(sender, pushName);
        const sub = args[0]?.toLowerCase();

        if (!gtList.length) return reply(L('plugins.gt.error'));

        if (sub === 'update') {
            if (!isCreator) return reply(global.mess.owner);
            await m.react('⏳');
            try {
                const result = await syncGTDatabase(async (msg) => {
                    // Log progres ke chat jika perlu, tapi console cukup untuk saat ini
                    logger.info('GACHA', `[GT Update] ${msg}`);
                });
                
                // Reload local list
                gtList = JSON.parse(fs.readFileSync(gtListPath, 'utf8'));
                
                if (result.added > 0) {
                    await reply(`✅ Sinkronisasi berhasil! Ditemukan dan ditambahkan *${result.added}* hero baru ke database.`);
                } else {
                    await reply(`✅ Database sudah mutakhir. Tidak ada hero baru.`);
                }
                await m.react('✅');
            } catch (err) {
                logger.error('GACHA', 'GT Update Error: ' + err.message);
                await reply(`❌ Gagal melakukan sinkronisasi: ${err.message}`);
                await m.react('❌');
            }
            return;
        }

        if (sub === 'pull') {
            if (user.yen < PULL_COST) return reply(L('plugins.gt.noYen', PULL_COST));
            user.yen -= PULL_COST;
            const { card, isPity } = await pullOnce(user);
            
            try {
                const buffer = await renderGTCard(card, user);
                await naze.sendMessage(m.chat, {
                    image: buffer,
                    mentions: [sender]
                }, { quoted: m });
            } catch (err) {
                logger.error('GACHA', 'GT Render Error: ' + err.message);
                const winText = L('plugins.gt.win');
                if (winText && winText !== 'plugins.gt.win') await reply(winText);
            }
            return;
        }
        
        if (sub === 'show') {
            const displayIdInput = (args[1] || '').toUpperCase();
            if (!displayIdInput) return reply(L('plugins.gt.commands'));
            
            const inv = user.gtInv || [];
            const targetBaseCard = gtList.find(c => c.displayId === displayIdInput);
            if (!targetBaseCard) return reply(L('plugins.gt.notFound'));
            
            const cardId = targetBaseCard.id;
            const ownedCards = inv.filter(item => item.id === cardId);
            if (ownedCards.length === 0) return reply(L('plugins.gt.invalidIdx'));
            
            const highestStarCard = ownedCards.reduce((prev, current) => {
                const prevVal = (prev.stars * 100) + (prev.isMyth ? 10 : 0) + (prev.isAscent ? 1 : 0);
                const currVal = (current.stars * 100) + (current.isMyth ? 10 : 0) + (current.isAscent ? 1 : 0);
                return (currVal > prevVal) ? current : prev;
            });
            const card = getCardInfo(highestStarCard.id, highestStarCard.stars, highestStarCard.isAscent, highestStarCard.isMyth);

            try {
                const buffer = await renderGTCard(card, user);
                await naze.sendMessage(m.chat, {
                    image: buffer,
                    mentions: [sender]
                }, { quoted: m });
            } catch (err) {
                logger.error('GACHA', 'GT Show Render Error: ' + err.message);
                await reply(`🎴 *${card.name}* (${card.stars}★ ${card.tier})`);
            }
            return;
        }
        
        if (sub === 'bulk') {
            let jumlah = parseInt(args[1]);
            if (isNaN(jumlah) || jumlah < 1) return reply(L('plugins.gt.commands'));
            if (jumlah > 10) jumlah = 10;
            
            const totalCost = jumlah * PULL_COST;
            if (user.yen < totalCost) return reply(L('plugins.gt.noYen', totalCost));
            user.yen -= totalCost;
            
            let pulledCards = [];
            user.gacha = (user.gacha || 0) + jumlah;

            for (let i = 0; i < jumlah; i++) {
                let star = rollStars();
                let card = pickCardByStars(star);
                if (!card) card = pickCardByStars(3);
                user.gtPity = (user.gtPity || 0) + 1;
                if (user.gtPity >= PITY_MAX) {
                    card = pickCardByStars(3);
                    user.gtPity = 0;
                }
                user.gtInv.push({ id: card.id, stars: card.stars });
                const fullCard = gtList.find(c => c.id === card.id);
                pulledCards.push({ ...fullCard, stars: card.stars });
            }
            saveRPG();
            
            // Sort: Terrendah ke Terlangka (1★ -> 3★, ID Besar -> Kecil)
            pulledCards.sort((a, b) => {
                if (a.stars !== b.stars) return a.stars - b.stars;
                return b.id - a.id;
            });

            // Fungsi pembentuk teks rincian ekonomi dan list
            const getBulkMessage = (visibleCount) => {
                const listText = pulledCards.map((c, idx) => {
                    if (idx < visibleCount) {
                        return `- #${c.displayId || c.id} - ${c.name} (${c.stars}★)`;
                    } else {
                        return `- #? - ??? (?★)`;
                    }
                }).join('\n');

                let currentPriceTotal = 0;
                for (let i = 0; i < visibleCount; i++) {
                    currentPriceTotal += (SELL_PRICE[pulledCards[i].stars] || 0);
                }

                const isDone = visibleCount === jumlah;
                let profitDisplay = L('plugins.gt.calculating');
                
                if (isDone) {
                    const profitValue = currentPriceTotal - totalCost;
                    profitDisplay = (profitValue >= 0 ? '+' : '') + profitValue.toFixed(2) + '¥';
                }

                return L('plugins.gt.winBulk', listText, totalCost, currentPriceTotal.toFixed(2), profitDisplay);
            };

            const sent = await naze.sendMessage(m.chat, {
                text: getBulkMessage(0)
            }, { quoted: m });
            
            for (let i = 1; i <= jumlah; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await naze.sendMessage(m.chat, {
                    text: getBulkMessage(i),
                    edit: sent.key
                });
            }
            return;
        }

        if (sub === 'inv') {
            let inv = user.gtInv || [];
            const useText = args.includes('--text');
            
            inv.sort((a, b) => {
                if (b.stars !== a.stars) return b.stars - a.stars;
                return a.id - b.id;
            });
            user.gtInv = inv;
            saveRPG();

            const perPage = 10;
            const totalPages = Math.ceil(inv.length / perPage) || 1;
            let page = parseInt(args[1]) || 1;
            if (page > totalPages) page = totalPages;
            if (page < 1) page = 1;

            const start = (page - 1) * perPage;
            const slice = inv.slice(start, start + perPage);

            // Hitung Total Worth Seluruh Koleksi
            const totalWorth = inv.reduce((total, item) => total + (SELL_PRICE[item.stars] || 0), 0);

            // Tampilkan Canvas secara default (kecuali dipaksa teks)
            if (!useText) {
                try {
                    const buffer = await renderGTInventory(user, slice, page, totalPages, getCardInfo, totalWorth);
                    await naze.sendMessage(m.chat, {
                        image: buffer,
                        mentions: [sender]
                    }, { quoted: m });
                    return;
                } catch (err) {
                    logger.error('GACHA', 'GT Inventory Render Error: ' + err.message);
                }
            }
            
            // Text Fallback (jika render gagal atau diminta)
            let header = L('plugins.gt.invTitle', user.name || 'User', page, totalPages);
            let list = '';
            
            for (let i = 0; i < slice.length; i++) {
                const item = slice[i];
                const info = getCardInfo(item.id, item.stars, item.isAscent, item.isMyth);
                if (info) {
                    const disp = info.displayId || info.id;
                    const tierLabel = info.tier.toUpperCase();
                    list += `- #${disp} - ${info.name} (${info.stars}★ ${tierLabel})\n`;
                } else {
                    list += `- #? ID ${item.id} (tidak dikenal)\n`;
                }
            }
            
            let footer = L('plugins.gt.invTotal', inv.length, user.gtPity || 0, PITY_MAX);
            await reply(`${header}\n\n${list || '- No cards -\n'}${footer}`);
            return;
        }

        if (sub === 'sell') {
            const inputString = args.slice(1).join(' ');
            if (!inputString) return reply(L('plugins.gt.commands'));
            
            const tokens = inputString.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
            if (tokens.length === 0) return reply(L('plugins.gt.commands'));

            let totalYen = 0;
            let soldItems = [];
            let inv = [...user.gtInv];
            let itemsToRemoveIndices = new Set();

            for (const token of tokens) {
                const starMatch = token.match(/^(\d+)STAR$/i);
                if (starMatch) {
                    const starsToSell = parseInt(starMatch[1]);
                    for (let i = 0; i < inv.length; i++) {
                        if (inv[i].stars === starsToSell && !itemsToRemoveIndices.has(i)) {
                            const item = inv[i];
                            const base = gtList.find(c => c.id === item.id);
                            if (base) {
                                const price = SELL_PRICE[item.stars] || 0;
                                totalYen += price;
                                soldItems.push({ id: base.displayId || base.id, name: base.name, stars: item.stars, price: price });
                                itemsToRemoveIndices.add(i);
                            }
                        }
                    }
                } else {
                    const base = gtList.find(c => c.displayId === token || String(c.id) === token);
                    if (!base) return reply(L('plugins.gt.notFound'));

                    const invIdx = inv.findIndex((item, index) => item.id === base.id && !itemsToRemoveIndices.has(index));
                    if (invIdx === -1) return reply(L('plugins.gt.invalidIdx'));

                    const item = inv[invIdx];
                    const price = SELL_PRICE[item.stars] || 0;
                    totalYen += price;
                    soldItems.push({ id: base.displayId || base.id, name: base.name, stars: item.stars, price: price });
                    itemsToRemoveIndices.add(invIdx);
                }
            }

            if (itemsToRemoveIndices.size === 0) return reply(L('plugins.gt.invalidIdx'));

            user.gtInv = inv.filter((_, index) => !itemsToRemoveIndices.has(index));
            user.yen += totalYen;
            saveRPG();

            if (itemsToRemoveIndices.size === 1) {
                const item = soldItems[0];
                return reply(L('plugins.gt.sellSuccess', user.name || 'User', item.id, item.name, item.stars, item.price.toFixed(2)));
            } else {
                return reply(L('plugins.gt.sellSuccessBulk', user.name || 'User', itemsToRemoveIndices.size, totalYen.toFixed(2)));
            }
        }

        if (sub === 'give') {
            if (!isCreator) return reply(global.mess.owner);
            if (args.length < 3) return reply(L('system.usage', prefix, command));
            
            const gachaType = args[1].toLowerCase();
            const idInput = args[2].toUpperCase();
            
            if (gachaType !== 'gt') return reply("Tipe gacha tidak valid. Gunakan 'gt'.");

            const card = gtList.find(c => c.displayId === idInput || String(c.id) === idInput);
            if (!card) return reply(L('plugins.gt.notFound'));

            let targetUser;
            const targetQuery = args[3];
            if (targetQuery) {
                targetUser = findRPGUserByQuery(targetQuery);
                if (!targetUser) return reply(L('rpg.cheat.userNotFound'));
            } else if (m.quoted && m.quoted.sender) {
                targetUser = getRPGUser(m.quoted.sender);
            } else {
                targetUser = findRPGUserByQuery("1") || getRPGUser(sender, pushName);
            }

            if (!targetUser.gtInv) targetUser.gtInv = [];
            targetUser.gtInv.push({ id: card.id, stars: card.stars });
            saveRPG();

            return reply(L('rpg.cheat.give', card.name, card.stars, targetUser.name, targetUser.userId));
        }

        if (sub === 'pity') {
            await reply(L('plugins.gt.pityTitle', user.gtPity || 0, PITY_MAX));
            return;
        }

        if (sub === 'rate') {
            const rate3 = (RATES[3] * 100).toFixed(1);
            const rate2 = (RATES[2] * 100).toFixed(1);
            const rate1 = (RATES[1] * 100).toFixed(1);
            await reply(L('plugins.gt.rateTitle', rate3, rate2, rate1));
            return;
        }

        if (sub === 'evolve') {
            const displayIdInput = (args[1] || '').toUpperCase();
            if (!displayIdInput) return reply(L('plugins.gt.commands'));
            
            const inv = user.gtInv || [];
            const baseTarget = gtList.find(c => c.displayId === displayIdInput);
            if (!baseTarget) return reply(L('plugins.gt.notFound'));

            // 1. Hitung jumlah kartu per tingkat bintang (termasuk status isAscent/isMyth)
            const counts = {}; // stars_asc_myth -> array of items
            inv.filter(item => item.id === baseTarget.id).forEach(item => {
                const key = `${item.stars}_${item.isAscent ? '1' : '0'}_${item.isMyth ? '1' : '0'}`;
                if (!counts[key]) counts[key] = [];
                counts[key].push(item);
            });

            // 2. Cari tingkat bintang yang punya >= 3 kartu dan bisa di-evolve
            const keys = Object.keys(counts).sort((a, b) => {
                const [sA, aA, mA] = a.split('_').map(Number);
                const [sB, aB, mB] = b.split('_').map(Number);
                const valA = (sA * 100) + (mA * 10) + aA;
                const valB = (sB * 100) + (mB * 10) + aB;
                return valB - valA; // Prioritas tertinggi
            });

            let targetKey = null;
            for (const key of keys) {
                if (counts[key].length >= 3) {
                    const [s, asc, myth] = key.split('_').map(Number);
                    const isAscent = !!asc;
                    const isMyth = !!myth;
                    
                    // Batasan Evolusi
                    let canEvo = true;
                    if (isAscent || isMyth) canEvo = false;
                    else if (s >= 6) canEvo = false; 
                    else if (baseTarget.tier === 'normal' && s >= 3) canEvo = false;
                    else if (baseTarget.tier === 'rare' && s >= 5 && !baseTarget.canAscended) canEvo = false;
                    else if (baseTarget.tier === 'unique' && s >= 5 && !baseTarget.hasMythVariant) canEvo = false;
                    else if (baseTarget.tier === 'collab' && s >= 5) canEvo = false;

                    if (canEvo) {
                        targetKey = key;
                        break;
                    }
                }
            }

            if (!targetKey) return reply(L('plugins.gt.evolveReq'));
            
            const [currentStars, currentIsAscent, currentIsMyth] = targetKey.split('_').map(Number);
            
            // 3. Proses Evolusi
            let removed = 0;
            for (let i = inv.length - 1; i >= 0; i--) {
                const item = inv[i];
                if (item.id === baseTarget.id && 
                    item.stars === currentStars && 
                    !!item.isAscent === !!currentIsAscent && 
                    !!item.isMyth === !!currentIsMyth && 
                    removed < 3) {
                    inv.splice(i, 1);
                    removed++;
                }
            }

            let newStars = currentStars + 1;
            let newIsAscent = false;
            let newIsMyth = false;

            if (baseTarget.tier === 'rare' && currentStars === 5 && baseTarget.canAscended) {
                newStars = 5; 
                newIsAscent = true;
            } else if (baseTarget.tier === 'unique' && currentStars === 5 && baseTarget.hasMythVariant) {
                newStars = 6;
                newIsMyth = true;
            }

            inv.push({ id: baseTarget.id, stars: newStars, isAscent: newIsAscent, isMyth: newIsMyth });
            user.gtInv = inv;
            saveRPG();

            const oldInfo = getCardInfo(baseTarget.id, currentStars, !!currentIsAscent, !!currentIsMyth);
            const newInfo = getCardInfo(baseTarget.id, newStars, newIsAscent, newIsMyth);

            await reply(L('plugins.gt.evolveSuccess', oldInfo.name, oldInfo.stars, newInfo.name, newInfo.stars));
            return;
        }

        return reply(L('plugins.gt.commands'));
    }
};