import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../../lib/logger.js';
import { getRPGUser, saveRPG } from '../../../lib/rpg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statsPath = path.join(process.cwd(), 'database', 'wordle_stats.json');
const dictDir = __dirname;

const dictID = fs.readFileSync(path.join(dictDir, 'dictionary_id.txt'), 'utf8')
    .split('\n').filter(v => v.trim()).map(v => v.trim().toUpperCase());
const dictEN = fs.readFileSync(path.join(dictDir, 'dictionary_en.txt'), 'utf8')
    .split('\n').filter(v => v.trim()).map(v => v.trim().toUpperCase());

if (!fs.existsSync(statsPath)) fs.writeFileSync(statsPath, '{}');
let wordleStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

function saveStats() {
    fs.writeFileSync(statsPath, JSON.stringify(wordleStats, null, 2));
}

if (!global.wordleGames) global.wordleGames = {};
if (!global.wordleCooldown) global.wordleCooldown = {};

function pickWord(dict) {
    return dict[Math.floor(Math.random() * dict.length)];
}

function checkWord(guess, answer) {
    guess = guess.toUpperCase();
    answer = answer.toUpperCase();
    let result = Array(5).fill('⬛');
    let answerArr = answer.split('');
    let guessArr = guess.split('');
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === answerArr[i]) {
            result[i] = '🟩';
            answerArr[i] = null;
        }
    }
    for (let i = 0; i < 5; i++) {
        if (result[i] === '🟩') continue;
        let idx = answerArr.indexOf(guessArr[i]);
        if (idx !== -1) {
            result[i] = '🟨';
            answerArr[idx] = null;
        }
    }
    return result.join('');
}

function renderBoard(board) {
    let text = '';
    for (let i = 0; i < 6; i++) {
        if (board[i]) {
            text += `${board[i].result} → ${board[i].guess}\n`;
        } else {
            text += `⬛⬛⬛⬛⬛\n`;
        }
    }
    return text;
}

function getReward(attempt, lang) {
    const table = { 1: 8, 2: 6, 3: 4, 4: 3, 5: 2, 6: 1 };
    let yen = table[attempt] || 0;
    if (lang === 'en') yen *= 1;
    if (lang === 'id') yen /= 2;
    return { yen, exp: Math.floor(yen * 65) };
}

async function startGame(sock, m, lang, reply) {
    const user = m.sender;
    if (!m.isGroup) return reply(L('game.wordle.groupOnly'));
    if (global.wordleGames[user]) return reply(L('game.wordle.alreadyPlaying'));
    
    const cd = global.wordleCooldown[user];
    if (cd && Date.now() - cd < 300000) {
        const remaining = Math.ceil((300000 - (Date.now() - cd)) / 1000);
        return reply(L('game.wordle.cooldown', remaining));
    }
    
    global.wordleCooldown[user] = Date.now();
    const dict = lang === 'en' ? dictEN : dictID;
    const word = pickWord(dict);
    const gameId = Date.now(); // Unique ID for this game instance
    
    logger.info('WORDLE', `${sock.getName(user)} (${user.split('@')[0]}) starting game - Word: ${word}`);

    const game = {
        id: gameId,
        word, lang, tries: 0, board: [], start: Date.now(),
        group: m.chat
    };
    global.wordleGames[user] = game;
    
    await reply(L('game.wordle.start', lang.toUpperCase()));
    const boardText = renderBoard([]);
    const sent = await sock.sendMessage(user, {
        text: L('game.wordle.boardStatus', lang.toUpperCase(), 0, '05:00', boardText)
    });
    game.messageKey = sent.key;

    // Fixed Timeout with gameId check
    setTimeout(async () => {
        if (!global.wordleGames[user] || global.wordleGames[user].id !== gameId) return;
        const g = global.wordleGames[user];
        const rpgUser = getRPGUser(user);
        
        logger.warn('WORDLE', `${sock.getName(user)} (${user.split('@')[0]}) lost by timeout - Word: ${g.word}`);

        // Count as loss
        if (!wordleStats[user]) wordleStats[user] = { win: 0, play: 0, yen: 0, exp: 0, best: 6 };
        wordleStats[user].play++;
        saveStats();

        await sock.sendMessage(user, {
            text: L('game.wordle.timeout', g.word)
        });
        await sock.sendMessage(game.group, {
            text: L('game.wordle.timeoutGc', rpgUser.name, game.lang.toUpperCase())
        });
        delete global.wordleGames[user];
    }, 300000);
}

async function handleGuess(sock, m, text, reply) {
    const user = m.sender;
    const game = global.wordleGames[user];
    if (!game) return;
    if (m.chat !== user) return;

    let guess = text.trim().toUpperCase();
    if (guess.length !== 5) {
        return sock.sendMessage(user, { text: L('game.wordle.wrongLength') });
    }

    const dict = game.lang === 'en' ? dictEN : dictID;
    if (!dict.includes(guess)) {
        return sock.sendMessage(user, { text: L('game.wordle.notFound') });
    }

    game.tries++;
    const result = checkWord(guess, game.word);
    game.board.push({ guess, result });

    const remainingMs = Math.max(0, 300000 - (Date.now() - game.start));
    const timeText = `${Math.floor(remainingMs / 60000).toString().padStart(2, '0')}:${Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0')}`;
    const boardText = renderBoard(game.board);
    await sock.sendMessage(user, {
        text: L('game.wordle.boardStatus', game.lang.toUpperCase(), game.tries, timeText, boardText),
        edit: game.messageKey
    });

    if (guess === game.word) {
        const timeSpentMs = Date.now() - game.start;
        const minutes = Math.floor(timeSpentMs / 60000);
        const seconds = Math.floor((timeSpentMs % 60000) / 1000);
        const timeSpended = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const multiplier = Math.max(1, 4 - 3 * (timeSpentMs / 300000));
        const baseReward = getReward(game.tries, game.lang);
        const reward = {
            yen: baseReward.yen * multiplier,
            exp: Math.floor(baseReward.exp * multiplier)
        };

        const rpgUser = getRPGUser(user);
        rpgUser.yen = (rpgUser.yen || 0) + reward.yen;
        rpgUser.xp = (rpgUser.xp || 0) + reward.exp;
        saveRPG();

        if (!wordleStats[user]) wordleStats[user] = { win: 0, play: 0, yen: 0, exp: 0, best: 6 };
        const stats = wordleStats[user];
        stats.win++;
        stats.play++;
        stats.yen += reward.yen;
        stats.exp += reward.exp;
        if (game.tries < stats.best) stats.best = game.tries;
        saveStats();

        logger.success('WORDLE', `${sock.getName(user)} (${user.split('@')[0]}) won in ${game.tries} tries (${timeSpended}) - Word: ${game.word}`);

        await sock.sendMessage(user, {
            text: L('game.wordle.win', game.lang.toUpperCase(), game.tries, timeSpended, reward.yen.toFixed(2), reward.exp)
        });
        await sock.sendMessage(game.group, {
            text: L('game.wordle.winGc', rpgUser.name, game.lang.toUpperCase(), game.tries, timeSpended, reward.yen.toFixed(2), reward.exp)
        });
        delete global.wordleGames[user];
        return;
    }

    if (game.tries >= 6) {
        const rpgUser = getRPGUser(user);
        if (!wordleStats[user]) wordleStats[user] = { win: 0, play: 0, yen: 0, exp: 0, best: 6 };
        wordleStats[user].play++;
        saveStats();

        logger.warn('WORDLE', `${sock.getName(user)} (${user.split('@')[0]}) lost (out of tries) - Word: ${game.word}`);

        await sock.sendMessage(user, {
            text: L('game.wordle.lose', game.word)
        });
        await sock.sendMessage(game.group, {
            text: L('game.wordle.loseGc', rpgUser.name, game.lang.toUpperCase())
        });
        delete global.wordleGames[user];
        return;
    }
}

export default {
    command: 'wordle',
    category: 'minigame',
    get description() { return L('game.wordle.desc'); },
    syntax: 'wordle <subcommand>',
    subcommand: 'id, en, lb, stats, how',
    aliases: ['w'],
    async run(context) {
        const { m, reply, naze, args, sender, prefix, command } = context;
        const sub = args[0]?.toLowerCase();
        if (sub === 'how') {
            return reply(L('game.wordle.how'));
        }
        if (sub === 'id' || sub === 'en') {
            return startGame(naze, m, sub, reply);
        }
        if (sub === 'stats') {
            const user = getRPGUser(sender);
            const stats = wordleStats[sender];
            if (!stats) return reply(L('system.userNotFound'));
            const winrate = ((stats.win / stats.play) * 100).toFixed(1);
            return reply(L('game.wordle.stats', user.name, stats.play, stats.win, winrate, stats.best, stats.yen.toFixed(2), stats.exp));
        }
        if (sub === 'lb') {
            const type = args[1]?.toLowerCase() || 'global';
            if (type === 'global') {
                const sorted = Object.entries(wordleStats)
                    .sort((a, b) => b[1].win - a[1].win)
                    .slice(0, 10);
                let text = '*# Global Wordle Leaderboard*\n\n';
                for (let i = 0; i < sorted.length; i++) {
                    const [jid, stat] = sorted[i];
                    const user = getRPGUser(jid);
                    text += `${i+1}. ${user.name} - ${stat.win} wins\n`;
                }
                return reply(text);
            } else if (type === 'group' && m.isGroup) {
                const groupMembers = new Set();
                if (m.metadata && m.metadata.participants) {
                    m.metadata.participants.forEach(p => groupMembers.add(p.id));
                }
                const sorted = Object.entries(wordleStats)
                    .filter(([jid]) => groupMembers.has(jid))
                    .sort((a, b) => b[1].win - a[1].win)
                    .slice(0, 10);
                let text = '*# Group Wordle Leaderboard*\n\n';
                for (let i = 0; i < sorted.length; i++) {
                    const [jid, stat] = sorted[i];
                    const user = getRPGUser(jid);
                    text += `${i+1}. ${user.name} - ${stat.win} wins\n`;
                }
                return reply(text);
            } else {
                return reply(L('system.usage', prefix, command));
            }
        }
        return reply(L('system.usage', prefix, command));
    },
    async onMessage(context) {
        const { m, naze, text, sender, command, reply } = context;
        if (!global.wordleGames[m.sender]) return;
        
        // Integrasi .cancel
        if (command === 'cancel' || text.toLowerCase() === 'cancel') {
            // Count as loss
            if (!wordleStats[sender]) wordleStats[sender] = { win: 0, play: 0, yen: 0, exp: 0, best: 6 };
            wordleStats[sender].play++;
            saveStats();

            logger.info('WORDLE', `${naze.getName(sender)} (${sender.split('@')[0]}) canceled session`);

            delete global.wordleGames[sender];
            return reply(L('game.wordle.canceled'));
        }

        if (text && text.length === 5) {
            await handleGuess(naze, m, text, reply);
        }
    }
};