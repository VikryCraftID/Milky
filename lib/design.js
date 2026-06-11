import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Daftarkan font
const fontDir = path.join(process.cwd(), 'assets', 'font');
const fonts = {
    'SFPR-Black': 'SF-Pro-Rounded-Black.otf',
    'SFPR-Bold': 'SF-Pro-Rounded-Bold.otf',
    'SFPR-Heavy': 'SF-Pro-Rounded-Heavy.otf',
    'SFPR-Light': 'SF-Pro-Rounded-Light.otf',
    'SFPR-Medium': 'SF-Pro-Rounded-Medium.otf',
    'SFPR-Regular': 'SF-Pro-Rounded-Regular.otf',
    'SFPR-Semibold': 'SF-Pro-Rounded-Semibold.otf',
    'SFPR-Thin': 'SF-Pro-Rounded-Thin.otf',
    'SFPR-Ultralight': 'SF-Pro-Rounded-Ultralight.otf',
    'Test': 'gt.ttf'
};

for (const [family, file] of Object.entries(fonts)) {
    const fontPath = path.join(fontDir, file);
    if (fs.existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath, family);
    }
}

function fileExist(p) {
    try { return fs.existsSync(p) } catch { return false }
}

const tierColors = {
    "1": "#808080",
    "2": "#3EAA3E",
    "3": "#36A3D5",
    "4": "#E5AD4D",
    "5": "#FF4444"
};

// ========== FUNGSI HELPER ==========
async function fetchImageWithFallback(url, fallbackPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return await loadImage(buffer);
    } catch (e) {
        console.error(`Gagal meload gambar dari URL (${url}), menggunakan fallback lokal. Error: ${e.message}`);
        return await loadImage(fallbackPath);
    }
}

export function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export function drawCircularImage(ctx, img, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
}

export function cropAndDrawImageRounded(ctx, img, targetWidth, targetHeight, x, y, radius) {
    const imgW = img.width, imgH = img.height;
    const targetAspect = targetWidth / targetHeight;
    const imgAspect = imgW / imgH;
    let cropW, cropH, cropX, cropY;

    if (imgAspect > targetAspect) {
        cropH = imgH;
        cropW = imgH * targetAspect;
        cropX = (imgW - cropW) / 2;
        cropY = 0;
    } else {
        cropW = imgW;
        cropH = imgW / targetAspect;
        cropX = 0;
        cropY = (imgH - cropH) / 2;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + targetWidth - radius, y);
    ctx.quadraticCurveTo(x + targetWidth, y, x + targetWidth, y + radius);
    ctx.lineTo(x + targetWidth, y + targetHeight - radius);
    ctx.quadraticCurveTo(x + targetWidth, y + targetHeight, x + targetWidth - radius, y + targetHeight);
    ctx.lineTo(x + radius, y + targetHeight);
    ctx.quadraticCurveTo(x, y + targetHeight, x, y + targetHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, cropX, cropY, cropW, cropH, x, y, targetWidth, targetHeight);
    ctx.restore();
}

export function cropAndDrawImage(ctx, img, targetWidth, targetHeight, x = 0, y = 0) {
    const imgW = img.width, imgH = img.height;
    const targetAspect = targetWidth / targetHeight;
    const imgAspect = imgW / imgH;
    let cropW, cropH, cropX, cropY;
    if (imgAspect > targetAspect) {
        cropH = imgH;
        cropW = imgH * targetAspect;
        cropX = (imgW - cropW) / 2;
        cropY = 0;
    } else {
        cropW = imgW;
        cropH = imgW / targetAspect;
        cropX = 0;
        cropY = (imgH - cropH) / 2;
    }
    ctx.drawImage(img, cropX, cropY, cropW, cropH, x, y, targetWidth, targetHeight);
}

export function drawText(ctx, text, x, y, fontSize, fontFamily, color, align = 'left', fontWeight = 'normal') {
    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", "Segoe UI", "Arial", sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

export function trustLabel(tf) {
    if (tf >= 90) return 'Trusted';
    if (tf >= 70) return 'Good';
    if (tf >= 40) return 'Untrusted';
    if (tf >= 20) return 'Rude';
    return 'Bad';
}

export async function tintImage(img, color) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0);
    return await loadImage(await canvas.encode('png'));
}

// ========== RENDER GUARDIAN TALES CARD ==========
export async function renderGTCard(card, user) {
    const width = 1208;
    const height = 1440;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gtElementColors = {
        "fire": "#de741e", "water": "#3cf8fa", "earth": "#b2e333",
        "light": "#faf8a6", "basic": "#ffffff", "dark": "#a945f8"
    };
    
    const cardColor = gtElementColors[(card.element || 'basic').toLowerCase()] || "#ffffff";

    const assetsDir = path.join(process.cwd(), 'assets', 'guardian-tales');
    const bgPath = path.join(assetsDir, 'backgrounds', (card.placename || 'default') + '_bg.png');
    const dotsPath = path.join(assetsDir, 'objects', 'dots.png');
    const illustPath = path.join(assetsDir, 'illustrations', (card.placename || 'default') + '_illust.png');
    const logoPath = path.join(assetsDir, 'objects', 'GTLogo.png');
    const shadePath = path.join(assetsDir, 'objects', 'bottom_shadow.png');
    const iconUrl = `https://raw.githubusercontent.com/VikryCraftID/MilkyAssets/main/icons/${card.placename}_icon.png`;
    const iconFallback = path.join(assetsDir, 'icons', 'fallback.png');
    const starPath = path.join(assetsDir, 'objects', 'star.png');
    const pixelPath = path.join(assetsDir, 'heroes', (card.placename || 'default') + '_' + (card.stars || 1) + 'star.png');
    const elementPath = path.join(assetsDir, 'objects', 'element', (card.element || 'basic') + '.png');
    const classPath = path.join(assetsDir, 'objects', 'class', (card.class || 'warrior') + '.png');

    const [heroBg, illust, shadow, logo, dot, heroProfile, star, heroPixel, hElement, hClass] = await Promise.all([
        loadImage(fileExist(bgPath) ? bgPath : path.join(assetsDir, 'backgrounds', 'fallback.png')),
        loadImage(fileExist(illustPath) ? illustPath : path.join(assetsDir, 'illustrations', 'fallback.png')),
        loadImage(shadePath),
        loadImage(logoPath),
        loadImage(dotsPath),
        fetchImageWithFallback(iconUrl, iconFallback),
        loadImage(starPath),
        loadImage(fileExist(pixelPath) ? pixelPath : path.join(assetsDir, 'heroes', 'fallback.png')),
        loadImage(elementPath),
        loadImage(classPath)
    ]);

    const heroName = (card.title ? card.title + ' ' : '') + (card.name || 'Unknown');
    const heroTier = (card.tier || 'Common').charAt(0).toUpperCase() + (card.tier || 'Common').slice(1);
    const dialogues = card.dialogue || ["..."];
    const heroDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    const heroID = card.id || '0';

    ctx.drawImage(heroBg, 0, -250, 1208, 1812);
    ctx.save();
    ctx.filter = 'blur(12px)';
    ctx.drawImage(heroBg, 0, -250, 1208, 1812);
    ctx.restore();

    const dotTint = await tintImage(dot, '#ffffff');
    ctx.drawImage(dotTint, 0, 0);

    const illustScale = 0.6;
    const illustW = illust.width * illustScale;
    const illustH = illust.height * illustScale;
    const illustX = (-width / 2) + (card.offsetCardX || 0);
    const illustY = (-height / 4) + (card.offsetCardY || 0);

    // Slanted Rect for Profile
    const rectX = 400;
    const rectY = 400;
    const rectWidth = 1000;
    const rectHeight = 250;
    const rectAngle = -20 * Math.PI / 180;

    ctx.save();
    ctx.translate(rectX + rectWidth / 2, rectY + rectHeight / 2);
    ctx.rotate(rectAngle);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.rect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
    ctx.clip();
    ctx.drawImage(illust, illustX - 650, illustY - 500, illustW * 1.15, illustH * 1.15);
    ctx.restore();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.60)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 100;
    ctx.shadowOffsetY = 80;
    ctx.drawImage(illust, illustX + 50, illustY, illustW, illustH);
    ctx.restore();

    ctx.drawImage(shadow, 0, 0);
    const logoScale = 0.6;
    ctx.drawImage(logo, 5, 35, logo.width * logoScale, logo.height * logoScale);

    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-100, 1000, 1470, 55);
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '30px Test';
    ctx.fillText(heroDialogue, 604, 1038);
    ctx.restore();

    const infoX = -50;
    const infoY = -100;
    ctx.save();
    ctx.scale(1.1, 1.1);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#000000';
    roundRect(ctx, 890 + infoX, 1130 + infoY, 180, 100, 20);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 10;
    ctx.strokeStyle = cardColor;
    roundRect(ctx, 890 + infoX, 1130 + infoY, 180, 100, 20);
    ctx.stroke();

    ctx.globalAlpha = 0.75;
    roundRect(ctx, 888 + infoX, 1250 + infoY, 60, 60, 15);
    ctx.fill();
    roundRect(ctx, 1012.5 + infoX, 1250 + infoY, 60, 60, 15);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 6;
    ctx.strokeStyle = cardColor;
    roundRect(ctx, 888 + infoX, 1250 + infoY, 60, 60, 15);
    ctx.stroke();
    roundRect(ctx, 1012.5 + infoX, 1250 + infoY, 60, 60, 15);
    ctx.stroke();

    ctx.globalAlpha = 0.75;
    roundRect(ctx, 155 + infoX, 1130 + infoY, 650, 180, 30);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 12;
    ctx.strokeStyle = cardColor;
    roundRect(ctx, 155 + infoX, 1130 + infoY, 650, 180, 30);
    ctx.stroke();

    const boxSize = 200;
    const borderThickness = 6;
    const iconPadding = 8;
    const innerIconSize = boxSize - (iconPadding * 2);
    const gradx = 100 + infoX;
    const grady = 1120 + infoY;
    
    ctx.globalAlpha = 1;
    ctx.shadowColor = cardColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = cardColor;
    roundRect(ctx, gradx - borderThickness, grady - borderThickness, boxSize + (borderThickness * 2), boxSize + (borderThickness * 2), 30 + borderThickness);
    ctx.fill();
    
    const overlayGradient = ctx.createLinearGradient(0, grady - borderThickness, 0, grady + boxSize + borderThickness);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = overlayGradient;
    roundRect(ctx, gradx - borderThickness, grady - borderThickness, boxSize + (borderThickness * 2), boxSize + (borderThickness * 2), 30 + borderThickness);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    const innerRadius = Math.max(0, 30 - iconPadding);
    roundRect(ctx, gradx + iconPadding, grady + iconPadding, innerIconSize, innerIconSize, innerRadius);
    ctx.clip();
    ctx.drawImage(heroProfile, gradx + iconPadding, grady + iconPadding, innerIconSize, innerIconSize);
    ctx.restore();

    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    // Character Title (Small, Gray, Above Name)
    if (card.title) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '22px Test';
        ctx.fillText(card.title, 330 + infoX, 1172 + infoY);
        ctx.restore();
    }

    ctx.font = '40px Test';
    ctx.fillText(card.name, 328 + infoX, 1205 + infoY);
    
    ctx.textAlign = 'center';
    ctx.fillText('#' + heroID, 980 + infoX, 1180 + infoY);
    ctx.font = '18px "SFPR-Semibold"';
    const formattedUserId = String(user.userId || 0).padStart(5, '0');
    ctx.fillText(`Owned by #${formattedUserId}`, 980 + infoX, 1205 + infoY);
    ctx.drawImage(hElement, 1023.5 + infoX, 1260 + infoY, 40, 40);
    ctx.drawImage(hClass, 898 + infoX, 1260 + infoY, 40, 40);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.font = '20px Test';
    ctx.fillText(heroTier, 330 + infoX, 1235 + infoY);

    const starScale = 0.04;
    const starXOffset = 320 + infoX;
    const starYOffset = 1245 + infoY;
    const starPathNew = path.join(assetsDir, 'objects', 'star-new.png');
    const starImgL = await loadImage(fileExist(starPathNew) ? starPathNew : starPath);
    
    const starConfig = {
        myth: { isGradient: true, color1: '#fa226d', color2: '#fff15d', glow: '#ff4444' },
        ascent: { isGradient: true, color1: '#6cf2b7', color2: '#e4fe39', glow: '#6bf2b7' },
        collab: { isGradient: false, color1: '#ffb4ef', glow: '#ffb4ef' },
        unique: { isGradient: false, color1: '#fdee6f', glow: '#fdee6f' },
        rare: { isGradient: false, color1: '#94ebff', glow: '#94ebff' },
        normal: { isGradient: false, color1: '#f49366', glow: '#f49366' }
    };
    
    const tierKey = (card.tier || 'unique').toLowerCase();
    const config = starConfig[tierKey] || starConfig['unique'];
    
    const starW = starImgL.width * starScale;
    const starH = starImgL.height * starScale;

    const starCanvas = createCanvas(starImgL.width, starImgL.height);
    const sCtx = starCanvas.getContext('2d');
    
    if (config.isGradient) {
        const starGradient = sCtx.createLinearGradient(0, 0, 0, starImgL.height);
        starGradient.addColorStop(0, config.color1);
        starGradient.addColorStop(1, config.color2);
        sCtx.fillStyle = starGradient;
    } else {
        sCtx.fillStyle = config.color1;
    }
    sCtx.fillRect(0, 0, starImgL.width, starImgL.height);
    sCtx.globalCompositeOperation = 'destination-in';
    sCtx.drawImage(starImgL, 0, 0);
    const coloredStar = await loadImage(await starCanvas.encode('png'));

    ctx.shadowColor = config.glow;
    ctx.shadowBlur = 15;
    
    // Loop based on card.stars to support 6 stars (aligned left naturally)
    for (let i = 0; i < card.stars; i++) {
        ctx.drawImage(coloredStar, starXOffset + (i * 30), starYOffset, starW, starH);
    }
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.drawImage(heroPixel, 580 + infoX + (card.offsetSpriteX || 0), 1073 + infoY + (card.offsetSpriteY || 0), 235, 235);
    ctx.restore();

    return await canvas.encode('png');
}

// ========== RENDER GUARDIAN TALES INVENTORY (MASTERPIECE VERSION) ==========
/**
 * @param {object} user - User object from DB
 * @param {array} cards - Array of 10 card objects for the current page
 * @param {number} page - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {function} getCardInfo - Helper function to get full card data
 * @param {number} totalWorth - Pre-calculated total value of entire collection
 */
export async function renderGTInventory(user, cards, page, totalPages, getCardInfo, totalWorth = 0) {
    const width = 1450;
    const height = 1000;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const assetsDir = path.join(process.cwd(), 'assets');
    const gtAssetsDir = path.join(assetsDir, 'guardian-tales');
    
    // 1. Load Global Assets
    const [mainBg, logo, starImg] = await Promise.all([
        loadImage(path.join(assetsDir, 'bgd.png')),
        loadImage(path.join(assetsDir, 'gacha_icon.png')),
        loadImage(path.join(gtAssetsDir, 'objects', 'star-new.png'))
    ]);

    // 2. Draw Immersive Foundation
    cropAndDrawImage(ctx, mainBg, width, height, 0, 0);
    // Overlay dihapus sesuai permintaan agar bgd.png tampil natural

    // 3. Header Architecture
    // Gacha Icon with Glow
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 25;
    ctx.drawImage(logo, 60, 50, 90, 90);

    // Title & Subtitle with Glow
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = 'bold 55px "SFPR-Bold"';
    ctx.fillText(`${user.name}'s Inventory`, 170, 105);
    
    ctx.shadowBlur = 10; // Softer glow for subtitle
    ctx.font = '24px "SFPR-Semibold"';
    ctx.fillText('Guardian Tales', 172, 138);
    ctx.restore();

    // 4. Glassmorphism Statistics Panel (Top-Right)
    const panelW = 380;
    const panelH = 100;
    const panelX = width - panelW - 65;
    const panelY = 55;

    // Panel Background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, panelX, panelY, panelW, panelH, 30);
    ctx.fill();
    ctx.stroke();

    // Reflection Streak on Panel
    const panelStreak = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
    panelStreak.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    panelStreak.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    panelStreak.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = panelStreak;
    roundRect(ctx, panelX, panelY, panelW, panelH, 30);
    ctx.fill();

    // Vertical Divider
    ctx.beginPath();
    ctx.moveTo(panelX + (panelW / 2), panelY + 20);
    ctx.lineTo(panelX + (panelW / 2), panelY + panelH - 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Statistics Labels (with glow)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    
    // Left: Total Worth
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "SFPR-Bold"';
    ctx.fillText(`${totalWorth.toLocaleString()}¥`, panelX + (panelW / 4), panelY + 52);
    ctx.font = '16px "SFPR-Semibold"';
    ctx.globalAlpha = 0.5;
    ctx.fillText('Total Worth', panelX + (panelW / 4), panelY + 78);

    // Right: Page Info
    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 30px "SFPR-Bold"';
    ctx.fillText(`${page}/${totalPages}`, panelX + (panelW * 0.75), panelY + 52);
    ctx.font = '16px "SFPR-Semibold"';
    ctx.globalAlpha = 0.5;
    ctx.fillText('Page', panelX + (panelW * 0.75), panelY + 78);
    ctx.restore();

    // 5. Grid Orchestration
    const cols = 5;
    const itemW = 245;
    const itemH = 340;
    const gapX = 30;
    const gapY = 45;
    const startX = (width - (cols * itemW + (cols - 1) * gapX)) / 2;
    const startY = 210;

    const SELL_PRICE = { 1: 7.5, 2: 10, 3: 16.5, 4: 25, 5: 40 };
    const gtElementColors = {
        "fire": "#de741e", "water": "#3cf8fa", "earth": "#b2e333",
        "light": "#faf8a6", "basic": "#ffffff", "dark": "#a945f8"
    };
    const starConfig = {
        myth: { isGradient: true, color1: '#fa226d', color2: '#fff15d', glow: '#ff4444' },
        ascent: { isGradient: true, color1: '#6cf2b7', color2: '#e4fe39', glow: '#6bf2b7' },
        collab: { isGradient: false, color1: '#ffb4ef', glow: '#ffb4ef' },
        unique: { isGradient: false, color1: '#fdee6f', glow: '#fdee6f' },
        rare: { isGradient: false, color1: '#94ebff', glow: '#94ebff' },
        normal: { isGradient: false, color1: '#f49366', glow: '#f49366' }
    };

    const darkenHex = (hex, percent) => {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    };

    // 6. Synthesis of Collection Cards
    for (let i = 0; i < cards.length; i++) {
        const item = cards[i];
        const card = getCardInfo(item.id, item.stars);
        if (!card) continue;

        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + (col * (itemW + gapX));
        const y = startY + (row * (itemH + gapY));

        const elementColor = gtElementColors[(card.element || 'basic').toLowerCase()] || "#ffffff";
        const cardValue = SELL_PRICE[item.stars] || 0;
        const config = starConfig[(card.tier || 'unique').toLowerCase()] || starConfig['unique'];

        // --- THE PILLAR OF LIGHT (CARD) ---
        
        // A. Dynamic Border Glow
        ctx.save();
        ctx.shadowColor = elementColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#080808';
        roundRect(ctx, x, y, itemW, itemH, 25);
        ctx.fill();
        ctx.restore();

        // B. Contextual Layering
        ctx.save();
        roundRect(ctx, x, y, itemW, itemH, 25);
        ctx.clip();

        // Layer 1: Character Environment (Background)
        const charBgPath = path.join(gtAssetsDir, 'backgrounds', (card.placename || 'default') + '_bg.png');
        const charBg = await loadImage(fileExist(charBgPath) ? charBgPath : path.join(gtAssetsDir, 'backgrounds', 'fallback.png'));
        ctx.globalAlpha = 1.0;
        cropAndDrawImage(ctx, charBg, itemW, itemH, x, y);
        // Layer 2: Hero Projection (Illustration)
        const illustPath = path.join(gtAssetsDir, 'illustrations', (card.placename || 'default') + '_illust.png');
        const illust = await loadImage(fileExist(illustPath) ? illustPath : path.join(gtAssetsDir, 'illustrations', 'fallback.png'));
        // Focused center illustration with dynamic offsets
        const illScale = 0.38; // Dikecilkan dari 0.45
        const illW = illust.width * illScale;
        const illH = illust.height * illScale;
        const illX = x + (itemW - illW) / 2 + (card.offsetMinicardX || 0);
        const illY = y + (itemH - illH) / 2 + 15 + (card.offsetMinicardY || 0); // Y digeser sedikit ke bawah agar tetap proporsional
        ctx.drawImage(illust, illX, illY, illW, illH);

        // Layer 3: Systematic Overlay (Dark Gradient at bottom)
        const infoH = 110;
        const bottomGrad = ctx.createLinearGradient(0, y + itemH - infoH, 0, y + itemH);
        bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bottomGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.8)');
        bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(x, y + itemH - infoH, itemW, infoH);
        ctx.restore();

        // C. Tactical Badges (Dark Background for consistency)
        // ID Badge (Top-Left)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = elementColor;
        ctx.lineWidth = 1.5;
        roundRect(ctx, x + 12, y + 12, 60, 28, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.save(); // Glow for badge text
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px "SFPR-Bold"';
        ctx.fillText(`${card.displayId || card.id}`, x + 42, y + 31);
        ctx.restore();

        // Value Badge (Top-Right)
        roundRect(ctx, x + itemW - 85, y + 12, 73, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff'; // Kembali ke putih
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px "SFPR-Bold"';
        ctx.fillText(`${cardValue}¥`, x + itemW - 48.5, y + 31);
        ctx.restore();
        ctx.restore();

        // D. Nomenclature (Info Panel Text with Glow)
        ctx.save();
        ctx.textAlign = 'left';

        // Character Name (Dominant, White Glow)
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Test';
        const dispName = card.name.length > 18 ? card.name.slice(0, 16) + '..' : card.name;
        ctx.fillText(dispName, x + 15, y + itemH - 60);
        
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.8;
        ctx.font = '14px "SFPR-Semibold"';
        // Capitalize only first letter of tier
        const displayTier = (card.tier || 'common').charAt(0).toUpperCase() + (card.tier || 'common').slice(1);
        ctx.fillText(displayTier, x + 15, y + itemH - 42);
        ctx.restore();

        // E. Constellation Synthesis (Colored Stars with Glow)
        const starCanvasI = createCanvas(starImg.width, starImg.height);
        const sCtxI = starCanvasI.getContext('2d');
        if (config.isGradient) {
            const sGrad = sCtxI.createLinearGradient(0, 0, 0, starImg.height);
            sGrad.addColorStop(0, config.color1);
            sGrad.addColorStop(1, config.color2);
            sCtxI.fillStyle = sGrad;
        } else {
            sCtxI.fillStyle = config.color1;
        }
        sCtxI.fillRect(0, 0, starImg.width, starImg.height);
        sCtxI.globalCompositeOperation = 'destination-in';
        sCtxI.drawImage(starImg, 0, 0);
        const coloredStarI = await loadImage(await starCanvasI.encode('png'));

        const sSize = 25; 
        const sGap = -6;  
        const starStartX = x + 15;
        
        ctx.save();
        ctx.shadowColor = config.glow;
        ctx.shadowBlur = 15;
        for (let s = 0; s < card.stars; s++) {
            ctx.drawImage(coloredStarI, starStartX + (s * (sSize + sGap)), y + itemH - 32, sSize, sSize);
        }
        ctx.restore();

        // F. Character Anchor (Even Bigger Icon Bottom-Right)
        const miniIconUrl = `https://raw.githubusercontent.com/VikryCraftID/MilkyAssets/main/icons/${card.placename}_icon.png`;
        const miniIcon = await fetchImageWithFallback(miniIconUrl, path.join(gtAssetsDir, 'icons', 'fallback.png'));
        
        const mSize = 70; 
        const mX = x + itemW - mSize - 10;
        const mY = y + itemH - mSize - 10;
        
        ctx.save();
        ctx.fillStyle = '#ffffff'; 
        roundRect(ctx, mX, mY, mSize, mSize, 15);
        ctx.fill();
        ctx.clip();
        ctx.drawImage(miniIcon, mX, mY, mSize, mSize);
        ctx.restore();

        // Draw border for icon using dynamic element color gradient
        const mGrad = ctx.createLinearGradient(0, mY, 0, mY + mSize);
        mGrad.addColorStop(0, elementColor);
        mGrad.addColorStop(1, darkenHex(elementColor, 40));
        ctx.strokeStyle = mGrad;
        ctx.lineWidth = 2.5;
        roundRect(ctx, mX, mY, mSize, mSize, 15);
        ctx.stroke();

        // G. External Dynamic Frame
        const frameGrad = ctx.createLinearGradient(0, y, 0, y + itemH);
        frameGrad.addColorStop(0, elementColor);
        frameGrad.addColorStop(1, darkenHex(elementColor, 40));
        ctx.strokeStyle = frameGrad;
        ctx.lineWidth = 4;
        roundRect(ctx, x, y, itemW, itemH, 25);
        ctx.stroke();
    }

    // 7. Metadata Footer with Glow
    ctx.save();
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.font = '22px "SFPR-Medium"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`TOTAL COLLECTION: ${user.gtInv.length} RECORDED SUBJECTS`, width / 2, height - 40);
    ctx.restore();

    return await canvas.encode('png');
}

// ========== RENDER PROFIL CARD ==========
export async function renderProfileCard(user, getXPNeed, getAchievements, getRolesData) {
    const width = 1500;
    const height = 1080;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const assetsDir = path.join(process.cwd(), 'assets');
    const placeBgPath = path.join(assetsDir, 'new_bg.png');
    const userBgPath = user.bg ? path.join(assetsDir, 'users', 'bg', user.bg) : path.join(assetsDir, 'users', 'bg', 'default.png');
    const avatarPath = user.avatar ? path.join(assetsDir, 'users', 'avatar', user.avatar) : path.join(assetsDir, 'users', 'avatar', 'default.png');
    const flagPath = user.flag ? path.join(assetsDir, 'flag', user.flag + '.svg') : path.join(assetsDir, 'flag', 'none.png');

    const placeBg = await loadImage(placeBgPath);
    const userBg = await loadImage(userBgPath);
    const avatar = await loadImage(avatarPath);
    let flagImg = null;
    if (fileExist(flagPath)) flagImg = await loadImage(flagPath);

    cropAndDrawImage(ctx, userBg, width, height, 0, 0);
    ctx.filter = 'blur(12px)';
    cropAndDrawImage(ctx, userBg, width, height, 0, 0);
    ctx.filter = 'none';

    cropAndDrawImageRounded(ctx, userBg, width * 0.942, height * 0.32, 45, 50, 50);
    drawCircularImage(ctx, avatar, 83, 248, 319.5);
    if (flagImg) drawCircularImage(ctx, flagImg, 307.5, 491, 73);
    ctx.drawImage(placeBg, 0, 0, width, height);

    const needXP = getXPNeed(user.level);
    const xpPercent = Math.min(1, (user.xp || 0) / needXP);
    const xpBarX = 98;
    const xpBarY = 802.12;
    const xpBarWidth = 630;
    const xpBarHeight = 20;
    const xpRadius = 100;

    const tf = (user.trustFactor || 0).toFixed(2);
    const tfPercent = Math.min(1, tf / 100);
    const tfBarX = 780;
    const tfBarY = 802.12;
    const tfBarWidth = 630;
    const tfBarHeight = 20;
    const tfRadius = 100;

    roundRect(ctx, xpBarX, xpBarY, xpBarWidth, xpBarHeight, xpRadius);
    ctx.fillStyle = '#e2dffb';
    ctx.fill();
    ctx.save();
    roundRect(ctx, xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight, xpRadius);
    ctx.clip();
    ctx.fillStyle = '#9f95f2';
    ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight);
    ctx.restore();

    roundRect(ctx, tfBarX, tfBarY, tfBarWidth, tfBarHeight, tfRadius);
    ctx.fillStyle = '#e2dffb';
    ctx.fill();
    ctx.save();
    roundRect(ctx, tfBarX, tfBarY, tfBarWidth * tfPercent, tfBarHeight, tfRadius);
    ctx.clip();
    ctx.fillStyle = '#73c279';
    ctx.fillRect(tfBarX, tfBarY, tfBarWidth * tfPercent, tfBarHeight);
    ctx.restore();

    drawText(ctx, user.name || 'User', 455, 455, 70, 'SFPR-Bold', '#272a42', 'left');
    drawText(ctx, user.bio || '', 455, 500, 31, 'SFPR-Regular', '#636681', 'left');

    let currentX = 455;
    const bY = 525;
    const bHeight = 50;
    const bPadding = 18.75;
    const bRadius = 62.5; 
    const bFontSize = 30;
    
    const rolesData = getRolesData();
    const roleName = user.role || "Human";
    let roleTier = "1";
    const root = rolesData.roots.find(r => r.name === roleName);
    if (root) roleTier = String(root.tier);
    else {
        for (const [parent, list] of Object.entries(rolesData.evos)) {
            const found = list.find(e => e.to === roleName);
            if (found) {
                roleTier = String(found.tier);
                break;
            }
        }
    }
    const roleColor = tierColors[roleTier] || "#808080";
    
    ctx.font = `semibold ${bFontSize}px "SFPR-Semibold"`;
    const roleTextWidth = ctx.measureText(roleName).width;
    const roleBadgeWidth = roleTextWidth + (bPadding * 2);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = roleColor;
    roundRect(ctx, currentX, bY, roleBadgeWidth, bHeight, bRadius);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 2;
    ctx.strokeStyle = roleColor;
    roundRect(ctx, currentX, bY, roleBadgeWidth, bHeight, bRadius);
    ctx.stroke();
    drawText(ctx, roleName, currentX + bPadding, bY + (bHeight * 0.7), bFontSize, 'SFPR-Semibold', roleColor, 'left');

    currentX += roleBadgeWidth + 12.5;

    const allAchievements = getAchievements();
    const currentAch = allAchievements.find(a => a.id === user.displayAchievement);
    if (currentAch) {
        const achText = currentAch.name;
        const achColor = currentAch.color;
        
        ctx.font = `semibold ${bFontSize}px "SFPR-Semibold"`;
        const achTextWidth = ctx.measureText(achText).width;
        const achBadgeWidth = achTextWidth + (bPadding * 2);

        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = achColor;
        roundRect(ctx, currentX, bY, achBadgeWidth, bHeight, bRadius);
        ctx.fill();
        ctx.restore();
        ctx.lineWidth = 2;
        ctx.strokeStyle = achColor;
        roundRect(ctx, currentX, bY, achBadgeWidth, bHeight, bRadius);
        ctx.stroke();
        drawText(ctx, achText, currentX + bPadding, bY + (bHeight * 0.7), bFontSize, 'SFPR-Semibold', achColor, 'left');
    }

    drawText(ctx, `#${user.userId}`, 1400, 480, 55, 'SFPR-Bold', '#8785be', 'right');
    drawText(ctx, user.vanity ? `@${user.vanity}` : '', 1400, 515, 32, 'SFPR-Semibold', '#8785be', 'right');

    drawText(ctx, `${user.reincarnation || 0}x`, 210, 700, 43, 'SFPR-Semibold', '#2c2e45', 'left');
    drawText(ctx, `${user.warns || 0}x`, 552, 700, 43, 'SFPR-Semibold', '#2c2e45', 'left');
    drawText(ctx, `${user.gacha || 0}x`, 891, 700, 43, 'SFPR-Semibold', '#2c2e45', 'left');
    drawText(ctx, `${user.achievements || 0}`, 1233, 700, 43, 'SFPR-Semibold', '#2c2e45', 'left');

    drawText(ctx, 'Exp Bar', 132, 788, 20, 'SFPR-Semibold', '#272a45', 'left');
    drawText(ctx, `Level ${user.level}`, 718, 788, 20, 'SFPR-Semibold', '#444444', 'right');
    drawText(ctx, `${user.xp || 0}/${needXP} Points`, 411.2, 845, 20, 'SFPR-Semibold', '#444444', 'center');

    drawText(ctx, 'Trust Factor', 812, 788, 20, 'SFPR-Semibold', '#272a45', 'left');
    drawText(ctx, `${tf}%`, 1398, 788, 20, 'SFPR-Semibold', '#444444', 'right');
    drawText(ctx, trustLabel(tf), 1091.2, 845, 20, 'SFPR-Semibold', '#444444', 'center');

    const formattedMessages = (user.messages || 0).toLocaleString('id-ID');
    const formattedYen = (user.yen || 0).toFixed(2).replace(/\.0+$/, '') + '¥';
    const formattedCommands = (user.commands || 0).toLocaleString('id-ID');

    drawText(ctx, formattedMessages, 221, 975, 43, 'SFPR-Bold', '#2c2e45', 'left');
    drawText(ctx, formattedYen, 678, 975, 43, 'SFPR-Bold', '#2c2e45', 'left');
    drawText(ctx, formattedCommands, 1135, 975, 43, 'SFPR-Bold', '#2c2e45', 'left');

    return await canvas.encode('jpeg');
}

// ========== RENDER ACHIEVEMENT CARD ==========
export async function renderAchievementCard(user, achievement) {
    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const assetsDir = path.join(process.cwd(), 'assets');
    const bg = await loadImage(path.join(assetsDir, 'bgach.png'));
    const starImg = await loadImage(path.join(assetsDir, 'starach.png'));

    ctx.drawImage(bg, 0, 0, width, height);
    
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 50;

    drawText(ctx, 'Achievement Collected!', width / 2, 460, 80, 'SFPR-Bold', '#ffffff', 'center', 'bold');
    drawText(ctx, achievement.name, width / 2, 620, 70, 'SFPR-Bold', '#ffffff', 'center', 'bold');

    const starSize = 40;
    const starGap = 20;
    const totalStarsWidth = (starSize * (achievement.stars || 1)) + (starGap * ((achievement.stars || 1) - 1));
    let startX = (width - totalStarsWidth) / 2;
    const starY = 820;

    for (let i = 0; i < (achievement.stars || 1); i++) {
        ctx.drawImage(starImg, startX + (i * (starSize + starGap)), starY, starSize, starSize);
    }

    drawText(ctx, `Achieved by #${user.userId}`, width / 2, 960, 45, 'SFPR-Bold', '#ffffff', 'center', 'bold');

    return await canvas.encode('png');
}

// ========== AUTO THUMBNAIL GENERATOR ==========
export async function generateThumbnail(buffer) {
    try {
        const { createCanvas: createThumb, loadImage: loadThumb } = await import('@napi-rs/canvas');
        const img = await loadThumb(buffer);
        const maxWidth = 200; 
        const ratio = img.width / img.height;
        const thumbWidth = maxWidth;
        const thumbHeight = Math.floor(thumbWidth / ratio);
        const thumbCanvas = createThumb(thumbWidth, thumbHeight);
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, thumbWidth, thumbHeight);
        return await thumbCanvas.encode('jpeg');
    } catch (e) {
        console.error('Gagal generate thumbnail:', e);
        return null;
    }
}
