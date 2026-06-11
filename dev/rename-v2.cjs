const fs = require('fs');
const path = require('path');

const dir = 'dev/icon';
const listPath = 'dev/list.txt';

try {
    // 1. Baca dan parsing daftar hero (mengabaikan collab)
    const rawText = fs.readFileSync(listPath, 'utf8');
    const listRaw = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');

    const heroes = [];
    let skip = false;
    for (const line of listRaw) {
        if (line.startsWith('### Collab')) {
            skip = true;
            break;
        }
        if (line.startsWith('### ')) continue;
        if (!skip) heroes.push(line);
    }

    // 2. Ambil daftar file dan sortir secara numerik berdasarkan angka pada namanya
    const allFiles = fs.readdirSync(dir);
    const bgFiles = allFiles
        .filter(f => /^background_\d+\./.test(f))
        .map(f => {
            const numMatch = f.match(/(\d+)/);
            return {
                name: f,
                num: numMatch ? parseInt(numMatch[1], 10) : 0,
                ext: path.extname(f)
            };
        })
        .sort((a, b) => a.num - b.num);

    console.log(`Ditemukan ${heroes.length} hero (Non-Collab) dan ${bgFiles.length} file gambar.`);

    // 3. Persiapkan tracker untuk nama ganda
    const nameCounts = {};
    const finalNames = [];

    for (const hero of heroes) {
        const basePlacename = hero.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!nameCounts[basePlacename]) {
            nameCounts[basePlacename] = 0;
        }
        nameCounts[basePlacename]++;
    }

    const currentCounts = {};
    for (const hero of heroes) {
        const basePlacename = hero.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!currentCounts[basePlacename]) {
            currentCounts[basePlacename] = 0;
        }
        currentCounts[basePlacename]++;

        let finalPlacename = basePlacename;
        if (nameCounts[basePlacename] > 1) {
            finalPlacename = `${basePlacename}-${currentCounts[basePlacename]}`;
        }
        finalNames.push(finalPlacename);
    }

    // 4. Eksekusi rename
    let renamedCount = 0;
    for (let i = 0; i < heroes.length; i++) {
        if (i < bgFiles.length) {
            const oldPath = path.join(dir, bgFiles[i].name);
            const newPath = path.join(dir, `${finalNames[i]}_icon${bgFiles[i].ext}`);
            
            try {
                fs.renameSync(oldPath, newPath);
                renamedCount++;
            } catch (err) {
                console.error(`Gagal merename ${bgFiles[i].name}:`, err.message);
            }
        } else {
            console.warn(`Peringatan: Tidak cukup file untuk hero ${heroes[i]}`);
        }
    }

    console.log(`Selesai! Berhasil me-rename ${renamedCount} file.`);

} catch (e) {
    console.error('Terjadi kesalahan:', e);
}