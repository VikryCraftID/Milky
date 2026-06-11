const board = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const langSelect = document.getElementById('lang-select');
const newGameBtn = document.getElementById('new-game-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalClose = document.getElementById('modal-close');
const messageContainer = document.getElementById('message-container');

// API Configuration
// Change 'http://localhost:3000' to your actual Bot Server URL when deploying to Vercel!
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? '' 
    : 'https://GANTI-DENGAN-LINK-BOT-KAMU.railway.app';

let sessionId = null;
let currentGuess = '';
let currentRow = 0;
let gameOver = false;

const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

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

// Start New Game
async function startNewGame() {
    try {
        const response = await fetch(`${API_BASE}/api/wordle/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lang: langSelect.value })
        });
        const data = await response.json();
        sessionId = data.sessionId;
        currentGuess = '';
        currentRow = 0;
        gameOver = false;
        initBoard();
        initKeyboard();
        modalOverlay.classList.add('hidden');
    } catch (err) {
        showMessage('Failed to connect to server');
    }
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
        }
    } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < 5) {
            currentGuess += key;
            updateBoard();
            // Add pop animation
            const tile = document.getElementById(`tile-${currentRow}-${currentGuess.length - 1}`);
            tile.classList.add('pop');
            setTimeout(() => tile.classList.remove('pop'), 100);
        }
    }
}

// Update Board UI
function updateBoard() {
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.textContent = currentGuess[i] || '';
    }
}

// Submit Guess to Server
async function submitGuess() {
    if (currentGuess.length !== 5) {
        shakeRow();
        showMessage('Not enough letters');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/wordle/guess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, guess: currentGuess })
        });
        const data = await response.json();

        if (data.status === 'error') {
            shakeRow();
            showMessage(data.message);
            return;
        }

        revealTiles(data.result);

        if (data.won) {
            gameOver = true;
            setTimeout(() => showResultModal('VICTORY', 'Magnificent! You guessed it.', true), 1500);
            saveStats(true);
        } else if (data.lost) {
            gameOver = true;
            setTimeout(() => showResultModal('GAME OVER', `The word was ${data.answer}`, false), 1500);
            saveStats(false);
        } else {
            currentRow++;
            currentGuess = '';
        }

    } catch (err) {
        showMessage('Server error');
    }
}

// Reveal tiles one by one
function revealTiles(result) {
    const row = currentRow;
    const guess = currentGuess;
    
    result.forEach((status, i) => {
        const tile = document.getElementById(`tile-${row}-${i}`);
        const key = document.getElementById(`key-${guess[i]}`);
        
        setTimeout(() => {
            tile.classList.add('flip');
            setTimeout(() => {
                tile.classList.add(status);
                // Update keyboard
                if (!key.classList.contains('correct')) {
                    key.className = `key ${status}`;
                }
            }, 300);
        }, i * 200);
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

function showResultModal(title, msg, won) {
    modalTitle.textContent = title;
    modalTitle.style.color = won ? 'var(--correct)' : 'var(--accent-purple)';
    modalMessage.textContent = msg;
    
    const stats = JSON.parse(localStorage.getItem('wordle-stats') || '{"played":0, "wins":0}');
    document.getElementById('stat-played').textContent = stats.played;
    document.getElementById('stat-wins').textContent = stats.played === 0 ? '0%' : Math.round((stats.wins / stats.played) * 100) + '%';
    
    modalOverlay.classList.remove('hidden');
}

function saveStats(won) {
    const stats = JSON.parse(localStorage.getItem('wordle-stats') || '{"played":0, "wins":0}');
    stats.played++;
    if (won) stats.wins++;
    localStorage.setItem('wordle-stats', JSON.stringify(stats));
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') handleInput('DELETE');
    else handleInput(key);
});

modalClose.onclick = () => modalOverlay.classList.add('hidden');
newGameBtn.onclick = startNewGame;

// Initial Start
startNewGame();
initKeyboard();
