# Project README

## Fuente

- `raw/docs/project-readme.md`

## Resumen

Fuente inicial del proyecto `openclaw-knowledge-wiki`. Define una wiki documental local para convertir fuentes autorizadas en notas navegables, trazables y mantenidas por Neodaemon.

## Datos confirmados

- El proyecto es documental y local.
- No ejecuta scripts.
- No usa APIs externas.
- No instala dependencias.
- `raw/` se considera inmutable.
- `wiki/` contiene notas generadas por Neodaemon.
- `wiki/index.md` funciona como catálogo maestro.
- `wiki/log.md` es append-only.
- Obsidian es opcional como visor/editor Markdown.

## Inferencias

- La versión mínima útil consiste en estructura de carpetas, índice, log y una primera nota trazable.
- El proyecto debe mantenerse aislado del core, Gmail, Telegram, RAG, gateway, systemd y memoria global.

## Dudas o límites

- Falta decidir qué fuentes reales de OpenClaw o NeoDaemon quiere Albert ingerir primero.
- Falta contenido operativo más allá de la fuente inicial del propio proyecto.

## Conceptos relacionados

- Wiki operativa local

## Enlaces internos

- `wiki/concepts/wiki-operativa-local.md`
