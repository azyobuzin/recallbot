// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "Recallbot",
  dependencies: [
    .package(url: "https://github.com/vapor/vapor.git", from: "4.120.0"),
    .package(url: "https://github.com/tid-kijyun/Kanna.git", from: "6.0.1"),
  ],
  targets: [
    .executableTarget(
      name: "RecallbotWebServer",
      dependencies: [
        .product(name: "Vapor", package: "vapor")
      ]
    ),
    .target(
      name: "SpotRecallPressReleaseSummarizer",
      dependencies: [
        .product(name: "Kanna", package: "Kanna")
      ]
    ),
    .testTarget(
      name: "SpotRecallPressReleaseSummarizerTests",
      dependencies: [
        .target(name: "SpotRecallPressReleaseSummarizer")
      ],
      resources: [
        .copy("TestData")
      ]
    ),
  ]
)
