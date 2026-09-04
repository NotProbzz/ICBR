import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawPixel) {
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      buffer[pxOffset] = Math.max(0, Math.min(255, Math.round(r)));
      buffer[pxOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      buffer[pxOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      buffer[pxOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const deflated = zlib.deflateSync(buffer, { level: 9 });

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Brand color palette: Forest Emerald #064E3B to Saffron Amber #D97706 / Gold #F59E0B
function renderIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = w / 2;

  // Background: Rounded rect for standard, full bleed for maskable
  let cornerR = isMaskable ? 0 : w * 0.22;
  
  if (!isMaskable) {
    // Check squircle / rounded rectangle boundary
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const innerW = cx - cornerR;
    const innerH = cy - cornerR;
    if (absX > innerW && absY > innerH) {
      const cornerDx = absX - innerW;
      const cornerDy = absY - innerH;
      if (cornerDx * cornerDx + cornerDy * cornerDy > cornerR * cornerR) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }
  }

  // Emerald green gradient background
  const t = (y / h) * 0.8 + (x / w) * 0.2;
  let bgR = 6 + t * (16 - 6);
  let bgG = 78 + t * (120 - 78);
  let bgB = 59 + t * (85 - 59);

  // Concentric decorative ring in safe zone
  const ringRadius = w * (isMaskable ? 0.36 : 0.40);
  const ringThickness = w * 0.015;
  if (Math.abs(dist - ringRadius) < ringThickness) {
    // Golden accent ring
    return [245, 158, 11, 230];
  }

  // Stylized Bovine / Bull Head & Horn Silhouette centered
  // Horns curve outwards, head triangle, snout, ears
  const scale = isMaskable ? 0.72 : 0.85;
  const nx = dx / (scale * cx); // -1 to 1 normalized
  const ny = (dy - h * 0.02) / (scale * cy); // -1 to 1 normalized

  // Head crown / forehead: circle
  const foreheadDist = Math.sqrt(nx * nx + (ny + 0.1) * (ny + 0.1));
  // Snout: lower oval
  const snoutDist = Math.sqrt((nx * 1.5) * (nx * 1.5) + (ny - 0.35) * (ny - 0.35));

  // Left & Right horns: crescent arc
  // Horn curve formula: y approx -0.3 + 0.8 * (abs(x) - 0.3)^2
  const absNx = Math.abs(nx);
  const hornCurveY = -0.05 - 1.2 * Math.pow(absNx - 0.15, 1.4);
  const hornDist = Math.abs(ny - hornCurveY);
  const inHornZone = absNx >= 0.12 && absNx <= 0.65 && ny < 0.05 && ny > -0.7;

  let isHorn = inHornZone && hornDist < (0.15 * (0.7 - absNx));
  let isHead = foreheadDist < 0.32;
  let isSnout = snoutDist < 0.26;

  // Ears: side ovals
  const earLx = nx + 0.45;
  const earRx = nx - 0.45;
  const earY = ny - 0.05;
  const isEar = Math.sqrt(earLx * earLx * 2 + earY * earY * 5) < 0.25 ||
                Math.sqrt(earRx * earRx * 2 + earY * earY * 5) < 0.25;

  if (isHorn) {
    // Horns in warm gold / ivory gradient
    const hornT = (ny + 0.7) / 0.7;
    return [254 - hornT * 20, 240 - hornT * 40, 138, 255];
  }

  if (isHead || isSnout || isEar) {
    // Bovine face in clean warm ivory white / pearl
    const faceT = (ny + 0.3) / 0.7;
    let r = 250 - faceT * 10;
    let g = 250 - faceT * 15;
    let b = 245 - faceT * 20;

    // AI Scanner reticle marks across snout
    if (Math.abs(ny - 0.15) < 0.015 && Math.abs(nx) < 0.18) {
      return [16, 185, 129, 255]; // Emerald scanner beam line
    }
    // Nostrils
    if (Math.abs(ny - 0.42) < 0.035 && (Math.abs(nx - 0.08) < 0.025 || Math.abs(nx + 0.08) < 0.025)) {
      return [55, 65, 81, 255];
    }
    // Eyes
    if (Math.abs(ny - 0.05) < 0.03 && (Math.abs(nx - 0.18) < 0.03 || Math.abs(nx + 0.18) < 0.03)) {
      return [31, 41, 55, 255];
    }

    return [r, g, b, 255];
  }

  // Outer ambient subtle rays or scan corners
  if (absNx > 0.65 && absNx < 0.85 && Math.abs(ny) > 0.65 && Math.abs(ny) < 0.85) {
    // Corner scan target brackets
    return [245, 158, 11, 200];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 1. 192x192 PNG
const png192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('pwa-192x192.png written (' + png192.length + ' bytes)');

// 2. 512x512 PNG
const png512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('pwa-512x512.png written (' + png512.length + ' bytes)');

// 3. 512x512 Maskable PNG
const pngMaskable = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);
console.log('pwa-maskable-512x512.png written (' + pngMaskable.length + ' bytes)');

// 4. 180x180 Apple Touch Icon
const pngApple = createPng(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);
console.log('apple-touch-icon.png written (' + pngApple.length + ' bytes)');

// 5. SVG Vector Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <!-- Decorative Ring -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#F59E0B" stroke-width="4" stroke-dasharray="12 8" opacity="0.6"/>
  <!-- Scanner Corners -->
  <path d="M 96 160 L 96 96 L 160 96" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/>
  <path d="M 416 160 L 416 96 L 352 96" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/>
  <path d="M 96 352 L 96 416 L 160 416" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/>
  <path d="M 416 352 L 416 416 L 352 416" fill="none" stroke="#F59E0B" stroke-width="8" stroke-linecap="round"/>
  <!-- Central Bovine & Camera AI Motif -->
  <g filter="url(#shadow)">
    <!-- Horns -->
    <path d="M 170 210 C 130 140 100 110 80 125 C 70 135 110 190 190 235 Z" fill="url(#goldGrad)"/>
    <path d="M 342 210 C 382 140 412 110 432 125 C 442 135 402 190 322 235 Z" fill="url(#goldGrad)"/>
    <!-- Head & Ears -->
    <ellipse cx="140" cy="245" rx="45" ry="20" transform="rotate(-20 140 245)" fill="#F3F4F6"/>
    <ellipse cx="372" cy="245" rx="45" ry="20" transform="rotate(20 372 245)" fill="#F3F4F6"/>
    <!-- Face Shield -->
    <path d="M 190 190 C 220 180 292 180 322 190 C 340 240 330 320 256 370 C 182 320 172 240 190 190 Z" fill="#FFFFFF"/>
    <!-- Muzzle / Snout -->
    <ellipse cx="256" cy="335" rx="48" ry="32" fill="#E5E7EB"/>
    <circle cx="238" cy="340" r="7" fill="#374151"/>
    <circle cx="274" cy="340" r="7" fill="#374151"/>
    <!-- Eyes -->
    <ellipse cx="218" cy="248" rx="10" ry="14" fill="#1F2937"/>
    <circle cx="220" cy="244" r="3.5" fill="#FFFFFF"/>
    <ellipse cx="294" cy="248" rx="10" ry="14" fill="#1F2937"/>
    <circle cx="296" cy="244" r="3.5" fill="#FFFFFF"/>
    <!-- Zebu Hump & Tilak Gold Motif -->
    <path d="M 256 205 L 263 225 L 256 235 L 249 225 Z" fill="#D97706"/>
    <!-- AI Scan Beam Laser Line -->
    <line x1="170" y1="285" x2="342" y2="285" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
    <circle cx="256" cy="285" r="5" fill="#34D399"/>
  </g>
  <!-- Text Emblem -->
  <text x="256" y="455" text-anchor="middle" fill="#E5E7EB" font-family="system-ui, sans-serif" font-size="28" font-weight="700" letter-spacing="4">BOVINE AI</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('icon.svg written');
