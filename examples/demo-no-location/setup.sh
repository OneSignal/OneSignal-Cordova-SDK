#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(cd "$(dirname "$0")" && pwd)
SDK_ROOT=$(cd "$DEMO_DIR/../.." && pwd)
SYNC_PLATFORM="${1:-all}"
export ONESIGNAL_DISABLE_LOCATION=true

info() { echo -e "\033[0;32m[demo-no-location]\033[0m $*"; }

patch_ios_podfile() {
  local podfile="$DEMO_DIR/ios/App/Podfile"

  if [[ ! -f "$podfile" ]]; then
    return
  fi

  PODFILE="$podfile" python3 <<'PY'
import os
from pathlib import Path

podfile = Path(os.environ["PODFILE"])
text = podfile.read_text()
pod_line = "  pod 'OneSignalCordovaDependencies', :path => '../../node_modules/onesignal-cordova-plugin'"

if "OneSignalCordovaDependencies" not in text:
    text = text.replace("target 'App' do\n", f"target 'App' do\n{pod_line}\n", 1)
    podfile.write_text(text)
PY
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

case "$SYNC_PLATFORM" in
  all|android|ios) ;;
  *)
    echo "Usage: $0 [all|android|ios]" >&2
    exit 2
    ;;
esac

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
  elif [[ -d "$DEMO_DIR/ios" && ! -f "$DEMO_DIR/ios/App/Podfile" ]]; then
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
  patch_ios_podfile
fi

info "Syncing Capacitor with ONESIGNAL_DISABLE_LOCATION=${ONESIGNAL_DISABLE_LOCATION:-}"
case "$SYNC_PLATFORM" in
  android)
    (cd "$DEMO_DIR" && vpx cap sync android)
    ;;
  ios)
    patch_ios_podfile
    (cd "$DEMO_DIR" && vpx cap sync ios)
    patch_ios_apns_capability
    ;;
  all)
    patch_ios_podfile
    (cd "$DEMO_DIR" && vpx cap sync)
    patch_ios_apns_capability
    ;;
esac
