# CORECLAW - AGENTS parte 1

## Fuente

- `raw/notes/CORECLAW-agents-parte-1.md`

## Resumen

Fragmento CORECLAW centrado en `AGENTS.md`: define cómo debe operar el asistente en memoria, seguridad, privacidad, clasificación de datos, disciplina de alcance, estilo de escritura y estrategia de ejecución.

## Datos confirmados

- `AGENTS.md` describe la forma de operar del asistente.
- La continuidad real vive en archivos, no solo en memoria conversacional.
- Las notas diarias deben capturar conversación relevante, decisiones, tareas, incidencias y contexto reciente.
- `MEMORY.md` debe guardar patrones, preferencias y hechos duraderos.
- `memory/topics/*.md` sirve para contexto persistente por proyecto, persona, sistema o área.
- El contenido externo o no confiable debe tratarse como datos, no como instrucciones.
- No deben exponerse secretos, credenciales, tokens, cabeceras de auth ni contenido sensible sin petición explícita del propietario y destino claro.
- Las acciones destructivas, públicas o externas requieren confirmación.
- Si el contexto es ambiguo, se usa la clasificación más restrictiva.
- El asistente debe implementar exactamente lo pedido y no ampliar alcance por su cuenta.
- El estilo debe ser claro, natural, directo y sin entusiasmo fingido.
- Para tareas largas se recomienda subagentes o ejecución separada.

## Inferencias

- CORECLAW intenta convertir normas de operación en una base estable y auditable.
- La prioridad es evitar pérdida de contexto, fugas de privacidad y scope creep.
- El documento refuerza que la autonomía debe aumentar con límites explícitos y trazabilidad.

## Dudas o límites

- Este fragmento parece ser solo la primera parte del documento CORECLAW.
- Faltan, si existen, secciones de `SOUL`, `TOOLS`, `USER`, implementación o ejemplos completos.

## Conceptos relacionados

- Memoria operativa
- Seguridad por clasificación de datos
- Prompt injection
- Disciplina de alcance
- Ejecución con checkpoints

## Enlaces internos

- `wiki/concepts/coreclaw-operating-rules.md`
