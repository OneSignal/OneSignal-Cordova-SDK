#!/usr/bin/env node

/**
 * Cordova hook to add OneSignal via CocoaPods (fallback option)
 * This runs after plugin install when USE_COCOAPODS preference is set to true
 */

const fs = require("fs");
const path = require("path");

const ONESIGNAL_POD_VERSION = "5.2.15";

/**
 * Add OneSignal pod to the Podfile
 */
function addCocoaPodsDependency(iosPath, targetName) {
  const podfilePath = path.join(iosPath, "Podfile");

  if (!fs.existsSync(podfilePath)) {
    console.error("OneSignal: Podfile not found at", podfilePath);
    return false;
  }

  let podfileContent = fs.readFileSync(podfilePath, "utf8");

  // Check if OneSignal pod is already added
  if (podfileContent.includes("OneSignalXCFramework")) {
    console.log("OneSignal: Pod already present in Podfile, skipping.");
    return true;
  }

  // Find the main target and add the pod
  const targetPattern = new RegExp(
    `(target\\s+['"]${targetName}['"]\\s+do[^]*?)(end)`,
    "m"
  );
  const match = podfileContent.match(targetPattern);

  if (match) {
    const podLine = `  pod 'OneSignalXCFramework', '${ONESIGNAL_POD_VERSION}'\n  `;
    podfileContent = podfileContent.replace(
      targetPattern,
      `$1${podLine}$2`
    );
  } else {
    // Try to find any target block
    const anyTargetPattern = /(target\s+['"][^'"]+['"]\s+do[^]*?)(end)/m;
    const anyMatch = podfileContent.match(anyTargetPattern);

    if (anyMatch) {
      const podLine = `  pod 'OneSignalXCFramework', '${ONESIGNAL_POD_VERSION}'\n  `;
      podfileContent = podfileContent.replace(
        anyTargetPattern,
        `$1${podLine}$2`
      );
    } else {
      console.error("OneSignal: Could not find target in Podfile");
      return false;
    }
  }

  fs.writeFileSync(podfilePath, podfileContent, "utf8");
  console.log("OneSignal: Added pod to Podfile");
  return true;
}

/**
 * Find the app target name from the Xcode project
 */
function findAppTargetName(iosPath) {
  const files = fs.readdirSync(iosPath);
  for (const file of files) {
    if (file.endsWith(".xcodeproj")) {
      // The target name is usually the project name without extension
      return file.replace(".xcodeproj", "");
    }
  }
  return "App"; // Default fallback
}

/**
 * Find the iOS platform path (supports both Cordova and Capacitor structures)
 */
function findIosPlatformPath(projectRoot) {
  // Cordova structure: platforms/ios/
  const cordovaPath = path.join(projectRoot, "platforms", "ios");
  if (fs.existsSync(cordovaPath)) {
    return cordovaPath;
  }

  // Capacitor structure: ios/App/
  const capacitorPath = path.join(projectRoot, "ios", "App");
  if (fs.existsSync(capacitorPath)) {
    return capacitorPath;
  }

  // Alternative Capacitor structure: ios/
  const capacitorAltPath = path.join(projectRoot, "ios");
  if (fs.existsSync(capacitorAltPath)) {
    return capacitorAltPath;
  }

  return null;
}

module.exports = function (context) {
  const projectRoot = context.opts.projectRoot;
  const ConfigParser =
    context.requireCordovaModule("cordova-common").ConfigParser;
  const configPath = path.join(projectRoot, "config.xml");
  const config = new ConfigParser(configPath);

  // Only run if USE_COCOAPODS preference is set
  const useCocoaPods = config.getPreference("USE_COCOAPODS", "ios");
  if (!useCocoaPods || useCocoaPods.toLowerCase() !== "true") {
    // SPM is the default, skip CocoaPods setup
    return;
  }

  console.log("OneSignal: USE_COCOAPODS preference is set, adding CocoaPods dependency...");

  const iosPath = findIosPlatformPath(projectRoot);

  if (!iosPath) {
    console.log("OneSignal: iOS platform not found, skipping CocoaPods setup.");
    return;
  }

  const targetName = findAppTargetName(iosPath);
  console.log(`OneSignal: Found target name: ${targetName}`);

  if (addCocoaPodsDependency(iosPath, targetName)) {
    console.log("OneSignal: CocoaPods dependency added successfully.");
    console.log("OneSignal: Run 'pod install' in the ios directory to complete setup.");
  }
};

