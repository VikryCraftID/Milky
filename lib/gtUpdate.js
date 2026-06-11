import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

/**
 * Sinkronisasi database hero dengan API gtales.top
 * @param {function} log - Fungsi callback untuk progres log
 */
export async function syncGTDatabase(log = console.log) {
    const dbPath = path.join(process.cwd(), 'database', 'gt-list.json');
    let gtList = [];
    try {
        gtList = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        log("Gagal membaca database lokal.");
        return { success: false, added: 0 };
    }

    log("Memeriksa update dari API gtales.top...");
    const apiListRes = await fetch("https://gtales.top/api/heroes");
    if (!apiListRes.ok) throw new Error("Gagal mengambil daftar hero dari API.");
    const apiList = await apiListRes.json();

    // Mapping nama lokal untuk pengecekan
    const localNames = new Set(gtList.map(h => h.name.toLowerCase()));
    const localPlacenames = new Set(gtList.map(h => h.placename.toLowerCase()));

    const newHeroesFromApi = apiList.filter(apiHero => {
        const name = apiHero.name.toLowerCase();
        const place = name.replace(/[^a-z0-9]/g, "");
        return !localNames.has(name) && !localPlacenames.has(place);
    });

    if (newHeroesFromApi.length === 0) {
        log("Database sudah mutakhir. Tidak ada hero baru ditemukan.");
        return { success: true, added: 0 };
    }

    log(`Ditemukan ${newHeroesFromApi.length} hero baru. Memulai pengambilan detail...`);
    
    let addedCount = 0;
    let nextId = Math.max(...gtList.filter(h => h.id < 1000).map(h => h.id)) + 1;

    for (const apiHero of newHeroesFromApi) {
        try {
            const detailRes = await fetch(`https://gtales.top/api/heroes?hero=${apiHero.key}`);
            if (!detailRes.ok) continue;
            const detail = await detailRes.json();

            const tier = (detail.rarity === '3' || detail.rarity === 'unique') ? 'unique' : 
                         (detail.rarity === '2' || detail.rarity === 'rare' || detail.rarity === 'ascend') ? 'rare' : 'normal';
            
            const stars = tier === 'unique' ? 3 : (tier === 'rare' ? 2 : 1);

            const newHero = {
                id: nextId++,
                displayId: String(nextId - 1),
                name: detail.name,
                placename: detail.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
                dialogue: ["-", "-", "-"],
                element: detail.element || "basic",
                class: detail.role || "warrior",
                tier: tier,
                stars: stars,
                canAscended: (detail.rarity === "ascend"),
                hasMythVariant: (detail.variants || []).some(v => v.version === "Myth"),
                offsetCardX: 0,
                offsetCardY: 0,
                offsetMinicardX: 0,
                offsetMinicardY: 0,
                offsetSpriteX: 0,
                offsetSpriteY: 0
            };

            gtList.push(newHero);
            addedCount++;
            log(`✔ Berhasil menambahkan: ${newHero.name}`);
            
            // Delay untuk stabilitas API
            await new Promise(r => setTimeout(r, 200));
        } catch (err) {
            log(`✘ Gagal mengambil detail untuk ${apiHero.name}: ${err.message}`);
        }
    }

    if (addedCount > 0) {
        fs.writeFileSync(dbPath, JSON.stringify(gtList, null, 2));
    }

    return { success: true, added: addedCount };
}