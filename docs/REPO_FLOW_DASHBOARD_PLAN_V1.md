# Repo Flow Dashboard Plan v1

## Estado

Feature documental para definir cómo implementar un dashboard visual del flujo Git/GitHub del repositorio.

No implementa código todavía.

Repositorio canónico:

- `https://github.com/terrassacode/neodaemon_v2`

## Objetivo

Crear un dashboard claro y fácil para ver en vivo cómo fluye el trabajo del repositorio:

```text
main
↓
feature branch
↓
commit local
↓
PR
↓
checks / CI
↓
merge manual
↓
cleanup
```

El objetivo no es sustituir GitHub.

El objetivo es que Albert pueda ver de un vistazo:

- qué feature está activa;
- en qué rama está;
- si hay PR abierto;
- si los checks pasan;
- cuál es la siguiente acción humana;
- qué queda pendiente.

## Inspiración externa revisada

### GitDeck

Repo:

- `https://github.com/debba/gitdeck`

Aporta:

- dashboard local;
- repositorios;
- issues;
- pull requests;
- Actions;
- actividad;
- vista kanban.

Uso recomendado:

- referencia principal de producto;
- no copiar directamente sin evaluar complejidad.

### DashGit

Repo:

- `https://github.com/javiertuya/dashgit`

Aporta:

- issues;
- PRs;
- review requests;
- ramas;
- build statuses.

Uso recomendado:

- inspiración para qué tarjetas mostrar;
- referencia ligera de flujo PR/rama/status.

### Grafana GitHub Datasource

Repo:

- `https://github.com/grafana/github-datasource`

Aporta:

- métricas GitHub en Grafana;
- dashboards de PRs, issues y actividad.

Uso recomendado:

- no usar en MVP;
- demasiado pesado para la primera versión;
- útil si algún día queremos métricas históricas.

### Octokit

Repo:

- `https://github.com/octokit/octokit.js`

Aporta:

- SDK GitHub maduro para Node.js;
- acceso limpio a PRs, branches, checks, runs y repo metadata.

Uso recomendado:

- fase posterior si `gh` se queda corto;
- no necesario para el MVP si ya tenemos `gh` autenticado.

## Decisión recomendada

Construir un MVP propio dentro del dashboard local existente.

Motivos:

- control total;
- menos dependencias;
- no exponemos tokens al frontend;
- encaja con OpenClaw V2;
- más fácil de adaptar al flujo `OK FEATURE` / `OK GITHUB`.

## Arquitectura propuesta

```text
Browser / Dashboard UI
        ↓
source_inbox_dashboard backend local
        ↓
comandos locales seguros: git + gh
        ↓
GitHub / repo local
```

Regla de seguridad:

```text
El frontend nunca recibe tokens ni credenciales.
```

El backend devuelve solo datos saneados:

- rama actual;
- estado limpio/sucio;
- commits ahead/behind;
- PRs abiertos;
- checks/status;
- URL del PR;
- siguiente acción sugerida.

## Fuente de datos MVP

### Local Git

Comandos candidatos:

```bash
git branch --show-current
git status --short --branch
git rev-parse --short HEAD
git rev-parse --short origin/main
git branch --list
git log --oneline -5
```

### GitHub CLI

Comandos candidatos:

```bash
gh pr list --repo terrassacode/neodaemon_v2
gh pr view <number> --repo terrassacode/neodaemon_v2
gh run list --repo terrassacode/neodaemon_v2
gh run view <id> --repo terrassacode/neodaemon_v2
```

## Endpoint MVP

Crear endpoint local:

```text
GET /api/repo/status
```

Respuesta orientativa:

```json
{
  "repo": "terrassacode/neodaemon_v2",
  "local": {
    "branch": "main",
    "dirty": false,
    "ahead": 0,
    "behind": 0
  },
  "main": {
    "local": "a209df9",
    "remote": "a209df9",
    "synced": true
  },
  "pullRequests": [
    {
      "number": 1,
      "title": "docs: define working flow feature process",
      "state": "MERGED",
      "branch": "feature/working-flow-v1",
      "url": "https://github.com/terrassacode/neodaemon_v2/pull/1",
      "checks": "pass"
    }
  ],
  "nextAction": "repo clean / ready for next FEATURE"
}
```

## Vista MVP

Añadir una pantalla nueva al dashboard:

```text
Repositorio
```

Componentes:

1. Tarjeta repo
   - nombre;
   - URL GitHub;
   - default branch.

2. Tarjeta main
   - local SHA;
   - remote SHA;
   - sincronizado / desfasado.

3. Tarjeta working tree
   - rama actual;
   - limpio / cambios pendientes;
   - lista resumida de archivos pendientes.

4. Lista de ramas feature
   - nombre;
   - último commit;
   - si tiene PR asociado.

5. Lista de PRs
   - número;
   - título;
   - rama;
   - estado;
   - checks;
   - enlace.

6. Siguiente acción
   - `OK FEATURE`;
   - `OK GITHUB`;
   - esperar CI;
   - merge manual;
   - cleanup;
   - repo listo.

## Timeline visual recomendado

Para cada feature activa:

```text
FEATURE_PROPOSAL → OK FEATURE → BRANCH → COMMIT → OK GITHUB → PR → CI → MERGE → CLEANUP
```

Cada paso puede tener estado:

- pendiente;
- activo;
- completado;
- bloqueado.

## Seguridad v1

La primera versión debe ser solo lectura.

Permitido:

- ver estado;
- abrir enlaces a GitHub;
- refrescar datos.

Prohibido en v1:

- push desde UI;
- merge desde UI;
- borrar ramas desde UI;
- editar tokens;
- mostrar tokens;
- ejecutar comandos arbitrarios desde UI.

## Fases de implementación

### Fase 1 — Endpoint local de estado

Crear `/api/repo/status`.

Debe devolver:

- repo;
- rama actual;
- estado dirty;
- main local/remoto;
- PRs;
- checks básicos;
- siguiente acción calculada.

Validación:

- `curl http://127.0.0.1:8788/api/repo/status` devuelve JSON saneado.

### Fase 2 — Pantalla Repositorio

Añadir pantalla visual al dashboard existente.

Validación:

- la pantalla carga;
- muestra repo/main/rama/PRs;
- no muestra tokens.

### Fase 3 — PR y checks

Enriquecer PRs con:

- estado mergeable;
- checks;
- últimos workflow runs.

Validación:

- PR abierto se ve como abierto;
- PR mergeado se ve como mergeado;
- checks vacíos se muestran como `sin CI configurado`.

### Fase 4 — Timeline de feature

Representar el flujo completo:

```text
FEATURE_PROPOSAL → OK FEATURE → BRANCH → COMMIT → OK GITHUB → PR → CI → MERGE → CLEANUP
```

Validación:

- al crear una feature, el dashboard muestra el paso correcto.

### Fase 5 — Acciones controladas futuras

Solo si Albert lo aprueba más adelante:

- botón copiar enlace PR;
- botón refrescar;
- botón preparar resumen;
- nunca merge automático por defecto.

## Siguiente FEATURE recomendada

```text
repo-flow-dashboard-mvp-v1
```

Objetivo:

- implementar `/api/repo/status`;
- añadir pantalla `Repositorio`;
- mostrar repo/main/rama/PRs/checks de forma visual;
- mantenerlo solo lectura.

Archivos probables:

- `source_inbox_dashboard/server.mjs`
- `source_inbox_dashboard/public/index.html`
- `source_inbox_dashboard/package.json` si hiciera falta dependencia nueva, aunque se intentará evitar.

## Criterio de éxito MVP

Albert abre el dashboard y ve:

```text
Repo: terrassacode/neodaemon_v2
Main: sincronizado
Rama actual: main / feature/...
Cambios locales: sí/no
PRs: abiertos/mergeados
Checks: pass/fail/pending/sin CI
Siguiente acción: clara
```

Sin mirar terminal.
