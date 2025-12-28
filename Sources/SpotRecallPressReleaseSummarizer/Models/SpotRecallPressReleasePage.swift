import Foundation

/// リコール届出プレスリリースの解析結果
struct SpotRecallPressReleasePage: Equatable, Sendable {
  /// プレスリリースURL
  let pressReleaseUrl: URL

  /// 車名 + 通称名
  let carName: String

  /// プレスリリース本文
  let preamble: String

  /// リコール届出一覧PDFのURL
  let recallListPdfUrl: URL

  /// 改善箇所説明図PDFのURL一覧
  let illustrationPdfUrls: [URL]
}
