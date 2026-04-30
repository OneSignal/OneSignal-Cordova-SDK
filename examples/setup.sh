#!/usr/bin/env bash
set -euo pipefail

# Run from inside any examples/<demo> directory.
ORIGINAL_DIR=$(pwd)
SDK_ROOT=$(cd "$ORIGINAL_DIR/../.." && pwd)

info() { echo -e "\033[0;32m[setup]\033[0m $*"; }

# ── Plugin tarball cache ─────────────────────────────────────────────────────
# Skip rebuild/repack/`vp add` when plugin sources haven't changed.
SDK_STAMP="$SDK_ROOT/.cordova-sdk-source.stamp"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/onesignal-cordova-plugin"

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
  (cd "$SDK_ROOT" && vp run build)
  (cd "$SDK_ROOT" && rm -f onesignal-cordova-plugin*.tgz && vp pm pack && mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz)

  # Remove before add so bun.lock's integrity hash refreshes against the new
  # tarball; otherwise `vp add` hits a dependency-loop error under bun 1.3+.
  # Keep the relative `file:../../...` path to match package.json's spec.
  info "Registering tarball with vp (refreshes bun.lock integrity hash)..."
  vp remove onesignal-cordova-plugin 2>/dev/null || true
  vp add file:../../onesignal-cordova-plugin.tgz

  echo "$SDK_SRC_HASH" > "$SDK_STAMP"
fi

# ── Web bundle ───────────────────────────────────────────────────────────────
info "Building web bundle (vite)..."
vp run build

# ── Capacitor sync cache ─────────────────────────────────────────────────────
# `cap sync` runs `pod install` + `xcodebuild clean` (~30-60s); skip when
# inputs are unchanged. Hash sources (not `dist/`) since bundlers emit
# content-hashed chunk names that can drift between identical builds.
SYNC_STAMP="$ORIGINAL_DIR/.cap-sync.stamp"
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

if [[ -d "$ORIGINAL_DIR/ios/App/App/public" ]] && [[ -f "$SYNC_STAMP" ]] && [[ "$(cat "$SYNC_STAMP")" == "$SYNC_HASH" ]]; then
  info "Capacitor sync inputs unchanged, skipping cap sync"
elif ! command -v pod >/dev/null 2>&1; then
  # CI Android jobs run on Linux where CocoaPods isn't installed.
  # Sync only Android so plain `cap sync` doesn't shell out to pod.
  info "CocoaPods not found, syncing Android only..."
  vpx cap sync android
  echo "$SYNC_HASH" > "$SYNC_STAMP"
else
  info "Syncing Capacitor..."
  vpx cap sync
  echo "$SYNC_HASH" > "$SYNC_STAMP"
fi
