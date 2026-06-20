# Voice Tools - Piper TTS MVP

Objetivo: dar a Nia una salida de voz local, gratuita y Open Source usando Piper.

## Alcance v1

- Texto → WAV local.
- Sin APIs externas en runtime.
- Modelos de voz fuera de git.
- El dashboard puede pedir una prueba TTS y reproducir el WAV generado.

## Instalar Piper localmente

```bash
cd /openclaw/openclaw_v2
python3 -m venv voice_tools/.venv
voice_tools/.venv/bin/pip install -r voice_tools/requirements.txt
```

## Modelos

Coloca un modelo Piper compatible en:

```text
data/voice/piper-models/voice.onnx
data/voice/piper-models/voice.onnx.json
```

Recomendación inicial: voz española Piper de calidad media o alta si el servidor aguanta.

No commitear modelos en git.

## Uso CLI

```bash
voice_tools/piper_say.py "Hola Albert, soy Nia."
```

Salida:

```text
data/voice/outputs/*.wav
```

## Seguridad

- No clona voz de Albert.
- No envía texto/audio fuera.
- No guarda secretos.
- Solo genera WAV local.

## Push-to-talk STT

Primer corte para entrada de voz:

```bash
voice_tools/transcribe_audio.py /ruta/audio.webm
```

Usa `faster-whisper` local en CPU/int8 y guarda modelos en:

```text
data/voice/stt-models/
```

El dashboard expone:

```text
POST /api/voice/listen
```

Este corte transcribe audio. La conexión automática con conversación Nia queda para la siguiente FEATURE.
