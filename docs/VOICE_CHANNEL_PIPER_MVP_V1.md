# Voice Channel Piper MVP v1

## Objetivo

Añadir salida de voz local para Nia usando Piper TTS.

## Alcance

- Texto → WAV local.
- Pestaña `Voz` en Source Inbox Dashboard.
- Endpoint `POST /api/voice/tts`.
- Reproducción de WAV desde el navegador.
- Sin APIs externas en runtime.

## Stack

- Piper TTS (`piper-tts`).
- Modelo local Piper en `data/voice/piper-models/`.
- WAV generados en `data/voice/outputs/`.

## Rutas

```text
voice_tools/piper_say.py
voice_tools/requirements.txt
source_inbox_dashboard/server.mjs
source_inbox_dashboard/public/index.html
```

## Instalación local verificada

```bash
python3 -m venv voice_tools/.venv
voice_tools/.venv/bin/pip install -r voice_tools/requirements.txt
```

Modelo usado localmente para prueba:

```text
es_ES-sharvard-medium
```

Ubicación local esperada:

```text
data/voice/piper-models/voice.onnx
data/voice/piper-models/voice.onnx.json
```

Los modelos y WAV no se versionan.

## Validación realizada

- Piper instalado en `.venv` local.
- Modelo español descargado localmente.
- `voice_tools/piper_say.py` generó WAV válido.
- `POST /api/voice/tts` generó WAV válido.
- `GET /voice/outputs/<archivo>.wav` sirvió audio WAV válido.
- `node --check server.mjs`: OK.
- Secret scan: OK.

## Límites

- Esto es solo salida de voz.
- No incluye STT/micrófono todavía.
- No clona voces.
- No envía texto/audio fuera en runtime.
