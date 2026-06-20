# Healthcheck

Comando mínimo para comprobar que el sistema sigue vivo.

```bash
python3 tools/healthcheck.py --quick
python3 tools/healthcheck.py --full
```

Uso recomendado:

- `--quick`: antes/después de cambios pequeños.
- `--full`: después de cambios importantes o merges que toquen dashboard, voz, Gmail o Source Inbox.

Salida esperada:

```text
SYSTEM_HEALTH_PASS
```

Si falla, corrige el primer `FAIL` relevante antes de seguir.
