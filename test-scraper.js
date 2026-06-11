import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeGTQuotes() {
    console.log("Mulai scraping (Test: 3 Hero)...");
    
    // Test URL, kita ambil Princess Aisha sebagai contoh
    const testHeroes = [
        { name: "Princess Aisha", url: "https://guardian-tales.fandom.com/wiki/Princess_Aisha/Voice_Lines" },
        { name: "Knight", url: "https://guardian-tales.fandom.com/wiki/Knight/Voice_Lines" }
    ];

    const results = {};

    for (const hero of testHeroes) {
        try {
            console.log(`Mengambil data untuk: ${hero.name}...`);
            const { data } = await axios.get(hero.url);
            const $ = cheerio.load(data);
            
            const quotes = [];
            
            // Mencari tabel yang berisi voice lines (English)
            // Di Wiki Fandom GT, biasanya quote ada di <td> setelah <th> yang berisi kondisi
            $('table.article-table tr').each((i, el) => {
                const condition = $(el).find('th').text().trim();
                let quoteText = $(el).find('td').first().text().trim();
                
                if (quoteText && quoteText.length > 0 && quoteText !== 'Link') {
                    // Bersihkan tulisan "Link" di akhir teks jika ada
                    quoteText = quoteText.replace(/Link$/, '').trim();
                    quotes.push(quoteText);
                }
            });

            // Filter out empty strings
            results[hero.name] = quotes.filter(q => q.length > 0);
            console.log(`Berhasil mendapatkan ${results[hero.name].length} dialog untuk ${hero.name}`);
            
            // Jeda agar tidak terkena rate limit
            await new Promise(res => setTimeout(res, 1000));
        } catch (e) {
            console.error(`Gagal mengambil data ${hero.name}:`, e.message);
        }
    }

    console.log("\nHasil Scraping Test:");
    console.log(JSON.stringify(results, null, 2));
}

scrapeGTQuotes();