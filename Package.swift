// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "Recallbot",
  dependencies: [
    .package(url: "https://github.com/vapor/vapor.git", from: "4.120.0")
  ],
  targets: [
    .executableTarget(
      name: "RecallbotWebServer",
      dependencies: [
        .product(name: "Vapor", package: "vapor")
      ]
    )
  ]
)
