// swift-tools-version:5.9

import PackageDescription

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
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master"),
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework.git", exact: "5.5.3"),
    ],
    targets: [
        .target(
            name: "onesignal-cordova-plugin",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLocation", package: "OneSignal-XCFramework"),
            ],
            path: "src/ios",
            publicHeadersPath: "."
        ),
    ]
)
