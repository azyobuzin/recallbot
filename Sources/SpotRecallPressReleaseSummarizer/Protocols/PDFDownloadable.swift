import Foundation

public protocol PDFDownloadable: Sendable {
  func downloadPDF(from url: URL) async throws -> Data
}
