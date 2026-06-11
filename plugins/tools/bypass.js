import fetch from 'node-fetch';
import logger from '../../lib/logger.js';

const SITE_KEY = '0x4AAAAAAAGzw6rXeQWJ_y2P';
const BASE_URL = 'https://bypass.city/';
const API_URL = 'https://api2.bypass.city/bypass';
const CF_API_URL = 'https://api.nexray.eu.cc/tools/bypass/cf';

//https://api.nexray.eu.cc/tools/bypass/cf?url=aaa&siteKey=aaa&mode=turnstile-max

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
    command: 'bypass',
    category: 'tools',
    description: 'Melewati URL/Link shortener tertentu dan memberikan hasilnya secara langsung.',
    syntax: 'bypass <url>',
    aliases: ['shortlink'],
    async run(context) {
        const { m, naze, text, prefix, command } = context;

        if (!text) {
            return m.reply(L('system.usage', prefix, command));
        }

        try {
            new URL(text);
        } catch {
            return m.reply(L('system.usage', prefix, command));
        }

        await m.react('⏳');

        try {
            // Step 1: Ambil token Cloudflare
            const cf = await fetch(CF_API_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    url: BASE_URL,
                    siteKey: SITE_KEY,
                    mode: 'turnstile-min'
                })
            }).then(r => r.json());

            if (!cf?.result?.token) {
               await m.react('❌');
              return m.reply(L('tools.bypass.failedToken'));
            }
            
            const cfToken = cf.result.token;

            // Step 2: Proses Bypass
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'origin': 'https://bypass.city',
                    'referer': 'https://bypass.city/',
                    'token': cfToken,
                    'x-captcha-provider': 'TURNSTILE'
                },
                body: JSON.stringify({ url: text })
            }).then(r => r.json());

            if (!res?.data) {
                await m.react('❌');
                return m.reply(L('tools.bypass.failedBypass'));
            }
await m.react('✅');

let msg = `*# Milky${' ' + res.name || ''} Bypass*\n\n`;
// msg += `- *Platform:* ${res.name || 'Unknown'}\n`;
// msg += `🔗 *URL Asli:* ${text}\n`;

const buttons = [];

// Jika ada hasil link utama
if (res.data && /^https?:\/\//.test(res.data)) {
    buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
            display_text: L('tools.bypass.btnDownload'),
            url: res.data,
            merchant_url: res.data
        })
    });
} else if (res.data) {
    msg += `- *${L('tools.bypass.labels.result')}:* ${res.data}\n`;
}

// Jika ada konten paste
if (res.isPaste && res.paste) {
    buttons.push({
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
            display_text: L('tools.bypass.btnCopy'),
            id: String(Date.now()),
            copy_code: res.paste
        })
    });
}

// Jika ada informasi file tambahan (embedData)
if (Array.isArray(res.embedData) && res.embedData.length) {
    msg += `${L('tools.bypass.labels.info')}`;
    res.embedData.forEach((v, i) => {
        msg += `\n- *${v.title || 'Unknown'}*`;
        msg += `\n- ${L('tools.bypass.labels.from')} ${v.site}`;
        msg += `\n- ${L('tools.bypass.labels.size')} ${v.size ? formatFileSize(v.size) : '-'}`;
    });
}

if (buttons.length > 0) {
    return naze.sendListMsg(m.chat, {
        text: msg,
        buttons: buttons
    }, { quoted: m });
} else {
    return m.reply(msg);
}

        } catch (error) {
            logger.error('TOOLS', 'BypassErr: ' + error.message);
            await m.react('❌');
            m.reply(L('tools.bypass.error'));
        }
    }
};
