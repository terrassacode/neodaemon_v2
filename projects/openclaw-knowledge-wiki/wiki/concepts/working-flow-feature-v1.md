# Working Flow Feature v1

## Fuente

- `docs/WORKING_FLOW_FEATURE_V1.md`

## Resumen

Primera feature documental para explicar cómo se trabaja en OpenClaw V2 / NeoDaemon V2 con Nia, `gpt-critical` y `github-cicd`.

## Flujo

```text
Albert pide algo
↓
Nia entiende objetivo y alcance
↓
gpt-critical revisa una vez
↓
FEATURE_PROPOSAL
↓
OK FEATURE
↓
rama + cambios + validación + commit
↓
FEATURE_READY_FOR_GITHUB
↓
OK GITHUB
↓
push + PR
↓
CI/checks
↓
FEATURE_RESULT
```

## Roles

- Albert: decide objetivo, límites y aprobaciones.
- Nia/neodaemon-v2: entiende, ejecuta y entrega.
- gpt-critical: busca riesgos y puntos ciegos en una sola pasada.
- github-cicd: ordena rama, commit, PR y CI.

## Reglas clave

- No trabajar en `main`.
- No push/PR sin `OK GITHUB`.
- No merge automático.
- No secretos.
- No `git add .` ni `git add -A`.
- Cerrar solo con evidencia.
