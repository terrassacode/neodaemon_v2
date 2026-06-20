#!/usr/bin/env python3
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

ROOT = Path('/openclaw/openclaw_v2')
MODEL_DIR = ROOT / 'data' / 'voice' / 'piper-models'
OUT_DIR = ROOT / 'data' / 'voice' / 'outputs'
DEFAULT_MODEL = MODEL_DIR / 'voice.onnx'
DEFAULT_CONFIG = MODEL_DIR / 'voice.onnx.json'


def find_piper() -> str | None:
    candidates = [
        ROOT / 'voice_tools' / '.venv' / 'bin' / 'piper',
        ROOT / 'voice_tools' / '.venv' / 'bin' / 'piper-tts',
    ]
    for c in candidates:
        if c.exists() and os.access(c, os.X_OK):
            return str(c)
    return shutil.which('piper') or shutil.which('piper-tts')


def main() -> int:
    parser = argparse.ArgumentParser(description='Generate local speech with Piper TTS.')
    parser.add_argument('text', nargs='?', help='Text to synthesize')
    parser.add_argument('--text-file', help='Read text from file')
    parser.add_argument('--model', default=str(DEFAULT_MODEL), help='Piper .onnx model path')
    parser.add_argument('--config', default=str(DEFAULT_CONFIG), help='Piper .onnx.json config path')
    parser.add_argument('--out', help='Output wav path')
    args = parser.parse_args()

    text = args.text or ''
    if args.text_file:
        text = Path(args.text_file).read_text(encoding='utf-8')
    text = text.strip()
    if not text:
        print(json.dumps({'ok': False, 'error': 'empty_text'}))
        return 2

    piper = find_piper()
    if not piper:
        print(json.dumps({'ok': False, 'error': 'piper_not_installed', 'hint': 'Run: python3 -m venv voice_tools/.venv && voice_tools/.venv/bin/pip install -r voice_tools/requirements.txt'}))
        return 3

    model = Path(args.model)
    config = Path(args.config)
    if not model.exists() or not config.exists():
        print(json.dumps({'ok': False, 'error': 'piper_model_missing', 'model': str(model), 'config': str(config), 'hint': 'Place a Piper .onnx model and .onnx.json config in data/voice/piper-models as voice.onnx and voice.onnx.json'}))
        return 4

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = Path(args.out) if args.out else OUT_DIR / f'nia-{uuid4().hex[:12]}.wav'
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = [piper, '--model', str(model), '--config', str(config), '--output_file', str(out)]
    proc = subprocess.run(cmd, input=text, text=True, capture_output=True)
    if proc.returncode != 0:
        print(json.dumps({'ok': False, 'error': 'piper_failed', 'stderr': proc.stderr[-1000:]}))
        return proc.returncode

    print(json.dumps({'ok': True, 'output': str(out), 'bytes': out.stat().st_size, 'textLength': len(text)}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
