# GitHub CI/CD Agent Flow

## Fuente

- `docs/GITHUB_CICD_AGENT_V1.md`
- `AGENTS.md`

## Resumen

Las peticiones de Albert que impliquen GitHub deben enrutarse por el agente real `github-cicd` para mantener orden, trazabilidad y seguridad.

## Cuándo usarlo

Usar `github-cicd` cuando haya intención de:

- crear rama;
- modificar con intención de publicar;
- preparar commit;
- abrir PR;
- hacer push;
- revisar CI/checks;
- sincronizar `main`;
- limpiar ramas tras merge;
- publicar cambios en GitHub.

## Flujo

```text
precheck
↓
revisión crítica
↓
FEATURE_PROPOSAL
↓
OK FEATURE
↓
rama + cambios + validaciones + commit local
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

## Límites

- No trabajar en `main`.
- No push/PR sin `OK GITHUB`.
- No merge automático.
- No tocar secretos.
- No usar `git add .` ni `git add -A`.
- No convertir tareas triviales sin GitHub en flujo CI/CD.
