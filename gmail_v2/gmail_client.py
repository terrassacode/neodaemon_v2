from __future__ import annotations

import os
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

BASE_DIR = Path(__file__).resolve().parent
SECRETS_DIR = BASE_DIR / ".secrets"
CREDENTIALS_PATH = SECRETS_DIR / "credentials.json"
TOKEN_PATH = SECRETS_DIR / "token.json"

# Minimal for draft workflow. Do not add send scripts.
SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.readonly",
]


def ensure_secret_dir() -> None:
    SECRETS_DIR.mkdir(mode=0o700, exist_ok=True)
    try:
        os.chmod(SECRETS_DIR, 0o700)
    except PermissionError:
        pass


def get_credentials() -> Credentials:
    ensure_secret_dir()

    if not CREDENTIALS_PATH.exists():
        raise FileNotFoundError(
            f"Missing OAuth credentials file: {CREDENTIALS_PATH}\n"
            "Create it from Google Cloud OAuth Client ID type 'Desktop app'."
        )

    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    elif not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
        creds = flow.run_local_server(port=0)

    TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
    try:
        os.chmod(TOKEN_PATH, 0o600)
    except PermissionError:
        pass

    return creds


def gmail_service():
    creds = get_credentials()
    return build("gmail", "v1", credentials=creds)
