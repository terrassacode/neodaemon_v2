# GPT Critical Reviewer v1

## Fuente

- `docs/GPT_CRITICAL_REVIEWER_V1.md`

## Resumen

Protocolo para que un revisor crítico tipo GPT ayude a Nia/NeoDaemon antes de tareas no triviales, detectando puntos ciegos, riesgos y mejoras sin ejecutar ni crear bucles.

## Regla central

```text
Nia propone acción → GPT crítico revisa una vez → Nia decide plan final → ejecución → evidencia
```

## Datos confirmados

- Se usa antes de tareas con riesgo, seguridad, arquitectura, automatización o efectos duraderos.
- No se usa para tareas triviales.
- Tiene máximo una pasada.
- Si no hay claridad tras una revisión, se devuelve `NECESITA_ALBERT`.
- GPT crítico detecta riesgos, puntos ciegos, scope creep, falta de rollback, falta de validación y alternativas más simples.
- GPT crítico no ejecuta, no aprueba y no sustituye a Albert.

## Inferencias

- El objetivo es mejorar decisiones sin añadir burocracia.
- La revisión debe reducir riesgo y mantener foco.

## Enlaces internos

- `wiki/concepts/gpt-operator-v2-status.md`
