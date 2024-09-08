import { userAgent } from "./constants.mjs";

/** @typedef {import("../types/services.ts").DownloadRssService} DownloadRssService */

/** @implements {DownloadRssService} */
export class DefaultDownloadRssService {
  async downloadRss() {
    const res = await fetch("https://www.mlit.go.jp/pressrelease.rdf", {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": userAgent,
      },
    });
    const body = new TextDecoder("shift_jis").decode(await res.arrayBuffer());
    if (res.ok) {
      return body;
    } else {
      throw new Error(
        `Failed to download RSS: ${res.status} ${res.statusText}\n${body}`,
      );
    }
  }
}
