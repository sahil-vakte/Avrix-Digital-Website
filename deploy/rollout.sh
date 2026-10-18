#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
new_image="${1:?Pass an immutable GHCR image tag}"
case "$new_image" in ghcr.io/*/avrix-api:*) ;; *) echo 'Invalid image tag' >&2; exit 2;; esac
compose=(docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml)
old_container=$("${compose[@]}" ps -q api)
old_image=''
if [ -n "$old_container" ]; then old_image=$(docker inspect --format '{{.Config.Image}}' "$old_container"); fi
export API_IMAGE="$new_image"
"${compose[@]}" pull api mail-worker
"${compose[@]}" up -d api mail-worker caddy
healthy=false
for attempt in {1..10}; do
  if curl --fail --silent --max-time 10 https://api.avrixdigital.co.uk/api/health/; then healthy=true; break; fi
  sleep 6
done
if [ "$healthy" != true ]; then
  if [ -n "$old_image" ]; then
    export API_IMAGE="$old_image"
    "${compose[@]}" up -d api mail-worker
    echo 'Health check failed; previous image restored.' >&2
  fi
  exit 1
fi
# Persist the successfully checked tag for reboot and future deploys.
python3 - "$new_image" <<'SCRIPT'
from pathlib import Path
import sys
p=Path('deploy/.env')
lines=[s for s in p.read_text().splitlines() if not s.startswith('API_IMAGE=')]
p.write_text('\n'.join(lines+['API_IMAGE='+sys.argv[1]])+'\n')
SCRIPT
