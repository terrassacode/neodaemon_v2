import subprocess
import json
import requests
from pathlib import Path

IDENTITY = Path("/openclaw/openclaw_v2/IDENTITY.md").read_text()

def find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        for v in obj.values():
            found = find_key(v, key)
            if found:
                return found
    elif isinstance(obj, list):
        for item in obj:
            found = find_key(item, key)
            if found:
                return found
    return None


def ask_rag(question):
    try:
        r = requests.get(
            "http://127.0.0.1:5001/rag-ask",
            params={
                "q": question,
                "token": "neodaemon-secure-token"
            },
            timeout=10
        )
        data = r.json()

        if data.get("sources"):
            return data.get("answer", "Sin respuesta RAG")

        return None

    except Exception:
        return None

def ask_main(question):
    message = f"""{IDENTITY}

Mensaje de Albert:
{question}
"""

    result = subprocess.run(
        [
            "openclaw", "agent",
            "--agent", "neodaemon-v2",
            "--session-id", "telegram-v2-main",
            "--message", message,
            "--json",
            "--thinking", "medium",
            "--timeout", "600"
        ],
        capture_output=True,
        text=True,
        timeout=650
    )

    if result.returncode != 0:
        return f"Error Neodaemon:\n{result.stderr.strip()}"

    try:
        data = json.loads(result.stdout)
        return find_key(data, "finalAssistantVisibleText") or "Sin respuesta"
    except Exception as e:
        return f"Error parseando respuesta:\n{e}"
