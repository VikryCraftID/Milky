import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.join(__dirname, '../../plugins');

function safePath(inputPath) {
    const normalized = path.normalize(inputPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const base = path.join(pluginsDir, normalized);
    if (!base.startsWith(pluginsDir)) return null;
    return base;
}

export default {
    command: 'delplugin',
    category: 'owner',
    description: 'Menghapus plugin dari path tujuan.',
    syntax: 'delplugin <path>',
    subcommand: '',
    aliases: ['deleteplugin', 'dpl', 'deletepl', 'removeplugin', 'rmpl', 'removepl', 'rmplugin'],
    isOwner: true,
    async run(context) {
        const { reply, text, prefix } = context;
        if (!text || !text.endsWith('.js')) return reply(L('system.usage', prefix, command));
        const filePath = safePath(text);
        if (!filePath) return reply(L('owner.delplugin.invalidPath'));
        if (!fs.existsSync(filePath)) return reply(L('owner.delplugin.notFound'));
        try {
            fs.unlinkSync(filePath);
            reply(L('owner.delplugin.success', text));
        } catch (err) {
            reply(L('owner.delplugin.failed', err.message));
        }
    }
};