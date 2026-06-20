# GPT Operator V2 status

## Fuente

- `docs/GPT_OPERATOR_V2_STATUS.md`
- `docs/OPERATOR_CHATGPT_V1.md`
- `OpenClaw-NeoDaemon-Skill/references/openclaw_role_model_v1.md`
- `OpenClaw-NeoDaemon-Skill/references/gpt_operator_behavior.md`
- `OpenClaw-NeoDaemon-Skill/references/gpt_operator_workflow.md`

## Resumen

El rol GPT heredado de NeoDaemon V1 está presente en V2 como documentación/protocolo, pero no como agente runtime activo separado. Su función puede aplicarse dentro de Nia como modo de revisión estratégica hasta que exista una configuración explícita para lanzarlo como agente independiente.

## Datos confirmados

- `openclaw_role_model_v1.md` declara explícitamente que es `Documentation only`.
- El principio central es: Albert define objetivos, GPT supervisa estrategia, NeoDaemon ejecuta proyectos.
- GPT debe detectar deriva estratégica, complejidad innecesaria, contradicciones de arquitectura, riesgos y puntos ciegos.
- GPT no debe ejecutar comandos, aprobar acciones, tocar archivos ni sustituir a NeoDaemon.
- `OPERATOR_CHATGPT_V1.md` define GPT como revisor crítico opcional, no router principal.
- No se encontró configuración runtime viva llamada GPT en V2.

## Inferencias

- El “GPT” de V1 fue migrado principalmente como rol operativo y protocolo de revisión.
- En V2, Nia puede emular ese rol si Albert lo pide explícitamente: revisión crítica, auditoría de plan, reducción de riesgos y siguiente acción mínima.
- Recuperar un agente separado requeriría configuración runtime adicional de OpenClaw, no solo documentación.

## Uso recomendado

Activadores:

- “pásalo por GPT”
- “haz revisión crítica”
- “audita el plan”
- “actúa como GPT Operator”

Formato:

```text
REVISIÓN GPT OPERATOR

ALCANCE:
RIESGOS:
SUPUESTOS NO VERIFICADOS:
RECOMENDACIÓN:
SIGUIENTE ACCIÓN MÍNIMA:
```

## Límite

No hay agente GPT separado activo confirmado. Estado actual: rol recuperado y documentado, no reconectado como proceso independiente.
