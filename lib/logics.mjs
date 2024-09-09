import jsdom from "jsdom";

/**
 * RSSをparseして「リコールの届出について」のみ抽出し古い順に出力する
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
 * プレスリリースページからPDFのリンクを抽出する
 * @param {jsdom.JSDOM} page
 * @returns {import("../types/objects.ts").PdfLink[]}
 */
export function extractPdfLinksFromPressReleasePage(page) {
  const anchors = /** @type {HTMLAnchorElement[]} */ ([
    ...page.window.document.querySelectorAll(".linkArrow01 a[href$='.pdf']"),
  ]);
  return anchors.map((x) => ({ title: x.textContent ?? "", href: x.href }));
}
