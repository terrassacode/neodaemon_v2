# GPT Operator V2 Status

## Estado

Recuperado como rol/protocolo, no como agente runtime activo.

## Hallazgo

En OpenClaw V2 ya existen las referencias principales del rol GPT heredado de NeoDaemon V1:

- `docs/OPERATOR_CHATGPT_V1.md`
- `OpenClaw-NeoDaemon-Skill/references/openclaw_role_model_v1.md`
- `OpenClaw-NeoDaemon-Skill/references/gpt_operator_behavior.md`
- `OpenClaw-NeoDaemon-Skill/references/gpt_operator_workflow.md`

También existen copias equivalentes en:

- `/openclaw/workspace/git_clean/neodaemon_v1/`

## Conclusión

No se ha encontrado una instancia viva separada llamada `GPT`, ni una configuración runtime activa que lo ejecute como agente independiente junto a Nia.

Sí se ha recuperado su función operativa:

- GPT = supervisor estratégico;
- GPT audita alcance, riesgos, arquitectura y contradicciones;
- GPT no ejecuta comandos;
- GPT no aprueba acciones;
- GPT no sustituye a NeoDaemon;
- NeoDaemon/Nia ejecuta y valida;
- Albert conserva decisión final.

## Uso en V2

Mientras no exista agente runtime separado, Nia debe aplicar el modo GPT Operator internamente cuando Albert pida revisión estratégica, diseño o auditoría.

Activadores recomendados:

- “pásalo por GPT”;
- “haz revisión crítica”;
- “audita el plan”;
- “dime riesgos antes de ejecutar”;
- “actúa como GPT Operator”.

## Formato de revisión GPT Operator

```text
REVISIÓN GPT OPERATOR

ALCANCE:
- ...

RIESGOS:
- ...

SUPUESTOS NO VERIFICADOS:
- ...

RECOMENDACIÓN:
- OK / REDUCIR / BLOQUEAR

SIGUIENTE ACCIÓN MÍNIMA:
- ...
```

## Límite

Esto no recrea un agente autónomo separado. Solo restaura el rol funcional dentro de V2 hasta que OpenClaw tenga una configuración runtime explícita para lanzar GPT como agente/revisor independiente.
