import axios from 'axios';
import { similarity } from '../../lib/function.js';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import logger from '../../lib/logger.js';

// Singleton instance untuk Kuroshiro
let kuroshiro = null;
let kuroshiroReady = false;

async function initKuroshiro() {
    if (kuroshiroReady) return kuroshiro;
    try {
        // Berdasarkan hasil debug:
        // Kuroshiro memiliki properti .default yang merupakan class
        // KuromojiAnalyzer adalah fungsi/constructor itu sendiri
        kuroshiro = new Kuroshiro.default();
        await kuroshiro.init(new KuromojiAnalyzer());
        kuroshiroReady = true;
        return kuroshiro;
    } catch (e) {
        logger.error('TOOLS', 'Kuroshiro Init Error: ' + e.message);
        return null;
    }
}

export default {
    command: 'lyrics',
    category: 'tools',
    get description() { return L('tools.lyrics.desc'); },
    syntax: 'lyrics <title>',
    aliases: ['lirik'],
    async run(context) {
        const { m, text, prefix, command } = context;

        if (!text) {
            return m.reply(L('tools.lyrics.usage'));
        }

        try {
            const url = `https://lrclib.net/api/search?q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(url, { timeout: 15000 });
            
            if (!Array.isArray(data) || data.length === 0) {
                return m.reply(L('tools.lyrics.notFound'));
            }

            const query = text.toLowerCase();
            
            // 1. Filter awal: Hanya yang punya plainLyrics
            const hasPlain = data.filter(item => item.plainLyrics);
            if (hasPlain.length === 0) return m.reply(L('tools.lyrics.notFound'));

            // 2. Filter Rasio Karakter (Prioritaskan Romaji jika ada)
            let targetList = hasPlain.filter(item => {
                const latinCount = (item.plainLyrics.match(/[a-zA-Z]/g) || []).length;
                const nonLatinCount = (item.plainLyrics.match(/[^\x00-\x7F]/g) || []).length;
                return latinCount > nonLatinCount;
            });
            
            let needsConversion = false;
            if (targetList.length === 0) {
                targetList = hasPlain;
                needsConversion = true;
            }

            // 3. Cari hasil yang paling mirip
            let bestMatch = null;
            let maxSimilarity = -1;

            for (const item of targetList) {
                const targetName = (item.trackName || item.name || '').toLowerCase();
                const simScore = similarity(query, targetName);

                if (simScore > maxSimilarity) {
                    maxSimilarity = simScore;
                    bestMatch = item;
                }
            }

            if (!bestMatch) {
                return m.reply(L('tools.lyrics.notFound'));
            }

            const title = bestMatch.trackName || bestMatch.name || text;
            const artist = bestMatch.artistName || '';
            let lyrics = bestMatch.plainLyrics.trim();

            // 4. Konversi Romaji Akurat via Kuroshiro
            const jpRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
            if (jpRegex.test(lyrics)) {
                const ks = await initKuroshiro();
                if (ks) {
                    try {
                        lyrics = await ks.convert(lyrics, {
                            to: 'romaji',
                            mode: 'spaced',
                            romajiSystem: 'hepburn'
                        });
                        // Bersihkan spasi berlebih di awal/akhir baris dan antar kata
                        lyrics = lyrics.split('\n').map(line => line.trim().replace(/\s+/g, ' ')).join('\n');
                    } catch (err) {
                        logger.error('TOOLS', 'Kuroshiro Conversion Error: ' + err.message);
                    }
                }
            }

            const header = L('tools.lyrics.title', `${title}${artist ? ` - ${artist}` : ''}`);
            const out = `${header}\n\n${lyrics}`;

            return m.reply(out);
        } catch (e) {
            logger.error('TOOLS', 'LYRICS ERROR: ' + (e?.response?.data || e.message || e));
            return m.reply(L('tools.lyrics.error'));
        }
    }
};