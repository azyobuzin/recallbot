import Foundation
import Testing

@testable import SpotRecallPressReleaseSummarizer

struct SpotRecallPressReleasePageParserTests {
  @Test("2024-09-06のプレスリリースを正しく解析できること")
  func parse20240906() async throws {
    // Arrange
    let url = URL(string: "https://www.mlit.go.jp/report/press/jidosha08_hh_005221.html")!
    let testDataURL = Bundle.module.url(
      forResource: "jidosha08_hh_005221", withExtension: "html", subdirectory: "TestData")!
    let htmlData = try Data(contentsOf: testDataURL)
    let downloader = StubHTMLDownloader(with: htmlData)
    let parser = SpotRecallPressReleasePageParser(downloader: downloader)

    // Act
    let page = try await parser.parseSpotRecallPressReleasePage(url)

    // Assert
    let expected = SpotRecallPressReleasePage(
      pressReleaseUrl: url,
      carName: "ドゥカティ　パニガーレV４　他",
      preamble: "ドゥカティジャパン株式会社から、令和６年９月６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。",
      recallListPdfUrl: URL(string: "https://www.mlit.go.jp/report/press/content/001761787.pdf")!,
      illustrationPdfUrls: [
        URL(string: "https://www.mlit.go.jp/report/press/content/001761784.pdf")!
      ]
    )
    #expect(page == expected)
  }

  @Test("2025-12-26のプレスリリース（本文が変わった）を正しく解析できること")
  func parse20251226() async throws {
    // Arrange
    let url = URL(string: "https://www.mlit.go.jp/report/press/jidosha08_hh_005637.html")!
    let testDataURL = Bundle.module.url(
      forResource: "jidosha08_hh_005637", withExtension: "html", subdirectory: "TestData")!
    let htmlData = try Data(contentsOf: testDataURL)
    let downloader = StubHTMLDownloader(with: htmlData)
    let parser = SpotRecallPressReleasePageParser(downloader: downloader)

    // Act
    let page = try await parser.parseSpotRecallPressReleasePage(url)

    // Assert
    let expected = SpotRecallPressReleasePage(
      pressReleaseUrl: url,
      carName: "KTM　390DUKE　他",
      preamble: "ＫＴＭ　ＪＡＰＡＮ株式会社から、令和７年１２月２６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。",
      recallListPdfUrl: URL(string: "https://www.mlit.go.jp/report/press/content/001975058.pdf")!,
      illustrationPdfUrls: [
        URL(string: "https://www.mlit.go.jp/report/press/content/001975059.pdf")!
      ]
    )
    #expect(page == expected)
  }
}
