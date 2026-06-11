import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

async function updateHeroNames() {
    try {
        console.log("Mengambil data dari Heavenhold...");
        const { data: html } = await axios.get('https://heavenhold.com/heroes/');
        const $ = cheerio.load(html);
        
        const nameMap = {}; // Short Name -> Full Name

        $('tr.hero-row').each((i, el) => {
            const cells = $(el).find('td');
            const anchor = $(cells[1]).find('a');
            
            // Ambil text dari anchor, tapi buang isi dari div di dalamnya (icons)
            // Cara bersih: clone anchor, hapus div, ambil text
            const clone = anchor.clone();
            clone.find('div').remove();
            let fullName = clone.text().trim();
            
            const shortName = $(cells[3]).text().trim();
            
            if (shortName && fullName) {
                // Kadang nama di list.txt adalah "The Knight", di Heavenhold short-nya "Knight"
                nameMap[shortName.toLowerCase()] = fullName;
                // Tambahkan rujukan silang jika perlu
                if (shortName.toLowerCase() === 'knight') nameMap['the knight'] = fullName;
            }
        });

        console.log(`Berhasil memetakan ${Object.keys(nameMap).length} hero dari Heavenhold.`);

        const dbPath = path.join(process.cwd(), 'database', 'gt-list.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        let updatedCount = 0;
        for (const hero of db) {
            // Kita coba bersihkan nama hero dari title yang mungkin sudah terlanjur terpasang
            // atau gunakan placename sebagai kunci pencarian yang lebih stabil
            const searchKey = hero.placename.toLowerCase();
            
            // Cari di map. Karena nameMap kuncinya adalah shortName (placename biasanya mirip shortname)
            if (nameMap[searchKey]) {
                const oldName = hero.name;
                hero.name = nameMap[searchKey];
                if (oldName !== hero.name) updatedCount++;
            } else {
                // Cek manual untuk beberapa nama yang mungkin beda
                // (placename '1stcorpscommander' vs shortName '1st Corps Commander')
                // Kita coba cari yang kuncinya mengandung placename atau sebaliknya
                for (let sn in nameMap) {
                    const cleanSn = sn.replace(/[^a-z0-9]/g, '');
                    if (cleanSn === searchKey) {
                        const oldName = hero.name;
                        hero.name = nameMap[sn];
                        if (oldName !== hero.name) updatedCount++;
                        break;
                    }
                }
            }
        }

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        console.log(`Selesai! Berhasil memperbarui ${updatedCount} nama hero di database.`);
        
        // Cek sample Clara
        const clara = db.find(h => h.placename === 'clara');
        if (clara) console.log(`Sample Result (Clara): ${clara.name}`);

    } catch (e) {
        console.error("Terjadi kesalahan:", e.message);
    }
}

updateHeroNames();