import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGIN_DIR = path.join(process.cwd(), 'plugins');

function tokenize(code) {
    const keywords = [
        "import", "from", "export", "default", "return", "const",
        "let", "var", "async", "await", "if", "else", "for",
        "while", "switch", "case", "break", "continue",
        "new", "class", "try", "catch"
    ];
    const tokens = [];
    const parts = code.split(/(\s+|".*?"|'.*?'|`.*?`)/g);
    for (let part of parts) {
        if (!part) continue;
        if (keywords.includes(part)) {
            tokens.push({ highlightType: 1, codeContent: part });
        } else if (/^".*"$|^'.*'$|^`.*`$/.test(part)) {
            tokens.push({ highlightType: 2, codeContent: part });
        } else if (/^\d+$/.test(part)) {
            tokens.push({ highlightType: 3, codeContent: part });
        } else {
            tokens.push({ highlightType: 0, codeContent: part });
        }
    }
    return tokens;
}

// Mendapatkan semua file .js (rekursif)
function getAllPluginFiles(dir, relativePath = '', arrayOfFiles = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const rel = path.join(relativePath, item);
        if (stat.isDirectory()) {
            getAllPluginFiles(fullPath, rel, arrayOfFiles);
        } else if (item.endsWith('.js')) {
            arrayOfFiles.push({
                fullPath,
                relName: rel.replace(/\.js$/, '') // relative name without .js
            });
        }
    }
    return arrayOfFiles;
}

export default {
    command: 'getplugin',
    category: 'owner',
    get description() { return L('owner.getplugin.desc'); },
    syntax: 'getplugin <path>',
    subcommand: '',
    aliases: ['gp', 'gpl', 'getpl', 'gplugin', 'readpl', 'rpl', 'rplugin', 'viewplugin', 'vpl', 'viewpl', 'vplugin', 'catplugin', 'cpl', 'cplugin', 'catpl'],
    isOwner: true,
    async run(context) {
        const { text, m, naze, prefix, command } = context;
        if (!text) {
            await m.reply(L('system.usage', prefix, command));
            return;
        }

        const allPlugins = getAllPluginFiles(PLUGIN_DIR);
        const keyword = text.toLowerCase();
        // cari plugin yang cocok (exact match relName, atau base name saja)
        let matched = null;
        for (const p of allPlugins) {
            const relLower = p.relName.toLowerCase();
            const baseName = path.basename(p.relName).toLowerCase();
            if (relLower === keyword || baseName === keyword || relLower.includes(keyword)) {
                matched = p;
                break;
            }
        }
        if (!matched) {
            await m.reply(L('owner.getplugin.notFound'));
            return;
        }

        const code = fs.readFileSync(matched.fullPath, 'utf8');
        const codeBlocks = tokenize(code);
        const submessages = [
            {
                messageType: 2,
                messageText: `> Path: plugins/${matched.relName}`
            },
            {
                messageType: 5,
                codeMetadata: {
                    codeLanguage: 'javascript',
                    codeBlocks
                }
            }
        ];
        const content = {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    pluginMetadata: {}
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages,
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: '867051314767696@bot'
                            },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        };
        await naze.relayMessage(m.chat, content, {});
    }
};