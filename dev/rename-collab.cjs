const fs = require('fs');
const path = require('path');

const dir = 'dev/icon';
const listPath = 'dev/list.txt';

try {
    // 1. Baca dan parsing daftar hero (KHUSUS Collab)
    const rawText = fs.readFileSync(listPath, 'utf8');
    const listRaw = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');

    const heroes = [];
    let isCollabSection = false;
    for (const line of listRaw) {
        if (line.startsWith('### Collab')) {
            isCollabSection = true;
            continue;
        }
        if (line.startsWith('### ') && isCollabSection) {
            break; // Jika ada section lain setelah collab, berhenti
        }
        if (isCollabSection) {
            heroes.push(line);
        }
    }

    // 2. Ambil daftar file yang masih berawalan background_ dan sortir numerik
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

    console.log(`Ditemukan ${heroes.length} hero Collab dan ${bgFiles.length} file gambar berawalan background_.`);

    // 3. Eksekusi rename
    let renamedCount = 0;
    for (let i = 0; i < heroes.length; i++) {
        if (i < bgFiles.length) {
            const placename = heroes[i].toLowerCase().replace(/[^a-z0-9]/g, '');
            const oldPath = path.join(dir, bgFiles[i].name);
            const newPath = path.join(dir, `${placename}_icon${bgFiles[i].ext}`);
            
            try {
                fs.renameSync(oldPath, newPath);
                renamedCount++;
            } catch (err) {
                console.error(`Gagal merename ${bgFiles[i].name}:`, err.message);
            }
        } else {
            console.warn(`Peringatan: Tidak cukup file untuk hero Collab ${heroes[i]}`);
        }
    }

    console.log(`Selesai! Berhasil me-rename ${renamedCount} file icon Collab.`);

} catch (e) {
    console.error('Terjadi kesalahan:', e);
}