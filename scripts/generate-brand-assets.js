// Régénère les icônes/splash à partir du logo Éveil (cercle + point doré).
// Usage : node scripts/generate-brand-assets.js
const path = require('path');
const sharp = require('sharp');

const GOLD = '#CBA35C';
const BG = '#12142B';
const OUT = path.join(__dirname, '..', 'assets', 'images');

function logoSvg({ size, viewBox, bg, strokeColor, dotColor }) {
  const [minX, minY, w, h] = viewBox;
  return `<svg width="${size}" height="${size}" viewBox="${minX} ${minY} ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    ${bg ? `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="${bg}"/>` : ''}
    <circle cx="12" cy="12" r="8.3" fill="none" stroke="${strokeColor}" stroke-width="1.4"/>
    <circle cx="15.3" cy="8.7" r="1.6" fill="${dotColor}"/>
  </svg>`;
}

async function render(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('wrote', outPath);
}

async function main() {
  // App icon: solid bg, full 24x24 viewbox (iOS applies its own corner mask).
  await render(
    logoSvg({ size: 1024, viewBox: [0, 0, 24, 24], bg: BG, strokeColor: GOLD, dotColor: GOLD }),
    path.join(OUT, 'icon.png')
  );

  // Android adaptive icon background: solid fill, no logo.
  await render(
    `<svg width="1024" height="1024" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="${BG}"/></svg>`,
    path.join(OUT, 'android-icon-background.png')
  );

  // Android adaptive icon foreground: logo only, transparent bg, padded to fit the safe zone (~60% of canvas).
  await render(
    logoSvg({ size: 1024, viewBox: [-8, -8, 40, 40], bg: null, strokeColor: GOLD, dotColor: GOLD }),
    path.join(OUT, 'android-icon-foreground.png')
  );

  // Android monochrome (themed icon): single-color glyph, transparent bg.
  await render(
    logoSvg({ size: 1024, viewBox: [-8, -8, 40, 40], bg: null, strokeColor: '#FFFFFF', dotColor: '#FFFFFF' }),
    path.join(OUT, 'android-icon-monochrome.png')
  );

  // Splash icon: logo only, transparent bg (background color comes from app.json splash config).
  await render(
    logoSvg({ size: 512, viewBox: [0, 0, 24, 24], bg: null, strokeColor: GOLD, dotColor: GOLD }),
    path.join(OUT, 'splash-icon.png')
  );

  // Favicon: solid bg version for the browser tab.
  await render(
    logoSvg({ size: 256, viewBox: [0, 0, 24, 24], bg: BG, strokeColor: GOLD, dotColor: GOLD }),
    path.join(OUT, 'favicon.png')
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
