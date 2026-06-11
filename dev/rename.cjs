const fs = require("fs");
const path = require("path");

const rawText = fs.readFileSync("dev/list.txt", "utf8");
const listRaw = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");

const heroes = [];
let skip = false;
for (const line of listRaw) {
    if (line.startsWith("### Collab")) {
        skip = true;
        break; // Stop here as user requested to skip collab
    }
    if (line.startsWith("### ")) continue;
    if (!skip) heroes.push(line);
}

const dir = "dev/icon";
const files = fs.readdirSync(dir)
    .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtimeMs, ext: path.extname(f) }))
    .sort((a, b) => a.time - b.time); // Ascending: oldest first

console.log("Memulai proses rename untuk", heroes.length, "file...");

let renamedCount = 0;
for(let i = 0; i < heroes.length; i++) {
    if (files[i]) {
        const placename = heroes[i].toLowerCase().replace(/[^a-z0-9]/g, "");
        const oldPath = path.join(dir, files[i].name);
        const newPath = path.join(dir, `${placename}_icon${files[i].ext}`);
        
        try {
            fs.renameSync(oldPath, newPath);
            renamedCount++;
        } catch (e) {
            console.error(`Gagal merename ${files[i].name}:`, e.message);
        }
    }
}

console.log(`Selesai! Berhasil me-rename ${renamedCount} file icon.`);
