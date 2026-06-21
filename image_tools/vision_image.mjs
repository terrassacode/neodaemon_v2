import path from 'node:path';
import { promises as fs } from 'node:fs';

const input = process.argv[2];
const model = process.argv[3] || process.env.OPENCLAW_VISION_MODEL || 'moondream';
const prompt = process.argv.slice(4).join(' ').trim() || 'Describe the image briefly.';

if (!input) {
  console.error('Usage: node vision_image.mjs /path/image [model] [prompt]');
  process.exit(2);
}

const OUT_DIR = '/openclaw/openclaw_v2/data/source-inbox/derived/images';
await fs.mkdir(OUT_DIR, { recursive: true });

const abs = path.resolve(input);
const safeBase = path.basename(abs).replace(/[^a-zA-Z0-9._-]+/g, '_');
const stem = safeBase.replace(/\.[^.]+$/, '');
const textPath = path.join(OUT_DIR, `${stem}.vision.txt`);
const jsonPath = path.join(OUT_DIR, `${stem}.vision.json`);

const image = await fs.readFile(abs);
const startedAt = Date.now();

const res = await fetch('http://127.0.0.1:11434/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt, images: [image.toString('base64')] }],
    stream: false
  })
});

const raw = await res.text();
let payload;
try { payload = JSON.parse(raw); } catch { payload = { error: raw }; }

if (!res.ok || payload.error) {
  const message = payload.error || `ollama_http_${res.status}`;
  await fs.writeFile(jsonPath, JSON.stringify({ ok: false, input: abs, model, prompt, error: message, raw: payload, createdAt: new Date().toISOString() }, null, 2));
  console.error(message);
  process.exit(1);
}

const description = String(payload.message?.content || payload.response || '').trim();
if (!description) {
  const message = 'empty_vision_response';
  await fs.writeFile(jsonPath, JSON.stringify({ ok: false, input: abs, model, prompt, error: message, createdAt: new Date().toISOString() }, null, 2));
  console.error(message);
  process.exit(1);
}

const result = {
  ok: true,
  input: abs,
  model,
  prompt,
  textPath,
  jsonPath,
  descriptionLength: description.length,
  durationMs: Date.now() - startedAt,
  createdAt: new Date().toISOString()
};

await fs.writeFile(textPath, description);
await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
