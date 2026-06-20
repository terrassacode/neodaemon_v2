from __future__ import annotations

import base64
from email.message import EmailMessage

from gmail_client import gmail_service

TO = "claw.neodaemon@gmail.com"
SUBJECT = "Prueba NeoDaemon V2 Gmail"
BODY = "Esto es una prueba de borrador desde NeoDaemon V2."


def build_raw_message() -> str:
    msg = EmailMessage()
    msg["To"] = TO
    msg["Subject"] = SUBJECT
    msg.set_content(BODY)
    return base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")


def main() -> None:
    service = gmail_service()
    draft = {"message": {"raw": build_raw_message()}}
    created = service.users().drafts().create(userId="me", body=draft).execute()
    print("Draft created")
    print(f"draft_id: {created.get('id')}")
    print(f"message_id: {created.get('message', {}).get('id')}")
    print("Email was NOT sent.")


if __name__ == "__main__":
    main()
