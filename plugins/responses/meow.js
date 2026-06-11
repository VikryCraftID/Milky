import { renderAchievementCard, renderGTCard } from '../../lib/design.js';
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import logger from '../../lib/logger.js';

/**
 * Generate an accurate waveform from an audio file using FFmpeg PCM extraction.
 * @param {string} audioPath 
 * @returns {Promise<Uint8Array>}
 */
async function generateAccurateWaveform(audioPath) {
    return new Promise((resolve) => {
        // Extract raw PCM 16-bit data, mono, 8000Hz
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

            // Find peak amplitude for normalization
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
                // Scale relative to peak, and apply a 3x boost (clamped to 100)
                waveform[i] = Math.min(100, Math.floor((avg / (peak || 32768)) * 100 * 3) || 0);
            }
            resolve(waveform);
        });
        ffmpeg.stderr.on('data', () => {});
    });
}

export default {
    command: 'meow',
    aliases: ['meow-vn', 'meow-gatch', 'meow-tales'],
    category: 'misc',
    get description() { return L('misc.meow.desc'); },
    syntax: '.meow-[subcommand]',
    subcommand: '',
    async run(context) {
        const { m, args, reply, naze, command } = context;
        const sub = (args[0] || '').toLowerCase();
        
        if (command === 'meow') {
            await reply('meow.');
        };
        
        // Logic for .nya-gatch or .nya gatch or aliases
        if (command === 'meow-gatch') {
            const dummyUser = { userId: 0 };
            const dummyAchievement = { name: "White Liquid?!", stars: 5 };
            
            try {
                const buffer = await renderAchievementCard(dummyUser, dummyAchievement);
                return await naze.sendMessage(m.chat, {
                    image: buffer,
                    mentions: [m.sender]
                }, { quoted: m });
            } catch (err) {
                logger.error('MEOW', 'Nya Gatch Error: ' + err.message);
                return reply(L('misc.meow.fail'));
            }
        }

        // Logic for .meow-tales
        if (command === 'meow-tales') {
            const dummyUser = { userId: 0 };
            const dummyCard = {
                id: 999,
                name: "Miya",
                placename: "miya",
                dialogue: ["Wow! Everything twinkles so brightly here!",
"Hello, everyone! It's Miya! Do you have a headache every morning?",
"I bet it's the doing of ghosts!"],
                element: "fire",
                class: "support",
                tier: "unique",
                stars: 3
            };
            
            try {
                const buffer = await renderGTCard(dummyCard, dummyUser);
                return await naze.sendMessage(m.chat, {
                    image: buffer,
                    mentions: [m.sender]
                }, { quoted: m });
            } catch (err) {
                logger.error('MEOW', 'Meow Tales Error: ' + err.message);
                return reply(L('misc.meow.fail'));
            }
        }
        
        // Logic for .nya-vn or .nya vn
        if (command === 'meow-vn') {
            try {
                const audioPath = path.resolve(process.cwd(), 'assets/randtest/crazy.mp3');
                if (!fs.existsSync(audioPath)) return reply('Audio file not found: assets/randtest/crazy.mp3');
                
                const tempOutput = path.join(process.cwd(), 'database/temp', `vn-${Date.now()}.ogg`);
                
                // Convert to OGG Opus using FFmpeg with VN-like settings
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i "${audioPath}" -ac 1 -ar 16000 -c:a libopus -b:a 12k -vbr on -vn "${tempOutput}"`, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                if (!fs.existsSync(tempOutput)) throw new Error('Conversion failed, output file not found.');

                const { generateWAMessageFromContent, prepareWAMessageMedia } = await import('baileys');
                
                // Prepare the media upload
                const media = await prepareWAMessageMedia({ 
                    audio: { url: tempOutput }, 
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true 
                }, { upload: naze.waUploadToServer });

                // Generate accurate waveform from the original audio
                const waveform = await generateAccurateWaveform(audioPath);
                
                // Construct the audio message with injected waveform
                const audioMsg = { 
                    audioMessage: { 
                        ...media.audioMessage, 
                        waveform,
                        ptt: true 
                    } 
                };

                // Wrap into a full WA message structure
                const message = generateWAMessageFromContent(m.chat, audioMsg, {
                    quoted: m,
                    userJid: naze.user.id
                });

                // Send via relay
                await naze.relayMessage(m.chat, message.message, { 
                    messageId: message.key.id
                });

                // Cleanup after a short delay
                setTimeout(() => {
                    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                }, 5000);
            } catch (err) {
                logger.error('MEOW', 'Nya VN Error: ' + err.message);
                return reply('Failed to send VN.');
            }
        }
    }
};