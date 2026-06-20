#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path('/openclaw/openclaw_v2')
TRANSCRIBE = ROOT / 'voice_tools' / 'transcribe_audio.py'
DEFAULT_INPUTS = ROOT / 'data' / 'voice' / 'inputs'
OUT_DIR = ROOT / 'data' / 'voice' / 'stt-benchmarks'
PYTHON = ROOT / 'voice_tools' / '.venv' / 'bin' / 'python'


def latest_audio(limit: int):
    files = [p for p in DEFAULT_INPUTS.glob('*') if p.suffix.lower() in {'.wav', '.webm', '.mp3', '.m4a', '.ogg'} and p.stat().st_size > 1024]
    return sorted(files, key=lambda p: p.stat().st_mtime, reverse=True)[:limit]


def run_one(audio: Path, model: str, language: str, timeout: int):
    start = time.perf_counter()
    cmd = [str(PYTHON if PYTHON.exists() else sys.executable), str(TRANSCRIBE), str(audio), '--language', language, '--model', model]
    proc = subprocess.run(cmd, cwd=str(ROOT), text=True, capture_output=True, timeout=timeout)
    elapsed_ms = round((time.perf_counter() - start) * 1000)
    payload = None
    try:
        payload = json.loads(proc.stdout or '{}')
    except Exception:
        payload = None
    ok = proc.returncode == 0 and bool(payload and payload.get('ok'))
    return {
        'ok': ok,
        'model': model,
        'audio': str(audio),
        'audioBytes': audio.stat().st_size,
        'elapsedMs': elapsed_ms,
        'text': payload.get('text') if payload else None,
        'language': payload.get('language') if payload else None,
        'languageProbability': payload.get('languageProbability') if payload else None,
        'duration': payload.get('duration') if payload else None,
        'textLength': payload.get('textLength') if payload else None,
        'error': None if ok else ((payload or {}).get('error') or proc.stderr[-500:] or 'transcription_failed')
    }


def main():
    ap = argparse.ArgumentParser(description='Benchmark local STT models with real voice inputs.')
    ap.add_argument('audio', nargs='*', help='Audio files. Defaults to latest voice inputs.')
    ap.add_argument('--models', default='base,small', help='Comma-separated models, e.g. base,small,medium')
    ap.add_argument('--language', default='es')
    ap.add_argument('--latest', type=int, default=3, help='How many latest audios to use when no files are provided.')
    ap.add_argument('--timeout', type=int, default=300)
    ap.add_argument('--write', action='store_true', help='Write JSON result under data/voice/stt-benchmarks/')
    args = ap.parse_args()

    audios = [Path(x).expanduser().resolve() for x in args.audio] if args.audio else latest_audio(args.latest)
    models = [m.strip() for m in args.models.split(',') if m.strip()]
    if not audios:
        print(json.dumps({'ok': False, 'error': 'no_audio_files'}, ensure_ascii=False))
        return 2
    rows = []
    for audio in audios:
        if not audio.exists():
            rows.append({'ok': False, 'audio': str(audio), 'error': 'audio_not_found'})
            continue
        for model in models:
            rows.append(run_one(audio, model, args.language, args.timeout))
    result = {
        'ok': all(r.get('ok') for r in rows),
        'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'models': models,
        'audioCount': len(audios),
        'rows': rows,
    }
    if args.write:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        out = OUT_DIR / f"stt-benchmark-{time.strftime('%Y%m%d-%H%M%S', time.gmtime())}.json"
        out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
        result['output'] = str(out)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
