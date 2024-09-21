/**
 * プレスリリースページから最初の文章を抽出します。
 * 例: ○○から、令和○年○月○日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。
 * @param {import("jsdom").JSDOM} dom
 * @returns {string}
 */
export function extractPreamble(dom) {
  const result = dom.window.document.querySelector(".date ~ p")?.textContent;
  if (!result) throw new Error("result is empty");
  return result;
}

/**
 * プレスリリースページからPDFのリンクを抽出します。
 * @param {import("jsdom").JSDOM} page
 * @returns {import("../types.ts").PdfLink[]}
 */
export function extractPdfLinks(page) {
  const anchors = /** @type {HTMLAnchorElement[]} */ ([
    ...page.window.document.querySelectorAll(".linkArrow01 a[href$='.pdf']"),
  ]);
  return anchors.map((x) => ({ title: x.textContent ?? "", href: x.href }));
}
