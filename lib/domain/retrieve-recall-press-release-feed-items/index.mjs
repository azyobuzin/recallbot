import jsdom from "jsdom";
import { rssUrl } from "../../constants.mjs";
import { AcceptHeaderValue } from "../../infrastructures/index.mjs";

/** @type {import("./types.ts").DownloadPressReleaseRss} */
const downloadPressReleaseRss = (deps) => () =>
  deps.downloadResource(rssUrl, AcceptHeaderValue.rss);

/** @type {import("./types.ts").DecodeShiftJIS} */
const decodeShiftJIS = (input) => new TextDecoder("shift_jis").decode(input);

/** @type {import("./types.ts").ParseRss} */
const parseRss = (rss) => {
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

/** @type {import("./types.ts").PickRecallPressReleaseFeedItems} */
const pickRecallPressReleaseFeedItems = (feedItems) =>
  feedItems
    .map((item) => {
      if (item.title.includes("リコールの届出について")) {
        return /** @type {import("../types.ts").RecallPressReleaseFeedItem<"spot">} */ ({
          title: item.title,
          link: item.link,
          recallPressReleaseType: "spot",
        });
      } else if (item.title.includes("少数台数のリコール届出の公表について")) {
        return /** @type {import("../types.ts").RecallPressReleaseFeedItem<"monthly">} */ ({
          title: item.title,
          link: item.link,
          recallPressReleaseType: "monthly",
        });
      }
    })
    .filter((x) => x != null);

/** @type {import("./types.ts").RetrieveRecallPressReleaseFeedItems} */
export const retrieveRecallPressReleaseFeedItems = (deps) => async () => {
  const rss = await downloadPressReleaseRss(deps)();
  const decodedRss = decodeShiftJIS(rss);
  const feedItems = parseRss(decodedRss);
  feedItems.reverse(); // 古い順にする
  return pickRecallPressReleaseFeedItems(feedItems);
};
