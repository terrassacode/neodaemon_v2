from __future__ import annotations

from gmail_client import gmail_service


def main() -> None:
    service = gmail_service()
    response = service.users().drafts().list(userId="me", maxResults=10).execute()
    drafts = response.get("drafts", [])

    if not drafts:
        print("No drafts found")
        return

    for draft in drafts:
        draft_id = draft.get("id")
        full = service.users().drafts().get(
            userId="me",
            id=draft_id,
            format="metadata",
            metadataHeaders=["To", "Subject", "Date"],
        ).execute()
        message = full.get("message", {})
        headers = message.get("payload", {}).get("headers", [])
        header_map = {h.get("name", "").lower(): h.get("value", "") for h in headers}
        print(f"draft_id: {draft_id}")
        print(f"message_id: {message.get('id')}")
        print(f"to: {header_map.get('to', '')}")
        print(f"subject: {header_map.get('subject', '')}")
        print("---")


if __name__ == "__main__":
    main()
