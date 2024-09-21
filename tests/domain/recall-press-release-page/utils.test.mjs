import { describe, expect, test } from "@jest/globals";
import {
  extractPdfLinks,
  extractPreamble,
} from "../../../lib/domain/recall-press-release-page/utils.mjs";
import { recall20240906 } from "../../fixtures.mjs";

describe("extractPreamble", () => {
  test("2024-09-06のプレスリリースページから冒頭の文章を抽出できること", async () => {
    const dom = await recall20240906();
    const actual = extractPreamble(dom);
    expect(actual).toBe(
      "ドゥカティジャパン株式会社から、令和６年９月６日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。",
    );
  });
});

describe("extractPdfLinks", () => {
  test("2024-09-06のプレスリリースページからPDFのリンクを抽出できること", async () => {
    const dom = await recall20240906();
    const actual = extractPdfLinks(dom);
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
