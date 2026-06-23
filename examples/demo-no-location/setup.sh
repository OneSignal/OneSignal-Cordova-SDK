#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(cd "$(dirname "$0")" && pwd)
SYNC_PLATFORM="all"
export ONESIGNAL_DISABLE_LOCATION=true

cd "$DEMO_DIR"

for arg in "$@"; do
  case "$arg" in
    all|android|ios)
      SYNC_PLATFORM="$arg"
      ;;
  esac
done

if [[ "$SYNC_PLATFORM" == "all" || "$SYNC_PLATFORM" == "android" ]]; then
  if [[ ! -d "$DEMO_DIR/android" ]]; then
    vp install
    vpx cap add android
  fi
fi

if [[ "$SYNC_PLATFORM" == "all" || "$SYNC_PLATFORM" == "ios" ]]; then
  if [[ -f "$DEMO_DIR/ios/App/Podfile" ]]; then
    rm -rf "$DEMO_DIR/ios"
  fi

  if [[ ! -d "$DEMO_DIR/ios" ]]; then
    vp install
    vpx cap add ios --packagemanager SPM
  fi
fi

exec ../setup.sh "$@" --spm
