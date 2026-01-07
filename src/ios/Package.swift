// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "OneSignalCordovaPlugin",
    platforms: [
        .iOS(.v11)
    ],
    products: [
        .library(
            name: "OneSignalCordovaPlugin",
            targets: ["OneSignalCordovaPlugin"]
        )
    ],
    dependencies: [
        .package(
            url: "https://github.com/OneSignal/OneSignal-XCFramework.git",
            exact: "5.2.15"
        )
    ],
    targets: [
        .target(
            name: "OneSignalCordovaPlugin",
            dependencies: [
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLiveActivities", package: "OneSignal-XCFramework")
            ],
            path: ".",
            sources: ["OneSignalPush.m"],
            publicHeadersPath: ".",
            cSettings: [
                .headerSearchPath(".")
            ]
        )
    ]
)

