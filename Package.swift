// swift-tools-version:5.9

import PackageDescription
import Foundation

func oneSignalEnvFlag(_ name: String) -> Bool {
    let value = Context.environment[name]?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return value == "true" || value == "1"
}

let oneSignalDisableLocation = oneSignalEnvFlag("ONESIGNAL_DISABLE_LOCATION")

var oneSignalDependencies: [Target.Dependency] = [
    .product(name: "Cordova", package: "cordova-ios"),
    .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
    .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
]

if !oneSignalDisableLocation {
    oneSignalDependencies.append(.product(name: "OneSignalLocation", package: "OneSignal-XCFramework"))
}

let package = Package(
    name: "onesignal-cordova-plugin",
    platforms: [
        .iOS(.v13),
    ],
    products: [
        .library(
            name: "onesignal-cordova-plugin",
            targets: ["onesignal-cordova-plugin"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/apache/cordova-ios.git", from: "8.0.0"),
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework.git", exact: "5.5.3"),
    ],
    targets: [
        .target(
            name: "onesignal-cordova-plugin",
            dependencies: oneSignalDependencies,
            path: "src/ios",
            publicHeadersPath: "."
        ),
    ]
)
