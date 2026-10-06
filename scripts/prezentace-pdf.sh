#!/bin/sh
# Vytiskne prezentaci firmy (prezentace.html) do PDF přes Chrome bez okna.
# Prezentace si náhledy projektů bere z index.html přes fetch, proto si skript na dobu
# tisku spustí vlastní místní server – z file:// by to prohlížeč nepovolil.
# Výchozí výstup je prezentace/Tetify-prezentace.pdf.
# Použití: scripts/prezentace-pdf.sh [výstup.pdf]
#   jiný port:   DECK_PORT=4400 scripts/prezentace-pdf.sh
#   jiný Chrome: CHROME="/cesta/k/Chrome" scripts/prezentace-pdf.sh

cd "$(dirname "$0")/.." || exit 1
OUT="${1:-prezentace/Tetify-prezentace.pdf}"
PORT="${DECK_PORT:-4399}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Nenašel jsem Chrome: $CHROME"; exit 1; }

PROFILE="$(mktemp -d)"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill "$SERVER" 2>/dev/null; wait "$SERVER" 2>/dev/null; rm -rf "$PROFILE"' EXIT
sleep 1

rm -f "$OUT"
"$CHROME" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
  --no-pdf-header-footer --user-data-dir="$PROFILE" --virtual-time-budget=10000 \
  --print-to-pdf="$OUT" "http://127.0.0.1:$PORT/prezentace.html" >/dev/null 2>&1 &
CHROME_PID=$!
# Chrome po zapsání PDF sám neskončí – počkáme na soubor a ukončíme ho.
for _ in $(seq 1 90); do
  [ -s "$OUT" ] && sleep 2 && break
  sleep 1
done
kill "$CHROME_PID" 2>/dev/null; wait "$CHROME_PID" 2>/dev/null
[ -s "$OUT" ] && echo "Hotovo: $OUT" || { echo "PDF se nepodařilo vytvořit."; exit 1; }
