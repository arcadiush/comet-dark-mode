#!/usr/bin/env bash
# Pakuje wtyczkę do dist/comet-dark-mode-<wersja>.zip (do wgrania w Chrome Web Store i addons.mozilla.org).
# Do paczki trafiają tylko pliki ładowane przez przeglądarkę - bez dokumentacji, bloga i źródeł ikon.
set -euo pipefail

cd "$(dirname "$0")"

version=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
out="dist/comet-dark-mode-${version}.zip"

mkdir -p dist
rm -f "$out"

zip -q -r -X "$out" \
  manifest.json \
  background content popup options utils \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png \
  icons/icon-off-16.png icons/icon-off-32.png icons/icon-off-48.png icons/icon-off-128.png \
  -x "*.DS_Store"

echo "Gotowe: $out"
unzip -l "$out" | tail -1
