const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
    let bits = 0;
    let value = 0;
    let output = '';
    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;
        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    while (output.length % 8 !== 0) {
        output += '=';
    }
    return output;
}

function base32Decode(str) {
    str = str.replace(/=+$/, '').toUpperCase();
    let bits = 0;
    let value = 0;
    let output = [];
    for (let i = 0; i < str.length; i++) {
        const index = BASE32_ALPHABET.indexOf(str[i]);
        if (index === -1) return null;
        value = (value << 5) | index;
        bits += 5;
        if (bits >= 8) {
            output.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(output);
}

export default {
    command: 'cipher',
    category: 'tools',
    get description() { return L('tools.cipher.desc'); },
    syntax: 'cipher <type> <encode/decode> <text>',
    aliases: [],
    async run(context) {
        const { m, args, prefix, command } = context;

        const type = (args[0] || '').toLowerCase();
        const mode = (args[1] || '').toLowerCase();
        const text = args.slice(2).join(' ');

        if (!type || !['base64', 'base32', 'base16', 'hex', 'binary'].includes(type)) {
            return m.reply(L('tools.cipher.invalidType'));
        }

        if (!mode || !['encode', 'decode'].includes(mode)) {
            return m.reply(L('tools.cipher.invalidMode'));
        }

        if (!text) {
            return m.reply(L('tools.cipher.noText'));
        }

        let result = '';

        try {
            if (mode === 'encode') {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'utf8').toString('base64');
                        break;
                    case 'base32':
                        result = base32Encode(Buffer.from(text, 'utf8'));
                        break;
                    case 'base16':
                    case 'hex':
                        result = Buffer.from(text, 'utf8').toString('hex');
                        break;
                    case 'binary':
                        result = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                        break;
                }
            } else {
                switch (type) {
                    case 'base64':
                        result = Buffer.from(text, 'base64').toString('utf8');
                        break;
                    case 'base32':
                        const dec32 = base32Decode(text);
                        if (!dec32) throw new Error();
                        result = dec32.toString('utf8');
                        break;
                    case 'base16':
                    case 'hex':
                        result = Buffer.from(text, 'hex').toString('utf8');
                        break;
                    case 'binary':
                        result = text.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
                        break;
                }
            }
        } catch (e) {
            return m.reply(L('tools.cipher.failDecode'));
        }

        await m.reply(L('tools.cipher.result', type.toUpperCase(), mode.toUpperCase(), result));
    }
};