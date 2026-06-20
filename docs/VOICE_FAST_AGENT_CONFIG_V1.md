# Voice Fast Agent Config v1

Objetivo: encontrar una ruta autorizada para que el modo voz use una respuesta de Nia más rápida que `gpt-5.5`.

## Estado actual

Pipeline medido:

```text
STT small: ~4.5s en audios cortos
Nia gpt-5.5: ~9s en llamadas live recientes
Piper: ~2.3–2.5s
```

Cuello principal actual:

```text
respuesta de Nia / modelo agente
```

## Modelos configurados observados

Agente `neodaemon-v2`:

```text
openai-codex/gpt-5.5
```

Modelos permitidos en catálogo local:

```text
openai-codex/gpt-5.5
openai/gemini-flash
xiaomi/mimo-v2-flash
```

Alias:

```text
gemini-flash → openai/gemini-flash
Xiaomi       → xiaomi/mimo-v2-flash
```

## Pruebas realizadas

### Override de modelo en `openclaw agent`

Comando equivalente probado:

```text
openclaw agent --agent neodaemon-v2 --model Xiaomi ...
openclaw agent --agent neodaemon-v2 --model gemini-flash ...
```

Resultado:

```text
provider/model overrides are not authorized for this caller
```

Conclusión:

```text
No se puede implementar modo rápido mediante override de modelo desde el backend actual del dashboard.
```

### Xiaomi directo

Comando equivalente probado:

```text
openclaw infer model run --model Xiaomi ...
```

Resultado:

```text
No text output returned for provider "xiaomi" model "mimo-v2-flash".
```

### Agente temporal `voice-fast-probe` con Xiaomi

Se creó un agente temporal:

```text
voice-fast-probe
model: Xiaomi
workspace: /openclaw/openclaw_v2
```

Luego se ejecutó una respuesta corta.

Resultado:

```text
xiaomi (mimo-v2-flash) returned a billing error — API key has run out of credits or has insufficient balance.
```

El agente temporal fue eliminado después de la prueba.

Verificación:

```text
voice-fast-probe-present=false
```

## Conclusión

No hay todavía un fast-agent viable que pueda activarse de forma segura.

Bloqueos concretos:

1. Overrides por request no autorizados.
2. Xiaomi configurado pero sin saldo/crédito útil.
3. Gemini aparece como alias/configurado, pero `openclaw infer` lo reporta como modelo desconocido en esta ruta.

## Recomendación

No cambiar producción ahora.

Siguientes opciones seguras:

1. Reparar/proveer crédito para Xiaomi y repetir prueba.
2. Configurar correctamente un modelo flash alternativo autorizado.
3. Crear agente persistente `voice-fast` solo cuando el modelo rápido responda bien en prueba directa.
4. Mantener `neodaemon-v2` / `gpt-5.5` como modo normal hasta tener candidato fiable.

## Decisión operativa

Esta FEATURE queda como diagnóstico con evidencia, no como cambio de runtime.

No cambia:

- dashboard;
- agente por defecto;
- modelo de producción;
- permisos externos;
- envío a canales.
