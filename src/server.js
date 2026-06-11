import express from 'express';
import { createServer } from 'http';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const require = createRequire(import.meta.url);
const packageInfo = require('../package.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Wordle Data & Logic
const wordlePath = path.join(process.cwd(), 'plugins/games/wordle');
const dictID = fs.existsSync(path.join(wordlePath, 'dictionary_id.txt')) 
    ? fs.readFileSync(path.join(wordlePath, 'dictionary_id.txt'), 'utf8').split('\n').filter(v => v.trim()).map(v => v.trim().toUpperCase())
    : [];
const dictEN = fs.existsSync(path.join(wordlePath, 'dictionary_en.txt'))
    ? fs.readFileSync(path.join(wordlePath, 'dictionary_en.txt'), 'utf8').split('\n').filter(v => v.trim()).map(v => v.trim().toUpperCase())
    : [];

const activeGames = new Map(); // key: sessionId, value: { word, tries, board }

app.post('/api/wordle/start', (req, res) => {
    const { lang = 'id' } = req.body;
    const dict = lang === 'en' ? dictEN : dictID;
    if (dict.length === 0) return res.status(500).json({ error: 'Dictionary not found' });
    
    const word = dict[Math.floor(Math.random() * dict.length)];
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    activeGames.set(sessionId, { word, tries: 0, lang });
    res.json({ sessionId, status: 'started' });
});

app.post('/api/wordle/guess', (req, res) => {
    const { sessionId, guess } = req.body;
    const game = activeGames.get(sessionId);
    
    if (!game) return res.status(404).json({ error: 'Game session not found' });
    if (!guess || guess.length !== 5) return res.status(400).json({ error: 'Invalid guess length' });
    
    const input = guess.toUpperCase();
    const dict = game.lang === 'en' ? dictEN : dictID;
    if (!dict.includes(input)) return res.json({ status: 'error', message: 'Word not in dictionary' });

    game.tries++;
    const answer = game.word;
    const result = Array(5).fill('absent'); // absent, present, correct
    let answerArr = answer.split('');
    let guessArr = input.split('');

    // First pass: Correct positions
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === answerArr[i]) {
            result[i] = 'correct';
            answerArr[i] = null;
        }
    }

    // Second pass: Present but wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] === 'correct') continue;
        const idx = answerArr.indexOf(guessArr[i]);
        if (idx !== -1) {
            result[i] = 'present';
            answerArr[idx] = null;
        }
    }

    const won = input === answer;
    const lost = game.tries >= 6 && !won;

    if (won || lost) activeGames.delete(sessionId);

    res.json({
        result,
        won,
        lost,
        answer: (won || lost) ? answer : null,
        tries: game.tries
    });
});

app.all('/', (req, res) => {
	if (process.send) {
		process.send('uptime');
		process.once('message', (uptime) => {
			res.json({
				bot_name: packageInfo.name,
				version: packageInfo.version,
				author: packageInfo.author,
				description: packageInfo.description,
				uptime: `${Math.floor(uptime)} seconds`
			});
		});
	} else res.json({ error: 'Process not running with IPC' });
});

app.all('/process', (req, res) => {
	const { send } = req.query;
	if (!send) return res.status(400).json({ error: 'Missing send query' });
	if (process.send) {
		process.send(send)
		res.json({ status: 'Send', data: send });
	} else res.json({ error: 'Process not running with IPC' });
});

app.all('/chat', (req, res) => {
	const { message, to } = req.query;
	if (!message || !to) return res.status(400).json({ error: 'Missing message or to query' });
	res.json({ status: 200, mess: 'does not start' })
});

export { app, server, PORT };