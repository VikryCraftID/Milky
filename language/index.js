import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { AsyncLocalStorage } from 'async_hooks';
import logger from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Objek penampung bahasa
let languages = { id: {}, en: {} };

/**
 * Load language files dynamically with cache buster
 */
async function loadLanguages() {
    try {
        const idPath = pathToFileURL(path.join(__dirname, 'id.js')).href;
        const enPath = pathToFileURL(path.join(__dirname, 'en.js')).href;
        
        const v = Date.now();
        const [idMod, enMod] = await Promise.all([
            import(`${idPath}?v=${v}`),
            import(`${enPath}?v=${v}`)
        ]);

        languages.id = idMod.default;
        languages.en = enMod.default;
        
        logger.success('i18n', 'Language packs updated.');
    } catch (e) {
        logger.error('i18n', `Failed to load language packs: ${e.message}`);
    }
}

// Watch for changes in language directory
fs.watch(__dirname, async (event, filename) => {
    if (filename && (filename === 'id.js' || filename === 'en.js')) {
        await loadLanguages();
    }
});

// AsyncLocalStorage instance
if (!global._localeStorage) {
    global._localeStorage = new AsyncLocalStorage();
}
export const localeStorage = global._localeStorage;

/**
 * Localization helper (i18n)
 * @param {string} key - Dot notation key
 * @param {...any} args - Arguments for dynamic templates
 */
export function L(key, ...args) {
    const context = localeStorage.getStore();
    
    let locale = 'en';
    const sender = context?.sender;
    
    if (sender && global.rpgDB?.users?.[sender]?.lang) {
        locale = global.rpgDB.users[sender].lang;
    } else if (context?.locale) {
        locale = context.locale;
    } else if (global.locale) {
        locale = global.locale;
    } else if (sender && sender.startsWith('62')) {
        locale = 'id';
    }

    const langObj = languages[locale] || languages['en'];
    let value = key.split('.').reduce((obj, i) => obj?.[i], langObj);
    
    if ((value === undefined || value === null) && locale !== 'en') {
        value = key.split('.').reduce((obj, i) => obj?.[i], languages['en']);
    }

    if (value === undefined || value === null) return key;
    
    if (typeof value === 'string' && value.includes('${args[')) {
        try {
            return new Function('args', `return \`${value}\``)(args);
        } catch (e) {
            console.error(`i18n Error [${key}]:`, e);
            return value;
        }
    }
    
    return value;
}

/**
 * Sync global.mess with Proxy for legacy support
 */
export async function syncGlobalMess() {
    await loadLanguages();
    global.mess = new Proxy({}, {
        get(target, prop) {
            if (typeof prop !== 'string') return undefined;
            return L(`mess.${prop}`);
        }
    });
}

export default L;