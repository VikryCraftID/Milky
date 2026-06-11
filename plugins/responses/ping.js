import os from 'os';
import logger from '../../lib/logger.js';

function runtime(seconds) {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function tanggal() {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

export default {
    command: 'ping',
    category: 'misc',
    get description() { return L('misc.ping.desc'); },
    syntax: 'ping',
    subcommand: '',
    aliases: ['botstatus', 'statusbot'],
    async run(context) {
        const { reply } = context;
        try {
            const start = performance.now();
            const uptimeStr = runtime(process.uptime());
            const now = tanggal();
            const mem = process.memoryUsage();
            const memUsedMB = (mem.rss / 1024 / 1024).toFixed(2);
            const heapUsedMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
            const heapTotalMB = (mem.heapTotal / 1024 / 1024).toFixed(2);
            const cpuInfo = os.cpus() || [];
            const cpuModel = cpuInfo[0]?.model || "N/A";
            const cpuCount = cpuInfo.length || 0;
            const platform = `${process.platform} ${process.arch}`;
            const nodev = process.version;
            const latencyMs = (performance.now() - start).toFixed(2);
            
            let teks = L('misc.ping.infoTitle');
            teks += L('misc.ping.runtime', uptimeStr);
            teks += L('misc.ping.latency', latencyMs);
            teks += L('misc.ping.time', now);
            teks += L('misc.ping.memoryTitle');
            teks += L('misc.ping.rss', memUsedMB);
            teks += L('misc.ping.heap', heapUsedMB, heapTotalMB);
            teks += L('misc.ping.systemTitle');
            teks += L('misc.ping.cpu', cpuModel, cpuCount);
            teks += L('misc.ping.platform', platform);
            teks += L('misc.ping.node', nodev);

            await reply(teks);
        } catch (err) {
            logger.error('PING', 'Ping Error: ' + err.message);
            await reply(global.mess.error);
        }
    }
};