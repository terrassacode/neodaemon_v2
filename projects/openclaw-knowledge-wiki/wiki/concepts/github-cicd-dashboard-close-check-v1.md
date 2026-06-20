# GitHub CI/CD Dashboard Close Check v1

## Fuente

- `docs/GITHUB_CICD_AGENT_V1.md`
- `AGENTS.md`

## Resumen

Norma de cierre para que `github-cicd` revise el dashboard Repositorio al terminar una FEATURE mergeada.

## Comprobaciones

- PR en estado `MERGED`.
- `main` local sincronizado con `origin/main`.
- Rama local de la FEATURE eliminada.
- Rama remota de la FEATURE eliminada.
- `cleanupBranches` vacío o sin la rama de la FEATURE.
- Siguiente acción coherente con repo listo o siguiente FEATURE.

## Fuente preferida

`GET http://127.0.0.1:8788/api/repo/status`

## Fallback

Si el dashboard no responde, usar `git` + `gh` y marcar el cierre como fallback.

## Alerta

Si algo falla, emitir `FEATURE_CLEANUP_ALERT` con riesgo y acción mínima recomendada.
