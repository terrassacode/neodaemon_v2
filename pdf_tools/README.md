# PDF Tools

Herramientas locales para extraer texto y metadata de PDFs subidos al Source Inbox.

## Requisitos

Usa herramientas del sistema:

- `pdfinfo`
- `pdftotext`

No usa APIs externas.

## Uso

```bash
/openclaw/openclaw_v2/pdf_tools/extract_pdf.sh /ruta/archivo.pdf
```

## Salidas

```text
/openclaw/openclaw_v2/data/source-inbox/derived/pdfs/
```
