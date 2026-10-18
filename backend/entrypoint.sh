#!/bin/sh
set -eu
python manage.py migrate --noinput
python manage.py createcachetable
if [ "${DJANGO_SETTINGS_MODULE:-}" = "config.settings.cloudflare" ]; then
  # Catch up persisted email jobs on startup and while this instance is awake.
  (while true; do python manage.py send_pending_emails || true; sleep 60; done) &
fi
exec "$@"
