export default {
    // Global Messages
    mess: {
        key: "Limit. Beritahu ini ke owner.",
        owner: "Maaf, kamu tidak punya izin untuk menjalankan perintah ini.",
        admin: "Maaf, perintah ini dikhususkan hanya untuk Admin grup.",
        botAdmin: "Maaf, Milky perlu menjadi Admin untuk menjalankan perintah ini.",
        onWa: "Nomor tersebut sepertinya tidak terdaftar di WhatsApp.",
        group: "Maaf, perintah ini hanya bisa digunakan di grup.",
        private: "Maaf, perintah ini hanya bisa digunakan di obrolan pribadi.",
        quoted: "Reply pesan yang diinginkan.",
        limit: "Limit. Beritahu ini ke owner.",
        fail: "Kesalahan terjadi, proses gagal.",
        error: "Kesalahan terjadi, harap beritahu ini ke owner.",
        done: "Perintah dijalankan."
    },

    // System Messages
    system: {
        invalidUrl: "Tautan tidak valid!",
        onlySupport: "Hanya mendukung video/audio/image/text",
        invalidApikey: "Apikey tidak valid!",
        userNotFound: "User tidak ditemukan di database!",
        ownerNotFound: "Owner tidak ditemukan di daftar!",
        groupNotRegistered: "Grup ini belum diregistrasi. Gunakan *.register* untuk mendaftarkan grup ini.",
        setupNotDone: "Grup ini sudah diregistrasi, tetapi bot belum dapat digunakan karena owner grup belum menyelesaikan setup.",
        usagePublic: "*Sukses diubah ke penggunaan publik*",
        usageSelf: "*Sukses diubah ke penggunaan pribadi*",
        rpgDisabled: "❌ Mode RPG sedang dinonaktifkan di grup ini.",
        wait: "Tunggu sebentar...",
        levelUp: "Selamat *${args[0]}*, kamu naik level *${args[1]}* → *${args[2]}*!",
        achievement: "Selamat @${args[0]}, kamu mendapatkan achievement: *${args[1]}*!",
        reincarnateMin: "Minimal level 10 untuk reinkarnasi.",
        usage: "Parameter tidak valid, jalankan perintah *${args[0]}help ${args[1]}* untuk bantuan.",
        cmd: {
            maintenance: "Perintah ini sedang dalam perbaikan.",
            disabled: "Perintah *${args[0]}* sedang dinonaktifkan dengan alasan: ${args[1]}",
            banned: "Kamu dilarang menggunakan perintah *${args[0]}* selama ${args[1]} dengan alasan: ${args[2]}",
            lowTrust: "Trust Factor terlalu rendah untuk menjalankan perintah ini.",
            cooldown: "Bentar! Tunggu ${args[0]} detik (>~< \")",
            noYen: "Yen kamu tidak mencukupi.",
            error: "Terjadi kesalahan: ${args[0]}"
        }
    },

    // Group Action Messages
    groupActions: {
        revoke: "mereset link grup!",
        subject: "mengubah Subject Grup menjadi :\n*${args[0]}*",
        icon: "telah mengubah icon grup.",
        description: "mengubah deskripsi grup.\n\n${args[0]}",
        editInfo: "telah mengatur agar *${args[0] == 'on' ? 'hanya admin' : 'semua peserta'}* yang dapat mengedit info grup.",
        closeGroup: "telah *${args[0] == 'on' ? 'menutup' : 'membuka'}* grup!\nSekarang ${args[0] == 'on' ? 'hanya admin yang' : 'semua peserta'} dapat mengirim pesan.",
        promote: "telah menjadikan @${args[0]} sebagai admin.",
        demote: "telah memberhentikan @${args[0]} dari admin.",
        ephemeral: "mengubah durasi pesan sementara menjadi *@${args[0]}*",
        ephemeralOff: "menonaktifkan pesan sementara.",
        joinRequest: "@${args[0]} meminta bergabung",
        whitelistJoin: "Grup ini baru bagiku, registrasi diperlukan.",
        welcome: "Selamat datang di ${args[0]}\n@",
        leave: "@\nKeluar dari ${args[0]}",
        promoteAction: "@\nPromote dari ${args[0]}\nOleh @admin",
        demoteAction: "@\nDemote dari ${args[0]}\nOleh @admin"
    },

    // Plugins Messages
    plugins: {
        whitelist: {
            desc: "Mengaktifkan bot dalam grup tertentu.",
            success: "Grup berhasil diregistrasi.\n\n- *ID:* ${args[0]}\n- *Owner:* @${args[1]}",
            already: "Grup ini sudah terdaftar.",
            notified: "Grup *${args[0]}* telah diregistrasi, tetapi Milky belum dapat diinteraksi. Jalankan perintah *.setup* untuk melanjutkan.",
            invalidSyntax: "Parameter tidak valid. Syntax tidak sesuai.",
            failUrl: "Gagal mengambil info grup dari URL. Pastikan link valid.",
            invalidId: "ID Grup tidak valid.",
            removed: "Grup dihapus dari whitelist.",
            notifyOwner: "Halo @${args[0]}, grup kamu *${args[1]}* telah diregistrasi oleh Owner Bot.\n\nSilakan selesaikan setup dengan mengetik *.setup* di sini."
        },
        add: {
            desc: "Menambah atau mengundang member ke dalam grup.",
            usage: "Parameter tidak valid, jalankan perintah *.help add* untuk bantuan.",
            success: "Berhasil menambahkan @${args[0]} ke dalam grup.",
            blocked: "Dia tersebut memblokir Milky, jadi aku tidak dapat menambahkannya",
            alreadyIn: "Dia sudah ada di grup ini.",
            full: "Grup sudah penuh, jadi aku tidak dapat menambahkannya.",
            leftRecently: "@${args[0]} tidak dapat diundang karena belum lama ini dia keluar dari grup.\nUndangan telah dikirimkan ke dia melalui Private Chat.",
            inviteMsg: "@${args[0]}\n mengundangmu masuk ke grup ini.",
            privateSent: "@${args[0]} tidak dapat ditambahkan karena pengaturan privasinya.\nUndangan telah dikirimkan ke dia melalui Private Chat.",
            failed: "Gagal menambahkan pengguna.\nStatus : ${args[0]}",
            inviteFail: "Undangan gagal dikirim."
        },
        setup: {
            desc: "Konfigurasi Milky untuk grup kamu.",
            sessionActive: "Kamu sedang dalam sesi setup. Selesaikan atau ketik *.cancel* untuk membatalkan.",
            noGroups: "Kamu tidak memiliki grup yang terdaftar atau kamu bukan admin di grup tersebut.",
            selectGroup: "Pilih grup yang ingin kamu setup:",
            interactReady: "Milky sudah dapat diinteraksi.",
            adminChanged: "Admin melakukan perubahan kepada Milky untuk grup ini.",
            setupDone: "Setup selesai. Milky sudah aktif di grup kamu.",
            saved: "Perubahan tersimpan, jika kamu ingin melakukan konfigurasi ke grup kamu lagi, jalankan perintah *.setup*.",
            canceled: "Perubahan dibatalkan, jika kamu ingin melakukan konfigurasi ke grup kamu lagi, jalankan perintah *.setup*.",
            rpgToggle: "Mode RPG ${args[0]} untuk grup tersebut.",
            secToggle: "Mode Security ${args[0]} untuk grup tersebut.",
            goalTitle: "*# Setup Grup: ${args[0]}*\n\nApa tujuan kamu menambahkan Milky ke grup kamu?",
            goalSec: "Aku ingin menjaga grupku.",
            goalFun: "Aku ingin bersenang-senang.",
            goalBoth: "Aku memilih keduanya.",
            secTitle: "# Setup Security Mode\n\nAtur beberapa fitur yang ingin kamu sesuaikan, jika sudah selesai, jalankan perintah *\".setup confirm\"*",
            antiLinkTitle: "Anti Link: ${args[0]}",
            antiLinkDesc: "Mendeteksi semua link yang dikirim oleh member dan menghapusnya.\n${args[1]}",
            antiKudetaTitle: "Anti Kudeta: ${args[0]}",
            antiKudetaDesc: "Mencegah grup diambil alih oleh admin baru yang tidak bertanggungjawab.\n${args[1]}",
            toggleOff: "Pilih untuk mematikan fitur ini.",
            toggleOn: "Pilih untuk mengaktifkan fitur ini.",
            saveCheck: "Simpan perubahan?",
            manageTitle: "# Manajemen Grup\n\n- Grup terpilih: *${args[0]}*\nApa yang ingin kamu atur?",
            btnRpg: "Toggle mode RPG",
            btnSec: "Toggle mode Security",
            btnSecManage: "Fitur Security",
            btnSave: "Simpan Perubahan"
        },
        gt: {
            desc: "Koleksi kartu Guardian Tales.",
            error: "Terjadi kesalahan.",
            noYen: "Yen tidak mencukupi, memerlukan ${args[0]}¥ untuk melakukan ini.",
            win: "",
            winBulk: "# Multi-Pull GT\n> Terpakai: ${args[1]}¥\n> Harga: ${args[2]}¥\n> Keuntungan: ${args[3]}\n\n${args[0]}",
            invTitle: "*# ${args[0]}'s GT Inventory*\n> page ${args[1]}/${args[2]}",
            invTotal: "\nTotal: ${args[0]} kartu\nPity: ${args[1]}/${args[2]}",
            sellSuccess: "${args[0]} menjual #${args[1]} - ${args[2]} (${args[3]}★) dan mendapatkan ${args[4]}¥",
            sellSuccessBulk: "${args[0]} menjual ${args[1]} kartu dan mendapatkan ${args[2]}¥",
            pityTitle: "Pity kamu: ${args[0]}/${args[1]}",
            rateTitle: "*# GT Rate*\n- 3★: ${args[0]}%\n- 2★: ${args[1]}%\n- 1★: ${args[2]}%",
            evolveReq: "Kamu membutuhkan 3 kartu yang sama untuk mengevolusikan kartu ini.",
            evolveSuccess: "*# GT Card Evolve*\nKartu ${args[0]} (${args[1]}★) kamu berevolusi menjadi ${args[2]} (${args[3]}★).",
            evolveMin: "kartu ini tidak dapat dievolusikan.",
            invalidIdx: "Parameter tidak valid, kartu tersebut tidak ada di dalam inventory kamu.",
            notFound: "Parameter tidak valid, kartu tersebut tidak ada.",
            commands: "Parameter tidak valid, jalankan perintah *.help gt* untuk bantuan.",
            calculating: "menghitung..."
        },
        group: {
            deleteDesc: "Menghapus pesan yang direply.",
            demoteDesc: "Menurunkan admin menjadi member.",
            hidetagDesc: "Menandai semua orang tanpa terlihat dengan pesan.",
            kickDesc: "Mengeluarkan seseorang dari grup.",
            kickBot: "Kamu ingin aku keluar? Baiklah... Sampai jumpa!",
            linkgroupDesc: "Mengambil dan mengirim link grup.",
            pinDesc: "Menyematkan pesan yang direply.",
            promoteDesc: "Menaikan member menjadi admin.",
            revokeDesc: "Mereset link grup.",
            revokeSuccess: "Link grup disetel ulang.",
            setdescDesc: "Mengubah deskripsi grup.",
            setngcDesc: "Mengubah nama grup.",
            setppgcDesc: "Mengatur foto profil grup dengan foto yang direply.",
            setppgcReply: "Reply foto yang ingin dijadikan sebagai foto profil grup.",
            tagallDesc: "Tag semua orang satu persatu dengan pesan.",
            tagallTitle: "*Tagall*\n\n*Pesan:* ${args[0]}\n\n",
            unpinDesc: "Melepas pesan yang disematkan.",
            unwarnDesc: "Melepas peringatan member.",
            unwarnSuccess: "Peringatan dihapus.",
            unwarnEmpty: "Pengguna tersebut tidak memiliki peringatan.",
            warnDesc: "Memberi peringatan ke member, jika peringatan melebihi 3, akan dikick.",
            warnProgress: "Peringatan ${args[0]}/3, jika peringatan lebih dari 3, kamu akan dikeluarkan dari grup ini.",
            warnKick: "Pengguna telah dikick karena sudah diperingati lebih dari 3 kali."
        }
    },

    // Game Messages
    game: {
        wordle: {
            desc: "Permainan Wordle, menebak sebuah kata 5 huruf.",
            how: "*# Cara Bermain Wordle*\n\n> Permulaan\n- Kamu memiliki 6 kesempatan untuk menebak kata yang terdiri dari 5 huruf, dan kamu diberikan 5 menit untuk menebak.\n- Setiap kamu menebak kata, huruf-huruf akan menyala dengan warna tertentu sebagai petunjuk.\n\n> Pengertian Warna\n- 🟩 Hijau berarti huruf itu berada di urutan yang benar.\n- 🟨 Kuning berarti huruf itu ada di kata rahasia tetapi berada di urutan yang salah.\n- ⬛ Hitam berarti huruf itu tidak ada di kata rahasia.\n\n> Contoh Singkat\n- Anggaplah kata rahasianya adalah *CERIA*\n- Dan kamu menebak dengan kata *CINTA*\n- Hasil kotaknya akan muncul: 🟩🟨⬛⬛🟩\n- Itu berarti huruf *C* dan *A* berada di urutan yang benar;\n- Huruf *I* berada di urutan yang salah; dan \n- Huruf *N* dan *T* tidak ada.",
            start: "Permainan *Wordle ${args[0]}* dimulai! Periksa private chat kamu untuk bermain.",
            win: "Kamu menyelesaikan *Wordle ${args[0]}* dalam ${args[1]} percobaan selama ${args[2]}. Kamu mendapatkan ${args[3]}¥ dan ${args[4]} exp.",
            winGc: "*${args[0]}* menyelesaikan *Wordle ${args[1]}* dalam ${args[2]} percobaan selama ${args[3]}. *${args[0]}* mendapatkan ${args[4]}¥ dan ${args[5]} exp.",
            timeout: "Waktu habis! Kata yang benar: *${args[0]}*. Kamu mendapatkan 0¥ dan 0 exp.",
            timeoutGc: "*${args[0]}* kehabisan waktu disaat bermain *Wordle ${args[1]}*. *${args[0]}* mendapatkan 0¥ dan 0 exp.",
            lose: "Percobaan kamu habis. Kata: *${args[0]}*. Kamu mendapatkan 0¥ dan 0 exp.",
            loseGc: "*${args[0]}* kalah dalam *Wordle ${args[1]}*. *${args[0]}* mendapatkan 0¥ dan 0 exp.",
            canceled: "Sesi Permainan Wordle telah dibatalkan.",
            wrongLength: "Huruf kamu melebihi yang diperlukan.",
            notFound: "Kata tidak ditemukan di kamus.",
            groupOnly: "Permainan hanya bisa dimulai di dalam grup.",
            alreadyPlaying: "Kamu sedang bermain Wordle saat ini. Ketik *.cancel* untuk berhenti.",
            cooldown: "Tunggu ${args[0]} detik sebelum memulai Permainan Wordle lagi.",
            stats: "*# Statistik Wordle ${args[0]}*\n\n- Jumlah Bermain: ${args[1]}x\n- Menang: ${args[2]}x\n- Winrate: ${args[3]}%\n- Skor Terbaik: ${args[4]}\n- Pendapatan: ${args[5]}¥, ${args[6]} exp",
            boardStatus: "*# Wordle ${args[0]}*\n\n- Percobaan: ${args[1]}/6\n- Waktu: ${args[2]}\n${args[3]}"
        },
        afk: {
            tag: "Jangan tag dia!\nDia sedang AFK ${args[0]}\nSelama ${args[1]}",
            reason: "dengan alasan ${args[0]}",
            noReason: "tanpa alasan",
            stop: "@${args[0]} berhenti AFK${args[1]}\nSelama ${args[2]}"
        }
    },

    // Tools & Responses
    tools: {
        play: {
            desc: "Mencari dan memutar lagu dari YouTube.",
            invalid: "Parameter tidak valid. Berikan judul atau link YouTube yang valid.",
            failedUrl: "Video tidak ditemukan",
            failedInfo: "Gagal mengambil info video.",
            failedServer: "Interaksi dengan server gagal, laporkan ini ke owner.",
            btnDownload: "Download Link"
        },
        sticker: {
            desc: "Membuat sticker dari gambar yang direply atau dikirim.",
            invalid: "Parameter tidak valid. Kirim atau reply media dengan caption *${args[0]}${args[1]}*",
            viewOnce: "Perintah ini tidak bisa dijalankan untuk media sekali lihat.",
            failed: "Parameter media tidak valid.",
            packname: "Sticker by ${args[0]}\n\nCreated on: Milky Interactive\n+62 822-4836-8488\n",
            author: "———————————— •\nMilky Interactive by CrystalDev"
        },
        mdl: {
            desc: "Download media dari platform tertentu dengan pilihan MP3 atau MP4. Platform yang didukung: YouTube, Facebook, Instagram, TikTok.",
            invalidUrl: "Parameter url tidak valid. Harap berikan link yang valid.",
            notSupported: "Maaf, platform ini tidak didukung.",
            title: "*# ${args[0]} Downloader*\n\nPilih format yang ingin kamu download:",
            failYt: "Semua server YouTube gagal.",
            failFb: "Gagal mengambil data Facebook.",
            failFormat: "Format ${args[0]} tidak tersedia.",
            failIg: "Gagal menemukan media Instagram.",
            failTiktok: "Media tidak ditemukan.",
            failTiktokDl: "Gagal mendapatkan link download TikTok.",
            successYt: "Download media dari YouTube berhasil!",
            successFb: "Download media dari Facebook berhasil!",
            successIg: "Download media dari Instagram berhasil!",
            successTiktok: "Download media dari TikTok berhasil!",
            btnMp3: "Audio (MP3)",
            btnMp4: "Video (MP4)"
        },
        bypass: {
            desc: "Melewati URL/Link shortener tertentu dan memberikan hasilnya secara langsung.",
            failedToken: "*# Milky Bypass\n\nError: FAILED_CLOUDFLARE_TOKEN\nHarap laporkan ini ke owner.",
            failedBypass: "*# Milky Bypass\n\nBypass gagal, link mungkin tidak didukung.",
            error: "*# Milky Bypass*\n\nTerjadi kesalahan saat memproses bypass.",
            title: "*# Milky${args[0]} Bypass*",
            btnDownload: "Download",
            btnCopy: "Salin",
            labels: {
                info: "> Informasi File:",
                from: "Dari:",
                size: "Ukuran:",
                result: "Hasil:"
            }
        },
        cipher: {
            desc: "Enkripsi teks UTF-8 atau dekripsi teks ke UTF-8.",
            invalidMode: "Mode tidak valid. Gunakan 'encode' atau 'decode'.",
            invalidType: "Tipe tidak valid. Gunakan 'base64', 'base32', 'hex', atau 'binary'.",
            noText: "Masukkan teks yang ingin diproses.",
            failDecode: "Gagal mendekripsi teks. Pastikan format input benar.",
            result: "*# Hasil Cipher (${args[0]} - ${args[1]})*\n\n${args[2]}"
        },
        lyrics: {
            desc: "Mencari lirik dari sebuah lagu.",
            usage: "Masukkan judul lagu yang ingin dicari.",
            notFound: "Lyrics tidak ditemukan.",
            error: "Gagal mengambil lyrics, coba lagi nanti.",
            title: "*# Lyrics ${args[0]}*"
        }
    },

    // RPG Messages
    rpg: {
        ach: {
            desc: "Melihat daftar achievement atau menyetel achievement yang ditampilkan.",
            title: "🏆 *Achievement List* 🏆",
            has: "_Sudah didapatkan_",
            notHas: "_Belum didapatkan_",
            usage: "📌 *Cara menyetel display:* ${args[0]}${args[1]} <id>\nContoh: ${args[0]}${args[1]} 1",
            nan: "❌ ID Achievement harus berupa angka.",
            notFound: "❌ Achievement dengan ID ${args[0]} tidak ditemukan.",
            notEarned: "❌ Kamu belum mendapatkan achievement *${args[0]}*.",
            success: "✅ Berhasil menyetel *${args[0]}* sebagai achievement yang ditampilkan."
        },
        cheat: {
            desc: "Menambahkan jumlah ke field yang ditentukan.\nField: yen, xp, level, msg, cmd, warn, gacha, reinc, tf",
            invalidMode: "Parameter mode tidak valid.",
            invalidAmount: "Parameter amount tidak valid.",
            invalidAmountNeg: "Parameter amount tidak valid. Kamu mencoba menggunakan angka negatif dalam mode set.",
            invalidField: "Parameter field tidak valid.",
            userNotFound: "Pengguna tidak ditemukan.",
            success: "*# Cheat Activated*\n\nBerhasil ${args[0]} nilai *${args[1]}* ke *${args[2]}* #${args[3]}${args[4]} ${args[5]}.",
            modes: {
                set: "mengatur",
                add: "menambah"
            },
            labels: {
                to: "menjadi",
                by: "sebanyak"
            },
            give: "*# Cheat Activated*\n\nKartu ${args[0]} (${args[1]}★) berhasil ditambahkan ke inventory ${args[2]} (#${args[3]})."
        },
        daily: {
            desc: "Mengambil reward harian.",
            alreadyClaimed: "Kamu sudah claim *${args[0]}* hari ini. Kembali lagi besok ya!",
            sessionActive: "Kamu sedang dalam sesi Daily Reward. Ketik *.cancel* untuk membatalkan.",
            groupNotify: "*# Daily Reward*\n\nPeriksa private chat kamu untuk memilih reward.",
            chooseTitle: "*# Daily Reward*\n\nPilih salah satu reward!",
            rewardSuccess: "*${args[0]}* mengambil *${args[1]}* dari Daily Reward.",
            rewardNotify: "*${args[0]}*, kamu mengambil *${args[1]}* dari Daily Reward.",
            canceled: "Sesi Daily Reward telah dibatalkan.",
            btnYen: "Yen (+2¥)",
            btnExp: "Exp (+1200 exp)",
            btnTf: "TF (+2.5%)"
        },
        evo: {
            desc: "Berevolusi race ke tingkat selanjutnya.",
            minLevel: "Kamu setidaknya memerlukan 2.5¥ dan minimal level 6 untuk evolusi.",
            noAttempts: "Kamu kehabisan kesempatan untuk evolusi.",
            noPath: "Role ${args[0]} tidak memiliki jalur evolusi lagi.",
            failed: "*Gagal Evolusi*\n\n${args[0]}",
            canceled: "Sesi Evolusi dibatalkan.",
            success: "*${args[0]}* berhasil melakukan evolusi dan berevolusi dan menjadi *${args[1]}*.",
            failReward: "*${args[0]}* telah gagal melakukan evolusi dan mendapatkan 1.5¥ kembali.",
            confirmTitle: "*# Race Evolution*\n\nKamu akan melakukan evolusi. Melakukan ini akan mereset Level kamu, jika kamu gagal, kamu akan dapat 1.5¥ kembali.\n\n",
            confirmPaths: "- Jalur evolusi yang tersedia:\n",
            confirmPathRow: "> *${args[0]}* (Tier ${args[1]}) - Peluang: ${args[2]}%\n",
            confirmFailProb: "\nKamu memiliki peluang ${args[0]}% untuk gagal melakukan evolusi.",
            footer: "Kesempatan evolusi: ${args[0]}/5",
            btnConfirm: "Konfirmasi",
            btnCancel: "Batalkan"
        },
        leaderboard: {
            desc: "Melihat daftar pengguna top berdasarkan Yen atau Level.",
            invalid: "Tipe leaderboard tidak valid. Gunakan *${args[0]} yen* atau *level*.",
            title: "╭──❍「 *LEADERBOARD ${args[0]}* 」❍\n",
            row: "│• ${args[0]}. @${args[1]}\n│  ${args[2]} : ${args[3]}\n│\n",
            footer: "╰──────❍\n\n_Ketik *${args[0]}level* untuk melihat top level._"
        },
        pay: {
            desc: "Mentransfer yen kamu ke pengguna lain dengan pajak 15.5%. Jumlah transfer minimal 1¥.",
            minAmount: "Jumlah transfer minimal 1¥.",
            targetNotFound: "Pengguna tujuan tidak ditemukan.",
            selfTransfer: "Kamu tidak dapat transfer ke diri sendiri.",
            insufficient: "Yen kamu tidak mencukupi untuk melakukan transfer.",
            success: "Kamu mentransfer *${args[0]}¥* ke *${args[1]}* dengan pajak 15.5%.",
            notify: "Kamu menerima *${args[0]}¥* dari *${args[1]}*."
        },
        race: {
            desc: "Menampilkan list race atau jalur evolusi ras tertentu.",
            originTitle: "# *Origin Race*\n\n",
            originRow: "${args[0]}. *${args[1]}*: ${args[2]}%\n",
            originFooter: "\nLihat jalur evolusi dengan perintah: ${args[0]} <role>",
            pathNotFound: "Argumen tidak valid. *\"${args[0]}\"* tidak ditemukan.",
            pathTitle: "🛤️ *EVOLUTION PATH: ${args[0]}* 🛤️\n\n",
            pathOrigin: "🟢 *${args[0]}* (Origin)\n",
            pathRow: "${args[0]}╰── *${args[1]}* (T${args[2]})\n${args[0]}    Peluang: ${args[3]}%\n",
            pathEmpty: "_Tidak ada jalur evolusi lebih lanjut._"
        },
        rein: {
            desc: "Melakukan reinkarnasi menjadi role baru secara acak.",
            minLevel: "Kamu setidaknya memerlukan 3¥ dan minimal level 8 untuk reinkarnasi.",
            failed: "Reinkarnasi gagal..?\n\n${args[0]}",
            canceled: "Reinkarnasi dibatalkan.",
            success: "*${args[0]}* melakukan reinkarnasi dan terlahir kembali sebagai *${args[1]}*.",
            confirmTitle: "*# Race Reincarnation*\n\nLakukan reinkarnasi? Ini akan mereset Level kamu.",
            confirmFooter: "Pilih opsi dibawah untuk melanjutkan.",
            btnConfirm: "Konfirmasi",
            btnCancel: "Batalkan"
        },
        status: {
            desc: "Melihat kartu identitas kamu.",
            profileTitle: "🎮 *RPG Profile* 🎮",
            profileBody: "👤 Nama: ${args[0]}\n🧬 Role: ${args[1]}\n🆔 ID: ${args[2]}\n⭐ Level: ${args[3]}\n📊 Exp: ${args[4]}/${args[5]}\n💰 Yen: ${args[6]}¥\n🛡️ Trust: ${args[7]}%\n💬 Pesan: ${args[8]}\n⚙️ Command: ${args[9]}\n⚠️ Warns: ${args[10]}\n🎲 Gacha: ${args[11]}\n✨ Reinc: ${args[12]}\n🏆 Achieve: ${args[13]}${args[14]}${args[15]}"
        },
        whois: {
            desc: "Melihat kartu identitas pengguna lain.",
            notRegistered: "❌ User yang kamu ${args[0]} belum terdaftar di database RPG.",
            notFound: "❌ User dengan ID/vanity \"${args[0]}\" tidak ditemukan.",
            usage: "📌 *How to use:* ${args[0]}whois <id/vanity/reply/tag>\nExample:\n${args[0]}whois 2\n${args[0]}whois crystal\nOr reply/tag a user's message.",
            profileTitle: "🔍 *Profil ${args[0]}* 🔍"
        }
    },

    // Owner Messages
    owner: {
        addplugin: {
            desc: "Menambahkan plugin dari pesan yang direply.",
            usage: "Syntax: .addplugin <path> [--force]\n(run command while reply a code.)",
            invalidPath: "Parameter path tidak valid.",
            noCode: "Jalankan perintah disaat mereply code, atau gunakan --force untuk membuat file kosong.",
            exists: "Plugin ${args[0]} sudah ada. Gunakan --force untuk menimpa.",
            success: "Plugin ${args[0]} berhasil ${args[1]}.",
            failed: "Gagal menulis file: ${args[0]}"
        },
        cmd: {
            desc: "Mengatur sebuah command.",
            noLoader: "Plugin loader belum siap.",
            notFound: "Perintah \"${args[0]}\" tidak ditemukan.",
            usageBan: "Syntax: .cmd ban <command> <target> <duration> <reason>",
            targetNotFound: "Target tidak ditemukan.",
            invalidDuration: "Parameter durasi tidak valid.",
            banSuccess: "Pengguna *${args[0]}* dilarang menggunakan perintah *${args[1]}* selama *${args[2]}* dengan alasan: ${args[3]}.",
            usageUnban: "Syntax: .cmd unban <command> <target>",
            unbanSuccess: "Akses pengguna menggunakan command *${args[0]}* diaktifkan kembali.",
            notBanned: "Pengguna ini tidak dilarang.",
            usageMaint: "Syntax: .cmd maintenance <command> <on/off> <reason>",
            maintOn: "Perintah ${args[0]} masuk ke mode maintenance",
            maintOff: "Perintah ${args[0]} telah diaktifkan untuk semua orang.",
            manageSuccess: "Perintah *${args[0]}* diatur:\n- Cooldown ${args[1]} detik\n- Yen diperlukan: ${args[2]}¥\n- TF diperlukan: ${args[3]}%",
            disableSuccess: "Perintah *${args[0]}* dimatikan untuk sementara waktu dengan alasan: ${args[1]}.",
            enableSuccess: "Perintah *${args[0]}* diaktifkan kembali.",
            listTitle: "*# CMD Settings*\n${args[0]}"
        },
        delplugin: {
            desc: "Menghapus plugin dari path tujuan.",
            invalidPath: "Path tidak valid.",
            notFound: "File tidak ditemukan.",
            success: "Plugin ${args[0]} dihapus.",
            failed: "Gagal: ${args[0]}"
        },
        getplugin: {
            desc: "Menyalin dan menempel plugin dari path tujuan",
            notFound: "Plugin tidak ditemukan."
        }
    },

    // Misc Messages
    misc: {
        cancel: {
            desc: "Membatalkan sesi aktif.",
            success: "Sesi dibatalkan.",
            noSession: "Kamu tidak memiliki sesi yang sedang aktif."
        },
        help: {
            desc: "Memberikan informasi detail perintah dan memberikan daftar perintah.",
            title: "*# ${args[0]}*",
            usage: "\nGunakan *${args[0]}help <command>* untuk detail perintah.",
            catNotFound: "Kategori \"${args[0]}\" tidak ditemukan atau kosong.",
            detailTitle: "*# Bantuan Perintah*",
            noDesc: "Tidak ada deskripsi.",
            categories: {
                group: "- Grup",
                user: "- Pengguna",
                economy: "- Ekonomi",
                minigame: "- Permainan",
                gacha: "- Gacha",
                owner: "- Owner",
                misc: "- Lainnya",
                tools: "- Alat",
                ai: "- AI",
                search: "- Search",
                download: "- Download",
                stalker: "- Stalker",
                anime: "- Anime"
            },
            labels: {
                command: "Perintah",
                usage: "Cara pakai",
                subcommand: "Subperintah",
                cooldown: "Cooldown",
                trust: "Trust Factor",
                cost: "Biaya Yen",
                disabled: "Perintah ini sedang dinonaktifkan.",
                maintenance: "Perintah ini sedang maintenance.",
                seconds: "detik",
                allCommands: "Daftar Perintah",
                categoryMenu: "Menu ${args[0]}"
            }
        },
        ping: {
            desc: "Tes response Milky.",
            infoTitle: "- Milky Information:\n",
            runtime: "> Runtime : ${args[0]}\n",
            latency: "> Latency : ${args[0]} ms\n",
            time: "> Time : ${args[0]}\n\n",
            memoryTitle: "- Memory\n",
            rss: "> RSS : ${args[0]} MB\n",
            heap: "> Heap : ${args[0]} / ${args[1]} MB\n\n",
            systemTitle: "- System\n",
            cpu: "> CPU : ${args[0]} (${args[1]} cores)\n",
            platform: "> Platform : ${args[0]}\n",
            node: "> Node : ${args[0]}"
        },
        report: {
            desc: "Melaporkan bug dari bot atau pengguna lain yang melanggar aturan ke owner.",
            activeSession: "Kamu masih punya sesi laporan yang belum selesai.",
            chooseTitle: "*# Milky Report*\n\nApa yang ingin kamu laporkan?",
            chooseFooter: "Pilih opsi dibawah untuk melanjutkan.",
            btnBug: "Laporkan Bug",
            btnUser: "Laporkan User",
            btnCancel: "Batalkan",
            cancel: "Sesi Laporan telah dibatalkan.",
            bugDesc: "*# Report Bug*\n\nJelaskan apa yang terjadi dan apa kendala yang kamu alami.",
            userDesc: "Siapa yang ingin kamu laporkan? Kirim nomor ID user tersebut.",
            tooShort: "Deskripsi kamu terlalu pendek untuk dilaporkan kepada owner!",
            noOwner: "Owner belum diatur.",
            success: "Laporan berhasil dikirim, jika laporanmu dikonfirmasi, kamu akan mendapatkan reward, terima kasih!",
            userIdInvalid: "Parameter tidak valid. Nomor ID tidak sesuai.",
            userNotFound: "Parameter tidak valid. Pengguna dengan nomor ID ${args[0]} tidak ditemukan.",
            userReason: "*# Report User*\n\nKamu akan melaporkan:\n- ID: #${args[0]}\n- Username: ${args[1]}\n- Vanity: ${args[2]}\n- Bio: ${args[3]}\n\nBerikan alasan yang jelas kenapa kamu melaporkan user ini.",
            ownerReviewConfirm: "Silakan berikan pesan feedback untuk pelapor:",
            ownerReviewReject: "Silakan berikan alasan penolakan untuk pelapor:",
            ownerRewardSyntax: "Feedback berhasil dicatat, berikan dia reward.\nSyntax: yen|exp|tf",
            ownerRejectSuccess: "Laporan ini berhasil ditolak dan pesan berhasil dikirim.",
            ownerInvalidSyntax: "Syntax: yen|exp|tf",
            ownerAcceptSuccess: "Laporan berhasil dikonfirmasi dan reward telah dikirim.",
            notifyReject: "*# Notifikasi Laporan*\n\nLaporan kamu *ditolak* oleh owner.\n> Pesan: ${args[0]}",
            notifyAccept: "*# Notifikasi Laporan*\n\nLaporan kamu *diterima* oleh owner.\n> Pesan: ${args[0]}${args[1]}",
            labels: {
                headerBug: "*# Bug Report*",
                headerUser: "*# User Report*",
                footerReview: "Milky Review System",
                btnConfirm: "Konfirmasi Laporan",
                btnReject: "Tolak Laporan"
            }
        },
        meow: {
            desc: "Tes response Milky.",
            fail: "Gagal merender dummy achievement."
        }
    },

    // User Messages
    user: {
        setav: {
            desc: "Mengatur foto profil pengguna. Dengan cara kamu reply sebuah gambar lalu ketik \".setav\" dan kirim, atau kamu bisa mengirim gambar dengan caption \".setav\".",
            success: "Avatar kamu berhasil diubah.",
            failed: "Parameter avatar gagal. Pastikan format gambar didukung dan ukuran tidak terlalu besar."
        },
        setb: {
            desc: "Mengatur bio profil.",
            invalid: "Paramater tidak valid, bio memiliki simbol yang tidak diperbolehkan. Dan bio setidaknya memiliki 3 sampai 32 karakter.",
            success: "Bio kamu berhasil diubah."
        },
        setbg: {
            desc: "Mengatur foto sampul profil. Dengan cara kamu reply sebuah gambar lalu ketik \".setbg\" dan kirim, atau kamu bisa mengirim gambar dengan caption \".setbg\".",
            success: "Background kamu berhasil diubah.",
            failed: "Paramater background tidak valid. Pastikan format gambar didukung dan ukuran tidak terlalu besar."
        },
        setf: {
            desc: "Mengatur bendera profil dengan ID bendera. Kalau kamu bingung dengan ID bendera, kamu bisa Google dengan keyword \"ID bendera <negara>\", ID bendera biasanya 2 huruf atau 2 huruf tapi terpisah kayak gini (id-id).",
            success: "Bendera kamu berhasil diubah ke *${args[0]}*."
        },
        setn: {
            desc: "Mengatur nama pengguna.",
            invalid: "Paramater tidak valid, nama memiliki simbol yang tidak diperbolehkan. Dan nama setidaknya memiliki 3 sampai 16 karakter.",
            success: "Nama kamu berhasil diubah."
        },
        setv: {
            desc: "Mengatur vanity tag pengguna.",
            invalid: "Paramater tidak valid, vanity memiliki simbol yang tidak diperbolehkan. Dan vanity setidaknya memiliki 3 sampai 12 karakter.",
            used: "Vanity *@${args[0]}* tidak tersedia atau sudah digunakan.",
            success: "Vanity kamu berhasil diubah."
        },
        lang: {
            desc: "Mengubah bahasa utama Milky.",
            success: "Bahasa berhasil diubah ke *${args[0]}*."
        }
    }
};