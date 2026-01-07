#!/usr/bin/env node

/**
 * Cordova hook to add OneSignal Swift Package Manager dependency
 * This runs after plugin install to add SPM package to the Xcode project
 */

const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

const ONESIGNAL_REPO_URL =
  "https://github.com/OneSignal/OneSignal-XCFramework.git";
const ONESIGNAL_VERSION = "5.2.15";
const ONESIGNAL_PRODUCTS = [
  "OneSignalFramework",
  "OneSignalInAppMessages",
  "OneSignalLocation",
  "OneSignalLiveActivities",
];

/**
 * Generate a unique 24-character UUID for Xcode project entries
 */
function generateUuid() {
  const chars = "ABCDEF0123456789";
  let uuid = "";
  for (let i = 0; i < 24; i++) {
    uuid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uuid;
}

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
 * Check if SPM package is already added to the project
 */
function isPackageAlreadyAdded(projectContents) {
  return projectContents.includes(ONESIGNAL_REPO_URL);
}

/**
 * Add SPM package reference to the project
 */
function addSpmPackage(pbxprojPath) {
  console.log("OneSignal: Adding Swift Package Manager dependency...");

  const project = xcode.project(pbxprojPath);
  project.parseSync();

  const projectContents = fs.readFileSync(pbxprojPath, "utf8");

  if (isPackageAlreadyAdded(projectContents)) {
    console.log("OneSignal: SPM package already added, skipping.");
    return;
  }

  // Get the main target (first non-test target)
  const targets = project.pbxNativeTargetSection();
  let mainTargetKey = null;
  let mainTargetName = null;

  for (const key in targets) {
    if (typeof targets[key] === "object" && targets[key].productType) {
      const productType = targets[key].productType.replace(/"/g, "");
      if (productType === "com.apple.product-type.application") {
        mainTargetKey = key;
        mainTargetName = targets[key].name.replace(/"/g, "");
        break;
      }
    }
  }

  if (!mainTargetKey) {
    console.error("OneSignal: Could not find main application target");
    return;
  }

  console.log(`OneSignal: Found main target: ${mainTargetName}`);

  // Get the main target's frameworks build phase key from the project hash
  const mainTarget = targets[mainTargetKey];
  let frameworksBuildPhaseKey = null;
  
  if (mainTarget.buildPhases) {
    const pbxFrameworksBuildPhase = project.hash.project.objects.PBXFrameworksBuildPhase;
    for (const phaseRef of mainTarget.buildPhases) {
      const phaseKey = phaseRef.value;
      if (pbxFrameworksBuildPhase && pbxFrameworksBuildPhase[phaseKey]) {
        frameworksBuildPhaseKey = phaseKey;
        break;
      }
    }
  }

  // Generate UUIDs for package references
  const packageRefUuid = generateUuid();
  const productDependencyUuids = ONESIGNAL_PRODUCTS.map(() => generateUuid());
  const buildFileUuids = ONESIGNAL_PRODUCTS.map(() => generateUuid());

  // Read the project file content
  let content = fs.readFileSync(pbxprojPath, "utf8");

  // 1. Add PBXBuildFile entries for the SPM products (in the existing PBXBuildFile section)
  const buildFileEntries = ONESIGNAL_PRODUCTS.map((product, index) =>
    `\t\t${buildFileUuids[index]} /* ${product} in Frameworks */ = {isa = PBXBuildFile; productRef = ${productDependencyUuids[index]} /* ${product} */; };`
  ).join("\n");

  content = content.replace(
    "/* End PBXBuildFile section */",
    `${buildFileEntries}\n/* End PBXBuildFile section */`
  );

  // 2. Add files to the main target's Frameworks build phase only
  if (frameworksBuildPhaseKey) {
    const newBuildFileRefs = buildFileUuids
      .map((uuid, i) => `\t\t\t\t${uuid} /* ${ONESIGNAL_PRODUCTS[i]} in Frameworks */`)
      .join(",\n");

    // Find this specific frameworks phase and add our files
    const specificPhasePattern = new RegExp(
      `(${frameworksBuildPhaseKey}[\\s\\S]*?files = \\()([\\s\\S]*?)(\\);)`,
      "s"
    );

    content = content.replace(specificPhasePattern, (match, prefix, existingFiles, suffix) => {
      const trimmed = existingFiles.trimEnd();
      // Remove trailing comma if present to normalize
      const normalized = trimmed.replace(/,\s*$/, "");
      if (normalized.trim()) {
        return `${prefix}${normalized},\n${newBuildFileRefs},\n\t\t\t${suffix}`;
      } else {
        return `${prefix}\n${newBuildFileRefs},\n\t\t\t${suffix}`;
      }
    });
  }

  // 3. Add packageProductDependencies to the main target (before buildPhases)
  const productDepsEntries = productDependencyUuids
    .map((uuid, i) => `\t\t\t\t${uuid} /* ${ONESIGNAL_PRODUCTS[i]} */`)
    .join(",\n");

  // Find the main target and add packageProductDependencies before buildPhases
  const targetPattern = new RegExp(
    `(${mainTargetKey}[\\s\\S]*?buildConfigurationList[^;]*;)(\\s*)(buildPhases\\s*=)`,
    "s"
  );

  content = content.replace(
    targetPattern,
    `$1\n\t\t\tpackageProductDependencies = (\n${productDepsEntries},\n\t\t\t);$2$3`
  );

  // 4. Add packageReferences to the PBXProject section (before buildConfigurationList)
  const projectBuildConfigPattern = /(isa = PBXProject;[\s\S]*?)(buildConfigurationList\s*=)/;
  content = content.replace(
    projectBuildConfigPattern,
    `$1packageReferences = (\n\t\t\t\t${packageRefUuid} /* XCRemoteSwiftPackageReference "OneSignal-XCFramework" */,\n\t\t\t);\n\t\t\t$2`
  );

  // 5. Add XCRemoteSwiftPackageReference and XCSwiftPackageProductDependency sections
  const packageRefSection = `/* Begin XCRemoteSwiftPackageReference section */
\t\t${packageRefUuid} /* XCRemoteSwiftPackageReference "OneSignal-XCFramework" */ = {
\t\t\tisa = XCRemoteSwiftPackageReference;
\t\t\trepositoryURL = "${ONESIGNAL_REPO_URL}";
\t\t\trequirement = {
\t\t\t\tkind = upToNextMajorVersion;
\t\t\t\tminimumVersion = ${ONESIGNAL_VERSION};
\t\t\t};
\t\t};
/* End XCRemoteSwiftPackageReference section */`;

  const productDependencySection = ONESIGNAL_PRODUCTS.map((product, index) =>
    `\t\t${productDependencyUuids[index]} /* ${product} */ = {
\t\t\tisa = XCSwiftPackageProductDependency;
\t\t\tpackage = ${packageRefUuid} /* XCRemoteSwiftPackageReference "OneSignal-XCFramework" */;
\t\t\tproductName = ${product};
\t\t};`
  ).join("\n");

  const spmSections = `
${packageRefSection}

/* Begin XCSwiftPackageProductDependency section */
${productDependencySection}
/* End XCSwiftPackageProductDependency section */
`;

  // Insert before rootObject
  content = content.replace(
    /(\t\};)\n(\trootObject)/,
    `$1${spmSections}\n$2`
  );

  // Write the modified content back
  fs.writeFileSync(pbxprojPath, content, "utf8");

  console.log("OneSignal: SPM package added successfully.");
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
  const ConfigParser = context.requireCordovaModule("cordova-common").ConfigParser;
  const configPath = path.join(projectRoot, "config.xml");
  const config = new ConfigParser(configPath);

  // Check if user wants to use CocoaPods instead
  const useCocoaPods = config.getPreference("USE_COCOAPODS", "ios");
  if (useCocoaPods && useCocoaPods.toLowerCase() === "true") {
    console.log(
      "OneSignal: USE_COCOAPODS preference is set, skipping SPM setup."
    );
    return;
  }

  const iosPath = findIosPlatformPath(projectRoot);

  if (!iosPath) {
    console.log("OneSignal: iOS platform not found, skipping SPM setup.");
    return;
  }

  const pbxprojPath = findXcodeProject(iosPath);

  if (!pbxprojPath) {
    console.error("OneSignal: Could not find Xcode project file.");
    return;
  }

  console.log(`OneSignal: Found Xcode project at ${pbxprojPath}`);

  try {
    addSpmPackage(pbxprojPath);
  } catch (error) {
    console.error("OneSignal: Error adding SPM package:", error.message);
    throw error;
  }
};
