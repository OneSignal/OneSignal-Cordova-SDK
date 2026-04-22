#!/usr/bin/env bash
set -euo pipefail

# Run from inside any examples/<demo> directory.
ORIGINAL_DIR=$(pwd)
SDK_ROOT=$(cd "$ORIGINAL_DIR/../.." && pwd)

info() { echo -e "\033[0;32m[setup]\033[0m $*"; }

# ── Plugin tarball cache ─────────────────────────────────────────────────────
# Skip the rebuild/repack/`bun add` cycle when the plugin sources haven't
# changed and the demo already has it installed. Mirrors run-local.sh.
SDK_STAMP="$SDK_ROOT/.cordova-sdk-source.stamp"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/onesignal-cordova-plugin"
TARBALL="$SDK_ROOT/onesignal-cordova-plugin.tgz"

SDK_SRC_HASH=$(find "$SDK_ROOT/src" "$SDK_ROOT/www" \
                    "$SDK_ROOT/package.json" "$SDK_ROOT/plugin.xml" \
                    "$SDK_ROOT/build-extras-onesignal.gradle" \
               -type f 2>/dev/null \
               | sort \
               | xargs shasum 2>/dev/null \
               | shasum \
               | awk '{print $1}')

if [[ -d "$INSTALLED_DIR" ]] && [[ -f "$SDK_STAMP" ]] && [[ "$(cat "$SDK_STAMP")" == "$SDK_SRC_HASH" ]]; then
  info "Cordova SDK source unchanged, skipping rebuild + repack"
else
  info "Building Cordova plugin & packing tarball..."
  (cd "$SDK_ROOT" && bun run build)
  (cd "$SDK_ROOT" && rm -f onesignal-cordova-plugin*.tgz && bun pm pack && mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz)

  if [[ ! -d "$INSTALLED_DIR" ]]; then
    info "First install — running bun add to register tarball in lockfile..."
    bun add "file:$TARBALL"
  else
    info "Extracting tarball into demo's node_modules (respects package.json files)..."
    rm -rf "$INSTALLED_DIR"/*
    rm -rf "$INSTALLED_DIR"/.[!.]* 2>/dev/null || true
    tar -xzf "$TARBALL" -C "$INSTALLED_DIR" --strip-components=1
  fi

  echo "$SDK_SRC_HASH" > "$SDK_STAMP"
fi

# ── Web bundle ───────────────────────────────────────────────────────────────
info "Building web bundle (vite)..."
bun run build

# ── Capacitor sync cache ─────────────────────────────────────────────────────
# `cap sync` runs `pod install` + an internal `xcodebuild clean`, so skipping
# it when nothing relevant changed saves ~30-60s and keeps the Xcode build
# dir warm for incremental rebuilds.
#
# We hash the web bundle *sources* (not `dist/`) because Vite's legacy plugin
# emits content-hashed chunk filenames whose order can drift between identical
# builds, which would invalidate the stamp on every run.
SYNC_STAMP="$ORIGINAL_DIR/ios/App/build/.cap-sync.stamp"
SYNC_HASH=$(find "$ORIGINAL_DIR/src" "$ORIGINAL_DIR/index.html" \
                 "$ORIGINAL_DIR/capacitor.config.ts" "$ORIGINAL_DIR/vite.config.ts" \
                 "$ORIGINAL_DIR/package.json" "$ORIGINAL_DIR/bun.lock" \
                 "$ORIGINAL_DIR/ios/App" \
            -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/Pods/*" \
            ! -path "*/build/*" \
            ! -path "*/DerivedData/*" \
            ! -path "*/xcuserdata/*" \
            \( -name "Podfile" -o -name "build.gradle" \
               -o -name "*.ts" -o -name "*.tsx" \
               -o -name "*.json" -o -name "*.html" -o -name "*.js" \
               -o -name "*.css" -o -name "*.svg" -o -name "*.xml" \
               -o -name "*.lock" \) \
            2>/dev/null \
            | sort \
            | xargs shasum 2>/dev/null \
            | shasum \
            | awk '{print $1}')
SYNC_HASH="${SYNC_HASH}-${SDK_SRC_HASH}"

pod_update() {
  (cd "$ORIGINAL_DIR/ios/App" && pod update OneSignalXCFramework --no-repo-update)
}

if [[ -d "$ORIGINAL_DIR/ios/App/App/public" ]] && [[ -f "$SYNC_STAMP" ]] && [[ "$(cat "$SYNC_STAMP")" == "$SYNC_HASH" ]]; then
  info "Capacitor sync inputs unchanged, skipping pod update + cap sync"
else
  info "Updating Pods + syncing Capacitor..."
  # cap sync may fail if pods are outdated; retry after updating pods.
  pod_update
  bun cap sync || { pod_update && bun cap sync; }
  mkdir -p "$(dirname "$SYNC_STAMP")"
  echo "$SYNC_HASH" > "$SYNC_STAMP"
fi
