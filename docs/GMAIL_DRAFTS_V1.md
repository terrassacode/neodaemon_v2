# Gmail Drafts v1

## Estado

Feature para dejar Gmail operativo de forma segura en OpenClaw V2.

## Objetivo

Permitir que Nia/NeoDaemon pueda:

- validar OAuth Gmail;
- listar borradores;
- crear borradores controlados;
- preparar correos para revisión humana.

No permite envío automático.

## Regla absoluta de envío

Nia no debe enviar emails salvo que Albert escriba exactamente:

```text
ENVÍA AHORA
```

Incluso con Gmail autorizado, las acciones permitidas por defecto son:

- listar borradores;
- leer estado seguro;
- crear borradores;
- proponer contenido.

Acciones prohibidas por defecto:

- enviar;
- responder;
- reenviar;
- borrar correos;
- modificar filtros/reglas;
- cambiar configuración de cuenta.

## Archivos

```text
gmail_v2/README.md
gmail_v2/requirements.txt
gmail_v2/.gitignore
gmail_v2/gmail_client.py
gmail_v2/oauth_start.py
gmail_v2/oauth_start_fixed_port.py
gmail_v2/oauth_manual.py
gmail_v2/list_drafts.py
gmail_v2/create_test_draft.py
```

## Archivos sensibles no versionados

Nunca commitear:

```text
gmail_v2/.secrets/credentials.json
gmail_v2/.secrets/token.json
gmail_v2/.venv/
gmail_v2/__pycache__/
```

## OAuth

Estado verificado:

- `credentials.json`: existe y es JSON válido;
- `token.json`: existe y es JSON válido;
- `refresh_token`: presente;
- permisos: `600`.

Scopes actuales:

```text
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/gmail.readonly
```

## Validación segura

Comando:

```bash
gmail_v2/.venv/bin/python gmail_v2/list_drafts.py
```

Resultado observado:

```text
No drafts found
```

## Riesgos

- El scope `gmail.compose` puede permitir envío si se implementa código de envío.
- Por eso esta feature no incluye scripts `send`, `reply` ni `forward`.
- Cualquier función futura de envío requiere una FEATURE separada y autorización explícita.

## Criterio de éxito

La feature está completa si:

- los scripts seguros están versionados;
- secretos quedan ignorados;
- `list_drafts.py` funciona;
- no existe ningún script de envío;
- secret scan del diff pasa;
- README documenta límites.
