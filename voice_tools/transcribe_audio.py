#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

ROOT = Path('/openclaw/openclaw_v2')
MODEL_DIR = ROOT / 'data' / 'voice' / 'stt-models'
DEFAULT_MODEL = 'small'


def main() -> int:
    parser = argparse.ArgumentParser(description='Transcribe local audio with faster-whisper.')
    parser.add_argument('audio', help='Audio file path')
    parser.add_argument('--model', default=DEFAULT_MODEL, help='faster-whisper model size/name')
    parser.add_argument('--language', default='es', help='Language code, default es')
    args = parser.parse_args()

    audio = Path(args.audio)
    if not audio.exists():
        print(json.dumps({'ok': False, 'error': 'audio_not_found', 'audio': str(audio)}))
        return 2

    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        print(json.dumps({
            'ok': False,
            'error': 'faster_whisper_not_installed',
            'hint': 'Run: voice_tools/.venv/bin/pip install -r voice_tools/requirements.txt',
            'detail': str(exc)[:300]
        }))
        return 3

    try:
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        model = WhisperModel(args.model, device='cpu', compute_type='int8', download_root=str(MODEL_DIR))
        segments, info = model.transcribe(str(audio), language=args.language, vad_filter=True, beam_size=5)
        parts = []
        for seg in segments:
            text = (seg.text or '').strip()
            if text:
                parts.append(text)
        transcript = ' '.join(parts).strip()
        print(json.dumps({
            'ok': True,
            'text': transcript,
            'language': getattr(info, 'language', args.language),
            'languageProbability': getattr(info, 'language_probability', None),
            'duration': getattr(info, 'duration', None),
            'model': args.model,
            'textLength': len(transcript)
        }, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({
            'ok': False,
            'error': 'transcription_failed',
            'hint': 'Revisar modelo faster-whisper, ffmpeg/audio o recursos CPU.',
            'detail': str(exc)[-1000:]
        }, ensure_ascii=False))
        return 4


if __name__ == '__main__':
    raise SystemExit(main())
