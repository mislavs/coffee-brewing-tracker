#!/bin/sh
set -eu

config_file="/usr/share/nginx/html/config.js"

cat > "$config_file" <<'EOF'
window.__APP_CONFIG__ = window.__APP_CONFIG__ ?? {}
EOF

if [ -n "${API_URL:-}" ]; then
  escaped_api_url=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf 'window.__APP_CONFIG__.apiUrl = "%s"\n' "$escaped_api_url" >> "$config_file"
fi
