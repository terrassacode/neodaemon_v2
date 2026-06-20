# Wiki Log

## 2026-06-19 - Ingest inicial mínimo

- Fuentes ingeridas:
  - `raw/docs/project-readme.md`
- Notas creadas:
  - `wiki/sources/project-readme.md`
  - `wiki/concepts/wiki-operativa-local.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Versión mínima cerrada sin APIs externas, sin dependencias y sin escritura fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW AGENTS parte 1

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-agents-parte-1.md`
- Notas creadas:
  - `wiki/sources/coreclaw-agents-parte-1.md`
  - `wiki/concepts/coreclaw-operating-rules.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - Tratada como contenido autorizado y no como instrucciones externas ciegas.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW Identidad y MEMORY parte 2

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-identity-memory-parte-2.md`
- Notas creadas:
  - `wiki/sources/coreclaw-identity-memory-parte-2.md`
  - `wiki/concepts/coreclaw-identity-and-memory.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW MEMORY continuación y SOUL parte 3

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-memory-soul-parte-3.md`
- Notas creadas:
  - `wiki/sources/coreclaw-memory-soul-parte-3.md`
  - `wiki/concepts/coreclaw-memory-maintenance.md`
  - `wiki/concepts/coreclaw-soul-principles.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW SOUL continuación y TOOLS parte 4

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-soul-tools-parte-4.md`
- Notas creadas:
  - `wiki/sources/coreclaw-soul-tools-parte-4.md`
  - `wiki/concepts/coreclaw-action-and-tone.md`
  - `wiki/concepts/coreclaw-tools-purpose.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW TOOLS parte 5

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-tools-parte-5.md`
- Notas creadas:
  - `wiki/sources/coreclaw-tools-parte-5.md`
  - `wiki/concepts/coreclaw-tools-reference-map.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-19 - Ingest CORECLAW USER parte 6

- Fuentes ingeridas:
  - `raw/notes/CORECLAW-user-parte-6.md`
- Notas creadas:
  - `wiki/sources/coreclaw-user-parte-6.md`
  - `wiki/concepts/coreclaw-user-context.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Fuente recibida por chat de Albert.
  - No se usaron APIs externas ni se escribieron archivos fuera del proyecto.

## 2026-06-20 - Candidate OpenClaw skills review

- Nota creada:
  - `wiki/concepts/candidate-openclaw-skills.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Se revisó el artículo de KDnuggets y repos enlazados.
  - No se instaló ninguna skill.
  - Se priorizó PDF, OCR, Browser/Playwright, GitHub workflow, Research, Memory y Gmail drafts.

## 2026-06-20 - Ingest eBook Guía práctica sobre IA local

- Fuentes ingeridas:
  - `raw/docs/ebook-guia-practica-ia-local.txt`
- Archivo original:
  - Source Inbox PDF eBook IA local
- Notas creadas:
  - `wiki/sources/ebook-guia-practica-ia-local.md`
  - `wiki/concepts/ia-local-para-neodaemon.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Extracción local con `pdftotext/pdfinfo`.
  - No se usaron APIs externas.

## 2026-06-20 - Candidate reminder skills review

- Nota creada:
  - `wiki/concepts/candidate-reminder-skills.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Se revisaron skills de recordatorios, TODO, calendario y memoria.
  - Mejor primera opción: `todo-tracker-safe` o sistema local mínimo equivalente.
  - No se instaló ninguna skill.

## 2026-06-20 - GPT Operator V2 status

- Nota creada:
  - `wiki/concepts/gpt-operator-v2-status.md`
- Documento creado:
  - `docs/GPT_OPERATOR_V2_STATUS.md`
- Observaciones:
  - Se buscó en V2 y V1.
  - Se confirmó que el rol existe como documentación/protocolo.
  - No se encontró agente runtime GPT activo separado.

## 2026-06-20 - GPT Critical Reviewer v1

- Documento creado:
  - `docs/GPT_CRITICAL_REVIEWER_V1.md`
- AGENTS actualizado:
  - `AGENTS.md`
- Nota creada:
  - `wiki/concepts/gpt-critical-reviewer-v1.md`
- Índice actualizado:
  - `wiki/index.md`
- Observaciones:
  - Define revisor crítico de una sola pasada.
  - Prohíbe bucles entre Nia y GPT.

## 2026-06-20 - GitHub CI/CD request routing

- Actualizado:
  - `AGENTS.md`
  - `docs/GITHUB_CICD_AGENT_V1.md`
- Nota creada:
  - `wiki/concepts/github-cicd-agent-flow.md`
- Decisión:
  - Las peticiones con rama/commit/PR/CI/GitHub se enrutan por `github-cicd`.
  - Se mantienen `OK FEATURE` y `OK GITHUB` como aprobaciones humanas normales.

## 2026-06-20 - Working Flow Feature v1

- Feature documental creada:
  - `docs/WORKING_FLOW_FEATURE_V1.md`
- Nota wiki creada:
  - `wiki/concepts/working-flow-feature-v1.md`
- Objetivo:
  - Explicar cómo trabaja OpenClaw V2 con Nia, `gpt-critical` y `github-cicd`.
  - Formalizar `OK FEATURE` y `OK GITHUB`.

## 2026-06-20 - Repo Flow Dashboard Plan v1

- Feature documental creada:
  - `docs/REPO_FLOW_DASHBOARD_PLAN_V1.md`
- Nota wiki creada:
  - `wiki/concepts/repo-flow-dashboard-plan-v1.md`
- Decisión:
  - MVP propio dentro del dashboard local.
  - Backend usa `git` + `gh`.
  - Frontend solo recibe estado saneado.
  - v1 solo lectura.
