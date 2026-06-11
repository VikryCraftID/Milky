import axios from 'axios';
import crypto from 'crypto';
import fetch from 'node-fetch';
import yts from 'yt-search';

const UA = 'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0';

async function savetubeDownload(url, format) {
    const ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1];
    if (!id) return null;

    try {
        const cdnRes = await axios.get("https://media.savetube.vip/api/random-cdn");
        const cdn = cdnRes.data.cdn;

        const info = await axios.post(`https://${cdn}/v2/info`, {
            url: `https://www.youtube.com/watch?v=${id}`
        }, {
            headers: { 'user-agent': UA, 'origin': 'https://yt.savetube.me' }
        });

        const enc = Buffer.from(info.data.data, 'base64');
        const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(ky, 'hex'), enc.slice(0, 16));
        const dec = JSON.parse(Buffer.concat([decipher.update(enc.slice(16)), decipher.final()]).toString());

        const dl = await axios.post(`https://${cdn}/download`, {
            id,
            downloadType: format === 'mp3' ? 'audio' : 'video',
            quality: format === 'mp3' ? '128' : format,
            key: dec.key
        }, { headers: { 'user-agent': UA } });

        return { dl: dl.data.data.downloadUrl };
    } catch (e) {
        return null;
    }
}

async function ytmp3wtfDownload(url, type) {
    const page = type === 'mp3' ? 'button' : 'vidbutton';

    try {
        const r = await fetch(`https://v2.ytmp3.wtf/${page}/?url=${encodeURIComponent(url)}`, {
            headers: { 'user-agent': UA }
        });

        const html = await r.text();

        const token = {
            phpsessid: r.headers.get('set-cookie')?.match(/PHPSESSID=([^;]+)/)?.[1],
            tokenId: html.match(/'token_id':\s*'([^']+)'/)?.[1],
            validTo: html.match(/'token_validto':\s*'([^']+)'/)?.[1]
        };

        const endpoint = type === 'mp3' ? 'convert' : 'vidconvert';

        const start = await fetch(`https://v2.ytmp3.wtf/${endpoint}/`, {
            method: 'POST',
            headers: {
                'user-agent': UA,
                'cookie': `PHPSESSID=${token.phpsessid}`,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                url,
                convert: 'gogogo',
                token_id: token.tokenId,
                token_validto: token.validTo
            })
        });

        const job = await start.json();
        if (!job.jobid) return null;

        for (let i = 0; i < 10; i++) {
            await new Promise(res => setTimeout(res, 2000));

            const check = await fetch(`https://v2.ytmp3.wtf/${endpoint}/?jobid=${job.jobid}&time=${Date.now()}`, {
                headers: {
                    'user-agent': UA,
                    'cookie': `PHPSESSID=${token.phpsessid}`
                }
            });

            const res = await check.json();
            if (res.ready && res.dlurl) {
                return { dl: res.dlurl };
            }
        }
    } catch (e) {
        return null;
    }

    return null;
}

export default {
    command: 'play',
    category: 'tools',
    get description() { return L('tools.play.desc'); },
    syntax: 'play <title/url>',
    aliases: ['p'],
    async run(context) {
        const { m, naze, text, prefix, command } = context;

        if (!text) {
            return m.reply(L('tools.play.invalid'));
        }

        await m.react('⏳');

        let url = text.split(" ")[0];
        let isYoutubeUrl = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i.test(url);
        let info = {};

        try {
            if (isYoutubeUrl) {
                const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)?.[1];
                const search = await yts({ videoId });

                info = {
                    title: search.title,
                    thumbnail: search.thumbnail,
                    duration: search.timestamp,
                    author: search.author?.name || search.author,
                    url: search.url
                };
            } else {
                const search = await yts(text);
                const video = search.videos[0];
                if (!video) throw L('tools.play.failedUrl');

                url = video.url;
                info = {
                    title: video.title,
                    thumbnail: video.thumbnail,
                    duration: video.timestamp,
                    author: video.author?.name || video.author,
                    url: video.url
                };
            }
        } catch (e) {
            await m.react('❌');
            return m.reply(L('tools.play.failedInfo'));
        }

        let result = null;

        // Download servers...
        result = await savetubeDownload(url, 'mp3');
        if (!result) result = await ytmp3wtfDownload(url, 'mp3');
        if (!result) {
            try {
                let endpoint = `https://api.deline.web.id/downloader/ytmp3?url=${url}`;
                const res = await axios.get(endpoint);
                if (res.data?.result?.dlink) result = { dl: res.data.result.dlink };
            } catch {}
        }

        if (!result) {
            await m.react('❌');
            return m.reply(L('tools.play.failedServer'));
        }

        await m.react('✅');
        
        // --- FINAL STRATEGY: NO THUMBNAIL ---
        // Kirim audio dengan AdReply Teks-Saja
        await naze.sendMessage(
            m.chat,
            {
                audio: { url: result.dl },
                mimetype: "audio/mpeg",
                fileName: `${info.title}.mp3`,
                /*contextInfo: {
                    externalAdReply: {
                        title: info.title,
                        body: `Publisher: ${info.author || "-"}`,
                        // TIDAK ADA THUMBNAIL SAMA SEKALI
                        mediaType: 1,
                        sourceUrl: url 
                    }
                }*/
            },
            { quoted: m }
        );

        // Kirim Tombol CTA secara terpisah
        await naze.sendListMsg(m.chat, {
            text: `> *${info.title}*`,
            footer: `ㅤ Duration: ${info.duration || "-"}`,
            buttons: [
                {
                    name: "cta_url",
                    buttonParamsJson: {
                        display_text: "Download Link",
                        url: result.dl,
                        merchant_url: result.dl
                    }
                }
            ]
        });
    }
};