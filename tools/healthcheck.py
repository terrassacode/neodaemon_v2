#!/usr/bin/env python3
import argparse
import json
import os
import ssl
import subprocess
import time
from pathlib import Path
from urllib import request

ROOT = Path('/openclaw/openclaw_v2')
DASHBOARD = os.environ.get('HEALTHCHECK_DASHBOARD_URL', 'https://bunker-ia.tail20d249.ts.net')
CTX = ssl._create_unverified_context()

class CheckFail(Exception):
    pass

def run(cmd, timeout=30):
    return subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, timeout=timeout)

def http(method, path, body=None, headers=None, timeout=30):
    url = DASHBOARD.rstrip('/') + path
    data = body if isinstance(body, bytes) else (body.encode('utf-8') if body is not None else None)
    req = request.Request(url, data=data, headers=headers or {}, method=method)
    with request.urlopen(req, timeout=timeout, context=CTX) as res:
        raw = res.read()
        ctype = res.headers.get('content-type', '')
        if 'application/json' in ctype:
            return json.loads(raw.decode('utf-8'))
        return raw.decode('utf-8', errors='replace')

def multipart_file(field, filename, content, mime):
    boundary = '----openclaw-healthcheck-%d' % int(time.time() * 1000)
    body = b''.join([
        f'--{boundary}\r\n'.encode(),
        f'Content-Disposition: form-data; name="{field}"; filename="{filename}"\r\n'.encode(),
        f'Content-Type: {mime}\r\n\r\n'.encode(),
        content,
        f'\r\n--{boundary}--\r\n'.encode(),
    ])
    return body, {'content-type': f'multipart/form-data; boundary={boundary}'}

def check(name, fn, results):
    start = time.perf_counter()
    try:
        detail = fn() or 'OK'
        ms = round((time.perf_counter() - start) * 1000)
        results.append({'name': name, 'ok': True, 'ms': ms, 'detail': str(detail)[:300]})
        print(f'PASS {name} ({ms} ms)')
    except Exception as exc:
        ms = round((time.perf_counter() - start) * 1000)
        results.append({'name': name, 'ok': False, 'ms': ms, 'detail': str(exc)[:500]})
        print(f'FAIL {name}: {exc}')

def git_clean():
    p = run(['git', 'status', '--short'], timeout=10)
    if p.returncode != 0:
        raise CheckFail(p.stderr or p.stdout)
    dirty = [line for line in p.stdout.splitlines() if line.strip()]
    allowed = [line for line in dirty if line.endswith('MEMORY.md')]
    unexpected = [line for line in dirty if line not in allowed]
    if unexpected:
        raise CheckFail('working tree dirty: ' + '; '.join(unexpected[:5]))
    return 'working tree clean' if not dirty else 'only MEMORY.md dirty'

def git_main_synced():
    local = run(['git', 'rev-parse', '--short', 'main'], timeout=10)
    remote = run(['git', 'rev-parse', '--short', 'origin/main'], timeout=10)
    if local.returncode != 0:
        raise CheckFail(local.stderr or local.stdout)
    if remote.returncode != 0:
        raise CheckFail(remote.stderr or remote.stdout)
    local_sha = local.stdout.strip()
    remote_sha = remote.stdout.strip()
    if local_sha != remote_sha:
        raise CheckFail(f'main={local_sha or "?"} origin={remote_sha or "?"}')
    return local_sha

def dashboard_home():
    html = http('GET', '/', timeout=20)
    if 'Source Inbox' not in html and 'Voz de Nia' not in html:
        raise CheckFail('unexpected dashboard HTML')
    return 'dashboard HTML OK'

def repo_status():
    data = http('GET', '/api/repo/status', timeout=30)
    if not data.get('ok'):
        raise CheckFail(data)
    if data.get('cleanupBranches'):
        raise CheckFail(f"cleanupBranches={len(data.get('cleanupBranches'))}")
    if not data.get('main', {}).get('synced'):
        raise CheckFail('main not synced according to dashboard')
    return data.get('nextAction', 'repo OK')

def reminders_api():
    data = http('GET', '/api/reminders', timeout=20)
    if not data.get('ok') or not isinstance(data.get('items'), list):
        raise CheckFail(data)
    return f"{len(data['items'])} reminders"

def source_text_api():
    payload = json.dumps({'title': 'healthcheck', 'text': 'OpenClaw healthcheck text probe'}).encode()
    data = http('POST', '/api/text', body=payload, headers={'content-type': 'application/json'}, timeout=20)
    if not data.get('ok'):
        raise CheckFail(data)
    return 'text accepted'

def latest_wav():
    files = sorted((ROOT / 'data/voice/inputs').glob('*.wav'), key=lambda p: p.stat().st_mtime, reverse=True)
    for p in files:
        if p.stat().st_size > 1024:
            return p
    raise CheckFail('no WAV input found')

def voice_stt_small():
    wav = latest_wav()
    body, headers = multipart_file('file', wav.name, wav.read_bytes(), 'audio/wav')
    data = http('POST', '/api/voice/listen?model=small', body=body, headers=headers, timeout=300)
    if not data.get('ok') or data.get('model') != 'small':
        raise CheckFail(data)
    return f"small {data.get('metrics',{}).get('sttMs')} ms: {data.get('text','')[:60]}"

def voice_tts():
    payload = json.dumps({'text': 'Prueba de salud de voz.'}).encode()
    data = http('POST', '/api/voice/tts', body=payload, headers={'content-type': 'application/json'}, timeout=180)
    if not data.get('ok') or not str(data.get('audioUrl','')).endswith('.wav'):
        raise CheckFail(data)
    return f"tts {data.get('metrics',{}).get('ttsMs')} ms"

def voice_ask_nia():
    payload = json.dumps({'text': 'Responde breve: healthcheck OK.'}).encode()
    data = http('POST', '/api/voice/ask-nia', body=payload, headers={'content-type': 'application/json'}, timeout=300)
    if not data.get('ok') or not data.get('reply'):
        raise CheckFail(data)
    return f"agent {data.get('metrics',{}).get('agentMs')} ms"

def gmail_drafts():
    gmail_python = ROOT / 'gmail_v2' / '.venv' / 'bin' / 'python'
    python_bin = str(gmail_python) if gmail_python.exists() else 'python3'
    p = run([python_bin, 'gmail_v2/list_drafts.py'], timeout=120)
    out = (p.stdout + p.stderr).strip()
    if p.returncode != 0:
        raise CheckFail(out[:500])
    return out.splitlines()[-1] if out else 'gmail OK'

def main():
    ap = argparse.ArgumentParser(description='OpenClaw system healthcheck')
    ap.add_argument('--quick', action='store_true', help='Core checks only')
    ap.add_argument('--full', action='store_true', help='Core + integrations')
    ap.add_argument('--json', action='store_true', help='Emit JSON summary after text output')
    args = ap.parse_args()
    full = args.full or not args.quick
    results = []
    checks = [
        ('core.git_clean', git_clean),
        ('core.git_main_synced', git_main_synced),
        ('core.dashboard_home', dashboard_home),
        ('core.repo_status', repo_status),
        ('input.reminders_api', reminders_api),
    ]
    if full:
        checks += [
            ('input.source_text_api', source_text_api),
            ('voice.stt_small', voice_stt_small),
            ('voice.tts', voice_tts),
            ('voice.ask_nia', voice_ask_nia),
            ('integrations.gmail_drafts', gmail_drafts),
        ]
    for name, fn in checks:
        check(name, fn, results)
    ok = all(r['ok'] for r in results)
    print('SYSTEM_HEALTH_PASS' if ok else 'SYSTEM_HEALTH_FAIL')
    if args.json:
        print(json.dumps({'ok': ok, 'mode': 'full' if full else 'quick', 'results': results}, indent=2, ensure_ascii=False))
    return 0 if ok else 1

if __name__ == '__main__':
    raise SystemExit(main())
