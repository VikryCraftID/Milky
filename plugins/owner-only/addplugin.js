import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.join(__dirname, '../../plugins');

function safePath(inputPath) {
    // Normalisasi path dan cegah directory traversal
    const normalized = path.normalize(inputPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const base = path.join(pluginsDir, normalized);
    if (!base.startsWith(pluginsDir)) return null;
    return base;
}

export default {
    command: 'addplugin',
    category: 'owner',
    get description() { return L('owner.addplugin.desc'); },
    syntax: '.addplugin <path> [--force]',
    subcommand: '',
    aliases: ['createplugin', 'cplugin', 'cpl', 'apl', 'addpl'],
    isOwner: true,
    async run(context) {
        const { m, reply, text, quoted } = context;
        if (!text && !quoted?.text) return reply(L('owner.addplugin.usage'));

        let force = false;
        let fileName = text?.trim() || '';

        // Cek flag --force di akhir
        if (fileName.endsWith(' --force')) {
            force = true;
            fileName = fileName.slice(0, -8).trim();
        }

        if (!fileName) return reply(L('owner.addplugin.invalidPath'));

        // Tambahkan ekstensi .js jika belum ada
        if (!fileName.endsWith('.js')) fileName += '.js';

        let code = quoted?.text || '';
        if (!code && !force) {
            return reply(L('owner.addplugin.noCode'));
        }

        const filePath = safePath(fileName);
        if (!filePath) return reply(L('owner.addplugin.invalidPath'));

        // Buat direktori jika belum ada
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Cek apakah file sudah ada
        if (fs.existsSync(filePath) && !force) {
            return reply(L('owner.addplugin.exists', fileName));
        }

        try {
            const isOverwrite = fs.existsSync(filePath);
            fs.writeFileSync(filePath, code, 'utf8');
            const relativePath = path.relative(pluginsDir, filePath);
            reply(L('owner.addplugin.success', relativePath, isOverwrite ? 'ditimpa' : 'dibuat'));
        } catch (err) {
            reply(L('owner.addplugin.failed', err.message));
        }
    }
};