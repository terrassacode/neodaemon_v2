from gmail_client import gmail_service, TOKEN_PATH


def main() -> None:
    gmail_service()
    print("OAuth OK")
    print(f"Token saved at: {TOKEN_PATH}")
    print("Token content was not displayed.")


if __name__ == "__main__":
    main()
