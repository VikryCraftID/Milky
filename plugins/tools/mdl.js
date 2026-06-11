import axios from 'axios';
import crypto from 'crypto';
import fetch from 'node-fetch';

const UA = 'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0';

// --- YT SCRAPERS (from play.js logic) ---
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
        const dl = await axios.post(`https://${cdn}/download`, { id, downloadType: format === 'mp3' ? 'audio' : 'video', quality: format === 'mp3' ? '128' : '720', key: dec.key }, { headers: { 'user-agent': UA } });
        return { dl: dl.data.data.downloadUrl };
    } catch (e) { return null; }
}

async function ytmp3wtfDownload(url, type) {
    const page = type === 'mp3' ? 'button' : 'vidbutton';
    try {
        const r = await fetch(`https://v2.ytmp3.wtf/${page}/?url=${encodeURIComponent(url)}`, { headers: { 'user-agent': UA } });
        const html = await r.text();
        const token = {
            phpsessid: r.headers.get('set-cookie')?.match(/PHPSESSID=([^;]+)/)?.[1],
            tokenId: html.match(/'token_id':\s*'([^']+)'/)?.[1],
            validTo: html.match(/'token_validto':\s*'([^']+)'/)?.[1]
        };
        const endpoint = type === 'mp3' ? 'convert' : 'vidconvert';
        const start = await fetch(`https://v2.ytmp3.wtf/${endpoint}/`, {
            method: 'POST',
            headers: { 'user-agent': UA, 'cookie': `PHPSESSID=${token.phpsessid}`, 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ url, convert: 'gogogo', token_id: token.tokenId, token_validto: token.validTo })
        });
        const job = await start.json();
        if (!job.jobid) return null;
        for (let i = 0; i < 10; i++) {
            await new Promise(res => setTimeout(res, 2000));
            const check = await fetch(`https://v2.ytmp3.wtf/${endpoint}/?jobid=${job.jobid}&time=${Date.now()}`, { headers: { 'user-agent': UA, 'cookie': `PHPSESSID=${token.phpsessid}` } });
            const res = await check.json();
            if (res.ready && res.dlurl) return { dl: res.dlurl };
        }
    } catch (e) { return null; }
    return null;
}

// --- FB SCRAPER ---
const unescapeHtml = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
async function fbDownload(url) {
    try {
        const body = new URLSearchParams({ k_exp: Math.floor(Date.now() / 1000) + 3600, k_token: Math.random().toString(16).slice(2), p: 'home', q: url, lang: 'en', v: 'v2', w: '' });
        const r = await fetch('https://fbdown.to/api/ajaxSearch', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'user-agent': UA, 'x-requested-with': 'XMLHttpRequest' }, body: body.toString() });
        const j = await r.json();
        if (j.status !== 'ok' || !j.data) return null;
        const videoUrl = j.data.match(/https:\/\/dl\.snapcdn\.app\/download\?token=[^"]+/)?.[0] || '';
        const audioUrl = j.data.match(/id="audioUrl"\s+value="([^"]+)"/)?.[1] || '';
        return { video: unescapeHtml(videoUrl), audio: unescapeHtml(audioUrl) };
    } catch (e) { return null; }
}

export default {
    command: 'mdl',
    category: 'tools',
    get description() { return L('tools.mdl.desc'); },
    syntax: 'mdl <url>',
    aliases: ['ytdl', 'ytmp3', 'ytmp4', 'fbdl', 'fb', 'fbmp3', 'fbmp4', 'igdl', 'ig', 'igmp3', 'igmp4', 'ttdl', 'tiktok', 'ttmp3', 'ttmp4'],
    async run(context) {
        const { m, naze, reply, args, command, prefix } = context;
        let url = args[0];
        if (!url) return reply(L('tools.mdl.invalidUrl'));

        let forceType = null;
        if (args.includes('--mp3')) forceType = 'mp3';
        if (args.includes('--mp4')) forceType = 'mp4';

        let requestType = forceType;
        if (!requestType) {
            if (['ytmp3', 'fbmp3', 'igmp3', 'ttmp3'].includes(command)) requestType = 'mp3';
            if (['ytmp4', 'fbmp4', 'igmp4', 'ttmp4'].includes(command)) requestType = 'mp4';
        }

        let platform = '';
        if (/youtube\.com|youtu\.be/i.test(url)) platform = 'yt';
        else if (/facebook\.com|fb\.watch/i.test(url)) platform = 'fb';
        else if (/instagram\.com/i.test(url)) platform = 'ig';
        else if (/tiktok\.com/i.test(url)) platform = 'tiktok';
        else return reply(L('tools.mdl.notSupported'));

        const generalCmds = ['mdl', 'ytdl', 'fb', 'fbdl', 'ig', 'igdl', 'tiktok', 'ttdl'];
        if (generalCmds.includes(command) && !requestType) {
            await m.react('✅');
            const platformName = { yt: 'YouTube', fb: 'Facebook', ig: 'Instagram', tiktok: 'TikTok' }[platform];
            return naze.sendButtonMsg(m.chat, {
                text: L('tools.mdl.title', platformName),
                footer: 'Milky Downloader',
                buttons: [
                    { buttonId: `${prefix}${command} ${url} --mp3`, buttonText: { displayText: 'Audio (MP3)' }, type: 1 },
                    { buttonId: `${prefix}${command} ${url} --mp4`, buttonText: { displayText: 'Video (MP4)' }, type: 1 }
                ]
            }, { quoted: m });
        }

        await m.react('⏳');
        const isMp3 = requestType === 'mp3';

        try {
            if (platform === 'yt') {
                let result = await savetubeDownload(url, isMp3 ? 'mp3' : 'mp4');
                if (!result) result = await ytmp3wtfDownload(url, isMp3 ? 'mp3' : 'mp4');
                if (!result) throw L('tools.mdl.failYt');
                if (isMp3) await naze.sendMessage(m.chat, { audio: { url: result.dl }, mimetype: "audio/mpeg" }, { quoted: m });
                else await naze.sendMessage(m.chat, { video: { url: result.dl }, caption: L('tools.mdl.successYt') }, { quoted: m });
            } 
            else if (platform === 'fb') {
                const res = await fbDownload(url);
                if (!res) throw L('tools.mdl.failFb');
                const dlUrl = isMp3 ? res.audio : res.video;
                if (!dlUrl) throw L('tools.mdl.failFormat', requestType.toUpperCase());
                if (isMp3) await naze.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: "audio/mpeg" }, { quoted: m });
                else await naze.sendMessage(m.chat, { video: { url: dlUrl }, caption: L('tools.mdl.successFb') }, { quoted: m });
            }
            else if (platform === 'ig') {
                const res = await axios.post('https://vdraw.ai/api/v1/instagram/ins-info', { url, type: 'video' }, { headers: { 'Content-Type': 'application/json' } });
                const videoUrl = res.data?.data?.info?.[0]?.url;
                if (!videoUrl) throw L('tools.mdl.failIg');
                if (isMp3) await naze.sendMessage(m.chat, { audio: { url: videoUrl }, mimetype: "audio/mpeg" }, { quoted: m });
                else await naze.sendMessage(m.chat, { video: { url: videoUrl }, caption: L('tools.mdl.successIg') }, { quoted: m });
            }
            else if (platform === 'tiktok') {
                const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA, Origin: 'https://tikdown.com', Referer: 'https://tikdown.com/' };
                const first = await axios.post('https://tikdown.com/proxy.php', `url=${encodeURIComponent(url.trim())}`, { headers });
                const items = first.data?.api?.mediaItems || [];
                const target = isMp3 ? items.find(v => v.type === 'Music') : items.find(v => v.type === 'Video');
                if (!target?.mediaUrl) throw L('tools.mdl.failTiktok');
                const res = await axios.post('https://tikdown.com/proxy.php', `url=${encodeURIComponent(target.mediaUrl)}`, { headers });
                if (!res.data?.api?.fileUrl) throw L('tools.mdl.failTiktokDl');
                if (isMp3) await naze.sendMessage(m.chat, { audio: { url: res.data.api.fileUrl }, mimetype: "audio/mp4" }, { quoted: m });
                else await naze.sendMessage(m.chat, { video: { url: res.data.api.fileUrl }, caption: L('tools.mdl.successTiktok') }, { quoted: m });
            }
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
            reply(L('system.error'));
        }
    }
};
