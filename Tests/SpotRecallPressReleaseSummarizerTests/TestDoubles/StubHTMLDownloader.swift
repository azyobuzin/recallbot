import Foundation
import SpotRecallPressReleaseSummarizer

/// テスト用のHTMLDownloadable実装。初期化時に渡されたデータを返す。
struct StubHTMLDownloader: HTMLDownloadable {
  private let htmlData: Data

  init(with htmlData: Data) {
    self.htmlData = htmlData
  }

  func downloadHTML(from url: URL) async throws -> Data {
    return htmlData
  }
}
