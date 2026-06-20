# Repo Flow Dashboard Plan v1

## Fuente

- `docs/REPO_FLOW_DASHBOARD_PLAN_V1.md`

## Resumen

Plan para implementar un dashboard visual del flujo Git/GitHub del repositorio `terrassacode/neodaemon_v2`.

## Decisión recomendada

Crear un MVP propio dentro del dashboard local existente, usando backend local con `git` + `gh`, sin exponer tokens al navegador.

## Inspiración externa

- GitDeck: referencia principal de dashboard GitHub local.
- DashGit: referencia de PRs, ramas y build statuses.
- Grafana GitHub Datasource: útil para métricas futuras, demasiado pesado para MVP.
- Octokit: opción futura si `gh` se queda corto.

## MVP

- Endpoint: `GET /api/repo/status`.
- Pantalla: `Repositorio`.
- Vista: repo, main, rama actual, cambios locales, PRs, checks y siguiente acción.

## Seguridad

Primera versión solo lectura:

- no push;
- no merge;
- no borrar ramas;
- no tokens en frontend;
- no comandos arbitrarios desde UI.
