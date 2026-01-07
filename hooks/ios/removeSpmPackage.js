#!/usr/bin/env node

/**
 * Cordova hook to remove OneSignal Swift Package Manager dependency
 * This runs before plugin uninstall to remove SPM package from the Xcode project
 */

const fs = require("fs");
const path = require("path");

const ONESIGNAL_REPO_URL =
  "https://github.com/OneSignal/OneSignal-XCFramework.git";
const ONESIGNAL_PRODUCTS = [
  "OneSignalFramework",
  "OneSignalInAppMessages",
  "OneSignalLocation",
  "OneSignalLiveActivities",
];

/**
 * Find the Xcode project file in the iOS platform directory
 */
function findXcodeProject(iosPath) {
  const files = fs.readdirSync(iosPath);
  for (const file of files) {
    if (file.endsWith(".xcodeproj")) {
      return path.join(iosPath, file, "project.pbxproj");
    }
  }
  return null;
}

/**
 * Remove SPM package reference from the project
 */
function removeSpmPackage(pbxprojPath) {
  console.log("OneSignal: Removing Swift Package Manager dependency...");

  let content = fs.readFileSync(pbxprojPath, "utf8");

  if (!content.includes(ONESIGNAL_REPO_URL)) {
    console.log("OneSignal: SPM package not found, skipping removal.");
    return;
  }

  // 1. Remove PBXBuildFile entries for OneSignal products (lines with productRef pointing to OneSignal)
  for (const product of ONESIGNAL_PRODUCTS) {
    // Match the entire line for OneSignal build file entries
    content = content.replace(
      new RegExp(`^\\s*[A-F0-9]{24}\\s*/\\*\\s*${product}\\s+in\\s+Frameworks\\s*\\*/.*productRef.*$\\n?`, "gm"),
      ""
    );
  }

  // 2. Remove references from files arrays in PBXFrameworksBuildPhase
  for (const product of ONESIGNAL_PRODUCTS) {
    // Remove the line with trailing comma
    content = content.replace(
      new RegExp(`^\\s*[A-F0-9]{24}\\s*/\\*\\s*${product}\\s+in\\s+Frameworks\\s*\\*/,?\\s*$\\n?`, "gm"),
      ""
    );
  }

  // 3. Remove packageProductDependencies entries from target
  for (const product of ONESIGNAL_PRODUCTS) {
    content = content.replace(
      new RegExp(`^\\s*[A-F0-9]{24}\\s*/\\*\\s*${product}\\s*\\*/,?\\s*$\\n?`, "gm"),
      ""
    );
  }

  // 4. Remove packageReferences entry for OneSignal
  content = content.replace(
    /^\s*[A-F0-9]{24}\s*\/\*\s*XCRemoteSwiftPackageReference "OneSignal-XCFramework"\s*\*\/,?\s*$\n?/gm,
    ""
  );

  // 5. Remove XCRemoteSwiftPackageReference section entry for OneSignal
  // Match the entry including the closing brace with proper indentation
  content = content.replace(
    /\t\t[A-F0-9]{24}\s*\/\*\s*XCRemoteSwiftPackageReference "OneSignal-XCFramework"\s*\*\/\s*=\s*\{[^}]*repositoryURL\s*=\s*"[^"]*OneSignal-XCFramework\.git"[^}]*\{[^}]*\}[^}]*\};\n?/g,
    ""
  );

  // 6. Remove XCSwiftPackageProductDependency entries for OneSignal products
  for (const product of ONESIGNAL_PRODUCTS) {
    content = content.replace(
      new RegExp(`\\t\\t[A-F0-9]{24}\\s*/\\*\\s*${product}\\s*\\*/\\s*=\\s*\\{[^}]*productName\\s*=\\s*${product};[^}]*\\};\\n?`, "g"),
      ""
    );
  }

  // 7. Clean up empty sections (including any leftover braces)
  content = content.replace(
    /\n*\/\* Begin XCRemoteSwiftPackageReference section \*\/\s*(\t*\};?\s*)*\/\* End XCRemoteSwiftPackageReference section \*\/\n*/g,
    ""
  );
  content = content.replace(
    /\n*\/\* Begin XCSwiftPackageProductDependency section \*\/\s*(\t*\};?\s*)*\/\* End XCSwiftPackageProductDependency section \*\/\n*/g,
    ""
  );

  // 8. Clean up empty packageReferences array
  content = content.replace(/^\s*packageReferences\s*=\s*\(\s*\);\s*$\n?/gm, "");

  // 9. Clean up empty packageProductDependencies array  
  content = content.replace(/^\s*packageProductDependencies\s*=\s*\(\s*\);\s*$\n?/gm, "");

  // Write the modified content back
  fs.writeFileSync(pbxprojPath, content, "utf8");

  console.log("OneSignal: SPM package removed successfully.");
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

  const iosPath = findIosPlatformPath(projectRoot);

  if (!iosPath) {
    console.log("OneSignal: iOS platform not found, skipping SPM removal.");
    return;
  }

  const pbxprojPath = findXcodeProject(iosPath);

  if (!pbxprojPath) {
    console.error("OneSignal: Could not find Xcode project file.");
    return;
  }

  console.log(`OneSignal: Found Xcode project at ${pbxprojPath}`);

  try {
    removeSpmPackage(pbxprojPath);
  } catch (error) {
    console.error("OneSignal: Error removing SPM package:", error.message);
  }
};
