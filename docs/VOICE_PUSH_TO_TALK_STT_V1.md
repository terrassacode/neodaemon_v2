# Voice Push-to-Talk STT v1

## Objetivo

Añadir entrada de voz local al dashboard: Albert mantiene pulsado un botón, habla, suelta, y el audio se transcribe localmente.

## Alcance

- Botón push-to-talk en pestaña `Voz`.
- Grabación con `MediaRecorder` del navegador.
- Endpoint `POST /api/voice/listen`.
- Transcripción local con `faster-whisper`.
- El texto transcrito se coloca en el cuadro de voz para poder generar audio con Piper.

## Fuera de alcance

- Enviar automáticamente el mensaje a la conversación Nia/OpenClaw.
- Respuesta conversacional automática.
- WebRTC continuo.

## Rutas

```text
voice_tools/transcribe_audio.py
source_inbox_dashboard/server.mjs
source_inbox_dashboard/public/index.html
```

## Modelos

`faster-whisper` descarga/usa modelos en:

```text
data/voice/stt-models/
```

No se versionan modelos ni audios grabados.

## Validación esperada

- `python3 -m py_compile voice_tools/transcribe_audio.py`
- `npm --prefix source_inbox_dashboard run check`
- endpoint devuelve error controlado si falta dependencia/modelo;
- endpoint devuelve texto si STT está instalado y el modelo disponible.

## Validación realizada

- `faster-whisper` instalado en `voice_tools/.venv`.
- Modelo `base` descargado en `data/voice/stt-models`.
- Prueba CLI con WAV generado por Piper: OK.
- Prueba endpoint `POST /api/voice/listen` con WAV multipart: OK.
- Transcripción observada: `Hola Albert, esta es una prueba de transcripción local.`

Nota: el backend usa `voice_tools/.venv/bin/python` para garantizar que `faster-whisper` esté disponible.

## WAV recorder update

El grabador push-to-talk usa WebAudio para generar WAV mono PCM en el navegador antes de subirlo al servidor.

Motivo:

- En Chrome/Android, `MediaRecorder` con `audio/webm;codecs=opus` puede generar archivos WebM incompletos si la grabación es corta.
- `faster-whisper`/PyAV lee WAV PCM de forma más estable.

Límites cliente:

- mínimo aproximado: 900 ms;
- máximo aproximado: 30 s;
- tamaño mínimo WAV antes de enviar.

Validación servidor:

- rechaza audio demasiado pequeño antes de llamar a STT.
