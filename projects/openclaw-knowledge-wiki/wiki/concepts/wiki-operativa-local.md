# Wiki operativa local

## Fuente

- `raw/docs/project-readme.md`

## Resumen

Una wiki operativa local es un espacio Markdown aislado donde Neodaemon convierte fuentes autorizadas en notas resumidas, navegables y trazables, sin automatización no autorizada ni dependencias externas.

## Datos confirmados

- La wiki usa `raw/` para fuentes originales.
- La wiki usa `wiki/` para notas generadas.
- La wiki usa `outputs/` para resultados derivados, como revisión manual.
- Obsidian puede usarse como visor/editor, pero no es requisito.
- Cada ingest debe quedar registrado en `wiki/log.md`.

## Inferencias

- El valor principal está en tener conocimiento consultable sin mezclarlo con memoria privada ni logs globales.
- La seguridad depende de respetar el perímetro del proyecto y no tocar fuentes originales.

## Dudas o límites

- No hay todavía una taxonomía final de conceptos, entidades y comparaciones.
- La utilidad crecerá cuando Albert autorice fuentes reales.

## Conceptos relacionados

- Ingest documental
- Trazabilidad de fuentes
- Obsidian opcional

## Enlaces internos

- `wiki/sources/project-readme.md`
