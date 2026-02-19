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
bun pm cache rm
bun i

bun cap sync
