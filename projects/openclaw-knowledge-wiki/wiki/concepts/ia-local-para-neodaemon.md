# IA local para NeoDaemon

## Fuente

- `raw/docs/ebook-guia-practica-ia-local.txt`

## Resumen

La IA local consiste en ejecutar modelos en el propio ordenador o servidor, evitando enviar código, documentos o datos sensibles a servicios externos. Para NeoDaemon, este enfoque encaja con el objetivo de construir un sistema agentic local, seguro y útil.

## Datos confirmados

- IA local reduce exposición de datos a terceros.
- Herramientas como Ollama facilitan ejecutar modelos desde terminal.
- Herramientas como LM Studio facilitan usar modelos locales con interfaz visual.
- Algunos entornos locales pueden exponer servidores compatibles para conectar editores o herramientas.
- La utilidad depende del hardware disponible, especialmente RAM/VRAM y CPU/GPU.

## Inferencias

- NeoDaemon debería preferir capacidades locales cuando el caso de uso implique privacidad, coste o disponibilidad offline.
- Las integraciones locales deben priorizar validación real, límites claros y fallback cuando el modelo local no baste.
- Ollama podría ser una pieza útil para tareas no críticas o privadas, pero habría que medir calidad y rendimiento.

## Dudas o límites

- Falta evaluar qué modelos locales están instalados o disponibles en `bunker-ia`.
- Falta decidir qué tareas concretas podrían delegarse a modelos locales sin degradar calidad.
- Falta benchmark mínimo con tareas reales de Albert.

## Posibles acciones futuras

- Inventariar hardware disponible.
- Revisar si Ollama está instalado.
- Probar un modelo pequeño para resumen local de documentos.
- Comparar calidad contra el modelo principal en 3 tareas reales.

## Enlaces internos

- `wiki/sources/ebook-guia-practica-ia-local.md`
