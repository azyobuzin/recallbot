import type jsdom from "jsdom";
import type { PdfLink } from "../types.ts";

/**
 * プレスリリースページから最初の文章を抽出します。
 * 例: ○○から、令和○年○月○日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。
 */
export function extractPreamble(dom: jsdom.JSDOM): string {
  const result = dom.window.document.querySelector(".date ~ p")?.textContent;
  if (!result) throw new Error("result is empty");
  return result;
}

/**
 * プレスリリースページからPDFのリンクを抽出します。
 */
export function extractPdfLinks(page: jsdom.JSDOM): PdfLink[] {
  const anchors = [
    ...page.window.document.querySelectorAll(".linkArrow01 a[href$='.pdf']"),
  ] as HTMLAnchorElement[];
  return anchors.map((x) => ({ title: x.textContent ?? "", href: x.href }));
}
