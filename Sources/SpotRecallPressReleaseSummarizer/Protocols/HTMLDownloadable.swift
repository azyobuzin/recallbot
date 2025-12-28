import Foundation

public protocol HTMLDownloadable: Sendable {
  func downloadHTML(from url: URL) async throws -> Data
}

struct StubHTMLDownloader: HTMLDownloadable {
  private let htmlData: Data

  init(with htmlData: Data) {
    self.htmlData = htmlData
  }

  func downloadHTML(from url: URL) async throws -> Data {
    return htmlData
  }
}
