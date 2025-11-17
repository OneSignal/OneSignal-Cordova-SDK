#!/bin/bash
cd ../../
bun run build

# Pack
bun pm pack
mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz

# Install/update the plugin in the example app
cd example/IonicCapOneSignal
bun i

# Build example
tsc && vite build

