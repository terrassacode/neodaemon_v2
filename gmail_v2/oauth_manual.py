from gmail_client import CREDENTIALS_PATH, SCOPES, TOKEN_PATH, ensure_secret_dir
from google_auth_oauthlib.flow import InstalledAppFlow


def main() -> None:
    ensure_secret_dir()
    flow = InstalledAppFlow.from_client_secrets_file(
        str(CREDENTIALS_PATH),
        scopes=SCOPES,
        redirect_uri="http://127.0.0.1:43717/",
    )
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    print("Open this URL in your browser:")
    print(auth_url)
    print()
    print("After Google redirects to 127.0.0.1 and the browser shows connection refused,")
    print("copy the FULL browser address bar URL and paste it here.")
    redirected = input("Redirected URL: ").strip()
    flow.fetch_token(authorization_response=redirected)
    creds = flow.credentials
    TOKEN_PATH.write_text(creds.to_json(), encoding="utf-8")
    TOKEN_PATH.chmod(0o600)
    print("OAuth OK")
    print(f"Token saved at: {TOKEN_PATH}")
    print("Token content was not displayed.")


if __name__ == "__main__":
    main()
