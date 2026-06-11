const fs = require('fs');
const fetch = require('node-fetch');

async function buildDatabase() {
    try {
        console.log("Membaca dev/list.txt...");
        const rawText = fs.readFileSync("dev/list.txt", "utf8");
        const listRaw = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");

        const categories = [];
        let currentCat = "";
        
        for (const line of listRaw) {
            if (line.startsWith("### ")) {
                currentCat = line.replace("### ", "");
            } else {
                categories.push({ name: line, tierCategory: currentCat });
            }
        }

        console.log("Mengambil daftar hero dari API gtales.top...");
        const apiListRes = await fetch("https://gtales.top/api/heroes");
        const apiList = await apiListRes.json();

        // Buat map nama -> key API (huruf kecil agar tidak case-sensitive)
        const apiNameMap = {};
        for (const item of apiList) {
            apiNameMap[item.name.toLowerCase()] = item.key;
        }

        // Tambahkan manual override jika ada perbedaan nama di wiki/api vs list user
        // Misalnya: "The Knight" di list, "Knight" di API (jika ada).
        apiNameMap["the knight"] = apiNameMap["knight"] || apiNameMap["the knight"];
        apiNameMap["1st corps commander"] = apiNameMap["1st corps commander"]; // Cek normal
        apiNameMap["mad panda trio"] = apiNameMap["mad panda trio"];

        const newDatabase = [];
        let normalIdCounter = 1;
        let collabIdCounter = 1001;
        let collabDisplayCounter = 1;

        console.log("Memulai fetching data detail untuk 168 hero...");
        
        for (let i = 0; i < categories.length; i++) {
            const { name, tierCategory } = categories[i];
            
            // Tentukan ID
            let id, displayId;
            if (tierCategory === "Collab") {
                id = collabIdCounter++;
                displayId = `${collabDisplayCounter++}EX`;
            } else {
                id = normalIdCounter++;
                displayId = String(id);
            }

            // Tentukan Bintang berdasarkan Kategori List
            let stars = 3;
            if (tierCategory === "Ascent" || tierCategory === "Rare") stars = 2;
            if (tierCategory === "Normal") stars = 1;

            // Buat Placename
            const placename = name.toLowerCase().replace(/[^a-z0-9]/g, "");

            // Setup default data jika API gagal/tidak cocok
            let role = "warrior";
            let element = "basic";
            let canAscended = false;
            let hasMythVariant = false;

            // Cari kunci API
            const apiKey = apiNameMap[name.toLowerCase()];
            
            if (apiKey) {
                // Fetch detail
                const detailRes = await fetch(`https://gtales.top/api/heroes?hero=${apiKey}`);
                if (detailRes.ok) {
                    const detail = await detailRes.json();
                    role = detail.role || role;
                    element = detail.element || element;
                    canAscended = (detail.rarity === "ascend");
                    
                    if (detail.variants && Array.isArray(detail.variants)) {
                        hasMythVariant = detail.variants.some(v => v.version === "Myth");
                    }
                } else {
                    console.warn(`⚠️ Gagal fetch detail untuk ${name} (Status: ${detailRes.status})`);
                }
            } else {
                console.warn(`⚠️ Peringatan: Nama '${name}' tidak ditemukan di API gtales.top! Menggunakan default.`);
            }

            // Tambahkan ke database baru
            const heroData = {
                id: id,
                displayId: displayId,
                name: name,
                placename: placename,
                dialogue: ["-", "-", "-"],
                element: element,
                class: role,
                tier: tierCategory.toLowerCase(),
                stars: stars,
                canAscended: canAscended,
                hasMythVariant: hasMythVariant
            };
            
            newDatabase.push(heroData);
            
            // Delay sedikit agar tidak di-rate-limit oleh API
            await new Promise(r => setTimeout(r, 100));
            
            if ((i + 1) % 20 === 0) {
                console.log(`Progress: ${i + 1}/${categories.length}`);
            }
        }

        // Tulis ke file sementara untuk dicek
        fs.writeFileSync("database/gt-list.json", JSON.stringify(newDatabase, null, 2));
        console.log("\nSelesai! Berhasil mem-build database/gt-list.json dengan total", newDatabase.length, "hero.");
        
    } catch (err) {
        console.error("Terjadi kesalahan fatal:", err);
    }
}

buildDatabase();