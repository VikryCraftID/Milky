import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile } from 'fs'
import logger from './lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function start() {
    console.clear();
    logger.startup('Amazing WhatsApp Bot');

	let args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)]
	let p = spawn(process.argv[0], args, {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc']
	}).on('message', data => {
		if (data === 'reset') {
			logger.warn('SYSTEM', 'Restarting process...');
			p.kill()
			setTimeout(() => {
				start()
			}, 1000);
		} else if (data === 'uptime') {
			p.send(process.uptime())
		}
	}).on('exit', code => {
		if (code !== 0 && code !== 2) { 
			logger.error('SYSTEM', `Exited with code: ${code}. Respawning in 5 seconds...`);
			setTimeout(() => {
				start()
			}, 5000);
		} else if (code === 2) {
            start();
        } else {
			console.log('\n' + logger.gradient(' ( ^ω^ ) Process exited cleanly. See you again, Master! \n'));
			process.exit(0)
		}
	})
}
start()