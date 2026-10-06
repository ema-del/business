#!/usr/bin/env python3
"""Minimal Google Sheets API client authenticated by a service account.

Credentials are read from the environment, never from a file in the repo:

    GOOGLE_SHEETS_SA_KEY       the service-account JSON, inline
    GOOGLE_SHEETS_SA_KEY_FILE  path to the JSON, as an alternative

Signs its own RS256 assertion by shelling out to `openssl`, so neither
`google-auth` nor a working `cryptography` build is needed. Usage:

    python3 scripts/sheets_api.py tabs   <sheet_id>
    python3 scripts/sheets_api.py get    <sheet_id> <a1_range>
    python3 scripts/sheets_api.py append <sheet_id> <a1_range> <json_row>
    python3 scripts/sheets_api.py update <sheet_id> <a1_range> <json_row>
    python3 scripts/sheets_api.py copyformat <sheet_id> <tab_id> <src_row> <dst_row> [cols]

`append` and `update` print the request and exit without sending it unless
--commit is passed, so a wrong range cannot overwrite live data by accident.
"""

import base64
import json
import os
import subprocess
import sys
import tempfile
import time

import requests

TOKEN_URL = "https://oauth2.googleapis.com/token"
SHEETS_URL = "https://sheets.googleapis.com/v4/spreadsheets"
SCOPE = "https://www.googleapis.com/auth/spreadsheets"


def _b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def load_credentials() -> dict:
    inline = os.environ.get("GOOGLE_SHEETS_SA_KEY")
    if inline:
        return json.loads(inline)
    path = os.environ.get("GOOGLE_SHEETS_SA_KEY_FILE")
    if path:
        with open(path) as handle:
            return json.load(handle)
    sys.exit(
        "No credentials. Set GOOGLE_SHEETS_SA_KEY (inline JSON) or "
        "GOOGLE_SHEETS_SA_KEY_FILE (path) in the environment settings."
    )


def access_token() -> str:
    creds = load_credentials()
    now = int(time.time())
    header = {"alg": "RS256", "typ": "JWT"}
    claims = {
        "iss": creds["client_email"],
        "scope": SCOPE,
        "aud": TOKEN_URL,
        "iat": now,
        "exp": now + 3600,
    }
    signing_input = f"{_b64(json.dumps(header).encode())}.{_b64(json.dumps(claims).encode())}"
    assertion = f"{signing_input}.{_b64(_sign_rs256(signing_input, creds['private_key']))}"

    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        },
        timeout=30,
    )
    if response.status_code != 200:
        sys.exit(f"Token request failed ({response.status_code}): {response.text}")
    return response.json()["access_token"]


def _sign_rs256(signing_input: str, private_key_pem: str) -> bytes:
    """RS256-sign via openssl, avoiding a dependency on a built crypto module."""
    with tempfile.TemporaryDirectory() as tmp:
        key_path = os.path.join(tmp, "key.pem")
        with open(key_path, "w", opener=lambda p, f: os.open(p, f, 0o600)) as handle:
            handle.write(private_key_pem)
        result = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", key_path],
            input=signing_input.encode(),
            capture_output=True,
            check=False,
        )
    if result.returncode != 0:
        sys.exit(f"openssl signing failed: {result.stderr.decode().strip()}")
    return result.stdout


def _headers() -> dict:
    return {"Authorization": f"Bearer {access_token()}"}


def tabs(sheet_id: str) -> list:
    response = requests.get(
        f"{SHEETS_URL}/{sheet_id}",
        params={"fields": "sheets.properties(sheetId,title,gridProperties)"},
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return [s["properties"] for s in response.json().get("sheets", [])]


def get(sheet_id: str, a1_range: str) -> list:
    response = requests.get(
        f"{SHEETS_URL}/{sheet_id}/values/{a1_range}",
        params={"valueRenderOption": "FORMATTED_VALUE"},
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json().get("values", [])


def append(sheet_id: str, a1_range: str, row: list) -> dict:
    response = requests.post(
        f"{SHEETS_URL}/{sheet_id}/values/{a1_range}:append",
        params={
            "valueInputOption": "USER_ENTERED",
            "insertDataOption": "INSERT_ROWS",
        },
        headers=_headers(),
        json={"values": [row]},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def update(sheet_id: str, a1_range: str, row: list) -> dict:
    response = requests.put(
        f"{SHEETS_URL}/{sheet_id}/values/{a1_range}",
        params={"valueInputOption": "USER_ENTERED"},
        headers=_headers(),
        json={"values": [row]},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def copy_row_format(
    sheet_id: str, tab_id: int, src_row: int, dst_row: int, columns: int = 1
) -> None:
    """Copy formatting from one row to another, by 1-based row number.

    A freshly written row inherits no number format, so a date lands as
    2026-10-06 where the rest of the column reads 10/6/2026. Copying the
    format from an existing row keeps the column consistent.
    """
    grid = lambda row: {
        "sheetId": tab_id,
        "startRowIndex": row - 1,
        "endRowIndex": row,
        "startColumnIndex": 0,
        "endColumnIndex": columns,
    }
    response = requests.post(
        f"{SHEETS_URL}/{sheet_id}:batchUpdate",
        headers=_headers(),
        json={
            "requests": [
                {
                    "copyPaste": {
                        "source": grid(src_row),
                        "destination": grid(dst_row),
                        "pasteType": "PASTE_FORMAT",
                    }
                }
            ]
        },
        timeout=30,
    )
    response.raise_for_status()


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--commit"]
    commit = "--commit" in sys.argv
    if not args:
        sys.exit(__doc__)

    command, rest = args[0], args[1:]

    if command == "tabs":
        print(json.dumps(tabs(rest[0]), indent=2))
    elif command == "get":
        print(json.dumps(get(rest[0], rest[1]), indent=2))
    elif command in ("append", "update"):
        sheet_id, a1_range, row = rest[0], rest[1], json.loads(rest[2])
        if not commit:
            print(f"DRY RUN — would {command} into {a1_range}:")
            print(json.dumps(row, indent=2))
            print("Re-run with --commit to send it.")
            return
        action = append if command == "append" else update
        print(json.dumps(action(sheet_id, a1_range, row), indent=2))
    elif command == "copyformat":
        sheet_id, tab_id, src_row, dst_row = rest[0], int(rest[1]), int(rest[2]), int(rest[3])
        columns = int(rest[4]) if len(rest) > 4 else 1
        copy_row_format(sheet_id, tab_id, src_row, dst_row, columns)
        print(f"Copied format from row {src_row} to row {dst_row}.")
    else:
        sys.exit(f"Unknown command: {command}\n{__doc__}")


if __name__ == "__main__":
    main()
