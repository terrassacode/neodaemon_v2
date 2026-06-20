from gmail_client import CREDENTIALS_PATH, SCOPES, TOKEN_PATH, ensure_secret_dir
from google_auth_oauthlib.flow import InstalledAppFlow


def main() -> None:
    ensure_secret_dir()
    flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
    creds = flow.run_local_server(host="127.0.0.1", port=43717, open_browser=False)
    TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
    TOKEN_PATH.chmod(0o600)
    print("OAuth OK")
    print(f"Token saved at: {TOKEN_PATH}")
    print("Token content was not displayed.")


if __name__ == "__main__":
    main()
