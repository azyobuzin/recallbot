import Foundation
import SwiftSoup

/// リコール届出プレスリリースのHTMLを、SwiftSoupを使って解析する
struct SpotRecallPressReleasePageParser<Downloader: HTMLDownloadable>:
  SpotRecallPressReleasePageParsable
{
  private let downloader: Downloader

  init(downloader: Downloader) {
    self.downloader = downloader
  }

  func parseSpotRecallPressReleasePage(_ url: URL) async throws -> SpotRecallPressReleasePage {
    let htmlData: Data
    do {
      htmlData = try await downloader.downloadHTML(from: url)
    } catch {
      throw Error.downloadError(cause: error)
    }

    let doc: Document
    do {
      doc = try SwiftSoup.parse(htmlData, url.absoluteString)
    } catch {
      throw Error.parseError(cause: error)
    }

    return try Self.parseDocument(doc, baseURL: url)
  }

  private static func parseDocument(_ doc: Document, baseURL: URL) throws
    -> SpotRecallPressReleasePage
  {
    let carName = try extractCarName(from: doc)
    let preamble = try extractPreamble(from: doc)
    let pdfLinks = try extractPdfLinks(from: doc, baseURL: baseURL)

    guard let recallListPdfUrl = pdfLinks.first(where: { $0.title == "リコール届出一覧表" })?.href else {
      throw Error.missingRecallListPdfLink
    }

    let illustrationPdfUrls =
      pdfLinks
      .filter { $0.title.hasPrefix("改善箇所説明図") }
      .map { $0.href }

    return SpotRecallPressReleasePage(
      pressReleaseUrl: baseURL,
      carName: carName,
      preamble: preamble,
      recallListPdfUrl: recallListPdfUrl,
      illustrationPdfUrls: illustrationPdfUrls
    )
  }

  /// 車名（メーカー + 通称名）を抽出します。
  private static func extractCarName(from doc: Document) throws -> String {
    let titleText = try doc.title()

    guard let openIndex = titleText.firstIndex(of: "（"),
      let closeIndex = titleText.lastIndex(of: "）"),
      openIndex < closeIndex
    else {
      throw Error.missingCarName(description: "括弧が見つかりませんでした。")
    }

    let startIndex = titleText.index(after: openIndex)
    let carName = String(titleText[startIndex..<closeIndex])
      .trimmingCharacters(in: .whitespacesAndNewlines)

    guard !carName.isEmpty else {
      throw Error.missingCarName(description: "抽出した車名が空です。")
    }

    return carName
  }

  /// 本文の1文目を抽出します。
  private static func extractPreamble(from doc: Document) throws -> String {
    /*
      dateクラスの次のp要素のテキストノードを抽出する
    
      HTMLの構造（新フォーマット: brあり）
          <p class="date mb20">令和7年12月26日</p>
          <p>ＫＴＭ　ＪＡＰＡＮ株式会社から、令和７年１２月２６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。<br><br>※お持ちの車両がリコール等情報の対象に該当するかは、販売店または届出者へお問い合わせください。<br>　なお、メーカー等ホームページの検索画面でもご確認いただけます。（一部メーカー等を除く）</p>
    
      HTML の構造（旧フォーマット: brなし）
          <p class="date mb20">令和6年9月6日</p>
          <p>ドゥカティジャパン株式会社から、令和６年９月６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。</p>
    
      期待される抽出結果
          ＫＴＭ　ＪＡＰＡＮ株式会社から、令和７年１２月２６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。
    */
    guard let element = try doc.select(".date ~ p").first() else {
      throw Error.missingPreamble(description: "本文要素が見つかりませんでした。")
    }

    // br より前のテキストノードを抽出
    let text = extractTextBeforeBr(from: element)
      .trimmingCharacters(in: .whitespacesAndNewlines)

    guard !text.isEmpty else {
      throw Error.missingPreamble(description: "抽出した本文が空です。")
    }

    return text
  }

  /// 要素内の最初の br 要素より前のテキストを抽出します。
  private static func extractTextBeforeBr(from element: Element) -> String {
    var result = ""
    for node in element.getChildNodes() {
      if let textNode = node as? TextNode {
        result += textNode.text()
      } else if let el = node as? Element {
        if el.tagName() == "br" {
          break
        }
      }
    }
    return result
  }

  /// PDFリンクを抽出します。
  private static func extractPdfLinks(from doc: Document, baseURL: URL) throws -> [PdfLink] {
    let elements = try doc.select(".linkArrow01 a[href$='.pdf']")
    return try elements.compactMap { element -> PdfLink? in
      guard let url = URL(string: try element.absUrl("href")) else {
        return nil
      }
      return PdfLink(title: try element.text(), href: url)
    }
  }
}

extension SpotRecallPressReleasePageParser {
  enum Error: Swift.Error {
    /// HTMLのダウンロードに失敗
    case downloadError(cause: Swift.Error)

    /// HTMLの解析に失敗
    case parseError(cause: Swift.Error)

    /// 車名を取得できなかった
    case missingCarName(description: String)

    /// 本文を取得できなかった
    case missingPreamble(description: String)

    /// リコール届出一覧PDFリンクを取得できなかった
    case missingRecallListPdfLink
  }

  private struct PdfLink {
    let title: String
    let href: URL
  }
}
