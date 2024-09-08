import { describe, expect, test } from "@jest/globals";
import {
  extractPdfLinksFromPressReleasePage,
  parseRssAndFilterRecalls,
} from "../lib/logics.mjs";
import { pressreleaseRdf20240908, recall20240906 } from "../tests/fixtures.mjs";

describe("parseRssAndFilterRecalls", () => {
  test("2024-09-08時点のRSSをparseして「リコールの届出について」のみを古い順に出力すること", async () => {
    const rss = await pressreleaseRdf20240908();
    const actual = parseRssAndFilterRecalls(rss);
    expect(actual).toEqual([
      {
        title: "リコールの届出について（マツダ　MAZDA CX-5　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005220.html",
      },
      {
        title: "リコールの届出について（ホンダ　GB350　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005222.html",
      },
      {
        title: "リコールの届出について（ドゥカティ　パニガーレV４　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005221.html",
      },
    ]);
  });
});

describe("extractPdfLinksFromPressReleasePage", () => {
  test("2024-09-08のプレスリリースページからPDFのリンクを抽出できること", async () => {
    const dom = await recall20240906();
    const actual = extractPdfLinksFromPressReleasePage(dom);
    expect(actual).toEqual([
      {
        title: "リコール届出一覧表",
        href: "https://www.mlit.go.jp/report/press/content/001761787.pdf",
      },
      {
        title: "改善箇所説明図",
        href: "https://www.mlit.go.jp/report/press/content/001761784.pdf",
      },
    ]);
  });
});
