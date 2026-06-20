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

## Voz → Nia → Voz revisada

Flujo añadido para conversación por voz con revisión humana:

1. Albert graba o escribe texto.
2. El texto queda editable en el campo del dashboard.
3. Botón `Enviar a Nia y escuchar`.
4. Backend llama a `openclaw agent` con `--deliver` omitido, por tanto no envía a canales externos.
5. La respuesta textual de Nia se convierte a WAV local con Piper.
6. El dashboard reproduce el audio.

Endpoint:

```text
POST /api/voice/ask-nia
```

Límites:

- mensaje de entrada máximo: 1200 caracteres en backend;
- respuesta para voz truncada a 800 caracteres antes de Piper si fuera necesario;
- sesión agent por defecto: `voice-dashboard`;
- agente por defecto: `neodaemon-v2`.

Variables opcionales:

```text
VOICE_AGENT_ID
VOICE_AGENT_SESSION
```

Seguridad:

- no usa `--deliver`;
- no publica en Telegram/Signal/WhatsApp/etc.;
- no guarda secretos;
- los WAV quedan en `data/voice/outputs`.
