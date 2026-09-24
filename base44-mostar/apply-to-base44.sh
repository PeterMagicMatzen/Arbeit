#!/usr/bin/env bash
# Copies the Relume port into a Base44 app checkout (default: /app) and wires it up.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
APP="${1:-/app}"

mkdir -p "$APP/public" "$APP/src/pages" "$APP/reference"
rm -rf "$APP/src/relume" "$APP/public/relume"
cp -r "$SRC/src/relume" "$APP/src/relume"
cp -r "$SRC/public/relume" "$APP/public/relume"
cp "$SRC"/src/pages/*.jsx "$APP/src/pages/"
cp -r "$SRC/reference/." "$APP/reference/"

# Tailwind: load the Relume preset
if ! grep -q "tailwind.preset.cjs" "$APP/tailwind.config.js"; then
  sed -i 's#^module.exports = {#module.exports = {\n    presets: [require("./src/relume/tailwind.preset.cjs")],#' "$APP/tailwind.config.js"
fi

# Fonts come from the bundled woff2 files, not the Google Fonts CDN
sed -i '/fonts.googleapis.com/d; /fonts.gstatic.com/d' "$APP/index.html"

# Use the Relume layout (navbar + footer) for the site routes
sed -i "s#^import SiteLayout from .*#import SiteLayout from '@/relume/SiteLayout';#" "$APP/src/App.jsx"
grep -q "@/relume/SiteLayout" "$APP/src/App.jsx"
echo "Relume port applied to $APP"
