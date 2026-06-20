# Candidate reminder skills

## Fuente

- `LeoYeAI/openclaw-master-skills/skill_index.md`
- Revisión de `SKILL.md`/README de skills candidatas vía GitHub API.

## Necesidad de Albert

Albert quiere guardar recordatorios diarios porque se olvida fácilmente. La solución debe ser simple, segura y no depender de mucha configuración.

## Candidatas encontradas

### todo-tracker-safe

Descripción observada:

- TODO tracker seguro con validación de entrada y operaciones de archivo seguras.
- Sirve para tareas entre sesiones.
- Usa herramientas básicas: bash, grep, awk, sed.

Encaje:

- Muy bueno para empezar local.
- No requiere cuentas externas.
- Puede integrarse con heartbeat o revisión diaria.

Riesgo:

- Bajo.

Recomendación:

- Mejor primera opción.

### openclaw-todoist / todoist

Descripción observada:

- Gestión de tareas en Todoist.
- `openclaw-todoist` menciona identidad multi-agent, checks programados y recordatorios.
- Requiere Todoist/API token en la variante clásica.

Encaje:

- Bueno si Albert ya usa Todoist.
- Peor si se quiere mantener todo local.

Riesgo:

- Medio: requiere cuenta externa/token.

Recomendación:

- No instalar todavía.

### calendar / google-calendar / gcalcli-calendar / caldav-calendar

Descripción observada:

- Crear eventos, listar agenda y manejar recordatorios/calendarios.
- Google Calendar requiere OAuth/token.
- CalDAV requiere `vdirsyncer` + `khal`.

Encaje:

- Bueno para eventos con hora/fecha real.
- Demasiado pesado para recordatorios rápidos diarios.

Riesgo:

- Medio-alto por credenciales y calendarios reales.

Recomendación:

- Fase 2, no primera opción.

### apple-reminders

Descripción observada:

- Apple Reminders vía `remindctl`.
- macOS-only.

Encaje:

- No encaja con `bunker-ia` Linux.

Riesgo:

- No aplicable.

### memory-manager / agent-memory / auto-memory-pro

Descripción observada:

- Memoria persistente, snapshots, semantic/episodic memory, curación de memoria.

Encaje:

- Útil para memoria del agente, no para recordatorios humanos inmediatos.

Riesgo:

- Medio: puede complicar CORECLAW memory.

Recomendación:

- Estudiar después, no usar como sistema de recordatorios.

## Recomendación final

Primera implementación recomendada:

- crear un sistema local mínimo `daily_reminders/` o adaptar `todo-tracker-safe`;
- guardar recordatorios en Markdown/JSON local;
- permitir comandos simples:
  - añadir recordatorio;
  - listar pendientes;
  - marcar hecho;
  - resumen diario;
- integrarlo después con heartbeat para que Nia avise sin saturar.

## No recomendado ahora

- Google Calendar: demasiado pronto, OAuth pendiente.
- Todoist: útil, pero añade dependencia externa.
- Memoria avanzada: buena idea, pero no resuelve recordatorio diario simple.

## Próximo paso concreto

Crear recordatorios locales mínimos en `/openclaw/openclaw_v2/daily_reminders/` con archivo JSON y comandos seguros.
