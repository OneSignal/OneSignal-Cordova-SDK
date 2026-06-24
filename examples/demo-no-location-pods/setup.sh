#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(cd "$(dirname "$0")" && pwd)
export ONESIGNAL_DISABLE_LOCATION=true

cd "$DEMO_DIR"

exec ../setup.sh "$@" --pods
