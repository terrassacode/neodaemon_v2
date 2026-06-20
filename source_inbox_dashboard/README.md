# Source Inbox Dashboard

Dashboard mínimo local para que Albert suba fuentes y Nia/NeoDaemon pueda leerlas después.

## Permite

- subir PDF;
- subir imágenes `jpg`, `jpeg`, `png`, `webp`, `gif`;
- guardar texto escrito;
- guardar URLs.

## No hace

- no OCR;
- no IA visual;
- no descarga URLs automáticamente;
- no expone secretos;
- no toca V1 ni servicios globales.

## Almacenamiento

```text
/openclaw/openclaw_v2/data/source-inbox/files
/openclaw/openclaw_v2/data/source-inbox/texts
/openclaw/openclaw_v2/data/source-inbox/urls
/openclaw/openclaw_v2/data/source-inbox/meta
```

## Ejecutar

```bash
cd /openclaw/openclaw_v2/source_inbox_dashboard
node server.mjs
```

Para abrir solo desde el propio servidor:

```text
http://127.0.0.1:8788
```

Para abrir desde móvil/Tailscale, escucha en todas las interfaces:

```bash
SOURCE_INBOX_HOST=0.0.0.0 node server.mjs
```

Y abre la IP del servidor, por ejemplo:

```text
http://100.117.135.114:8788
```

## Seguridad

- nombres saneados;
- no sobrescribe archivos;
- limita uploads a 25 MB;
- acepta solo PDF e imágenes permitidas;
- URLs se guardan como texto/metadata, no se visitan automáticamente.

## Voz local

El dashboard incluye una pestaña `Voz` para generar audio local con Piper TTS.

Requisitos:

```text
voice_tools/.venv/
data/voice/piper-models/voice.onnx
data/voice/piper-models/voice.onnx.json
```

Los WAV se generan en:

```text
/openclaw/openclaw_v2/data/voice/outputs
```

No usa APIs externas en runtime.
