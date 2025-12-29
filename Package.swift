// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "recallbot",
  dependencies: [
    .package(url: "https://github.com/awslabs/aws-sdk-swift.git", from: "1.6.24"),
    .package(url: "https://github.com/scinfu/SwiftSoup.git", from: "2.11.2"),
    .package(url: "https://github.com/vapor/vapor.git", from: "4.120.0"),
  ],
  targets: [
    .executableTarget(
      name: "RecallbotWebServer",
      dependencies: [
        .product(name: "Vapor", package: "vapor")
      ]
    ),
    .target(name: "SpotRecallListSummarizerAbstraction"),
    .target(
      name: "SpotRecallListSummarizerSingleConverse",
      dependencies: [
        .target(name: "SpotRecallListSummarizerAbstraction"),
        .product(name: "AWSBedrockRuntime", package: "aws-sdk-swift"),
      ]
    ),
    .target(
      name: "SpotRecallPressReleaseSummarizer",
      dependencies: [
        .product(name: "SwiftSoup", package: "SwiftSoup")
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
