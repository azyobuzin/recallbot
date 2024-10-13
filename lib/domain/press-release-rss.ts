import jsdom from "jsdom";
import { rssUrl } from "../constants.mjs";
import { decodeShiftJIS } from "../decode.ts";
import {
  AcceptHeaderValue,
  type DownloadResource,
} from "../infrastructures/index.ts";
import type { ServiceFactory } from "../types.ts";
import type { RecallPressReleaseFeedItem, RssFeedItem } from "./types.ts";

type DownloadPressReleaseRssDependencies = {
  downloadResource: DownloadResource;
};

const downloadPressReleaseRss =
  (deps: DownloadPressReleaseRssDependencies) => () =>
    deps.downloadResource(rssUrl, AcceptHeaderValue.rss);

const parseRss = (rss: string): RssFeedItem[] => {
  const domEnv = new jsdom.JSDOM();
  const dom = new domEnv.window.DOMParser().parseFromString(rss, "text/xml");
  const items = [...dom.querySelectorAll("item")];
  return items.map((item) => {
    const title = item.querySelector("title")?.textContent;
    if (title == null) throw new TypeError("title is null");
    const link = item.querySelector("link")?.textContent;
    if (link == null) throw new TypeError("link is null");
    return { title, link };
  });
};

const pickRecallPressReleaseFeedItems = (
  feedItems: RssFeedItem[],
): RecallPressReleaseFeedItem[] =>
  feedItems
    .map<RecallPressReleaseFeedItem | undefined>((item) => {
      if (item.title.includes("リコールの届出について")) {
        return {
          title: item.title,
          link: item.link,
          recallPressReleaseType: "spot",
        };
      } else if (item.title.includes("少数台数のリコール届出の公表について")) {
        return {
          title: item.title,
          link: item.link,
          recallPressReleaseType: "monthly",
        };
      }
    })
    .filter((x) => x != null);

export type RetrieveRecallPressReleaseFeedItems = () => Promise<
  RecallPressReleaseFeedItem[]
>;

export type RetrieveRecallPressReleaseFeedItemsDependencies =
  DownloadPressReleaseRssDependencies;

export type RetrieveRecallPressReleaseFeedItemsFactory = ServiceFactory<
  RetrieveRecallPressReleaseFeedItems,
  RetrieveRecallPressReleaseFeedItemsDependencies
>;

/** プレスリリースのRSSをダウンロードし、リコール届出に関するフィードのみを抽出します。 */
export const retrieveRecallPressReleaseFeedItems: RetrieveRecallPressReleaseFeedItemsFactory =
  (deps) => async () => {
    const rss = await downloadPressReleaseRss(deps)();
    const decodedRss = decodeShiftJIS(rss);
    const feedItems = parseRss(decodedRss);
    feedItems.reverse(); // 古い順にする
    return pickRecallPressReleaseFeedItems(feedItems);
  };
