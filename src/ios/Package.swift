// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "onesignal-cordova-plugin",
    platforms: [
        .iOS("12.0")
    ],
    products: [
        .library(name: "onesignal-cordova-plugin", targets: ["onesignal_cordova_plugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework", exact: "5.2.15")
    ],
    targets: [
        .target(
            name: "onesignal_cordova_plugin",
            dependencies: [
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLocation", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLiveActivities", package: "OneSignal-XCFramework")
            ],
            path: "."
        )
    ]
)
