import axios from 'axios';
import crypto from 'crypto';
import fetch from 'node-fetch';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import logger from '../../lib/logger.js';

const UA = 'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0';

/**
 * Generate an accurate waveform from an audio file using FFmpeg PCM extraction.
 */
async function generateAccurateWaveform(audioPath) {
    return new Promise((resolve) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', audioPath,
            '-ac', '1',
            '-ar', '8000',
            '-f', 's16le',
            '-'
        ]);

        let pcmData = [];
        ffmpeg.stdout.on('data', (chunk) => pcmData.push(chunk));
        ffmpeg.on('close', () => {
            const buffer = Buffer.concat(pcmData);
            const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2);
            
            const numSegments = 64;
            const segmentSize = Math.floor(samples.length / numSegments);
            const waveform = new Uint8Array(numSegments);

            let peak = 0;
            for (let i = 0; i < samples.length; i++) {
                const abs = Math.abs(samples[i]);
                if (abs > peak) peak = abs;
            }

            for (let i = 0; i < numSegments; i++) {
                let sum = 0;
                for (let j = 0; j < segmentSize; j++) {
                    sum += Math.abs(samples[i * segmentSize + j]);
                }
                const avg = sum / segmentSize;
                waveform[i] = Math.min(100, Math.floor((avg / (peak || 32768)) * 100 * 3) || 0);
            }
            resolve(waveform);
        });
        ffmpeg.stderr.on('data', () => {});
    });
}

async function savetubeDownload(url, format) {
    const ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1];
    if (!id) return null;
    try {
        const cdnRes = await axios.get("https://media.savetube.vip/api/random-cdn");
        const cdn = cdnRes.data.cdn;
        const info = await axios.post(`https://${cdn}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` }, { headers: { 'user-agent': UA, 'origin': 'https://yt.savetube.me' } });
        const enc = Buffer.from(info.data.data, 'base64');
        const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(ky, 'hex'), enc.slice(0, 16));
        const dec = JSON.parse(Buffer.concat([decipher.update(enc.slice(16)), decipher.final()]).toString());
        const dl = await axios.post(`https://${cdn}/download`, { id, downloadType: format === 'mp3' ? 'audio' : 'video', quality: format === 'mp3' ? '128' : format, key: dec.key }, { headers: { 'user-agent': UA } });
        return { dl: dl.data.data.downloadUrl };
    } catch (e) { return null; }
}

async function getNextSong(history) {
    const prompt = `Lupakan obrolan kita sebelumnya dan reset ingatan kamu ataupun latar belakang kamu. Berikan aku rekomendasi lagu selanjutnya dari lagu-lagu yang sebelumnya telah ku putar:\n• ${history.join('\n• ')}\nKamu harus balas dengan judul lagu berserta nama artist dari yang kamu rekomendasikan. Kamu hanya boleh membalas dengan dengan judul lagu, tidak boleh ada tambahan, tidak boleh ada feedback. Dan lagu yang direkomendasikan harus lagu yang sejenis, lagu yang dikenal dan sering didengar oleh banyak orang, boleh dari artist yang sama ataupun berbeda, boleh memiliki genre yang berbeda asalkan lagunya memiliki vibes yang sama dengan lagu terakhir.`;
    try {
        const res = await fetch(`https://api.nexray.eu.cc/ai/gemini?text=${encodeURIComponent(prompt)}`);
        const text = await res.text();
        const cleaned = text.trim().replace(/^"|"$/g, '');
        if (cleaned && cleaned.length > 3) return cleaned;
        return null;
    } catch (e) {
        logger.error('AUTOPLAY', 'AI Recommendation Error: ' + e.message);
        return null;
    }
}

function timeToSeconds(timestamp) {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').reverse();
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
        seconds += parseInt(parts[i]) * Math.pow(60, i);
    }
    return seconds;
}

global.autoplay = global.autoplay || {};

async function startAutoplay(sender, naze, query) {
    const session = global.autoplay[sender];
    if (!session) return;

    try {
        let url = query;
        let isYoutubeUrl = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i.test(url);
        let info = {};

        if (isYoutubeUrl) {
            const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1];
            const search = await yts({ videoId });
            info = { title: search.title, duration: search.timestamp, url: search.url };
        } else {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw "Lagu tidak ditemukan.";
            url = video.url;
            info = { title: video.title, duration: video.timestamp, url: video.url };
        }

        session.history.push(info.title);

        // Download
        let result = await savetubeDownload(url, 'mp3');
        if (!result) {
            try {
                let res = await axios.get(`https://api.deline.web.id/downloader/ytmp3?url=${url}`);
                if (res.data?.result?.dlink) result = { dl: res.data.result.dlink };
            } catch {}
        }

        if (!result) {
            await naze.sendMessage(session.chat, { text: `❌ Gagal mengunduh lagu: ${info.title}. Melompat ke lagu selanjutnya...` });
            const next = await getNextSong(session.history);
            if (next) return startAutoplay(sender, naze, next);
            delete global.autoplay[sender];
            return;
        }

        // Logic VN High Quality
        const tempDir = path.join(process.cwd(), 'database/temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const tempInput = path.join(tempDir, `ap-in-${Date.now()}.mp3`);
        const tempOutput = path.join(tempDir, `ap-out-${Date.now()}.ogg`);

        // Download to local
        const response = await axios({ url: result.dl, method: 'GET', responseType: 'stream' });
        await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(tempInput);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Convert to High Quality OGG Opus
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${tempInput}" -c:a libopus -b:a 128k -vbr on -vn "${tempOutput}"`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Generate waveform
        const waveform = await generateAccurateWaveform(tempInput);
        
        // Gunakan naze.sendMessage secara langsung (lebih tangguh terhadap Connection Closed)
        await naze.sendMessage(session.chat, {
            audio: { url: tempOutput },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            waveform: waveform
        });

        // Cleanup files
        setTimeout(() => {
            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
        }, 15000);

        // Timer Logic
        const durationSec = timeToSeconds(info.duration);
        const triggerIn = Math.max(10, durationSec - 60) * 1000;

        if (session.timerId) clearTimeout(session.timerId);
        session.timerId = setTimeout(async () => {
            if (!global.autoplay[sender]) return;
            const nextQuery = await getNextSong(session.history);
            if (nextQuery) {
                startAutoplay(sender, naze, nextQuery);
            } else {
                await naze.sendMessage(session.chat, { text: "⚠️ Gagal mendapatkan rekomendasi AI. Sesi dihentikan." });
                delete global.autoplay[sender];
            }
        }, triggerIn);

    } catch (e) {
        logger.error('AUTOPLAY', 'Autoplay Loop Error: ' + e.message);
        // Jika error koneksi, tunggu sebentar lalu coba lagi atau stop jika parah
        if (e.message?.includes('Connection Closed') || e.statusCode === 428) {
            logger.info('AUTOPLAY', 'Mendeteksi gangguan koneksi, mencoba ulang dalam 5 detik...');
            await new Promise(r => setTimeout(r, 5000));
            if (global.autoplay[sender]) startAutoplay(sender, naze, query);
        } else {
            if (global.autoplay[sender]) {
                await naze.sendMessage(global.autoplay[sender].chat, { text: `❌ Terjadi kesalahan pada Autoplay: ${e.message || e}` });
                delete global.autoplay[sender];
            }
        }
    }
}

export default {
    command: 'autoplay',
    category: 'tools',
    description: 'Memutar lagu secara otomatis dengan rekomendasi AI dan timer tidur.',
    syntax: 'autoplay <title/url>',
    aliases: ['milkymusic', 'ytplayer'],
    async run(context) {
        const { m, naze, text, sender, reply } = context;

        if (global.autoplay[sender]) {
            return reply("Kamu sudah memiliki sesi Autoplay yang aktif. Gunakan *.cancel* untuk menghentikan.");
        }

        if (!text) return reply("Masukkan judul lagu atau URL YouTube.");

        global.autoplay[sender] = {
            history: [],
            chat: m.chat,
            state: 'wait_timer',
            query: text,
            timerId: null,
            sleepId: null,
            sleepAt: null
        };

        // Kirim List Message untuk Timer Tidur
        await naze.sendListMsg(m.chat, {
            text: "💤 *Autoplay Sleep Timer*\nSilakan pilih berapa lama bot akan memutar lagu sebelum berhenti otomatis.\n\n⚠️ *Penting:* Pastikan kamu sudah mengaktifkan *'Unduh Otomatis Media'* di pengaturan WhatsApp agar lagu dapat terputar lancar saat layar mati.",
            footer: "Milky Autoplay Music",
            title: "Pengaturan Timer",
            buttons: [
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "Pilih Durasi",
                        sections: [{
                            title: "Durasi Tidur",
                            rows: [
                                { header: "15 Menit", title: "Atur timer 15 menit", id: "ap_timer_15" },
                                { header: "30 Menit", title: "Atur timer 30 menit", id: "ap_timer_30" },
                                { header: "1 Jam", title: "Atur timer 60 menit", id: "ap_timer_60" },
                                { header: "1 Jam 30 Menit", title: "Atur timer 90 menit", id: "ap_timer_90" },
                                { header: "2 Jam", title: "Atur timer 120 menit", id: "ap_timer_120" }
                            ]
                        }]
                    })
                }
            ]
        }, { quoted: m });
    },

    async onMessage(context) {
        const { m, naze, sender, text, command, reply, body } = context;

        const isCancel = command === 'cancel' || text?.toLowerCase() === 'cancel' || body?.toLowerCase() === '.cancel';
        if (isCancel && global.autoplay[sender]) {
            const session = global.autoplay[sender];
            if (session.timerId) clearTimeout(session.timerId);
            if (session.sleepId) clearTimeout(session.sleepId);
            delete global.autoplay[sender];
            return m.reply("✅ Sesi Autoplay telah dihentikan.");
        }

        let responseId = '';
        if (m.type === 'interactiveResponseMessage') {
            try {
                const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                responseId = params.id;
            } catch (e) {}
        }

        if (global.autoplay[sender] && global.autoplay[sender].state === 'wait_timer' && responseId.startsWith('ap_timer_')) {
            const minutes = parseInt(responseId.replace('ap_timer_', ''));
            const session = global.autoplay[sender];
            
            session.state = 'playing';
            session.sleepAt = Date.now() + (minutes * 60 * 1000);
            
            await m.reply(`✅ Timer tidur diatur ke *${minutes} menit*. Selamat menikmati musik!`);
            
            session.sleepId = setTimeout(() => {
                if (global.autoplay[sender]) {
                    const s = global.autoplay[sender];
                    if (s.timerId) clearTimeout(s.timerId);
                    
                    const historyText = s.history.map((song, i) => `${i + 1}. ${song}`).join('\n');
                    naze.sendMessage(s.chat, { 
                        text: `🔔 *Sleep Timer:* Waktu habis! Sesi Autoplay dihentikan secara otomatis.\n\n📜 *Riwayat Musik Malam Ini:*\n${historyText}\n\nSelamat tidur, semoga mimpi indah! 💤` 
                    });
                    
                    delete global.autoplay[sender];
                }
            }, minutes * 60 * 1000);

            startAutoplay(sender, naze, session.query);
        }
    }
};