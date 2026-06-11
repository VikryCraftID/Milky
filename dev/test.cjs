const fs = require('fs');
const rawInput = `Myth
Clara
Clara
Kahlor
Kahlor
Lucy
Lucy
Randi
Randi
AA72
AA72
Bianca
Bianca
Daisy
Daisy
J
J
Orca
Orca
Wakamo
Wakamo
Chriselle
Chriselle
Dabin
Dabin
Kamael
Kamael
Noel
Noel
Xiaoman
Xiaoman
Eugene
Eugene
Gabriel
Gabriel
Haruka
Haruka
Illuni
Illuni
Eunha
Eunha
Eva
Eva
Rie
Rie
The Knight
The Knight
Arabelle
Arabelle
Beth
Beth
Callie
Callie
Gremory
Gremory
Nifty
Nifty

Unique
Amy
Amy
Lynn
Lynn
Miya
Miya
Plitvice
Plitvice
Pymon
Pymon
Rey
Rey
Saya
Saya
Scintilla
Scintilla
Toga
Toga
Vishuvac
Vishuvac
Win Ling
Win Ling
Andras
Andras
Angie
Angie
Ara
Ara
Garam
Garam
Hana
Hana
Marina
Marina
Natsume
Natsume
Rachel
Rachel
Sia
Sia
Veronica
Veronica
White Snow
White Snow
Yun
Yun
Yuze
Yuze
Alef
Alef
Ameris
Ameris
Bari
Bari
Estel
Estel
Mad Panda Trio
Mad Panda Trio
Mayreel
Mayreel
Morrian
Morrian
Parvati
Parvati
Rosetta
Rosetta
Rue
Rue
Tasha
Tasha
Tinia
Tinia
Yuna
Yuna
Carol
Carol
Chun Ryeo
Chun Ryeo
Cornet
Cornet
Eleanor
Eleanor
Future Princess
Future Princess
KAI
KAI
Lapice
Lapice
Lena
Lena
Mk.99
Mk.99
Odile
Odile
Priscilla
Priscilla
Ruri
Ruri
Shapira
Shapira
Valencia
Valencia
Ameris
Ameris
Anna
Anna
Dohwa
Dohwa
Erina
Erina
Future Knight
Future Knight
Girgas
Girgas
Kanna
Kanna
Lahn
Lahn
Loraine
Loraine
Mikke
Mikke
Miss Chrom
Miss Chrom
Nari
Nari
Sohee
Sohee
1st Corps Commander
1st Corps Commander
Claude
Claude
Crosselle
Crosselle
Lilith
Lilith
Lupina
Lupina
Mk.2
Mk.2
Noxia
Noxia
Oghma
Oghma
Plague Doctor
Plague Doctor
Sumire
Sumire
Vinette
Vinette

Ascent
Elvira
Elvira
Coco
Coco
Craig
Craig
Fei
Fei
Mei
Mei
Karina
Karina

Rare
Akayuki
Akayuki
Dolf
Dolf
Girgas
Girgas
Lavi
Lavi
Catherine
Catherine
Favi
Favi
Rachel
Rachel
White Beast
White Beast
Aoba
Aoba
Hekate
Hekate
Marianne
Marianne
Marvin
Marvin
Aisha
Aisha
Eva
Eva
Neva
Neva
Sohee
Sohee
Amy
Amy
Loraine
Loraine
Ranpang
Ranpang
Rie
Rie
Shapira
Shapira
Yuze
Yuze

Normal
Ailie
Ailie
Hyper
Hyper
Maria
Maria
Mina
Mina
Agatha
Agatha
Blade
Blade
DaVinci
DaVinci
Kate
Kate
Leah
Leah
Lisa
Lisa
Marty Junior
Marty Junior
Rio
Rio
Dragon
Dragon
Kang
Kang
Bob
Bob
Jay
Jay
Linda
Linda
Nyan
Nyan
Hoshida
Hoshida
Oralie
Oralie
Peggy
Peggy
Zoe
Zoe

Collab
Lina
Lina
Nelluru
Nelluru
Popp
Popp
Shuna
Shuna
Stark
Stark
Rimuru Tempest
Rimuru Tempest
Maam
Maam
Frieren
Frieren
Gourry
Gourry
Alicia
Alicia
Dai
Dai
Fern
Fern
Klen
Klen
Milim Nava
Milim Nava
Xellos
Xellos`;

const lines = rawInput.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
const result = [];
let count = 0;
let lastLine = "";

for (const line of lines) {
    if (["Myth", "Unique", "Ascent", "Rare", "Normal", "Collab"].includes(line)) {
        result.push(line === "Myth" ? "### " + line : "\n### " + line);
        lastLine = "";
    } else {
        if (line !== lastLine) {
            result.push(line);
            count++;
            lastLine = line;
        }
    }
}

fs.writeFileSync("dev/list.txt", result.join("\n"));
console.log("Total Hero:", count);
