#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
backup_dir=/opt/avrix-website/shared/backups
backup="$backup_dir/avrix-$(date -u +%Y%m%dT%H%M%SZ).dump"
temporary="$backup.partial"
trap 'rm -f -- "$temporary"' EXIT
/usr/bin/pg_dump --port=5433 --format=custom --file="$temporary" avrix
/usr/bin/pg_restore --list "$temporary" >/dev/null
mv -- "$temporary" "$backup"
# This directory is dedicated to Avrix; retain at least seven days of dumps.
find "$backup_dir" -maxdepth 1 -type f -name 'avrix-*.dump' -mtime +6 -delete
