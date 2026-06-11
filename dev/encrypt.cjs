const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const inputFile = path.join(__dirname, '../index.js');
const outputFile = path.join(__dirname, '../index.protected.js');

console.log('🛡️ Starting encryption for index.js...');

try {
    const sourceCode = fs.readFileSync(inputFile, 'utf8');

    const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayThreshold: 1,
        splitStrings: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    }).getObfuscatedCode();

    fs.writeFileSync(outputFile, obfuscatedCode);
    
    console.log('✅ Encryption success!');
    console.log(`📂 Protected file saved to: ${outputFile}`);
    console.log('\n💡 Tip: You can now rename index.protected.js to index.js and use it on your hosting.');
} catch (err) {
    console.error('❌ Encryption failed:', err.message);
}