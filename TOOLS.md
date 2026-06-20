# TOOLS.md - NeoDaemon Environment

## Qué es este archivo

`TOOLS.md` guarda notas locales y operativas del entorno.

No define la filosofía del asistente.
No sustituye a las skills.
No es memoria curada del usuario.

Su función es muy concreta: reunir valores específicos del entorno que hacen falta para operar bien.

## Qué sí va aquí

- rutas locales
- IDs de canales, grupos, topics o threads
- nombres de hosts, aliases y endpoints
- ubicaciones de logs
- nombres de dispositivos
- preferencias técnicas del entorno
- ubicación de configs y secretos
- reglas prácticas que dependen de la instalación real

## Qué no va aquí

- principios de personalidad
- reglas generales de ejecución
- historia del proyecto
- preferencias humanas que pertenecen a `USER.md` o `MEMORY.md`
- documentación de skills compartidas

## Configuración y secretos

Incluye aquí solo dónde viven las cosas, no su contenido completo.

### Rutas de configuración

- `.env` canónico: `[RUTA_DEL_ENV_CANONICO]`
- Config de plataforma: `[RUTA_DE_LA_CONFIG_PRINCIPAL]`
- Symlinks o rutas de compatibilidad: `[RUTAS_DE_COMPATIBILIDAD_SI_APLICA]`

### Regla de seguridad

- documenta ubicación y propósito, no pegues secretos completos.
- evita pegar secretos enteros en el archivo.
- si un valor es especialmente sensible, referencia su ubicación, no el contenido.

## Mensajería

### Plataforma principal

- Canal o grupo principal: `[ID_O_NOMBRE_DEL_GRUPO_PRINCIPAL]`

### Topics, threads o subcanales

- `[TOPIC_O_THREAD_1]` → `[ID_1]`
- `[TOPIC_O_THREAD_2]` → `[ID_2]`
- `[TOPIC_O_THREAD_3]` → `[ID_3]`

### Comportamiento por topic

- `[TOPIC_O_THREAD_1]`: `[COMPORTAMIENTO_ESPERADO_1]`
- `[TOPIC_O_THREAD_2]`: `[COMPORTAMIENTO_ESPERADO_2]`
- `[TOPIC_O_THREAD_3]`: `[COMPORTAMIENTO_ESPERADO_3]`

### Plataforma secundaria

- `[CANAL_O_WORKSPACE_SECUNDARIO_1]` → `[ID_O_REFERENCIA_1]`
- `[CANAL_O_WORKSPACE_SECUNDARIO_2]` → `[ID_O_REFERENCIA_2]`

## Proyectos y herramientas externas

### Gestión de proyectos

- Workspace o espacio principal: `[WORKSPACE_DE_PM]`
- Proyecto 1: `[NOMBRE_E_ID_PROYECTO_1]`
- Proyecto 2: `[NOMBRE_E_ID_PROYECTO_2]`

### CLIs y utilidades

- CLI de email: `[RUTA_EMAIL_CLI]`
- CLI de agente o coding tool: `[RUTA_AGENT_CLI]`
- Logs: `[RUTA_LOGS]`
- Base de datos o mirror local: `[RUTA_DB_LOCAL]`

### Gmail / correo saliente

- Cuenta propia del asistente: `claw.neodaemon@gmail.com`
- Uso previsto: correo saliente de Nia/NeoDaemon cuando Albert lo pida o lo apruebe.
- Regla: no guardar contraseñas, refresh tokens ni secretos completos en este archivo.
- Envíos externos: requieren confirmación previa salvo que Albert configure explícitamente una política controlada de autonomía.

## Infraestructura local

### Hosts y aliases

- `[HOST_O_ALIAS_1]` → `[DESCRIPCION_Y_O_ENDPOINT_1]`
- `[HOST_O_ALIAS_2]` → `[DESCRIPCION_Y_O_ENDPOINT_2]`
- `[HOST_O_ALIAS_3]` → `[DESCRIPCION_Y_O_ENDPOINT_3]`

### Paths o endpoints útiles

- `[SERVICIO_O_ENDPOINT_1]`
- `[SERVICIO_O_ENDPOINT_2]`
- `[SERVICIO_O_ENDPOINT_3]`

## Reglas operativas del entorno

Guarda aquí reglas que dependen de cómo está montado el entorno real.

Ejemplos válidos:

- qué formato funciona mejor para notas de voz
- qué navegador o cuenta usar para cierto flujo
- qué endpoint es el bueno de un conector
- qué alias SSH está verificado
- qué validación visual hay que hacer antes de enviar algo

Ejemplos de estructura:

- Notas de voz: `[REGLA_TECNICA_DE_AUDIO]`
- Navegador o sesión recomendada: `[REGLA_DE_NAVEGADOR]`
- Regla de validación antes de enviar: `[REGLA_DE_VALIDACION]`
- Endpoint o conector activo: `[ENDPOINT_O_CONECTOR_ACTIVO]`

## Preferencias de contenido técnicas

Si hay preferencias del entorno que afectan a output o delivery técnico, pueden ir aquí.

Ejemplos:

- formato de audio preferido
- herramienta de conversión recomendada
- comportamiento de portapapeles o scripts helper
- stack de prompts activo y fallback

## Stack de prompts o runtime

- Stack por defecto: `[STACK_PRINCIPAL]`
- Stack alternativo o fallback: `[STACK_FALLBACK]`
- Cómo se conmuta: `[METODO_DE_CONMUTACION]`

## Mantenimiento

Un buen `TOOLS.md` debe ser:

- corto
- preciso
- local al entorno
- fácil de escanear
- fácil de actualizar

Si una nota deja de ser específica del entorno, probablemente debe mudarse a otro archivo.

## Principio final

`TOOLS.md` es la chuleta local del asistente.

No debería explicar el mundo.

Solo debería evitar que el asistente pierda tiempo buscando cosas que ya debería tener a mano.

## Campos a personalizar

- `[RUTA_DEL_ENV_CANONICO]`
- `[RUTA_DE_LA_CONFIG_PRINCIPAL]`
- `[RUTAS_DE_COMPATIBILIDAD_SI_APLICA]`
- `[ID_O_NOMBRE_DEL_GRUPO_PRINCIPAL]`
- `[TOPIC_O_THREAD_1]`
- `[TOPIC_O_THREAD_2]`
- `[TOPIC_O_THREAD_3]`
- `[ID_1]`
- `[ID_2]`
- `[ID_3]`
- `[COMPORTAMIENTO_ESPERADO_1]`
- `[COMPORTAMIENTO_ESPERADO_2]`
- `[COMPORTAMIENTO_ESPERADO_3]`
- `[CANAL_O_WORKSPACE_SECUNDARIO_1]`
- `[CANAL_O_WORKSPACE_SECUNDARIO_2]`
- `[ID_O_REFERENCIA_1]`
- `[ID_O_REFERENCIA_2]`
- `[WORKSPACE_DE_PM]`
- `[NOMBRE_E_ID_PROYECTO_1]`
- `[NOMBRE_E_ID_PROYECTO_2]`
- `[RUTA_EMAIL_CLI]`
- `[RUTA_AGENT_CLI]`
- `[RUTA_LOGS]`
- `[RUTA_DB_LOCAL]`
- `[HOST_O_ALIAS_1]`
- `[HOST_O_ALIAS_2]`
- `[HOST_O_ALIAS_3]`
- `[DESCRIPCION_Y_O_ENDPOINT_1]`
- `[DESCRIPCION_Y_O_ENDPOINT_2]`
- `[DESCRIPCION_Y_O_ENDPOINT_3]`
- `[SERVICIO_O_ENDPOINT_1]`
- `[SERVICIO_O_ENDPOINT_2]`
- `[SERVICIO_O_ENDPOINT_3]`
- `[REGLA_TECNICA_DE_AUDIO]`
- `[REGLA_DE_NAVEGADOR]`
- `[REGLA_DE_VALIDACION]`
- `[ENDPOINT_O_CONECTOR_ACTIVO]`
- `[STACK_PRINCIPAL]`
- `[STACK_FALLBACK]`

## Main Server

Hostname:
bunker-ia

User:
openclaw

Purpose:

Main server for NeoDaemon and OpenClaw.

## Main Repository

Repository:

/openclaw/workspace/git_clean/neodaemon_v1

Default branch:

main

Working rule:

Never work directly on main.
Create branch → PR → Validation → Merge.

## Services

OpenClaw Gateway

systemctl --user status openclaw-gateway.service

OpenClaw Dashboard

systemctl --user status openclaw-dashboard.service

OpenClaw Dashboard Web

systemctl --user status openclaw-dashboard-web.service

OpenClaw RAG

systemctl --user status openclaw-rag-v2.service

## Known Ports

Gateway:

127.0.0.1:18789

Gateway Auth:

127.0.0.1:18791

Dashboard:

100.117.135.114:8090

API:

0.0.0.0:8000

## Image Inbox

Current goal:

Minimal Image Inbox.

Requirements:

- upload single image
- jpg/png/webp
- fixed folder
- no overwrite
- sanitized filenames
- visible by NeoDaemon

Storage:

/openclaw/data/image-inbox/uploads

Metadata:

/openclaw/data/image-inbox/meta

## Git Workflow

Preferred flow:

Branch
↓
PR
↓
PR Guardian
↓
Human approval
↓
Merge
↓
Cleanup

Never:

- direct modifications on main
- bypass PR Guardian
- force merge
- declare PASS without evidence
