import os
import time
import subprocess
import requests
from pathlib import Path

ENV_FILE = Path("/openclaw/openclaw_v2/.env")
WORKDIR = Path("/openclaw/openclaw_v2")

def load_token():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("TELEGRAM_BOT_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("TELEGRAM_BOT_TOKEN not found")

TOKEN = load_token()
API = f"https://api.telegram.org/bot{TOKEN}"

def send(chat_id, text):
    requests.post(f"{API}/sendMessage", json={
        "chat_id": chat_id,
        "text": text[:3900],
    }, timeout=20)

def run(cmd):
    r = subprocess.run(
        cmd,
        shell=True,
        cwd=WORKDIR,
        capture_output=True,
        text=True,
        timeout=120,
    )
    return f"""COMMAND:
{cmd}

STDOUT:
{r.stdout}

STDERR:
{r.stderr}

EXIT_CODE:
{r.returncode}
"""
def handle(text):
    t = text.strip()
    tl = t.lower()

    if "donde estoy" in tl or "dónde estoy" in tl:
        return run("pwd")

    if "estado" in tl or tl == "status":
        return run("git status")

    if "lista" in tl and ("imagen" in tl or "imagenes" in tl or "imágenes" in tl):
        return run("find incoming_images -type f 2>/dev/null")

    if "busca" in tl and "jpg" in tl:
        return run('find /openclaw -name "*.jpg" | head')

    if "crea carpeta" in tl:
        nombre = tl.replace("crea carpeta", "").strip()
        if nombre:
            return run(f'mkdir -p "{nombre}" && ls -ld "{nombre}"')

    if tl.startswith("haz "):
        return run(t[4:])

    return run(t)

def main():
    print("NeoDaemon V2 Telegram bot running")
    offset = None

    while True:
        try:
            params = {"timeout": 30}
            if offset is not None:
                params["offset"] = offset

            data = requests.get(f"{API}/getUpdates", params=params, timeout=40).json()

            for update in data.get("result", []):
                offset = update["update_id"] + 1
                msg = update.get("message") or {}
                chat_id = msg.get("chat", {}).get("id")
                text = msg.get("text")

                if chat_id and text:
                    reply = handle(text)
                    send(chat_id, reply)

        except Exception as e:
            print("ERROR:", repr(e))
            time.sleep(5)

if __name__ == "__main__":
    main()
