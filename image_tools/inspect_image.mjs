import path from 'node:path';
import { promises as fs } from 'node:fs';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node inspect_image.mjs /path/image');
  process.exit(2);
}

const OUT_DIR = '/openclaw/openclaw_v2/data/source-inbox/derived/images';
await fs.mkdir(OUT_DIR, { recursive: true });

const abs = path.resolve(input);
const safeBase = path.basename(abs).replace(/[^a-zA-Z0-9._-]+/g, '_');
const stem = safeBase.replace(/\.[^.]+$/, '');

const image = sharp(abs, { failOn: 'none' });
const meta = await image.metadata();

const previewPath = path.join(OUT_DIR, `${stem}.preview.png`);
const thumbPath = path.join(OUT_DIR, `${stem}.thumb.jpg`);
const metaPath = path.join(OUT_DIR, `${stem}.image-meta.json`);

await sharp(abs, { failOn: 'none' })
  .rotate()
  .resize({ width: 1200, height: 1800, fit: 'inside', withoutEnlargement: true })
  .png()
  .toFile(previewPath);

await sharp(abs, { failOn: 'none' })
  .rotate()
  .resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 82 })
  .toFile(thumbPath);

const result = {
  input: abs,
  metadata: {
    format: meta.format,
    width: meta.width,
    height: meta.height,
    space: meta.space,
    channels: meta.channels,
    density: meta.density,
    hasAlpha: meta.hasAlpha,
    orientation: meta.orientation
  },
  previewPath,
  thumbPath,
  metaPath,
  createdAt: new Date().toISOString()
};

await fs.writeFile(metaPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
