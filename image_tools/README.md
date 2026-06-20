# Image Tools

Herramientas locales para preparar imágenes subidas en Source Inbox.

## Funciones

- inspeccionar metadata de imagen;
- crear preview PNG reducido;
- crear thumbnail JPEG;
- ejecutar OCR local con `tesseract.js`.

## Uso

```bash
cd /openclaw/openclaw_v2/image_tools
npm install
node inspect_image.mjs /ruta/imagen.jpg
node ocr_image.mjs /ruta/imagen.jpg spa+eng
```

## Salidas

```text
/openclaw/openclaw_v2/data/source-inbox/derived/images/
```

## Seguridad

- no envía imágenes fuera;
- no llama APIs externas;
- no modifica la imagen original;
- solo crea derivados locales.
