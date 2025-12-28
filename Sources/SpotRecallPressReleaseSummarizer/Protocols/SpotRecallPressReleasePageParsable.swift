import Foundation

/// リコール届出プレスリリースのHTMLを解析する
protocol SpotRecallPressReleasePageParsable: Sendable {
  func parseSpotRecallPressReleasePage(_ url: URL) async throws -> SpotRecallPressReleasePage
}
