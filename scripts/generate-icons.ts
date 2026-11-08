import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// The installed app always uses Siikawa, independently of the selected companion.
// Keep the approved artwork intact; only package it at platform-required sizes.
const source = fileURLToPath(new URL('../assets/branding/siikawa-install-master.png', import.meta.url));
const directory = new URL('../public/icons/', import.meta.url);
const background = '#DFF7CC';
mkdirSync(directory, { recursive: true });

for (const size of [180, 192, 512]) {
  const filename = size === 180 ? 'siikawa-apple-touch-180.png' : `siikawa-${size}.png`;
  await sharp(source)
    .resize(size, size)
    .flatten({ background })
    .png()
    .toFile(fileURLToPath(new URL(filename, directory)));
}

// Extra padding keeps the face inside the central mask-safe circle on Android.
await sharp(source)
  .resize(368, 368)
  .flatten({ background })
  .extend({ top: 72, bottom: 72, left: 72, right: 72, background })
  .png()
  .toFile(fileURLToPath(new URL('siikawa-maskable-512.png', directory)));

const favicon = await sharp(source).resize(64, 64).flatten({ background }).png().toBuffer();
writeFileSync(
  new URL('siikawa.svg', directory),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${favicon.toString('base64')}"/></svg>`,
);
console.info('Generated Siikawa install icons: Apple 180px, PWA 192/512px, maskable 512px and SVG favicon.');
