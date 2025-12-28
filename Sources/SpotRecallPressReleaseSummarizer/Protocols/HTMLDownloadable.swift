import Foundation

public protocol HTMLDownloadable: Sendable {
  func downloadHTML(from url: URL) async throws -> Data
}
