# Dashboard HTTPS Mic Access v1

## Objetivo

Permitir que el botón push-to-talk del dashboard acceda al micrófono desde móvil/navegador.

## Diagnóstico

El navegador bloquea `getUserMedia()` cuando el dashboard se abre por HTTP remoto:

```text
http://100.117.135.114:8788
```

Aunque el permiso de micrófono esté activado, Chrome/Android exige contexto seguro:

- `https://...`, o
- `localhost`.

## Solución recomendada

Usar Tailscale Serve para exponer el dashboard por HTTPS dentro del tailnet:

```text
https://bunker-ia.tail20d249.ts.net
```

Destino local:

```text
http://127.0.0.1:8788
```

Comando previsto:

```bash
tailscale serve --yes --bg 8788
```

## Bloqueo actual

Tailscale respondió:

```text
Serve is not enabled on your tailnet.
To enable, visit:
https://login.tailscale.com/f/serve?node=nUzoCfFyri11CNTRL
```

Hasta habilitar Serve en el tailnet, no se puede completar la exposición HTTPS con Tailscale Serve.

## Cambio aplicado en dashboard

El mensaje de error del botón push-to-talk ahora explica que hace falta HTTPS/localhost y que no basta con activar el permiso del navegador.

## Seguridad

- No se habilitó Funnel público.
- Objetivo es Serve dentro del tailnet.
- No se exponen secretos.
