# Gmail V2 OAuth

Objetivo: habilitar Gmail real para `claw.neodaemon@gmail.com` sin envío automático.

## Reglas

- Nunca enviar emails desde estos scripts.
- Solo OAuth, crear borradores y listar borradores.
- No imprimir tokens ni secretos.
- Guardar credenciales y token solo en `gmail_v2/.secrets/`.

## Archivos sensibles esperados

Crea este archivo manualmente con credenciales OAuth de tipo **Desktop app** desde Google Cloud:

```text
gmail_v2/.secrets/credentials.json
```

El token OAuth se creará automáticamente aquí:

```text
gmail_v2/.secrets/token.json
```

No pegues estos contenidos en chats ni documentación.

## Instalación

Desde `/openclaw/openclaw_v2`:

```bash
python3 -m venv gmail_v2/.venv
source gmail_v2/.venv/bin/activate
pip install -r gmail_v2/requirements.txt
```

## Uso

1. Iniciar OAuth:

```bash
python gmail_v2/oauth_start.py
```

2. Crear draft de prueba:

```bash
python gmail_v2/create_test_draft.py
```

3. Listar drafts:

```bash
python gmail_v2/list_drafts.py
```

## Seguridad

Los scopes usados permiten crear y leer borradores. Aunque el scope `gmail.compose` puede permitir envío si se implementase, este paquete no incluye ningún script de envío ni llama a `messages.send` ni `drafts.send`.
