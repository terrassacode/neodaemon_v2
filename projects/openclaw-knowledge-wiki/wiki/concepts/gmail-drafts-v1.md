# Gmail Drafts v1

## Fuente

- `docs/GMAIL_DRAFTS_V1.md`
- `gmail_v2/README.md`

## Resumen

Gmail queda operativo para OAuth, listar borradores y crear borradores controlados. No se permite envío automático.

## Regla clave

No enviar emails salvo orden exacta:

```text
ENVÍA AHORA
```

## Permitido por defecto

- listar borradores;
- crear borradores;
- proponer contenido;
- verificar OAuth sin imprimir secretos.

## Prohibido por defecto

- enviar;
- responder;
- reenviar;
- borrar emails;
- modificar reglas/configuración de Gmail.

## Estado verificado

- OAuth credentials: OK.
- Token OAuth: OK.
- Refresh token: OK.
- `list_drafts.py`: OK, sin borradores encontrados.
