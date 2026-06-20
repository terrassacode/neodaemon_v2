import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';

const ROOT = path.resolve('/openclaw/openclaw_v2/source_inbox_dashboard');
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.resolve('/openclaw/openclaw_v2/data/source-inbox');
const MAX_UPLOAD = 25 * 1024 * 1024;
const PORT = Number(process.env.SOURCE_INBOX_PORT || 8788);
const HOST = process.env.SOURCE_INBOX_HOST || '127.0.0.1';
const REMINDERS_FILE = '/openclaw/openclaw_v2/data/daily-reminders/reminders.json';
const REPO_ROOT = path.resolve('/openclaw/openclaw_v2');
const GITHUB_REPO = 'terrassacode/neodaemon_v2';
const SECRET_TOKEN_RE = new RegExp(`gho${'_'}[A-Za-z0-9_]+|github${'_'}pat${'_'}[A-Za-z0-9_]+`, 'g');
const VOICE_OUT_DIR = path.resolve('/openclaw/openclaw_v2/data/voice/outputs');
const PIPER_SCRIPT = path.resolve('/openclaw/openclaw_v2/voice_tools/piper_say.py');

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

function safeName(name) {
  const base = path.basename(String(name || 'source')).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return base || 'source';
}

async function ensureDirs() {
  await fs.mkdir(path.join(DATA, 'files'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'texts'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'urls'), { recursive: true });
  await fs.mkdir(path.join(DATA, 'meta'), { recursive: true });
  await fs.mkdir(VOICE_OUT_DIR, { recursive: true });
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
  })();
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
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

async function handleUpload(req, res) {
  const body = await readBody(req);
  const part = filePart(parseMultipart(body, req.headers['content-type']));
  if (!part || !part.content.length) return sendJson(res, 400, { ok: false, error: 'missing_file' });
  const ext = allowedMime.get(part.mime);
  if (!ext) return sendJson(res, 415, { ok: false, error: 'unsupported_type', mime: part.mime });
  const original = safeName(part.filename);
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


async function handleVoiceTts(req, res) {
  const data = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
  const text = String(data.text || '').trim();
  if (!text) return sendJson(res, 400, { ok: false, error: 'missing_text' });
  if (text.length > 800) return sendJson(res, 400, { ok: false, error: 'text_too_long', max: 800 });
  const outName = `${nowStamp()}_${crypto.randomUUID().slice(0, 8)}_nia.wav`;
  const outPath = path.join(VOICE_OUT_DIR, outName);
  const result = await runCommand('python3', [PIPER_SCRIPT, text, '--out', outPath], { cwd: REPO_ROOT, timeout: 120000 });
  let payload = null;
  try { payload = JSON.parse(result.stdout || '{}'); } catch { payload = null; }
  if (!result.ok || !payload?.ok) {
    return sendJson(res, 503, {
      ok: false,
      error: payload?.error || result.error || 'tts_failed',
      hint: payload?.hint || 'Revisar instalación Piper/modelo local.',
      detail: payload || { stderr: result.stderr }
    });
  }
  return sendJson(res, 201, {
    ok: true,
    audioUrl: `/voice/outputs/${outName}`,
    output: payload.output,
    bytes: payload.bytes,
    textLength: payload.textLength,
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

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.resolve(PUBLIC, '.' + rel);
  if (!filePath.startsWith(PUBLIC)) return sendJson(res, 403, { ok: false, error: 'forbidden' });
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, { 'content-type': filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    res.end(body);
  } catch {
    sendJson(res, 404, { ok: false, error: 'not_found' });
  }
}

await ensureDirs();
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/reminders') return await handleListReminders(req, res);
    if (req.method === 'GET' && req.url === '/api/repo/status') return await handleRepoStatus(req, res);
    if (req.method === 'POST' && req.url === '/api/reminders') return await handleAddReminder(req, res);
    if (req.method === 'POST' && req.url === '/api/reminders/complete') return await handleCompleteReminder(req, res);
    if (req.method === 'POST' && req.url === '/api/upload') return await handleUpload(req, res);
    if (req.method === 'POST' && req.url === '/api/text') return await handleText(req, res);
    if (req.method === 'POST' && req.url === '/api/url') return await handleUrl(req, res);
    if (req.method === 'POST' && req.url === '/api/voice/tts') return await handleVoiceTts(req, res);
    if (req.method === 'GET' && req.url.startsWith('/voice/outputs/')) return await serveVoiceOutput(req, res);
    if (req.method === 'GET') return await serveStatic(req, res);
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  } catch (err) {
    sendJson(res, err.message === 'body_too_large' ? 413 : 500, { ok: false, error: err.message });
  }
});
server.listen(PORT, HOST, () => {
  console.log(`Source Inbox Dashboard listening on http://${HOST}:${PORT}`);
});
