# Working Flow Feature v1

## Estado

Primera feature documental para explicar cómo trabajamos en OpenClaw V2 / NeoDaemon V2.

Repositorio canónico:

- `https://github.com/terrassacode/neodaemon_v2`

Agentes implicados:

- `neodaemon-v2`: agente principal/Nia para entender, ejecutar y entregar.
- `gpt-critical`: revisor crítico de una sola pasada.
- `github-cicd`: agente/flujo para rama, commit, PR, CI y GitHub.

## Objetivo

Que cada petición importante tenga un camino limpio:

```text
Albert pide algo
↓
Nia entiende objetivo y alcance
↓
gpt-critical busca puntos ciegos una vez
↓
Nia prepara FEATURE_PROPOSAL
↓
Albert responde OK FEATURE
↓
Nia/github-cicd trabaja en rama
↓
validación real
↓
commit local
↓
FEATURE_READY_FOR_GITHUB
↓
Albert responde OK GITHUB
↓
push + PR
↓
CI/checks
↓
FEATURE_RESULT
```

## Principio principal

Albert decide intención, límites y aprobaciones.

Nia y los agentes deciden el orden técnico seguro dentro de esos límites.

Albert no debe tener que revisar comandos Git de bajo nivel, pero sí debe conservar veto sobre:

- objetivo;
- alcance;
- riesgo;
- publicación en GitHub;
- merge;
- acciones sensibles.

## Qué es una FEATURE

Una FEATURE es una unidad pequeña y verificable de trabajo.

Debe tener:

- objetivo claro;
- alcance limitado;
- rama propia;
- archivos previstos;
- validaciones previstas;
- rollback local;
- evidencia final.

Una FEATURE no debe mezclar cosas no relacionadas.

Mala feature:

```text
arreglar dashboard + cambiar memoria + tocar Gmail + publicar docs + reiniciar servicios
```

Buena feature:

```text
documentar flujo operativo de trabajo V2
```

## Fase 0 — Precheck

Antes de pedir aprobación, Nia/github-cicd revisa:

- repo correcto;
- remoto correcto;
- rama actual;
- estado de `main`;
- si hay cambios pendientes;
- archivos sensibles;
- si la tarea realmente necesita GitHub;
- tamaño del cambio;
- validaciones posibles.

Si algo bloquea, se responde:

```text
FEATURE_BLOCKED
```

## Revisión crítica

Para tareas no triviales, Nia aplica `gpt-critical` una sola vez.

El objetivo no es crear burocracia.

El objetivo es detectar:

- riesgos;
- puntos ciegos;
- scope creep;
- complejidad innecesaria;
- secretos;
- falta de validación;
- falta de rollback;
- contradicciones con reglas existentes.

Regla anti-bucle:

```text
Nia propone acción → GPT crítico revisa una vez → Nia decide plan final
```

Si sigue sin estar claro:

```text
NECESITA_ALBERT
```

## FEATURE_PROPOSAL

Antes de empezar trabajo local, Nia presenta una propuesta clara.

Debe incluir:

- objetivo;
- rama propuesta;
- archivos previstos;
- tipo de cambios;
- riesgo estimado;
- qué NO tocará;
- validaciones;
- rollback local;
- acciones incluidas si Albert aprueba;
- acciones no incluidas;
- respuestas válidas.

Respuestas válidas:

```text
OK FEATURE
CANCELAR
EXPLICAR
BLOQUEAR
```

## OK FEATURE

`OK FEATURE` autoriza trabajo local dentro del alcance aprobado.

Incluye:

- crear rama;
- modificar solo archivos previstos;
- ejecutar validaciones;
- revisar diff/status;
- crear commit local.

No incluye:

- push;
- abrir PR;
- merge;
- tocar secretos;
- tocar servicios;
- cambiar gateway/modelos/sandbox;
- acciones externas sensibles.

## Trabajo local

Durante el trabajo local:

- no trabajar en `main`;
- no usar `git add .`;
- no usar `git add -A`;
- añadir archivos explícitos;
- no commitear datos runtime;
- no commitear `node_modules`;
- no commitear secretos;
- validar antes de cerrar.

## FEATURE_READY_FOR_GITHUB

Cuando el commit local está listo, Nia presenta:

- objetivo;
- rama;
- commit;
- archivos cambiados;
- validaciones ejecutadas;
- estado de `git status`;
- revisión de secretos;
- riesgo final;
- qué hará `OK GITHUB`;
- qué no hará.

## OK GITHUB

`OK GITHUB` autoriza:

- push de la rama;
- apertura de PR.

No autoriza:

- merge automático;
- borrar ramas remotas;
- acciones destructivas;
- saltarse CI;
- tocar credenciales.

## PR y CI

Después del PR:

- `github-cicd` revisa checks/CI;
- resume fallos en lenguaje claro;
- propone correcciones si procede;
- no mergea automáticamente.

Albert decide merge o siguiente paso.

## FEATURE_RESULT

El cierre debe incluir evidencia real:

- PR;
- estado de CI/checks;
- commit;
- archivos cambiados;
- si main está actualizado;
- si quedan ramas pendientes;
- si el repo quedó limpio;
- bloqueos si los hay.

## Reglas absolutas

- No trabajar directamente en `main`.
- No push sin `OK GITHUB`.
- No PR sin `OK GITHUB`.
- No merge automático.
- No tocar secretos.
- No imprimir tokens.
- No usar `git add .` ni `git add -A`.
- No declarar terminado sin evidencia.
- No ampliar alcance sin permiso.

## Cómo se aplica a esta primera feature

Esta feature documenta el propio flujo.

Alcance:

- crear esta guía;
- enlazarla desde la wiki;
- reforzar reglas en `AGENTS.md` y documentos operativos existentes;
- añadir higiene básica a `.gitignore` para evitar subir dependencias y datos runtime.

No incluye:

- publicar a GitHub;
- abrir PR;
- merge;
- ordenar todas las features futuras;
- commitear dashboard, Gmail, OCR, PDF o datos locales.
