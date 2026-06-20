import path from 'node:path';
import { promises as fs } from 'node:fs';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

const input = process.argv[2];
const lang = process.argv[3] || 'spa+eng';
if (!input) {
  console.error('Usage: node ocr_image.mjs /path/image [spa+eng]');
  process.exit(2);
}

const OUT_DIR = '/openclaw/openclaw_v2/data/source-inbox/derived/images';
await fs.mkdir(OUT_DIR, { recursive: true });

const abs = path.resolve(input);
const safeBase = path.basename(abs).replace(/[^a-zA-Z0-9._-]+/g, '_');
const stem = safeBase.replace(/\.[^.]+$/, '');
const preparedPath = path.join(OUT_DIR, `${stem}.ocr-input.png`);
const textPath = path.join(OUT_DIR, `${stem}.ocr.txt`);
const jsonPath = path.join(OUT_DIR, `${stem}.ocr.json`);

await sharp(abs, { failOn: 'none' })
  .rotate()
  .grayscale()
  .normalize()
  .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
  .png()
  .toFile(preparedPath);

const worker = await createWorker(lang);
const ret = await worker.recognize(preparedPath);
await worker.terminate();

const text = ret.data.text || '';
const result = {
  input: abs,
  preparedPath,
  textPath,
  jsonPath,
  language: lang,
  confidence: ret.data.confidence,
  textLength: text.length,
  createdAt: new Date().toISOString()
};

await fs.writeFile(textPath, text);
await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
