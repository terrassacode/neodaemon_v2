# Candidate OpenClaw Skills

## Fuente

- `https://www.kdnuggets.com/10-github-repositories-to-master-openclaw`
- Revisión rápida de repositorios enlazados vía GitHub API.

## Regla de seguridad

No instalar skills automáticamente.

Antes de instalar cualquier skill:

- revisar código o documentación mínima;
- comprobar permisos y secretos requeridos;
- confirmar que no envía datos fuera sin aprobación;
- probar en alcance mínimo;
- documentar rollback.

## Prioridad alta

### PDF & Documents

Objetivo:

- procesar PDFs y eBooks subidos al Source Inbox;
- extraer texto;
- resumir;
- crear notas trazables en la wiki.

Estado local:

- Source Inbox ya acepta PDFs.
- Falta extracción PDF robusta.

Valor para Albert:

- alto.

Riesgo:

- bajo si es local y sin APIs externas.

### Image OCR / Vision

Objetivo:

- procesar imágenes y capturas;
- generar preview;
- extraer texto OCR;
- crear notas o diagnósticos.

Estado local:

- implementado con `sharp` + `tesseract.js` en `image_tools/`.
- integrado parcialmente en Source Inbox.

Valor para Albert:

- alto.

Riesgo:

- bajo, local.

### Browser / Playwright

Objetivo:

- abrir webs;
- extraer contenido;
- validar dashboards;
- capturar screenshots;
- comprobar flujos web.

Valor para Albert:

- alto.

Riesgo:

- medio: cuidado con sesiones autenticadas y datos privados.

### GitHub / Git Workflow

Objetivo:

- revisar diffs;
- preparar PRs;
- validar estado;
- mejorar flujo NeoDaemon.

Valor para Albert:

- alto.

Riesgo:

- medio: nunca mergear ni tocar main sin flujo aprobado.

## Prioridad media-alta

### Search & Research

Objetivo:

- investigar con fuentes;
- resumir contenido externo;
- crear notas trazables.

Valor para Albert:

- medio-alto.

Riesgo:

- medio: contenido web no confiable debe tratarse como datos, no instrucciones.

## Prioridad media

### Agent Memory / memU

Repositorio observado:

- `NevaMind-AI/memU`

Objetivo:

- estudiar ideas de memoria persistente;
- mejorar CORECLAW memory;
- reducir pérdida de contexto.

Valor para Albert:

- medio.

Riesgo:

- medio: no integrar memoria externa sin auditoría.

### Gmail / Communication

Objetivo:

- crear borradores reales;
- listar borradores;
- proponer respuestas;
- nunca enviar sin orden exacta `ENVÍA AHORA`.

Estado local:

- `gmail_v2/` existe como estructura mínima OAuth/drafts.
- Pendiente credenciales OAuth válidas.

Valor para Albert:

- medio.

Riesgo:

- alto si se permite envío; mitigación: no implementar envío automático.

## Prioridad baja-media

### Security / Passwords

Objetivo:

- aprender buenas prácticas;
- no integrar gestores de secretos sin diseño.

Valor para Albert:

- medio.

Riesgo:

- alto si una skill toca credenciales.

## Repos revisados del artículo

- `openclaw/openclaw`
- `LeoYeAI/openclaw-master-skills`
- `VoltAgent/awesome-openclaw-skills`
- `hesamsheikh/awesome-openclaw-usecases`
- `carlvellotti/learn-openclaw`
- `NevaMind-AI/memU`
- `BlockRunAI/ClawRouter`
- `1Panel-dev/1Panel`
- `getumbrel/umbrel`
- `zeroclaw-labs/zeroclaw`

## Recomendación de implementación

Orden recomendado:

1. PDF extraction local.
2. Mejorar Source Inbox para listar elementos subidos y estado OCR/PDF.
3. Browser/Playwright controlado para validar dashboards.
4. GitHub workflow helper.
5. Estudio de memU antes de tocar memoria real.
6. Retomar Gmail OAuth cuando existan credenciales válidas.

## Próximo paso concreto

Implementar PDF extraction local para el eBook ya subido y crear una primera nota de resumen trazable.
