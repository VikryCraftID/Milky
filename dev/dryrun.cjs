const fs = require("fs");
const path = require("path");

const rawText = fs.readFileSync("dev/list.txt", "utf8");
// Gunakan regex untuk newline yang lebih aman
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

console.log("Total Heroes (Non-Collab):", heroes.length);
console.log("Total Files in dev/icon:", files.length);

if (heroes.length > 0) {
    console.log("\n--- 5 Mapping Pertama (Ascending) ---");
    for(let i=0; i<5; i++) {
        const placename = heroes[i].toLowerCase().replace(/[^a-z0-9]/g, "");
        console.log(`${files[i].name}  --->  ${placename}_icon${files[i].ext} (${heroes[i]})`);
    }
    console.log("...");
    console.log("\n--- 5 Mapping Terakhir (Sesuai jumlah hero) ---");
    for(let i=heroes.length-5; i<heroes.length; i++) {
        if (files[i]) {
            const placename = heroes[i].toLowerCase().replace(/[^a-z0-9]/g, "");
            console.log(`${files[i].name}  --->  ${placename}_icon${files[i].ext} (${heroes[i]})`);
        }
    }
}
