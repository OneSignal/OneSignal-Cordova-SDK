#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go to the root directory (two levels up from example/scripts/)
cd "${SCRIPT_DIR}/../.."

# Get example name from argument or environment variable
EXAMPLE_NAME="${1:-${EXAMPLE}}"

bun run build

# Pack - remove old tarballs first to ensure fresh build
rm -f onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz
bun pm pack
mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz

# Install/update the plugin in the example app
cd example/${EXAMPLE_NAME}
if [ -n "$CI" ]; then
  bun install --frozen-lockfile
else
  rm -rf node_modules/onesignal-cordova-plugin
  bun i --fresh
fi

# Build example
if [ "$EXAMPLE_NAME" = "IonicAngular" ]; then
  ng build
elif [ "$EXAMPLE_NAME" = "IonicCapOneSignal" ]; then
  tsc && vite build
else
  echo "Unknown example: ${EXAMPLE_NAME}"
  exit 1
fi
