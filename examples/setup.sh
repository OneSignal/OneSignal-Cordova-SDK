#!/usr/bin/env bash
set -euo pipefail

# Run from inside any examples/<demo> directory.
ORIGINAL_DIR=$(pwd)
SDK_ROOT=$(cd "$ORIGINAL_DIR/../.." && pwd)
DEMO_NAME=$(basename "$ORIGINAL_DIR")
SYNC_PLATFORM="all"
IOS_PACKAGE_MANAGER="spm"
USE_LOCAL_POD=false

if [[ "$DEMO_NAME" == "demo-pods" ]]; then
  IOS_PACKAGE_MANAGER="pods"
fi

info() { echo -e "\033[0;32m[setup]\033[0m $*"; }

usage() {
  echo "Usage: $0 [all|android|ios] [--local-pod] [--spm|--pods]" >&2
}

patch_ios_podfile_local() {
  local podfile="$ORIGINAL_DIR/ios/App/Podfile"

  if [[ ! -f "$podfile" ]]; then
    return 1
  fi

  PODFILE="$podfile" python3 <<'PY'
import os
import re
from pathlib import Path

podfile = Path(os.environ["PODFILE"])
text = podfile.read_text()
pod_line = "  pod 'OneSignalCordovaDependencies', :path => '../../node_modules/onesignal-cordova-plugin'"

text = re.sub(r"^.*pod 'OneSignalCordovaDependencies'.*\n", "", text, flags=re.MULTILINE)

if "  pod 'CordovaPluginsStatic'" in text:
    text = text.replace("  pod 'CordovaPluginsStatic'", f"{pod_line}\n  pod 'CordovaPluginsStatic'", 1)
elif "  pod 'CordovaPlugins'" in text:
    text = text.replace("  pod 'CordovaPlugins'", f"{pod_line}\n  pod 'CordovaPlugins'", 1)
else:
    text = text.replace("target 'App' do\n", f"target 'App' do\n{pod_line}\n", 1)

podfile.write_text(text)
PY
}

patch_ios_podfile_git_branch() {
  local podfile="$ORIGINAL_DIR/ios/App/Podfile"
  local branch

  if [[ ! -f "$podfile" ]]; then
    return 1
  fi

  branch=$(git -C "$SDK_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || true)
  if [[ "$branch" != rel/* ]]; then
    return 1
  fi

  info "Repointing OneSignalCordovaDependencies pod to git branch ${branch}..."
  PODFILE="$podfile" BRANCH="$branch" python3 <<'PY'
import os
import re
from pathlib import Path

podfile = Path(os.environ["PODFILE"])
branch = os.environ["BRANCH"]
text = podfile.read_text()
pod_line = (
    "  pod 'OneSignalCordovaDependencies', "
    ":git => 'https://github.com/OneSignal/OneSignal-Cordova-SDK.git', "
    f":branch => '{branch}'"
)

text, count = re.subn(
    r"^.*pod 'OneSignalCordovaDependencies'.*\n",
    f"{pod_line}\n",
    text,
    flags=re.MULTILINE,
)
if count == 0:
    raise SystemExit("Unable to find OneSignalCordovaDependencies pod in Podfile")

podfile.write_text(text)
PY
}

install_or_update_pods() {
  local app_dir="$ORIGINAL_DIR/ios/App"

  if ! (cd "$app_dir" && pod install); then
    info "Refreshing OneSignalXCFramework after local dependency changes..."
    (cd "$app_dir" && pod update OneSignalXCFramework)
  fi
}

finish_pods_sync() {
  local status="${1:-0}"

  if [[ ! -f "$ORIGINAL_DIR/ios/App/Podfile" ]]; then
    return "$status"
  fi

  if [[ "$USE_LOCAL_POD" == true ]]; then
    patch_ios_podfile_local
    info "Using OneSignalCordovaDependencies from the local plugin path."
    install_or_update_pods

    if [[ "$status" -ne 0 ]]; then
      info "Recovered iOS sync after repointing OneSignalCordovaDependencies to the local plugin."
    fi
    return
  fi

  if patch_ios_podfile_git_branch; then
    install_or_update_pods

    if [[ "$status" -ne 0 ]]; then
      info "Recovered iOS sync after repointing OneSignalCordovaDependencies to the release branch."
    fi
    return
  fi

  if [[ "$status" -ne 0 ]]; then
    return "$status"
  fi

  info "Using OneSignalCordovaDependencies from the generated git tag."
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
      if [[ "$IOS_PACKAGE_MANAGER" == "pods" ]]; then
        if finish_pods_sync "$status"; then
          status=0
        else
          status=$?
        fi
      fi
      ;;
    all)
      vpx cap sync || status=$?
      if [[ "$IOS_PACKAGE_MANAGER" == "pods" ]]; then
        if finish_pods_sync "$status"; then
          status=0
        else
          status=$?
        fi
      fi
      ;;
  esac
  return "$status"
}

for arg in "$@"; do
  case "$arg" in
    all|android|ios)
      SYNC_PLATFORM="$arg"
      ;;
    --local-pod)
      USE_LOCAL_POD=true
      ;;
    --local-package)
      info "$arg is no longer needed; the SPM demo always installs the local packed plugin."
      ;;
    --spm)
      IOS_PACKAGE_MANAGER="spm"
      ;;
    --pods)
      IOS_PACKAGE_MANAGER="pods"
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
