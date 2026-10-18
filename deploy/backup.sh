#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
: "${BACKUP_BUCKET:?Set an S3 bucket with encryption and 30-day lifecycle}"
: "${BACKUP_KMS_KEY_ID:?Set the KMS key ARN}"
backup_name="avrix-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec -T db pg_dump -U avrix -d avrix -Fc | aws s3 cp - "s3://${BACKUP_BUCKET}/${backup_name}" --sse aws:kms --sse-kms-key-id "$BACKUP_KMS_KEY_ID"
