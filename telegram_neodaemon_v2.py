import os
import time
import subprocess
import requests
from pathlib import Path
from main_handler_v2 import ask_main

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

    if tl.startswith("haz "):
        return run(t[4:])

    if tl in {"shell", "/shell"}:
        return "Modo shell: escribe haz <comando>"

    return ask_main(t)

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
