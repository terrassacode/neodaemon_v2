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

## Modo conversación v1

Mejora del flujo de voz para reducir fricción sin perder control humano:

- botón principal `🎙️ Hablar con Nia`;
- grabación toggle: pulsar para grabar, pulsar para transcribir;
- historial corto en pantalla con turnos `Tú` / `Nia`;
- botón `Repetir última respuesta`;
- checkbox `Autoenviar si la transcripción parece buena`, apagado por defecto;
- el texto transcrito sigue siendo editable antes de enviarlo.

La regla de seguridad sigue igual: no se activa modo manos libres total por defecto.

## Modo manos libres controlado v1

Mejora del modo conversación sin activar escucha continua ni detección automática de silencio:

- `Autoenviar transcripciones buenas` queda apagado por defecto.
- Si se activa, el flujo es:

```text
pulsar → grabar
pulsar → transcribir
si la transcripción parece buena → enviar a Nia
Nia responde → Piper reproduce
queda listo para hablar otra vez
```

- Si la transcripción parece dudosa, no se envía automáticamente y queda para revisión.
- Estado visible del flujo:
  - `Listo para hablar`
  - `Escuchando`
  - `Transcribiendo`
  - `Nia pensando`
  - `Hablando`
  - `Listo para hablar otra vez`
- Botón `Pausar modo automático` para desactivar el autoenvío.

No incluye modo escucha continua. Ese paso queda separado por seguridad y estabilidad.

## Métricas de latencia y calidad v1

Instrumentación para decidir mejoras de voz con datos reales.

Respuestas de endpoints incluyen `metrics`:

- `/api/voice/listen`
  - `sttMs`
  - `totalMs`
  - modelo STT
  - duración del audio
- `/api/voice/ask-nia`
  - `agentMs`
  - `ttsMs`
  - `totalMs`
- `/api/voice/tts`
  - `ttsMs`
  - `totalMs`

El dashboard muestra una línea tipo:

```text
Métricas respuesta: Nia 4.2s · Piper 1.1s · total 5.4s
```

Log local mínimo:

```text
data/voice/metrics.jsonl
```

No guarda texto, audio ni secretos. Solo métricas técnicas: tipo, ok/error, tiempos, modelo, duración, tamaños y longitudes.

## Selector de modo STT v1

El dashboard permite elegir modelo STT por grabación:

```text
Rápido  → base
Normal  → small  (por defecto)
Preciso → medium
```

La selección se envía a:

```text
POST /api/voice/listen?model=base|small|medium
```

El backend valida la lista permitida. Si no se indica modelo, usa `small` para conservar el comportamiento anterior.

Recomendación basada en benchmark real:

```text
base   = rápido
small  = normal/equilibrado
medium = preciso/manual, no default
```
