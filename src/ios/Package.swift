// swift-tools-version:5.6
import PackageDescription

let package = Package(
    name: "OnesignalCordovaPlugin",
    platforms: [
        .iOS("12.0")
    ],
    products: [
        .library(name: "OnesignalCordovaPlugin", targets: ["OnesignalCordovaPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework", exact: "5.2.15")
    ],
    targets: [
        .target(
            name: "OnesignalCordovaPlugin",
            dependencies: [
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLocation", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLiveActivities", package: "OneSignal-XCFramework")
            ],
            path: "src/ios"
        )
    ]
)
