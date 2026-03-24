#!/usr/bin/env bash
set -euo pipefail

ORIGINAL_DIR=$(pwd)

# Build root package
cd ../../
bun run build

rm -f onesignal-cordova-plugin.tgz
bun pm pack
mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz

# Use fresh install of the package
cd "$ORIGINAL_DIR"
bun remove onesignal-cordova-plugin
bun add file:../../onesignal-cordova-plugin.tgz

pod_update() {
  cd ios/App && pod update OneSignalXCFramework --no-repo-update && cd ../..
}

# cap sync may fail if pods are outdated; retry after updating pods
pod_update
bun cap sync || { pod_update && bun cap sync; }

