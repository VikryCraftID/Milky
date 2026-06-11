import fs from 'fs';
import path from 'path';
import { loadImage, createCanvas } from '@napi-rs/canvas';

const dir = 'dev/icon';

async function convertWebpToPng() {
    try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
        
        if (files.length === 0) {
            console.log("Tidak ada file .webp yang ditemukan.");
            return;
        }

        console.log(`Ditemukan ${files.length} file .webp. Memulai konversi...`);

        for (const file of files) {
            const oldPath = path.join(dir, file);
            const newName = file.replace(/\.webp$/, '.png');
            const newPath = path.join(dir, newName);

            try {
                // Baca file webp
                const image = await loadImage(oldPath);
                
                // Buat canvas sesuai ukuran gambar
                const canvas = createCanvas(image.width, image.height);
                const ctx = canvas.getContext('2d');
                
                // Gambar ke canvas
                ctx.drawImage(image, 0, 0);
                
                // Encode ke PNG dan simpan
                const buffer = await canvas.encode('png');
                fs.writeFileSync(newPath, buffer);
                
                // Hapus file lama jika berhasil
                fs.unlinkSync(oldPath);
                
                console.log(`✔ Berhasil dikonversi: ${newName}`);
            } catch (err) {
                console.error(`❌ Gagal mengonversi ${file}:`, err.message);
            }
        }
        
        console.log("Proses konversi selesai!");
    } catch (e) {
        console.error("Terjadi kesalahan:", e);
    }
}

convertWebpToPng();