#!/usr/bin/env bash
set -euo pipefail
PDF=${1:?usage: extract_pdf.sh /path/file.pdf}
OUT_DIR=/openclaw/openclaw_v2/data/source-inbox/derived/pdfs
mkdir -p "$OUT_DIR"
BASE=$(basename "$PDF")
SAFE=$(printf '%s' "$BASE" | sed 's/[^A-Za-z0-9._-]/_/g; s/\.pdf$//I')
INFO="$OUT_DIR/${SAFE}.pdfinfo.txt"
TEXT="$OUT_DIR/${SAFE}.txt"
JSON="$OUT_DIR/${SAFE}.extract.json"
pdfinfo "$PDF" > "$INFO"
pdftotext -layout -enc UTF-8 "$PDF" "$TEXT"
BYTES=$(wc -c < "$TEXT" | tr -d ' ')
PAGES=$(awk -F: '/^Pages:/ {gsub(/ /,"",$2); print $2}' "$INFO" | head -1)
python3 - <<PY
import json, pathlib
result={
  "input": "$PDF",
  "infoPath": "$INFO",
  "textPath": "$TEXT",
  "jsonPath": "$JSON",
  "pages": "$PAGES",
  "textBytes": int("$BYTES"),
}
pathlib.Path("$JSON").write_text(json.dumps(result, indent=2, ensure_ascii=False))
print(json.dumps(result, indent=2, ensure_ascii=False))
PY
