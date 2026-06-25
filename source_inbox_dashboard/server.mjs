import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';

const ROOT = path.resolve('/openclaw/openclaw_v2/source_inbox_dashboard');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.resolve('/openclaw/openclaw_v2/data/source-inbox');
const FILES_ROOT = path.join(DATA, 'files');
const MAX_UPLOAD = 25 * 1024 * 1024;
const PORT = Number(process.env.SOURCE_INBOX_PORT || 8788);
const HOST = process.env.SOURCE_INBOX_HOST || '127.0.0.1';
const REMINDERS_FILE = '/openclaw/openclaw_v2/data/daily-reminders/reminders.json';
const REPO_ROOT = path.resolve('/openclaw/openclaw_v2');
const GITHUB_REPO = 'terrassacode/neodaemon_v2';
const SECRET_TOKEN_RE = new RegExp(`gho${'_'}[A-Za-z0-9_]+|github${'_'}pat${'_'}[A-Za-z0-9_]+`, 'g');
const VOICE_OUT_DIR = path.resolve('/openclaw/openclaw_v2/data/voice/outputs');
const VOICE_IN_DIR = path.resolve('/openclaw/openclaw_v2/data/voice/inputs');
const VOICE_METRICS_FILE = path.resolve('/openclaw/openclaw_v2/data/voice/metrics.jsonl');
const PIPER_SCRIPT = path.resolve('/openclaw/openclaw_v2/voice_tools/piper_say.py');
const STT_SCRIPT = path.resolve('/openclaw/openclaw_v2/voice_tools/transcribe_audio.py');
const VOICE_PYTHON = path.resolve('/openclaw/openclaw_v2/voice_tools/.venv/bin/python');
const VOICE_AGENT_ID = process.env.VOICE_AGENT_ID || 'neodaemon-v2';
const VOICE_AGENT_SESSION = process.env.VOICE_AGENT_SESSION || 'voice-dashboard';
const VOICE_FAST_AGENT_ID = process.env.VOICE_FAST_AGENT_ID || VOICE_AGENT_ID;
const VOICE_FAST_AGENT_SESSION = process.env.VOICE_FAST_AGENT_SESSION || 'voice-dashboard-fast';
const VOICE_FAST_MODEL = process.env.VOICE_FAST_MODEL || '';
const VOICE_FAST_TIMEOUT_SECONDS = Number(process.env.VOICE_FAST_TIMEOUT_SECONDS || '60');
const ALLOWED_STT_MODELS = new Set(['base', 'small', 'medium']);
const PRECISE_VISION_MODEL = process.env.PRECISE_VISION_MODEL || 'openai-codex/gpt-5.5';

const allowedMime = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function elapsedMs(start) {
  return Math.round(Number(process.hrtime.bigint() - start) / 1e6);
}

async function appendVoiceMetric(item) {
  const safe = {
    createdAt: new Date().toISOString(),
    kind: item.kind,
    ok: Boolean(item.ok),
    metrics: item.metrics || {},
    model: item.model || null,
    audioSeconds: item.audioSeconds ?? null,
    inputBytes: item.inputBytes ?? null,
    textLength: item.textLength ?? null,
    replyLength: item.replyLength ?? null,
    error: item.error || null
  };
  await fs.appendFile(VOICE_METRICS_FILE, JSON.stringify(safe) + '\n').catch(() => {});
}

function safeName(name) {
  const base = path.basename(String(name || 'source')).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return base || 'source';
}

async function ensureDirs() {
  await fs.mkdir(path.join(DATA, 'files'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'texts'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'urls'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'meta'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'derived', 'images'), { recursive: true });
  await fs.mkdir(VOICE_OUT_DIR, { recursive: true });
  await fs.mkdir(VOICE_IN_DIR, { recursive: true });
  await fs.mkdir(path.dirname(VOICE_METRICS_FILE), { recursive: true });
}



function runPdfTools(filePath, id) {
  const pdfTool = '/openclaw/openclaw_v2/pdf_tools/extract_pdf.sh';
  const logPath = path.join(DATA, 'meta', `${id}.pdf-tools.log`);
  execFile(pdfTool, [filePath], { timeout: 120000 }, async (error, stdout, stderr) => {
    const log = [
      'script=extract_pdf.sh',
      `ok=${!error}`,
      error ? `error=${error.message}` : '',
      stdout ? `stdout=${stdout}` : '',
      stderr ? `stderr=${stderr}` : ''
    ].filter(Boolean).join('\n') + '\n---\n';
    await fs.appendFile(logPath, log).catch(() => {});
  });
}

function runImageTools(filePath, id) {
  const imageToolsDir = '/openclaw/openclaw_v2/image_tools';
  const node = process.execPath;
  const logPath = path.join(DATA, 'meta', `${id}.image-tools.log`);
  const run = (script, args = []) => new Promise((resolve) => {
    execFile(node, [path.join(imageToolsDir, script), filePath, ...args], { cwd: imageToolsDir, timeout: 240000 }, async (error, stdout, stderr) => {
      const log = [
        `script=${script}`,
        `ok=${!error}`,
        error ? `error=${error.message}` : '',
        stdout ? `stdout=${stdout}` : '',
        stderr ? `stderr=${stderr}` : ''
      ].filter(Boolean).join('\n') + '\n---\n';
      await fs.appendFile(logPath, log).catch(() => {});
      resolve(!error);
    });
  });
  (async () => {
    await run('inspect_image.mjs');
    await run('ocr_image.mjs', ['spa+eng']);
    await run('vision_image.mjs', ['moondream']);
  })();
}


async function readMeta(id) {
  if (!/^[A-Za-z0-9T_.-]+$/.test(String(id || ''))) return null;
  const metaPath = path.join(DATA, 'meta', `${id}.json`);
  try { return JSON.parse(await fs.readFile(metaPath, 'utf8')); } catch { return null; }
}

async function latestImageMeta() {
  const names = await fs.readdir(path.join(DATA, 'meta')).catch(() => []);
  const items = [];
  for (const name of names.filter(name => name.endsWith('.json'))) {
    const id = name.replace(/\.json$/, '');
    const meta = await readMeta(id);
    if (meta?.kind === 'file' && String(meta.mime || '').startsWith('image/') && meta.path) items.push(meta);
  }
  items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return items[0] || null;
}

function derivedStemForImage(filePath) {
  const safeBase = path.basename(filePath).replace(/[^a-zA-Z0-9._-]+/g, '_');
  return safeBase.replace(/\.[^.]+$/, '');
}

async function handleImagePreciseVision(req, res) {
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8') || '{}');
  const meta = data.id ? await readMeta(String(data.id)) : await latestImageMeta();
  if (!meta) return sendJson(res, 404, { ok: false, error: 'image_not_found' });
  if (meta.kind !== 'file' || !String(meta.mime || '').startsWith('image/')) return sendJson(res, 400, { ok: false, error: 'not_an_image' });
  const filePath = path.resolve(String(meta.path || ''));
  const filesRoot = path.resolve(DATA, 'files');
  if (!filePath.startsWith(filesRoot + path.sep)) return sendJson(res, 403, { ok: false, error: 'forbidden_path' });
  try { await fs.access(filePath); } catch { return sendJson(res, 404, { ok: false, error: 'image_file_missing' }); }

  const prompt = String(data.prompt || '').trim() || 'Analiza esta imagen con precisión. Si contiene texto, extrae lo importante. Si es una tabla o documento, resume su estructura. No inventes: marca dudas o partes ilegibles.';
  if (prompt.length > 1000) return sendJson(res, 400, { ok: false, error: 'prompt_too_long', max: 1000 });
  const stem = derivedStemForImage(filePath);
  const outDir = path.join(DATA, 'derived', 'images');
  const textPath = path.join(outDir, `${stem}.precise-vision.txt`);
  const jsonPath = path.join(outDir, `${stem}.precise-vision.json`);
  const logPath = path.join(DATA, 'meta', `${meta.id}.precise-vision.log`);
  const started = process.hrtime.bigint();
  const result = await runCommand('openclaw', [
    'infer', 'image', 'describe',
    '--file', filePath,
    '--prompt', prompt,
    '--model', PRECISE_VISION_MODEL,
    '--timeout-ms', '120000',
    '--json'
  ], { cwd: REPO_ROOT, timeout: 150000 });
  const durationMs = elapsedMs(started);
  let payload = null;
  try { payload = JSON.parse(result.stdout || '{}'); } catch { payload = null; }
  const text = String(payload?.outputs?.[0]?.text || payload?.text || payload?.description || payload?.output || payload?.result?.text || '').trim();
  const ok = Boolean(result.ok && text);
  const record = {
    ok,
    id: meta.id,
    input: filePath,
    prompt,
    textPath,
    jsonPath,
    durationMs,
    model: PRECISE_VISION_MODEL,
    createdAt: new Date().toISOString(),
    error: ok ? null : (payload?.error || result.error || result.stderr || 'precise_vision_failed')
  };
  await fs.writeFile(jsonPath, JSON.stringify(record, null, 2));
  if (ok) await fs.writeFile(textPath, text);
  await fs.appendFile(logPath, [`ok=${ok}`, `durationMs=${durationMs}`, ok ? `textLength=${text.length}` : `error=${record.error}`].join('\n') + '\n---\n').catch(() => {});
  if (!ok) return sendJson(res, 503, { ok: false, error: record.error, detail: payload || { stderr: result.stderr }, durationMs });
  return sendJson(res, 201, { ok: true, id: meta.id, originalName: meta.originalName, text, textPath, jsonPath, durationMs, model: PRECISE_VISION_MODEL, createdAt: record.createdAt });
}

function sendJson(res, status, data, req = null) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  if (req?.method === 'HEAD') return res.end();
  res.end(body);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    execFile(command, args, {
      cwd: options.cwd || REPO_ROOT,
      timeout: options.timeout || 8000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, GH_NO_UPDATE_NOTIFIER: '1' }
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        code: error?.code ?? 0,
        signal: error?.signal || null,
        stdout: String(stdout || '').trim(),
        stderr: String(stderr || '').trim(),
        error: error ? String(error.message || error).slice(0, 300) : null
      });
    });
  });
}

function safeLines(text, max = 30) {
  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, max)
    .map(line => line.replace(SECRET_TOKEN_RE, '[redacted]'));
}

function parseBranchStatus(text) {
  const first = String(text || '').split('\n')[0] || '';
  const branch = /^##\s+([^\.\s]+|[^\s]+?)(?:\.\.\.|$)/.exec(first)?.[1] || 'unknown';
  const ahead = Number(/\[ahead (\d+)/.exec(first)?.[1] || 0);
  const behind = Number(/behind (\d+)/.exec(first)?.[1] || 0);
  return { branch, ahead, behind };
}

function checkSummary(checks) {
  if (!Array.isArray(checks) || checks.length === 0) return { state: 'none', label: 'sin CI' };
  const states = checks.map(c => String(c.conclusion || c.status || '').toLowerCase());
  if (states.some(s => ['failure', 'cancelled', 'timed_out', 'action_required'].includes(s))) return { state: 'fail', label: 'fallando' };
  if (states.some(s => ['queued', 'in_progress', 'pending', 'waiting', 'requested'].includes(s))) return { state: 'pending', label: 'pendiente' };
  if (states.every(s => ['success', 'completed', 'neutral', 'skipped'].includes(s))) return { state: 'pass', label: 'ok' };
  return { state: 'unknown', label: 'desconocido' };
}

function nextRepoAction({ dirty, branch, prs, mainSynced, githubOk }) {
  if (!githubOk) return 'GitHub no disponible: revisar login de gh';
  const activePr = prs.find(pr => pr.state === 'OPEN');
  if (activePr) {
    const checks = checkSummary(activePr.statusCheckRollup);
    if (checks.state === 'fail') return `PR #${activePr.number}: corregir checks fallidos`;
    if (checks.state === 'pending') return `PR #${activePr.number}: esperar CI/checks`;
    return `PR #${activePr.number}: listo para revisión/merge manual`;
  }
  if (branch !== 'main') return dirty ? 'Feature local con cambios: validar y preparar commit' : 'Feature local limpia: preparar FEATURE_READY_FOR_GITHUB';
  if (dirty) return 'Main tiene cambios locales: ordenar en una nueva FEATURE';
  if (!mainSynced) return 'Sincronizar main con origin/main';
  return 'Repo listo para la siguiente FEATURE';
}

async function handleRepoStatus(req, res) {
  const [status, branchName, head, mainLocal, mainRemote, branches, remoteBranches, prsRaw] = await Promise.all([
    runCommand('git', ['status', '--short', '--branch']),
    runCommand('git', ['branch', '--show-current']),
    runCommand('git', ['rev-parse', '--short', 'HEAD']),
    runCommand('git', ['rev-parse', '--short', 'main']),
    runCommand('git', ['rev-parse', '--short', 'origin/main']),
    runCommand('git', ['branch', '--format=%(refname:short)|%(objectname:short)|%(committerdate:relative)']),
    runCommand('git', ['branch', '-r', '--format=%(refname:short)|%(objectname:short)|%(committerdate:relative)']),
    runCommand('gh', ['pr', 'list', '--repo', GITHUB_REPO, '--state', 'all', '--limit', '30', '--json', 'number,title,state,headRefName,baseRefName,url,isDraft,mergeable,updatedAt,statusCheckRollup'])
  ]);
  const parsedStatus = parseBranchStatus(status.stdout);
  const pending = safeLines(status.stdout).filter(line => !line.startsWith('##'));
  const branch = branchName.stdout || parsedStatus.branch;
  let prs = [];
  if (prsRaw.ok && prsRaw.stdout) {
    try { prs = JSON.parse(prsRaw.stdout); } catch { prs = []; }
  }
  prs = prs.map(pr => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    branch: pr.headRefName,
    base: pr.baseRefName,
    url: pr.url,
    isDraft: Boolean(pr.isDraft),
    mergeable: pr.mergeable || 'UNKNOWN',
    updatedAt: pr.updatedAt,
    checks: checkSummary(pr.statusCheckRollup),
    statusCheckRollup: pr.statusCheckRollup || []
  }));
  const localFeatureBranches = safeLines(branches.stdout, 50)
    .map(line => {
      const [name, sha, updated] = line.replace(/^\*\s*/, '').split('|');
      return { name, sha, updated, scope: 'local' };
    })
    .filter(item => item.name && item.name !== 'main' && item.name.startsWith('feature/'));
  const remoteFeatureBranches = safeLines(remoteBranches.stdout, 80)
    .map(line => {
      const [rawName, sha, updated] = line.replace(/^\*\s*/, '').split('|');
      const name = String(rawName || '').replace(/^origin\//, '');
      return { name, sha, updated, scope: 'remote' };
    })
    .filter(item => item.name && item.name !== 'HEAD' && item.name !== 'main' && item.name.startsWith('feature/'));
  const branchMap = new Map();
  for (const item of [...localFeatureBranches, ...remoteFeatureBranches]) {
    const existing = branchMap.get(item.name) || { name: item.name, sha: item.sha, updated: item.updated, local: false, remote: false, hasPr: false };
    existing.local ||= item.scope === 'local';
    existing.remote ||= item.scope === 'remote';
    existing.sha ||= item.sha;
    existing.updated ||= item.updated;
    existing.hasPr = prs.some(pr => pr.branch === item.name);
    branchMap.set(item.name, existing);
  }
  const featureBranches = [...branchMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const cleanupBranches = featureBranches
    .map(item => {
      const mergedPr = prs.find(pr => pr.branch === item.name && pr.state === 'MERGED');
      return mergedPr ? { ...item, pr: { number: mergedPr.number, title: mergedPr.title, url: mergedPr.url, state: mergedPr.state } } : null;
    })
    .filter(Boolean);
  const dirty = pending.length > 0;
  const mainSynced = Boolean(mainLocal.ok && mainRemote.ok && mainLocal.stdout === mainRemote.stdout);
  sendJson(res, 200, {
    ok: true,
    generatedAt: new Date().toISOString(),
    repo: { name: GITHUB_REPO, url: `https://github.com/${GITHUB_REPO}`, root: REPO_ROOT },
    local: {
      branch,
      head: head.stdout || null,
      dirty,
      pending,
      ahead: parsedStatus.ahead,
      behind: parsedStatus.behind
    },
    main: {
      local: mainLocal.stdout || null,
      remote: mainRemote.stdout || null,
      synced: mainSynced
    },
    branches: featureBranches,
    cleanupBranches,
    pullRequests: prs,
    github: { ok: prsRaw.ok, error: prsRaw.ok ? null : (prsRaw.stderr || prsRaw.error || 'gh_failed') },
    nextAction: nextRepoAction({ dirty, branch, prs, mainSynced, githubOk: prsRaw.ok })
  });
}

async function readBody(req, limit = MAX_UPLOAD) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('body_too_large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=(?:(?:"([^"]+)")|([^;]+))/i.exec(contentType || '');
  if (!boundaryMatch) throw new Error('missing_boundary');
  const boundary = Buffer.from('--' + (boundaryMatch[1] || boundaryMatch[2]));
  const parts = [];
  let start = buffer.indexOf(boundary);
  while (start !== -1) {
    start += boundary.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;
    const rawHeaders = buffer.slice(start, headerEnd).toString('utf8');
    let contentStart = headerEnd + 4;
    let next = buffer.indexOf(boundary, contentStart);
    if (next === -1) break;
    let content = buffer.slice(contentStart, next);
    if (content.length >= 2 && content[content.length - 2] === 13 && content[content.length - 1] === 10) {
      content = content.slice(0, -2);
    }
    parts.push({ rawHeaders, content });
    start = next;
  }
  return parts;
}

function filePart(parts) {
  for (const part of parts) {
    const disp = /content-disposition:\s*form-data;([^\r\n]+)/i.exec(part.rawHeaders)?.[1] || '';
    if (!/name="file"/.test(disp)) continue;
    const filename = /filename="([^"]*)"/i.exec(disp)?.[1] || 'upload';
    const mime = /content-type:\s*([^\r\n]+)/i.exec(part.rawHeaders)?.[1]?.trim().toLowerCase() || 'application/octet-stream';
    return { filename, mime, content: part.content };
  }
  return null;
}


async function readReminders() {
  try {
    const raw = await fs.readFile(REMINDERS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeReminders(items) {
  await fs.mkdir(path.dirname(REMINDERS_FILE), { recursive: true });
  await fs.writeFile(REMINDERS_FILE, JSON.stringify(items, null, 2));
}

async function handleListReminders(req, res) {
  const items = await readReminders();
  sendJson(res, 200, { ok: true, items });
}

async function handleAddReminder(req, res) {
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const text = String(data.text || '').trim();
  if (!text) return sendJson(res, 400, { ok: false, error: 'missing_text' });
  if (text.length > 300) return sendJson(res, 400, { ok: false, error: 'text_too_long' });
  const when = String(data.when || '').trim().slice(0, 80);
  const priority = ['low', 'normal', 'high'].includes(data.priority) ? data.priority : 'normal';
  const items = await readReminders();
  const item = {
    id: crypto.randomUUID(),
    text,
    when,
    priority,
    done: false,
    createdAt: new Date().toISOString(),
    doneAt: null
  };
  items.unshift(item);
  await writeReminders(items);
  sendJson(res, 201, { ok: true, item });
}

async function handleCompleteReminder(req, res) {
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const id = String(data.id || '');
  const items = await readReminders();
  const item = items.find(x => x.id === id);
  if (!item) return sendJson(res, 404, { ok: false, error: 'not_found' });
  item.done = true;
  item.doneAt = new Date().toISOString();
  await writeReminders(items);
  sendJson(res, 200, { ok: true, item });
}


async function findExistingFileByHash(hash) {
  const filesDir = path.join(DATA, 'files');
  const names = await fs.readdir(filesDir).catch(() => []);
  for (const name of names) {
    const filePath = path.join(filesDir, name);
    let stat;
    try { stat = await fs.stat(filePath); } catch { continue; }
    if (!stat.isFile()) continue;
    const body = await fs.readFile(filePath);
    const existingHash = crypto.createHash('sha256').update(body).digest('hex');
    if (existingHash !== hash) continue;
    const id = name.split('_').slice(0, 2).join('_');
    const metaPath = path.join(DATA, 'meta', `${id}.json`);
    let meta = null;
    try { meta = JSON.parse(await fs.readFile(metaPath, 'utf8')); } catch { meta = null; }
    return { id, name, path: filePath, bytes: stat.size, meta };
  }
  return null;
}

async function handleUpload(req, res) {
  const body = await readBody(req);
  const part = filePart(parseMultipart(body, req.headers['content-type']));
  if (!part || !part.content.length) return sendJson(res, 400, { ok: false, error: 'missing_file' });
  const ext = allowedMime.get(part.mime);
  if (!ext) return sendJson(res, 415, { ok: false, error: 'unsupported_type', mime: part.mime });
  const original = safeName(part.filename);
  const sha256 = crypto.createHash('sha256').update(part.content).digest('hex');
  const duplicateOf = await findExistingFileByHash(sha256);
  if (duplicateOf) {
    return sendJson(res, 200, {
      ok: true,
      duplicate: true,
      message: 'Archivo duplicado detectado. No se guardó ni se reprocesó.',
      original: duplicateOf.meta || { id: duplicateOf.id, storedName: duplicateOf.name, path: duplicateOf.path, bytes: duplicateOf.bytes },
      upload: { originalName: original, mime: part.mime, bytes: part.content.length, sha256 }
    });
  }
  const id = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}`;
  const storedName = `${id}_${original.endsWith(ext) ? original : original + ext}`;
  const filePath = path.join(DATA, 'files', storedName);
  await fs.writeFile(filePath, part.content, { flag: 'wx' });
  const isImage = part.mime.startsWith('image/');
  const isPdf = part.mime === 'application/pdf';
  const meta = {
    id,
    kind: 'file',
    originalName: original,
    storedName,
    mime: part.mime,
    bytes: part.content.length,
    sha256,
    path: filePath,
    imageProcessing: isImage ? 'queued' : 'not_applicable',
    pdfProcessing: isPdf ? 'queued' : 'not_applicable',
    createdAt: new Date().toISOString()
  };
  const metaPath = path.join(DATA, 'meta', `${id}.json`);
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), { flag: 'wx' });
  if (isImage) runImageTools(filePath, id);
  if (isPdf) runPdfTools(filePath, id);
  sendJson(res, 201, { ok: true, item: meta, metaPath });
}

async function handleText(req, res) {
  const data = JSON.parse((await readBody(req, 1024 * 1024)).toString('utf8'));
  const text = String(data.text || '').trim();
  if (!text) return sendJson(res, 400, { ok: false, error: 'missing_text' });
  const title = safeName(data.title || 'text');
  const id = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}`;
  const filePath = path.join(DATA, 'texts', `${id}_${title}.md`);
  const content = `# ${data.title || 'Texto'}\n\n${text}\n`;
  await fs.writeFile(filePath, content, { flag: 'wx' });
  const meta = { id, kind: 'text', title: data.title || '', path: filePath, createdAt: new Date().toISOString() };
  const metaPath = path.join(DATA, 'meta', `${id}.json`);
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), { flag: 'wx' });
  sendJson(res, 201, { ok: true, item: meta, metaPath });
}



async function handleVoiceListen(req, res) {
  const totalStart = process.hrtime.bigint();
  const url = new URL(req.url, 'http://localhost');
  const requestedModel = String(url.searchParams.get('model') || 'small').trim().toLowerCase();
  if (!ALLOWED_STT_MODELS.has(requestedModel)) return sendJson(res, 400, { ok: false, error: 'unsupported_stt_model', model: requestedModel, allowed: [...ALLOWED_STT_MODELS] });
  const body = await readBody(req, 12 * 1024 * 1024);
  const part = filePart(parseMultipart(body, req.headers['content-type']));
  if (!part) return sendJson(res, 400, { ok: false, error: 'missing_audio' });
  const rawMime = String(part.mime || '').toLowerCase();
  const mime = rawMime.split(';')[0].trim();
  if (!['audio/webm', 'audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'].includes(mime)) {
    return sendJson(res, 400, { ok: false, error: 'unsupported_audio_type', mime: rawMime });
  }
  const ext = mime.includes('wav') ? '.wav' : mime.includes('mpeg') ? '.mp3' : mime.includes('mp4') ? '.m4a' : mime.includes('ogg') ? '.ogg' : '.webm';
  const id = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}`;
  const audioPath = path.join(VOICE_IN_DIR, `${id}_ptt${ext}`);
  if (part.content.length < 1024) return sendJson(res, 400, { ok: false, error: 'audio_too_small', bytes: part.content.length });
  await fs.writeFile(audioPath, part.content, { flag: 'wx' });
  const sttStart = process.hrtime.bigint();
  const result = await runCommand(VOICE_PYTHON, [STT_SCRIPT, audioPath, '--language', 'es', '--model', requestedModel], { cwd: REPO_ROOT, timeout: 240000 });
  const sttMs = elapsedMs(sttStart);
  let payload = null;
  try { payload = JSON.parse(result.stdout || '{}'); } catch { payload = null; }
  const metrics = { sttMs, totalMs: elapsedMs(totalStart) };
  if (!result.ok || !payload?.ok) {
    await appendVoiceMetric({ kind: 'stt', ok: false, metrics, inputBytes: part.content.length, error: payload?.error || result.error || 'stt_failed' });
    return sendJson(res, 503, {
      ok: false,
      error: payload?.error || result.error || 'stt_failed',
      hint: payload?.hint || 'Revisar faster-whisper/modelo/audio local.',
      detail: payload || { stderr: result.stderr },
      audioPath,
      metrics
    });
  }
  await appendVoiceMetric({ kind: 'stt', ok: true, metrics, model: payload.model, audioSeconds: payload.duration, inputBytes: part.content.length, textLength: payload.textLength });
  return sendJson(res, 201, {
    ok: true,
    text: payload.text,
    language: payload.language,
    languageProbability: payload.languageProbability,
    duration: payload.duration,
    model: payload.model,
    metrics,
    textLength: payload.textLength,
    audioPath,
    createdAt: new Date().toISOString()
  });
}

async function handleVoiceTts(req, res) {
  const totalStart = process.hrtime.bigint();
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const text = String(data.text || '').trim();
  if (!text) return sendJson(res, 400, { ok: false, error: 'missing_text' });
  if (text.length > 800) return sendJson(res, 400, { ok: false, error: 'text_too_long', max: 800 });
  const outName = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}_nia.wav`;
  const outPath = path.join(VOICE_OUT_DIR, outName);
  const ttsStart = process.hrtime.bigint();
  const result = await runCommand('python3', [PIPER_SCRIPT, text, '--out', outPath], { cwd: REPO_ROOT, timeout: 120000 });
  const metrics = { ttsMs: elapsedMs(ttsStart), totalMs: elapsedMs(totalStart) };
  let payload = null;
  try { payload = JSON.parse(result.stdout || '{}'); } catch { payload = null; }
  if (!result.ok || !payload?.ok) {
    await appendVoiceMetric({ kind: 'tts', ok: false, metrics, textLength: text.length, error: payload?.error || result.error || 'tts_failed' });
    return sendJson(res, 503, {
      ok: false,
      error: payload?.error || result.error || 'tts_failed',
      hint: payload?.hint || 'Revisar instalación Piper/modelo local.',
      detail: payload || { stderr: result.stderr },
      metrics
    });
  }
  await appendVoiceMetric({ kind: 'tts', ok: true, metrics, textLength: payload.textLength });
  return sendJson(res, 201, {
    ok: true,
    audioUrl: `/voice/outputs/${outName}`,
    output: payload.output,
    bytes: payload.bytes,
    metrics,
    textLength: payload.textLength,
    createdAt: new Date().toISOString()
  });
}

function extractAgentText(payload) {
  const direct = payload?.result?.payloads?.find(item => typeof item?.text === 'string' && item.text.trim())?.text;
  const metaVisible = payload?.result?.meta?.finalAssistantVisibleText;
  const metaRaw = payload?.result?.meta?.finalAssistantRawText;
  return String(direct || metaVisible || metaRaw || '').trim();
}

function voiceAgentPrompt(text, mode = 'fast') {
  if (mode === 'full') {
    return [
      'Mensaje recibido desde el panel de voz de Albert.',
      'Responde en español, en primera persona como Nia, de forma natural y breve.',
      'La respuesta se leerá en voz alta con Piper: máximo 700 caracteres, sin tablas y sin markdown pesado.',
      '',
      `Mensaje de Albert: ${text}`
    ].join('\n');
  }
  return [
    'Modo voz rápido de Nia.',
    'Responde como una conversación oral: directo, natural y corto.',
    'No uses herramientas, no revises archivos, no hagas Git, no abras planes largos.',
    'Si la petición requiere ejecutar acciones reales, responde brevemente que necesita modo completo.',
    'Máximo 350 caracteres. Sin listas largas, sin markdown pesado.',
    '',
    `Albert dice: ${text}`
  ].join('\n');
}

async function createVoiceAudio(text) {
  const ttsStart = process.hrtime.bigint();
  const outName = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}_nia.wav`;
  const outPath = path.join(VOICE_OUT_DIR, outName);
  const result = await runCommand('python3', [PIPER_SCRIPT, text, '--out', outPath], { cwd: REPO_ROOT, timeout: 120000 });
  const metrics = { ttsMs: elapsedMs(ttsStart) };
  let payload = null;
  try { payload = JSON.parse(result.stdout || '{}'); } catch { payload = null; }
  if (!result.ok || !payload?.ok) {
    return { ok: false, error: payload?.error || result.error || 'tts_failed', detail: payload || { stderr: result.stderr }, metrics };
  }
  return { ok: true, audioUrl: `/voice/outputs/${outName}`, output: payload.output, bytes: payload.bytes, textLength: payload.textLength, metrics };
}

async function handleVoiceAskNia(req, res) {
  const totalStart = process.hrtime.bigint();
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const text = String(data.text || '').trim();
  const requestedMode = String(data.mode || 'fast').trim().toLowerCase();
  const mode = requestedMode === 'full' ? 'full' : 'fast';
  if (!text) return sendJson(res, 400, { ok: false, error: 'missing_text' });
  if (text.length > 1200) return sendJson(res, 400, { ok: false, error: 'text_too_long', max: 1200 });
  const prompt = voiceAgentPrompt(text, mode);
  const agentStart = process.hrtime.bigint();
  const agentId = mode === 'fast' ? VOICE_FAST_AGENT_ID : VOICE_AGENT_ID;
  const sessionId = mode === 'fast' ? VOICE_FAST_AGENT_SESSION : VOICE_AGENT_SESSION;
  const timeoutSeconds = mode === 'fast' ? VOICE_FAST_TIMEOUT_SECONDS : 180;
  const args = [
    'agent',
    '--agent', agentId,
    '--session-id', sessionId,
    '--message', prompt,
    '--thinking', 'off',
    '--timeout', String(timeoutSeconds),
    '--json'
  ];
  if (mode === 'fast' && VOICE_FAST_MODEL) args.splice(5, 0, '--model', VOICE_FAST_MODEL);
  const agent = await runCommand('openclaw', args, { cwd: REPO_ROOT, timeout: (timeoutSeconds + 30) * 1000 });
  const agentMs = elapsedMs(agentStart);
  let payload = null;
  try { payload = JSON.parse(agent.stdout || '{}'); } catch { payload = null; }
  const reply = extractAgentText(payload);
  if (!agent.ok || payload?.status !== 'ok' || !reply) {
    const metrics = { agentMs, totalMs: elapsedMs(totalStart) };
    await appendVoiceMetric({ kind: 'ask-nia', ok: false, metrics, textLength: text.length, error: agent.error || 'agent_failed' });
    return sendJson(res, 503, {
      ok: false,
      error: agent.error || 'agent_failed',
      hint: 'No se pudo obtener respuesta de Nia vía openclaw agent.',
      detail: { status: payload?.status || null, stderr: agent.stderr },
      metrics
    });
  }
  const maxReplyLength = mode === 'fast' ? 500 : 800;
  const spokenText = reply.length > maxReplyLength ? `${reply.slice(0, maxReplyLength - 3)}...` : reply;
  const audio = await createVoiceAudio(spokenText);
  const metrics = { agentMs, ttsMs: audio.metrics?.ttsMs || null, totalMs: elapsedMs(totalStart) };
  if (!audio.ok) {
    await appendVoiceMetric({ kind: 'ask-nia', ok: false, metrics, textLength: text.length, replyLength: reply.length, error: audio.error });
    return sendJson(res, 503, {
      ok: false,
      error: audio.error,
      hint: 'Nia respondió, pero Piper no pudo generar audio.',
      reply,
      detail: audio.detail,
      metrics
    });
  }
  await appendVoiceMetric({ kind: 'ask-nia', mode, ok: true, metrics, textLength: text.length, replyLength: reply.length });
  return sendJson(res, 201, {
    ok: true,
    reply,
    spokenText,
    audioUrl: audio.audioUrl,
    bytes: audio.bytes,
    metrics,
    mode,
    agent: { id: agentId, session: sessionId },
    createdAt: new Date().toISOString()
  });
}

async function serveVoiceOutput(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const name = path.basename(url.pathname);
  if (!/^[A-Za-z0-9._-]+\.wav$/.test(name)) return sendJson(res, 400, { ok: false, error: 'invalid_audio_name' });
  const filePath = path.resolve(VOICE_OUT_DIR, name);
  if (!filePath.startsWith(VOICE_OUT_DIR)) return sendJson(res, 403, { ok: false, error: 'forbidden' });
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    sendJson(res, 404, { ok: false, error: 'not_found' });
  }
}


async function readJsonFile(filePath) {
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return null; }
}

async function latestMetaItems(kind = null, limit = 8) {
  const metaDir = path.join(DATA, 'meta');
  const names = await fs.readdir(metaDir).catch(() => []);
  const items = [];
  for (const name of names.filter(name => name.endsWith('.json'))) {
    const item = await readJsonFile(path.join(metaDir, name));
    if (!item || (kind && item.kind !== kind)) continue;
    items.push(item);
  }
  items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return items.slice(0, limit);
}

async function tailJsonLines(filePath, limit = 8) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return raw.trim().split('\n').filter(Boolean).slice(-limit).map(line => {
      try { return JSON.parse(line); } catch { return { raw: line }; }
    }).reverse();
  } catch { return []; }
}

function parseToolLogStatus(text) {
  const scripts = [];
  for (const block of String(text || '').split('\n---\n')) {
    const script = /^script=(.+)$/m.exec(block)?.[1] || null;
    if (!script) continue;
    const ok = /^ok=true$/m.test(block);
    scripts.push({ script, ok });
  }
  return scripts;
}

async function imageActivityFor(item) {
  const logPath = path.join(DATA, 'meta', `${item.id}.image-tools.log`);
  let scripts = [];
  try { scripts = parseToolLogStatus(await fs.readFile(logPath, 'utf8')); } catch {}
  const filePath = String(item.path || '');
  const stem = path.basename(filePath).replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/\.[^.]+$/, '');
  const derived = path.join(DATA, 'derived', 'images');
  const exists = async suffix => !!(await fs.stat(path.join(derived, `${stem}${suffix}`)).catch(() => null));
  return {
    id: item.id,
    originalName: item.originalName,
    createdAt: item.createdAt,
    mime: item.mime,
    bytes: item.bytes,
    scripts,
    hasOcr: await exists('.ocr.txt'),
    hasVision: await exists('.vision.txt'),
    hasPreciseVision: await exists('.precise-vision.txt')
  };
}


async function processingStatusForFile(item) {
  const filePath = String(item.path || '');
  const stem = path.basename(filePath).replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/\.[^.]+$/, '');
  const derivedImages = path.join(DATA, 'derived', 'images');
  const derivedPdfs = path.join(DATA, 'derived', 'pdfs');
  const exists = async file => !!(await fs.stat(file).catch(() => null));
  const imageLogPath = path.join(DATA, 'meta', `${item.id}.image-tools.log`);
  const pdfLogPath = path.join(DATA, 'meta', `${item.id}.pdf-tools.log`);
  let imageScripts = [];
  let pdfScripts = [];
  try { imageScripts = parseToolLogStatus(await fs.readFile(imageLogPath, 'utf8')); } catch {}
  try { pdfScripts = parseToolLogStatus(await fs.readFile(pdfLogPath, 'utf8')); } catch {}
  const scriptStatus = name => {
    const script = imageScripts.find(s => s.script === name) || pdfScripts.find(s => s.script === name);
    if (!script) return 'pending';
    return script.ok ? 'done' : 'failed';
  };
  const tasks = [];
  if (String(item.mime || '').startsWith('image/')) {
    tasks.push({ name: 'inspect', status: scriptStatus('inspect_image.mjs') });
    tasks.push({ name: 'ocr', status: await exists(path.join(derivedImages, `${stem}.ocr.txt`)) ? 'done' : scriptStatus('ocr_image.mjs') });
    tasks.push({ name: 'vision-local', status: await exists(path.join(derivedImages, `${stem}.vision.txt`)) ? 'done' : scriptStatus('vision_image.mjs') });
    tasks.push({ name: 'vision-precise', status: await exists(path.join(derivedImages, `${stem}.precise-vision.txt`)) ? 'done' : 'manual' });
  } else if (item.mime === 'application/pdf') {
    tasks.push({ name: 'pdf-extract', status: await exists(path.join(derivedPdfs, `${stem}.txt`)) ? 'done' : scriptStatus('extract_pdf.sh') });
  }
  const rank = { failed: 0, pending: 1, manual: 2, done: 3 };
  const overall = tasks.some(t => t.status === 'failed') ? 'failed' : tasks.some(t => t.status === 'pending') ? 'pending' : 'done';
  return { id: item.id, originalName: item.originalName, mime: item.mime, createdAt: item.createdAt, overall, tasks };
}


async function readTextIfExists(filePath, maxChars = 5000) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return text.slice(0, maxChars);
  } catch { return null; }
}

function derivedStemForFile(filePath) {
  return path.basename(String(filePath || '')).replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/\.[^.]+$/, '');
}

async function latestFileMeta() {
  return (await latestMetaItems('file', 1))[0] || null;
}

async function handleAnalyzeLatestFile(req, res) {
  const item = await latestFileMeta();
  if (!item) return sendJson(res, 404, { ok: false, error: 'no_file_found' });
  const filePath = path.resolve(String(item.path || ''));
  const filesRoot = path.resolve(DATA, 'files');
  if (!filePath.startsWith(filesRoot + path.sep)) return sendJson(res, 403, { ok: false, error: 'forbidden_path' });
  const stem = derivedStemForFile(filePath);
  const mime = String(item.mime || '');
  const result = {
    ok: true,
    id: item.id,
    originalName: item.originalName,
    mime,
    createdAt: item.createdAt,
    kind: 'unknown',
    summary: '',
    details: {},
    recommendation: ''
  };
  if (mime.startsWith('image/')) {
    const derived = path.join(DATA, 'derived', 'images');
    const ocr = await readTextIfExists(path.join(derived, `${stem}.ocr.txt`), 3000);
    const vision = await readTextIfExists(path.join(derived, `${stem}.vision.txt`), 2000);
    const precise = await readTextIfExists(path.join(derived, `${stem}.precise-vision.txt`), 4000);
    result.kind = 'image';
    result.details = { hasOcr: Boolean(ocr), hasVision: Boolean(vision), hasPreciseVision: Boolean(precise), ocr, vision, precise };
    result.summary = precise || vision || ocr || 'Imagen recibida, pero aún no hay texto/análisis disponible.';
    result.recommendation = precise ? 'Ya tiene visión precisa.' : 'Si es importante o contiene texto pequeño, usa “visión precisa” con confirmación.';
  } else if (mime === 'application/pdf') {
    const derived = path.join(DATA, 'derived', 'pdfs');
    let text = await readTextIfExists(path.join(derived, `${stem}.txt`), 5000);
    if (!text) {
      const pdfTool = path.join(REPO_ROOT, 'pdf_tools', 'extract_pdf.sh');
      await runCommand(pdfTool, [filePath], { cwd: REPO_ROOT, timeout: 120000 });
      text = await readTextIfExists(path.join(derived, `${stem}.txt`), 5000);
    }
    result.kind = 'pdf';
    result.details = { hasText: Boolean(text), text };
    result.summary = text ? text.slice(0, 1200) : 'PDF recibido, pero no se pudo extraer texto todavía.';
    result.recommendation = text ? 'PDF extraído. Puedes pedir resumen o búsqueda sobre este texto.' : 'Revisar extracción PDF.';
  } else {
    result.summary = 'Archivo recibido. No hay analizador específico para este tipo todavía.';
    result.recommendation = 'Añadir soporte específico si este formato se repite.';
  }
  return sendJson(res, 200, result);
}

async function handleProcessingQueue(req, res) {
  const files = await latestMetaItems('file', 30);
  const items = [];
  for (const item of files) {
    const status = await processingStatusForFile(item);
    if (status.tasks.length) items.push(status);
  }
  return sendJson(res, 200, { ok: true, generatedAt: new Date().toISOString(), items: items.slice(0, 20) });
}

async function handleActivity(req, res) {
  const files = await latestMetaItems('file', 8);
  const filesWithPreview = files.map(item => ({
    ...item,
    previewUrl: String(item.mime || '').startsWith('image/') ? `/source-files/${encodeURIComponent(item.id)}` : null,
    fileType: String(item.mime || '').includes('pdf') ? 'pdf' : String(item.mime || '').startsWith('image/') ? 'image' : 'file'
  }));
  const texts = await latestMetaItems('text', 5);
  const urls = await latestMetaItems('url', 5);
  const imageItems = files.filter(item => String(item.mime || '').startsWith('image/')).slice(0, 5);
  const images = [];
  for (const item of imageItems) images.push(await imageActivityFor(item));
  const [branch, status, head] = await Promise.all([
    runCommand('git', ['branch', '--show-current']),
    runCommand('git', ['status', '--short']),
    runCommand('git', ['log', '-1', '--oneline', '--decorate'])
  ]);
  return sendJson(res, 200, {
    ok: true,
    generatedAt: new Date().toISOString(),
    latest: { files: filesWithPreview, texts, urls, images },
    voice: { metrics: await tailJsonLines(VOICE_METRICS_FILE, 8) },
    repo: {
      branch: branch.stdout || null,
      dirty: Boolean(status.stdout),
      pending: safeLines(status.stdout, 20),
      head: head.stdout || null
    }
  });
}

async function serveSourceFile(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const id = decodeURIComponent(url.pathname.replace(/^\/source-files\//, ''));
  const meta = await readMeta(id);
  if (!meta || meta.kind !== 'file') return sendJson(res, 404, { ok: false, error: 'not_found' }, req);
  const filePath = path.resolve(String(meta.path || ''));
  if (!filePath.startsWith(FILES_ROOT + path.sep)) return sendJson(res, 403, { ok: false, error: 'forbidden_path' }, req);
  const mime = String(meta.mime || 'application/octet-stream');
  if (!allowedMime.has(mime)) return sendJson(res, 415, { ok: false, error: 'unsupported_type' }, req);
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      'content-type': mime,
      'cache-control': 'private, max-age=300',
      'content-disposition': `inline; filename="${path.basename(filePath).replace(/"/g, '')}"`
    });
    if (req.method === 'HEAD') return res.end();
    res.end(body);
  } catch {
    return sendJson(res, 404, { ok: false, error: 'file_missing' }, req);
  }
}

async function handleUrl(req, res) {
  const data = JSON.parse((await readBody(req, 256 * 1024)).toString('utf8'));
  const url = String(data.url || '').trim();
  let parsed;
  try { parsed = new URL(url); } catch { return sendJson(res, 400, { ok: false, error: 'invalid_url' }); }
  if (!['http:', 'https:'].includes(parsed.protocol)) return sendJson(res, 400, { ok: false, error: 'unsupported_url_protocol' });
  const id = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}`;
  const filePath = path.join(DATA, 'urls', `${id}.md`);
  const content = `# URL\n\n- URL: ${url}\n- Added: ${new Date().toISOString()}\n\n## Nota\n\n${String(data.note || '').trim()}\n`;
  await fs.writeFile(filePath, content, { flag: 'wx' });
  const meta = { id, kind: 'url', url, note: data.note || '', path: filePath, createdAt: new Date().toISOString() };
  const metaPath = path.join(DATA, 'meta', `${id}.json`);
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), { flag: 'wx' });
  sendJson(res, 201, { ok: true, item: meta, metaPath });
}


async function handleHealthcheckQuick(req, res) {
  const result = await runCommand('python3', ['tools/healthcheck.py', '--quick'], { cwd: REPO_ROOT, timeout: 120000 });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  const lines = output.split('\n').filter(Boolean).slice(-40);
  return sendJson(res, result.ok ? 200 : 503, {
    ok: result.ok,
    status: result.ok ? 'SYSTEM_HEALTH_PASS' : 'SYSTEM_HEALTH_FAIL',
    output: lines.join('\n'),
    code: result.code,
    createdAt: new Date().toISOString()
  });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.resolve(PUBLIC, '.' + rel);
  if (!filePath.startsWith(PUBLIC)) return sendJson(res, 403, { ok: false, error: 'forbidden' }, req);
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, { 'content-type': filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    res.end(body);
  } catch {
    sendJson(res, 404, { ok: false, error: 'not_found' }, req);
  }
}

await ensureDirs();
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/api/reminders') return await handleListReminders(req, res);
    if (req.method === 'GET' && pathname === '/api/repo/status') return await handleRepoStatus(req, res);
    if (req.method === 'GET' && pathname === '/api/activity') return await handleActivity(req, res);
    if ((req.method === 'GET' || req.method === 'HEAD') && pathname.startsWith('/source-files/')) return await serveSourceFile(req, res);
    if (req.method === 'GET' && pathname === '/api/processing-queue') return await handleProcessingQueue(req, res);
    if (req.method === 'POST' && pathname === '/api/analyze-latest-file') return await handleAnalyzeLatestFile(req, res);
    if (req.method === 'POST' && pathname === '/api/healthcheck/quick') return await handleHealthcheckQuick(req, res);
    if (req.method === 'POST' && pathname === '/api/reminders') return await handleAddReminder(req, res);
    if (req.method === 'POST' && pathname === '/api/reminders/complete') return await handleCompleteReminder(req, res);
    if (req.method === 'POST' && pathname === '/api/upload') return await handleUpload(req, res);
    if (req.method === 'POST' && pathname === '/api/text') return await handleText(req, res);
    if (req.method === 'POST' && pathname === '/api/url') return await handleUrl(req, res);
    if (req.method === 'POST' && pathname === '/api/voice/tts') return await handleVoiceTts(req, res);
    if (req.method === 'POST' && pathname === '/api/voice/listen') return await handleVoiceListen(req, res);
    if (req.method === 'POST' && pathname === '/api/voice/ask-nia') return await handleVoiceAskNia(req, res);
    if (req.method === 'POST' && pathname === '/api/image/precise-vision') return await handleImagePreciseVision(req, res);
    if (req.method === 'GET' && pathname.startsWith('/voice/outputs/')) return await serveVoiceOutput(req, res);
    if (req.method === 'GET' || req.method === 'HEAD') return await serveStatic(req, res);
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' }, req);
  } catch (err) {
    sendJson(res, err.message === 'body_too_large' ? 413 : 500, { ok: false, error: err.message });
  }
});
server.listen(PORT, HOST, () => {
  console.log(`Source Inbox Dashboard listening on http://${HOST}:${PORT}`);
});
