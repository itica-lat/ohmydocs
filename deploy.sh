#!/bin/bash
set -e

SITE="ohmydocs"
LIVE="/var/www/$SITE"
FLAG="/run/nginx-maintenance/$SITE"

echo "[deploy] $SITE — $(date)"

# Maintenance on
sudo touch "$FLAG"

cd "$LIVE"
git pull

bun install --frozen-lockfile
bun run build

# Maintenance off
sudo rm -f "$FLAG"

echo "[deploy] done"
