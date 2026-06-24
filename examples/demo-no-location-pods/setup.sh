#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(cd "$(dirname "$0")" && pwd)
SDK_ROOT=$(cd "$DEMO_DIR/../.." && pwd)
SYNC_PLATFORM="all"
USE_LOCAL_POD=false
export ONESIGNAL_DISABLE_LOCATION=true

info() { echo -e "\033[0;32m[demo-no-location-pods]\033[0m $*"; }

usage() {
  echo "Usage: $0 [all|android|ios] [--local-pod]" >&2
}

patch_ios_podfile_local() {
  local podfile="$DEMO_DIR/ios/App/Podfile"

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
  local podfile="$DEMO_DIR/ios/App/Podfile"
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
  local app_dir="$DEMO_DIR/ios/App"

  if ! (cd "$app_dir" && pod install); then
    info "Refreshing OneSignalXCFramework after local dependency changes..."
    (cd "$app_dir" && pod update OneSignalXCFramework)
  fi
}

run_capacitor_sync() {
  local platform="${1:-all}"
  local status=0

  case "$platform" in
    android)
      (cd "$DEMO_DIR" && vpx cap sync android)
      return
      ;;
    ios)
      (cd "$DEMO_DIR" && vpx cap sync ios) || status=$?
      ;;
    all)
      (cd "$DEMO_DIR" && vpx cap sync) || status=$?
      ;;
  esac

  if [[ ! -f "$DEMO_DIR/ios/App/Podfile" ]]; then
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

patch_ios_apns_capability() {
  local app_dir="$DEMO_DIR/ios/App/App"
  local project_file="$DEMO_DIR/ios/App/App.xcodeproj/project.pbxproj"
  local entitlements_file="$app_dir/App.entitlements"

  if [[ ! -f "$project_file" || ! -d "$app_dir" ]]; then
    return
  fi

  cat > "$entitlements_file" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>development</string>
</dict>
</plist>
EOF

  PROJECT_FILE="$project_file" python3 <<'PY'
import os
import re
from pathlib import Path

project_file = Path(os.environ["PROJECT_FILE"])
text = project_file.read_text()

text = re.sub(
    r"PRODUCT_BUNDLE_IDENTIFIER = [^;]+;",
    "PRODUCT_BUNDLE_IDENTIFIER = com.onesignal.example;",
    text,
)

text = text.replace(
    "CODE_SIGN_STYLE = Automatic;\n",
    "CODE_SIGN_STYLE = Automatic;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n",
)
text = re.sub(
    r"(\t+CODE_SIGN_ENTITLEMENTS = App/App\.entitlements;\n)(\t+CODE_SIGN_ENTITLEMENTS = App/App\.entitlements;\n)+",
    r"\1",
    text,
)

if "SystemCapabilities" not in text:
    text = text.replace(
        "\t\t\t\t\t\tProvisioningStyle = Automatic;\n",
        "\t\t\t\t\t\tProvisioningStyle = Automatic;\n"
        "\t\t\t\t\t\tSystemCapabilities = {\n"
        "\t\t\t\t\t\t\tcom.apple.Push = {\n"
        "\t\t\t\t\t\t\t\tenabled = 1;\n"
        "\t\t\t\t\t\t\t};\n"
        "\t\t\t\t\t\t};\n",
        1,
    )

project_file.write_text(text)
PY
}

for arg in "$@"; do
  case "$arg" in
    all|android|ios)
      SYNC_PLATFORM="$arg"
      ;;
    --local-pod)
      USE_LOCAL_POD=true
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

info "Building Cordova plugin and packing local tarball..."
(cd "$SDK_ROOT" && vp run build)
(cd "$SDK_ROOT" && rm -f onesignal-cordova-plugin*.tgz && vp pm pack && mv onesignal-cordova-plugin-*.tgz onesignal-cordova-plugin.tgz)

info "Installing demo dependencies..."
(cd "$DEMO_DIR" && vp install)

info "Refreshing local Cordova plugin tarball dependency..."
(cd "$DEMO_DIR" && vp remove onesignal-cordova-plugin 2>/dev/null || true)
(cd "$DEMO_DIR" && vp add file:../../onesignal-cordova-plugin.tgz)

info "Building web bundle..."
(cd "$DEMO_DIR" && vp run build)

if [[ "$SYNC_PLATFORM" == "all" || "$SYNC_PLATFORM" == "android" ]]; then
  if [[ -f "$DEMO_DIR/android/app/build.gradle" ]] &&
     ! grep -q 'applicationId "com.onesignal.example"' "$DEMO_DIR/android/app/build.gradle"; then
    info "Recreating Android platform with package com.onesignal.example..."
    rm -rf "$DEMO_DIR/android"
  fi

  if [[ ! -d "$DEMO_DIR/android" ]]; then
    info "Adding Android platform..."
    (cd "$DEMO_DIR" && vpx cap add android)
  fi
fi

if [[ "$SYNC_PLATFORM" == "all" || "$SYNC_PLATFORM" == "ios" ]]; then
  if ! command -v pod >/dev/null 2>&1; then
    info "CocoaPods not found, skipping iOS platform setup."
    if [[ "$SYNC_PLATFORM" == "ios" ]]; then
      exit 1
    fi
    SYNC_PLATFORM="android"
  else
    if [[ -d "$DEMO_DIR/ios" && ! -f "$DEMO_DIR/ios/App/Podfile" ]]; then
      info "Recreating iOS platform with CocoaPods..."
      rm -rf "$DEMO_DIR/ios"
    fi

    if [[ ! -d "$DEMO_DIR/ios" ]]; then
      info "Adding iOS platform..."
      if ! (cd "$DEMO_DIR" && vpx cap add ios --packagemanager CocoaPods); then
        if [[ ! -f "$DEMO_DIR/ios/App/Podfile" ]]; then
          exit 1
        fi
        info "Patching generated Podfile before rerunning CocoaPods..."
      fi
    fi
    if [[ "$USE_LOCAL_POD" == true ]]; then
      patch_ios_podfile_local
    else
      patch_ios_podfile_git_branch || true
    fi
  fi
fi

info "Syncing Capacitor with ONESIGNAL_DISABLE_LOCATION=${ONESIGNAL_DISABLE_LOCATION:-}"
case "$SYNC_PLATFORM" in
  android)
    run_capacitor_sync android
    ;;
  ios)
    run_capacitor_sync ios
    patch_ios_apns_capability
    ;;
  all)
    run_capacitor_sync all
    patch_ios_apns_capability
    ;;
esac
