import chalk from 'chalk';
import moment from 'moment-timezone';
import figlet from 'figlet';

const timezone = 'Asia/Jakarta';

// Palette Milky (Purple & Blue Variations - Neon Frost)
const P = {
    purple: chalk.hex('#c084fc'),
    violet: chalk.hex('#a78bfa'),
    indigo: chalk.hex('#818cf8'),
    blue: chalk.hex('#60a5fa'),
    sky: chalk.hex('#38bdf8'),
    pink: chalk.hex('#f472b6'),
    fuchsia: chalk.hex('#e879f9'),
    rose: chalk.hex('#fb7185'),
    white: chalk.white,
    gray: chalk.gray
};

const colors = [P.purple, P.violet, P.indigo, P.blue, P.sky];

// Isolated Banner Background Gradient (Top: Dark Purple -> Bottom: Black)
const bgHexColors = [
    '#1e0b36', '#1a0a30', '#16092a', '#120824', '#0f071e',
    '#0b0618', '#080512', '#05040c', '#020206', '#000000'
];

const groundColor = '#000000';

export const logger = {
    getTime() {
        return moment.tz(timezone).format('HH:mm:ss');
    },

    gradient(text) {
        let result = '';
        const len = text.length;
        if (len === 0) return '';
        for (let i = 0; i < len; i++) {
            const colorIdx = Math.floor((i / len) * colors.length);
            const color = colors[Math.min(colorIdx, colors.length - 1)];
            result += color(text[i]);
        }
        return result;
    },

    isParticleChar(char) {
        return ['.', '+', '*', '✦'].includes(char);
    },

    _writeFullLine(content, bgColorHex) {
        const bgANSI = chalk.bgHex(bgColorHex);
        // Print 1-space margin outside, then the colored background block
        // \x1b[K ensures the background fills to the end of the line
        process.stdout.write(' ' + bgANSI(content + '\x1b[K') + '\n');
    },

    div() {
        return P.violet('║');
    },

    _log(content) {
        this._writeFullLine(content, groundColor);
    },

    base(label, color) {
        const time = P.gray(`[${this.getTime()}]`);
        return `${time} ${this.div()} ${color.bold(label.padEnd(10))} ${P.blue('→')}`;
    },

    info(label, message) {
        this._log(`${this.base(label, P.violet)} ${P.white(message)}`);
    },

    success(label, message) {
        this._log(`${this.base(label, P.sky)} ${P.white.bold('(✧ω✧) ')}${P.white(message)}`);
    },

    warn(label, message) {
        this._log(`${this.base(label, P.purple)} ${P.white.bold('(>_<) ')}${P.white(message)}`);
    },

    error(label, message) {
        this._log(`${this.base(label, P.blue)} ${P.white.bold('(╥﹏╥) ')}${P.white(message)}`);
    },

    debug(label, message) {
        this._log(`${this.base(label, P.indigo)} ${P.gray('(✧ω✧) ')}${P.gray(message)}`);
    },

    startup(text) {
        const termWidth = process.stdout.columns || 80;
        
        // 1. Art Definitions
        const sideArtPlain = [
            "                                         _.oo.",
            "                 _.u[[/;:,.         .odMMMMMM'",
            "              .o888UU[[[/;:-.  .o@P^    MMM^",
            "             oN88888UU[[[/;::-.        dP^",
            "            dNMMNN888UU[[[/;:--.   .o@P^",
            "           ,MMMMMMN888UU[[/;::-. o@^",
            "           NNMMMNN888UU[[[/~.o@P^",
            "           888888888UU[[[/o@^-..",
            "          oI8888UU[[[/o@P^:--..",
            "       .@^  YUU[[[/o@^;::---..",
            "     oMP     ^/o@P^;:::---..",
            "  .dMMM    .o@^ ^;::---...",
            " dMMMMMMM@^`       `^^^^",
            "YMMMUP^",
            " ^^"
        ].map(line => line.trimEnd());
        
        const minLeading = Math.min(...sideArtPlain.filter(l => l.length > 0).map(l => l.match(/^\s*/)[0].length));
        const sideArt = sideArtPlain.map(l => l.slice(minLeading));
        const sideArtWidth = Math.max(...sideArt.map(l => l.length));

        const milkyLinesPlain = figlet.textSync('Milky', { font: 'DOS Rebel', horizontalLayout: 'default' }).split('\n');
        const interLinesPlain = figlet.textSync('Interactive', { font: 'Small', horizontalLayout: 'default' }).split('\n');
        
        const overlapOffset = 2;
        const totalTextLines = milkyLinesPlain.length + interLinesPlain.length - overlapOffset;
        const textLogoPlainLines = [];
        for (let i = 0; i < totalTextLines; i++) {
            let line = '';
            const mIdx = i;
            const iIdx = i - (milkyLinesPlain.length - overlapOffset);
            const mLine = milkyLinesPlain[mIdx] || '';
            const iLine = interLinesPlain[iIdx] || '';
            const len = Math.max(mLine.length, iLine.length);
            for (let j = 0; j < len; j++) {
                const mChar = mLine[j] || ' ';
                const iChar = iLine[j] || ' ';
                line += (iChar !== ' ') ? iChar : mChar;
            }
            textLogoPlainLines.push(line);
        }

        const gap = 4;
        const bannerWidth = sideArtWidth + gap + Math.max(...textLogoPlainLines.map(l => l.length));
        const bannerPadSize = Math.max(0, Math.floor((termWidth - bannerWidth) / 2));
        const bannerPad = ' '.repeat(bannerPadSize);

        const subtitle = 'Created by CrystalDev, fully inspired by Shiro Interactive.';
        const frameWidth = Math.min(termWidth - 2, Math.max(bannerWidth + 10, 60));
        const framePadSize = Math.max(0, Math.floor((termWidth - frameWidth) / 2));
        const framePad = ' '.repeat(framePadSize);
        
        const frameLinesPlain = [
            '╔' + '═'.repeat(frameWidth - 2) + '╗',
            '║' + ' '.repeat(Math.floor((frameWidth - 2 - subtitle.length) / 2)) + subtitle + ' '.repeat(frameWidth - 2 - subtitle.length - Math.floor((frameWidth - 2 - subtitle.length) / 2)) + '║',
            '╚' + '═'.repeat(frameWidth - 2) + '╝'
        ];

        // 2. Assemble Rows
        const rows = [];
        const maxContentLines = Math.max(sideArt.length, textLogoPlainLines.length + 1);
        for (let i = 0; i < maxContentLines; i++) {
            rows.push({ type: 'content', raw: bannerPad + (sideArt[i] || '').padEnd(sideArtWidth, ' ') + ' '.repeat(gap) + (textLogoPlainLines[i-1] || ''), sIdx: i, tIdx: i-1 });
        }
        rows.push({ type: 'empty', raw: '' });
        frameLinesPlain.forEach((l, i) => rows.push({ type: 'frame', raw: framePad + l, idx: i }));

        // 3. Render
        console.clear();
        console.log('');
        
        rows.forEach((row, i) => {
            const bgIdx = Math.floor((i / rows.length) * bgHexColors.length);
            const bgColor = bgHexColors[Math.min(bgIdx, bgHexColors.length - 1)];
            
            let coloredContent = '';
            if (row.type === 'content') {
                const sColor = colors[Math.min(Math.floor((row.sIdx / sideArt.length) * colors.length), colors.length - 1)];
                const mColor = colors[Math.min(Math.floor((row.tIdx / milkyLinesPlain.length) * colors.length), colors.length - 1)];
                const iLineIdx = row.tIdx - (milkyLinesPlain.length - overlapOffset);
                const iColor = colors[Math.min(Math.floor((iLineIdx / interLinesPlain.length) * colors.length), colors.length - 1)];
                
                const sStart = bannerPadSize;
                const sEnd = sStart + sideArtWidth;
                const tStart = sEnd + gap;

                for (let j = 0; j < row.raw.length; j++) {
                    const char = row.raw[j];
                    if (char === ' ') {
                        coloredContent += ' ';
                    } else if (j >= sStart && j < sEnd) {
                        coloredContent += sColor(char);
                    } else if (j >= tStart) {
                        const relX = j - tStart;
                        const isInter = interLinesPlain[iLineIdx] && interLinesPlain[iLineIdx][relX] && interLinesPlain[iLineIdx][relX] !== ' ';
                        coloredContent += isInter ? iColor(char) : mColor(char);
                    } else {
                        coloredContent += char;
                    }
                }
            } else if (row.type === 'frame') {
                const fColor = colors[Math.min(Math.floor((row.idx / 3) * colors.length), colors.length - 1)];
                for (let j = 0; j < row.raw.length; j++) {
                    coloredContent += (row.raw[j] === ' ') ? ' ' : fColor(row.raw[j]);
                }
            }

            this._writeFullLine(coloredContent, bgColor);
        });
        console.log('');
    },

    message(chatType, senderName, senderNumber, chatName, content) {
        const time = P.gray(`[${this.getTime()}]`);
        const typeTag = chatType === 'GC' ? P.purple.bold('GROUP') : P.indigo.bold('PRIVATE');
        const mainContent = `${time} ${this.div()} ${typeTag} ${P.pink.bold(senderName)} ${P.gray(`(${senderNumber})`)}`;
        const subContent1 = `  ${P.violet('└─')} ${P.rose('in')} ${P.fuchsia(chatName)}`;
        const subContent2 = `  ${P.violet('└─')} ${P.white.bold('( ^ω^ )')} ${P.white(content)}`;
        
        this._log(mainContent);
        this._log(subContent1);
        this._log(subContent2);
    }
};

export default logger;
