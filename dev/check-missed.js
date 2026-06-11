import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

async function checkMissedNames() {
    try {
        const { data: html } = await axios.get('https://heavenhold.com/heroes/');
        const $ = cheerio.load(html);
        
        const nameMap = new Set(); 
        $('tr.hero-row').each((i, el) => {
            const shortName = $(el).find('td').eq(3).text().trim().toLowerCase();
            if (shortName) nameMap.add(shortName);
        });

        const dbPath = path.join(process.cwd(), 'database', 'gt-list.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        const missed = [];
        for (const hero of db) {
            if (hero.tier === 'collab') continue; // Skip collab

            const searchKey = hero.placename.toLowerCase();
            let found = nameMap.has(searchKey);
            
            // Re-check logic similar to update script (cleaning names)
            if (!found) {
                for (let sn of nameMap) {
                    if (sn.replace(/[^a-z0-9]/g, '') === searchKey) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                missed.push(`${hero.name} (Tier: ${hero.tier})`);
            }
        }

        if (missed.length > 0) {
            console.log("--- DAFTAR HERO YANG TIDAK DITEMUKAN DI HEAVENHOLD ---");
            console.log(missed.join('\n'));
            console.log(`\nTotal: ${missed.length} hero.`);
        } else {
            console.log("Semua hero non-collab berhasil dipetakan ke Heavenhold!");
        }
        
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkMissedNames();