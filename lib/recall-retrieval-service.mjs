import jsdom from "jsdom";

export class RecallRetrievalService {
  /**
   * @param {import("../types/services.ts").DownloadRssService} rssDownloader
   */
  constructor(rssDownloader) {
    this._rssDownloader = rssDownloader;
  }
}

/**
 * @param {string} rss
 * @returns {import("../types/objects.ts").FeedItem[]}
 */
export function parseAndFilterItems(rss) {
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
