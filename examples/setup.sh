#!/usr/bin/env bash
set -euo pipefail

# Run from inside any examples/<demo> directory.
ORIGINAL_DIR=$(pwd)
SDK_ROOT=$(cd "$ORIGINAL_DIR/../.." && pwd)
SYNC_PLATFORM="all"

info() { echo -e "\033[0;32m[setup]\033[0m $*"; }

usage() {
  echo "Usage: $0 [all|android|ios]" >&2
}

patch_ios_spm_cordova_plugin_package() {
  local cordova_plugins_dir="$ORIGINAL_DIR/ios/capacitor-cordova-ios-plugins"
  local static_dir="$cordova_plugins_dir/sourcesstatic/OnesignalCordovaPlugin"
  local package_dir="$cordova_plugins_dir/sources/OnesignalCordovaPlugin"
  local package_file="$package_dir/Package.swift"
  local ios_sdk_version

  if [[ ! -d "$static_dir" || ! -d "$ORIGINAL_DIR/ios/App/CapApp-SPM" ]]; then
    return 0
  fi

  ios_sdk_version=$(sed -n 's|.*OneSignal-XCFramework.git", exact: "\([^"]*\)".*|\1|p' "$SDK_ROOT/Package.swift" | head -n1)
  if [[ -z "$ios_sdk_version" ]]; then
    echo "Unable to resolve OneSignal iOS SDK version from Package.swift" >&2
    return 1
  fi

  rm -rf "$package_dir"
  mkdir -p "$package_dir"
  cp -R "$static_dir/." "$package_dir/"

  cat > "$package_file" <<SWIFT
// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "OnesignalCordovaPlugin",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "OnesignalCordovaPlugin",
            targets: ["OnesignalCordovaPlugin"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.3.1"),
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework.git", exact: "$ios_sdk_version")
    ],
    targets: [
        .target(
            name: "OnesignalCordovaPlugin",
            dependencies: [
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLocation", package: "OneSignal-XCFramework")
            ],
            path: ".",
            publicHeadersPath: "."
        )
    ]
)
SWIFT

  info "Prepared generated Cordova plugin SPM package."
}

run_capacitor_sync() {
  local platform="${1:-all}"
  local status=0

  case "$platform" in
    android)
      vpx cap sync android
      return
      ;;
    ios)
      vpx cap sync ios || status=$?
      patch_ios_spm_cordova_plugin_package
      ;;
    all)
      vpx cap sync || status=$?
      patch_ios_spm_cordova_plugin_package
      ;;
  esac
  return "$status"
}

for arg in "$@"; do
  case "$arg" in
    all|android|ios)
      SYNC_PLATFORM="$arg"
      ;;
    --local-pod|--local-package)
      info "$arg is no longer needed; the SPM demo always installs the local packed plugin."
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

# ── Plugin tarball cache ─────────────────────────────────────────────────────
# Skip rebuild/repack/`vp add` when plugin sources haven't changed.
SDK_STAMP="$SDK_ROOT/.cordova-sdk-source.stamp"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/onesignal-cordova-plugin"

SDK_SRC_HASH=$(find "$SDK_ROOT/src" "$SDK_ROOT/www" \
                    "$SDK_ROOT/package.json" "$SDK_ROOT/plugin.xml" \
                    "$SDK_ROOT/Package.swift" \
                    "$SDK_ROOT/OneSignalCordovaDependencies.podspec" \
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
# `cap sync` can refresh native projects and package metadata; skip when
# inputs are unchanged. Use per-platform stamps so Android-only runs do not
# touch iOS in CI.
SYNC_STAMP="$ORIGINAL_DIR/.cap-sync-${SYNC_PLATFORM}.stamp"
SYNC_INPUTS=(
  "$ORIGINAL_DIR/src"
  "$ORIGINAL_DIR/index.html"
  "$ORIGINAL_DIR/capacitor.config.ts"
  "$ORIGINAL_DIR/vite.config.ts"
  "$ORIGINAL_DIR/package.json"
  "$ORIGINAL_DIR/bun.lock"
)

case "$SYNC_PLATFORM" in
  android)
    SYNC_INPUTS+=("$ORIGINAL_DIR/android")
    ;;
  ios)
    SYNC_INPUTS+=("$ORIGINAL_DIR/ios/App")
    ;;
  all)
    SYNC_INPUTS+=("$ORIGINAL_DIR/android" "$ORIGINAL_DIR/ios/App")
    ;;
esac

SYNC_HASH=$(find "${SYNC_INPUTS[@]}" \
            -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/Pods/*" \
            ! -path "*/build/*" \
            ! -path "*/DerivedData/*" \
            ! -path "*/xcuserdata/*" \
            \( -name "Podfile" -o -name "Package.swift" \
               -o -name "Package.resolved" -o -name "build.gradle" \
               -o -name "*.ts" -o -name "*.tsx" \
               -o -name "*.json" -o -name "*.html" -o -name "*.js" \
               -o -name "*.css" -o -name "*.svg" -o -name "*.xml" \
               -o -name "*.lock" -o -name "*.xcconfig" \) \
            2>/dev/null \
            | sort \
            | xargs shasum 2>/dev/null \
            | shasum \
            | awk '{print $1}')
SYNC_HASH="${SYNC_HASH}-${SDK_SRC_HASH}"

sync_outputs_exist() {
  case "$SYNC_PLATFORM" in
    android)
      [[ -d "$ORIGINAL_DIR/android/app/src/main/assets/public" ]]
      ;;
    ios)
      [[ -d "$ORIGINAL_DIR/ios/App/App/public" ]]
      ;;
    all)
      [[ -d "$ORIGINAL_DIR/android/app/src/main/assets/public" && -d "$ORIGINAL_DIR/ios/App/App/public" ]]
      ;;
  esac
}

if sync_outputs_exist && [[ -f "$SYNC_STAMP" ]] && [[ "$(cat "$SYNC_STAMP")" == "$SYNC_HASH" ]]; then
  info "Capacitor sync inputs unchanged, skipping cap sync"
elif [[ "$SYNC_PLATFORM" == "android" ]]; then
  info "Syncing Capacitor Android..."
  run_capacitor_sync android
  echo "$SYNC_HASH" > "$SYNC_STAMP"
elif [[ "$SYNC_PLATFORM" == "ios" ]]; then
  info "Syncing Capacitor iOS..."
  run_capacitor_sync ios
  echo "$SYNC_HASH" > "$SYNC_STAMP"
elif [[ "$(uname -s)" != "Darwin" ]]; then
  # CI Android jobs run on Linux; keep native iOS project updates on macOS.
  info "Non-macOS host detected, syncing Android only..."
  vpx cap sync android
  echo "$SYNC_HASH" > "$SYNC_STAMP"
else
  info "Syncing Capacitor..."
  run_capacitor_sync all
  echo "$SYNC_HASH" > "$SYNC_STAMP"
fi
