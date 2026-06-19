const board = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const langSelect = document.getElementById('lang-select');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalStats = document.getElementById('modal-stats');
const modalStartBtn = document.getElementById('modal-start-btn');
const modalClose = document.getElementById('modal-close');
const messageContainer = document.getElementById('message-container');

// API Configuration
const API_BASE = '';

let sessionId = null;
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let currentLang = 'id';
let gameStartTime = null;
let timerInterval = null;

// Translations
const dictUI = {
    id: {
        played: "Dimainkan",
        winrate: "Tingkat Kemenangan",
        best: "Terbaik",
        winPct: "Menang %",
        startBtn: "Mulai!",
        closeBtn: "Tutup",
        startTitle: "Mulai Permainan?",
        startMsg: "Kamu punya waktu 5 menit untuk menebak kata.",
        errorTitle: "AKSES DITOLAK",
        errorMsg: "Mulai permainan di WhatsApp terlebih dahulu dengan mengetik <code>.wordle id</code> atau <code>.wordle en</code>",
        expTitle: "SESI BERAKHIR",
        expMsg: "Sesi permainan ini sudah tidak aktif.",
        winTitle: "KEMENANGAN",
        winMsg: "Luar biasa! Kamu berhasil menebaknya.",
        loseTitle: "GAME OVER",
        loseMsg: "Katanya adalah ",
        connErr: "Gagal terhubung ke Milky Bot"
    },
    en: {
        played: "Played",
        winrate: "Win Rate",
        best: "Best",
        winPct: "Win %",
        startBtn: "Start!",
        closeBtn: "Close",
        startTitle: "Start Game?",
        startMsg: "You have 5 minutes to guess the word.",
        errorTitle: "ACCESS DENIED",
        errorMsg: "Please start a game on WhatsApp first by typing <code>.wordle id</code> or <code>.wordle en</code>",
        expTitle: "SESSION EXPIRED",
        expMsg: "This game session is no longer active.",
        winTitle: "VICTORY",
        winMsg: "Magnificent! You guessed it.",
        loseTitle: "GAME OVER",
        loseMsg: "The word was ",
        connErr: "Failed to connect to Milky Bot"
    }
};

function applyTranslations(lang) {
    const t = dictUI[lang] || dictUI['id'];
    document.getElementById('lbl-header-played').textContent = t.played;
    document.getElementById('lbl-header-rate').textContent = t.winrate;
    document.getElementById('lbl-header-best').textContent = t.best;
    document.getElementById('lbl-stat-played').textContent = t.played;
    document.getElementById('lbl-stat-wins').textContent = t.winPct;
    modalStartBtn.textContent = t.startBtn;
    modalClose.textContent = t.closeBtn;
}

// Audio System
const sfx = {
    typing: new Audio(`${API_BASE}/assets/sound/wordle_typing.mp3`),
    yes: new Audio(`${API_BASE}/assets/sound/wordle_yes.mp3`),
    no: new Audio(`${API_BASE}/assets/sound/wordle_no.mp3`),
    win: new Audio(`${API_BASE}/assets/sound/wordle_win.ogg`),
    lose: new Audio(`${API_BASE}/assets/sound/wordle_lose.ogg`)
};

function playSFX(name) {
    if (sfx[name]) {
        sfx[name].volume = 0.5;
        sfx[name].currentTime = 0;
        sfx[name].play().catch(() => {});
    }
}

const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

// 1. URL Parameter Extraction
function parseUrlParams() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    if (parts.length >= 2) {
        const uuid = parts[parts.length - 1];
        const lang = parts[parts.length - 2];
        if (['id', 'en'].includes(lang)) {
            return { lang, uuid };
        }
    }
    return null;
}

// Initialize Board
function initBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

// Initialize Keyboard
function initKeyboard() {
    keyboard.innerHTML = '';
    keys.forEach(rowKeys => {
        const row = document.createElement('div');
        row.className = 'kb-row';
        rowKeys.forEach(key => {
            const button = document.createElement('button');
            button.textContent = key === 'DELETE' ? 'DEL' : key;
            button.className = 'key';
            if (key === 'ENTER' || key === 'DELETE') button.classList.add('large');
            button.id = `key-${key}`;
            button.onclick = () => handleInput(key);
            row.appendChild(button);
        });
        keyboard.appendChild(row);
    });
}

// Handle Start Button
modalStartBtn.onclick = async () => {
    try {
        const response = await fetch(`${API_BASE}/api/wordle/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: sessionId })
        });
        const data = await response.json();
        if (data.success || data.error === 'Game already started') {
            modalOverlay.classList.add('hidden');
            gameOver = false;
            startTimer(300000); // 5 minutes start timer
            gameStartTime = Date.now();
        } else {
            showMessage(dictUI[currentLang].connErr);
        }
    } catch (e) {
        showMessage(dictUI[currentLang].connErr);
    }
};

function showStartModal() {
    modalTitle.textContent = dictUI[currentLang].startTitle;
    modalTitle.style.color = "var(--accent-purple)";
    modalMessage.innerHTML = dictUI[currentLang].startMsg;
    modalStats.classList.add('hidden');
    modalStartBtn.classList.remove('hidden');
    modalClose.style.display = 'none';
    modalOverlay.classList.remove('hidden');
}

function showResultModal(title, msg, won, stats) {
    modalTitle.textContent = title;
    modalTitle.style.color = won ? 'var(--correct)' : 'var(--accent-purple)';
    modalMessage.innerHTML = msg;
    
    if (stats) {
        document.getElementById('stat-played').textContent = stats.played;
        document.getElementById('stat-wins').textContent = `${stats.winRate}%`;
        
        // Update header stats for consistency
        document.getElementById('header-played').textContent = stats.played;
        document.getElementById('header-rate').textContent = `${stats.winRate}%`;
        document.getElementById('header-best').textContent = stats.best;
        
        modalStats.classList.remove('hidden');
    } else {
        modalStats.classList.add('hidden');
    }
    
    modalStartBtn.classList.add('hidden');
    modalOverlay.classList.remove('hidden');
    modalClose.style.display = 'inline-block';
}

// Load Session State from Bot
async function loadSession() {
    const params = parseUrlParams();
    if (!params) {
        applyTranslations('id');
        showLockedScreen(dictUI['id'].errorTitle, dictUI['id'].errorMsg);
        return;
    }

    sessionId = params.uuid;

    try {
        const response = await fetch(`${API_BASE}/api/wordle/state?uuid=${sessionId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'cf-tunnel-no-cookie': '1'
            }
        });
        const data = await response.json();

        if (response.status !== 200) {
            applyTranslations(params.lang);
            showLockedScreen(dictUI[params.lang].expTitle, data.error || dictUI[params.lang].expMsg);
            return;
        }

        // Language is from API
        currentLang = data.lang || params.lang;
        langSelect.value = currentLang;
        applyTranslations(currentLang);
        
        langSelect.addEventListener('change', (e) => {
            const newLang = e.target.value;
            window.location.href = `/wordle/${newLang}/${sessionId}`;
        });

        // Populate Profile Bar
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-name').textContent = data.user.name;
        document.getElementById('user-id').textContent = `#${data.user.jid}`;
        
        const avatarImg = document.getElementById('user-avatar');
        avatarImg.src = data.user.pp.startsWith('http') ? data.user.pp : `${API_BASE}${data.user.pp}`;
        
        document.getElementById('header-played').textContent = data.stats.played;
        document.getElementById('header-rate').textContent = `${data.stats.winRate}%`;
        document.getElementById('header-best').textContent = data.stats.best;

        initBoard();
        initKeyboard();
        
        data.board.forEach((item, idx) => {
            currentRow = idx;
            currentGuess = item.guess;
            updateBoard();
            
            const resultStatus = Array.from(item.result).map(emoji => {
                if (emoji === '🟩') return 'correct';
                if (emoji === '🟨') return 'present';
                return 'absent';
            });
            
            revealTiles(resultStatus, true);
        });

        currentRow = data.tries;
        currentGuess = '';

        if (data.status === 'waiting') {
            gameOver = true;
            showStartModal();
        } else {
            // Start Timer (if playing)
            startTimer(data.remainingTime);
            gameStartTime = Date.now() - (300000 - data.remainingTime);
            
            if (currentRow >= 6) {
                gameOver = true;
                stopTimer();
            }
        }

    } catch (err) {
        console.error(err);
        applyTranslations('id');
        showMessage(dictUI['id'].connErr);
    }
}

function startTimer(remainingMs) {
    clearInterval(timerInterval);
    const display = document.getElementById('timer-display');
    
    function update() {
        if (remainingMs <= 0) {
            clearInterval(timerInterval);
            display.textContent = "00:00";
            return;
        }
        
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        remainingMs -= 1000;
    }
    
    update();
    timerInterval = setInterval(update, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function showLockedScreen(title, msg) {
    initBoard();
    initKeyboard();
    gameOver = true;
    modalTitle.textContent = title;
    modalTitle.style.color = "var(--accent-purple)";
    modalMessage.innerHTML = msg;
    modalOverlay.classList.remove('hidden');
    modalClose.style.display = 'none';
}

// Handle Inputs
function handleInput(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'DELETE' || key === 'BACKSPACE') {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
            playSFX('typing');
        }
    } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
            currentGuess += key;
            updateBoard();
            playSFX('typing');
            const tile = document.getElementById(`tile-${currentRow}-${currentGuess.length - 1}`);
            tile.classList.add( 'pop');
            setTimeout(() => tile.classList.remove('pop'), 100);
        }
    }
}

function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = currentGuess[i] || '';
    }
}

async function submitGuess() {
    if (currentGuess.length !== 5) {
        shakeRow();
        showMessage('Not enough letters');
        playSFX('no');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/wordle/guess`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'cf-tunnel-no-cookie': '1'
            },
            body: JSON.stringify({ uuid: sessionId, guess: currentGuess })
        });
        const data = await response.json();

        if (data.status === 'error') {
            shakeRow();
            showMessage(data.message);
            playSFX('no');
            return;
        }

        revealTiles(data.result);

        if (data.won) {
            gameOver = true;
            stopTimer();
            const timeSpent = calculateTimeSpent();
            
            showGameSummary(`${dictUI[currentLang].winTitle}`);
            
            setTimeout(() => {
                showResultModal(dictUI[currentLang].winTitle, dictUI[currentLang].winMsg, true, data.stats);
                playSFX('win');
            }, 1500);
        } else if (data.lost) {
            gameOver = true;
            stopTimer();
            showGameSummary(`${dictUI[currentLang].loseTitle}`);
            setTimeout(() => {
                showResultModal(dictUI[currentLang].loseTitle, `${dictUI[currentLang].loseMsg} <b>${data.answer}</b>`, false, data.stats);
                playSFX('lose');
            }, 1500);
        } else {
            currentRow++;
            currentGuess = '';
        }

    } catch (err) {
        console.error(err);
        showMessage(`Connection Error: ${err.message}`);
        playSFX('no');
    }
}

function calculateTimeSpent() {
    const totalMs = Date.now() - gameStartTime;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showGameSummary(text) {
    const timer = document.getElementById('timer-display');
    const summary = document.getElementById('game-summary');
    timer.classList.add('hidden');
    summary.textContent = text;
    summary.classList.remove('hidden');
}

function revealTiles(result, instant = false) {
    const row = currentRow;
    const guess = currentGuess;
    
    result.forEach((status, i) => {
        const tile = document.getElementById(`tile-${row}-${i}`);
        const key = document.getElementById(`key-${guess[i]}`);
        
        if (instant) {
            tile.classList.add(status);
            if (key && !key.classList.contains('correct')) {
                key.className = `key ${status}`;
            }
        } else {
            setTimeout(() => {
                tile.classList.add('flip');
                playSFX('yes');
                setTimeout(() => {
                    tile.classList.add(status);
                    if (key && !key.classList.contains('correct')) {
                        key.className = `key ${status}`;
                    }
                }, 300);
            }, i * 200);
        }
    });
}

function shakeRow() {
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.classList.add('shake');
        setTimeout(() => tile.classList.remove('shake'), 500);
    }
}

function showMessage(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    messageContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}


window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') handleInput('DELETE');
    else handleInput(key);
});

modalClose.onclick = () => modalOverlay.classList.add('hidden');

loadSession();
