const fs = require('fs');
const path = require('path');

function fixTitles() {
    const listPath = 'dev/list.txt';
    const dbPath = 'database/gt-list.json';

    if (!fs.existsSync(listPath) || !fs.existsSync(dbPath)) {
        console.error("File tidak ditemukan!");
        return;
    }

    // 1. Ambil daftar nama murni dari list.txt (melewati kategori ###)
    const rawList = fs.readFileSync(listPath, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
    const baseNames = [];
    for (const line of rawList) {
        if (!line.startsWith('###')) {
            baseNames.push(line);
        }
    }

    // 2. Baca database saat ini
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    if (db.length !== baseNames.length) {
        console.warn(`Peringatan: Jumlah hero di DB (${db.length}) tidak sama dengan di list.txt (${baseNames.length})!`);
        // Kita tetap lanjut karena biasanya urutannya tetap sama untuk yang ada
    }

    let updated = 0;
    for (let i = 0; i < db.length; i++) {
        if (i >= baseNames.length) break;

        const fullName = db[i].name;
        const baseName = baseNames[i];

        // Set name baru ke baseName
        db[i].name = baseName;

        // Ekstrak title
        // Kita cari baseName di dalam fullName dan hapus
        // Gunakan regex case-insensitive untuk berjaga-jaga
        const regex = new RegExp(baseName, 'i');
        let title = fullName.replace(regex, '').trim();
        
        // Simpan title
        db[i].title = title || "";
        updated++;
    }

    // 3. Simpan kembali
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Selesai! Berhasil memisahkan title dan name untuk ${updated} hero.`);
    
    // Sample check
    console.log("Sample (1):", db[0]);
}

fixTitles();