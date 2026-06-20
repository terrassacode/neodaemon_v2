# GitHub CI/CD Agent v1

## Estado

Agente real creado en OpenClaw V2 como `github-cicd`.

## Objetivo

Mantener un flujo limpio y ordenado para cada petición que termine en GitHub:

```text
petición de Albert
↓
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
CI / checks / revisión
↓
Albert mergea o decide
↓
FEATURE_RESULT
```

## Enrutado de peticiones

Toda petición de Albert debe pasar por este criterio antes de ejecutar:

### Usar `github-cicd` cuando la petición implique

- crear una rama;
- modificar código o documentación con intención de publicarlo;
- preparar commit;
- abrir PR;
- hacer push;
- revisar estado de PR;
- revisar CI/checks;
- sincronizar `main`;
- limpiar ramas después de merge;
- publicar cambios en GitHub.

### No usar `github-cicd` cuando sea solo

- leer archivos;
- responder una pregunta;
- explorar documentación;
- hacer cambios locales experimentales sin intención de commit/PR;
- revisar ideas sin tocar repositorio.

## Regla de orden

Para peticiones GitHub, Nia no debe improvisar comandos sueltos. Debe encaminar el trabajo por este flujo:

1. Precheck interno.
2. Revisión crítica de una sola pasada.
3. `FEATURE_PROPOSAL`.
4. Esperar `OK FEATURE`.
5. Trabajo local en rama.
6. Validación y commit local.
7. `FEATURE_READY_FOR_GITHUB`.
8. Esperar `OK GITHUB`.
9. Push + PR.
10. Seguimiento de CI/checks.
11. `FEATURE_RESULT`.

La intención es orden, trazabilidad y seguridad, no burocracia. Si una tarea es demasiado pequeña para PR, el agente debe decirlo y proponer no usar GitHub.

## Fuentes usadas

### Externas

La búsqueda web no encontró un repositorio oficial específico de OpenClaw que implemente exactamente este agente CI/CD. Aparecieron resultados genéricos/SEO y repos/documentación de OpenClaw, pero no una plantilla canónica directamente replicable.

### Locales usadas como base fiable

- `docs/GITHUB_EXECUTOR_V1.md`
- `docs/GITHUB_OPERATOR_SKILL_V1.md`
- `docs/human-approval-github-workflow-v0-1.md`
- `OpenClaw-NeoDaemon-Skill/references/github_workflow.md`
- OpenClaw docs: `agents.list` + skill `github`

## Configuración del agente

- ID: `github-cicd`
- Nombre: `GitHub CI/CD Operator`
- Workspace: `/openclaw/openclaw_v2`
- Skill: `github`
- Herramientas: `read`, `write`, `memory_get`, `web_search`, `exec`
- Exec: `allowlist`, aprobación en comandos no permitidos
- Filesystem: solo workspace

## Límites absolutos

- No trabajar directamente en `main`.
- No usar `git add .` ni `git add -A`.
- No hacer push sin `OK GITHUB`.
- No abrir PR sin `OK GITHUB`.
- No hacer merge automático.
- No borrar rama remota sin política explícita.
- No tocar tokens, credenciales ni secretos.
- No imprimir tokens.
- No guardar credenciales.
- No tocar servicios, systemd, cron, timers, gateway, modelos o sandbox global sin `CONFIRMACIÓN_ESPECIAL`.

## Autenticación GitHub

`gh` está instalado y autenticado en el host. El token lo gestiona `gh`/keyring y no debe copiarse a chat, archivos, logs ni commits.

Cuando haga falta GitHub real:

- el agente no debe recibir tokens en chat;
- si aparece un token en output/log/diff, bloquear.

## Revisión crítica obligatoria

Antes de `FEATURE_PROPOSAL`, aplicar una revisión crítica de una sola pasada:

- puntos ciegos;
- riesgos;
- alternativas simples;
- alcance real;
- archivos previstos;
- validaciones;
- rollback;
- secretos;
- rutas sensibles.

Si hay bloqueo, emitir `FEATURE_BLOCKED`.

## Salidas obligatorias

### FEATURE_PROPOSAL

Debe incluir:

- objetivo;
- rama propuesta;
- archivos previstos;
- riesgo;
- qué NO tocará;
- validaciones;
- rollback local;
- acciones incluidas en `OK FEATURE`;
- acciones NO incluidas;
- respuesta válida.

### FEATURE_READY_FOR_GITHUB

Debe incluir:

- objetivo;
- rama;
- commit;
- archivos cambiados;
- validaciones ejecutadas;
- `git status`;
- revisión de secretos;
- riesgo final;
- acciones incluidas en `OK GITHUB`;
- acciones NO incluidas.

### FEATURE_RESULT

Debe incluir:

- PR;
- estado CI/checks;
- merge: manual/pendiente/hecho;
- main actualizado o no;
- ramas pendientes;
- repo limpio o no;
- evidencia.
