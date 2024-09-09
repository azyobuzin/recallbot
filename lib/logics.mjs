import jsdom from "jsdom";

/**
 * RSSをparseして「リコールの届出について」のみ抽出し古い順に出力します。
 * @param {string} rss
 * @returns {import("../types/objects.ts").FeedItem[]}
 */
export function parseRssAndFilterRecalls(rss) {
  const domEnv = new jsdom.JSDOM();
  const dom = new domEnv.window.DOMParser().parseFromString(rss, "text/xml");
  const items = [...dom.querySelectorAll("item")];
  return items
    .map((item) => {
      const title = item.querySelector("title")?.textContent;
      if (title == null) throw new TypeError("title is null");
      const link = item.querySelector("link")?.textContent;
      if (link == null) throw new TypeError("link is null");
      return { title, link };
    })
    .filter((item) => item.title.includes("リコールの届出について"))
    .reverse(); // 古い順にする
}

/**
 * プレスリリースのタイトルから車名（メーカー + 通称名）を抽出します。
 * @param {string} title
 * @returns {string}
 */
export function extractCarNameFromTitle(title) {
  const s = title.indexOf("（");
  const e = title.lastIndexOf("）");
  if (s < 0 || e < 0) throw new Error("括弧が見つかりませんでした。");
  return title.slice(s + 1, e);
}

/**
 * プレスリリースページから最初の文章を抽出します。
 * 例: ○○から、令和○年○月○日国土交通大臣に対して、下記のとおりリコールの届出がありましたので、お知らせします。
 * @param {jsdom.JSDOM} page
 * @returns {string}
 */
export function extractPreambleFromPressReleasePage(page) {
  const result = page.window.document.querySelector(".date ~ p")?.textContent;
  if (!result) throw new Error("result is empty");
  return result;
}

/**
 * プレスリリースページからPDFのリンクを抽出します。
 * @param {jsdom.JSDOM} page
 * @returns {import("../types/objects.ts").PdfLink[]}
 */
export function extractPdfLinksFromPressReleasePage(page) {
  const anchors = /** @type {HTMLAnchorElement[]} */ ([
    ...page.window.document.querySelectorAll(".linkArrow01 a[href$='.pdf']"),
  ]);
  return anchors.map((x) => ({ title: x.textContent ?? "", href: x.href }));
}
