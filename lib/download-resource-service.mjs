import { userAgent } from "./constants.mjs";

/** @typedef {import("../types/services.ts").DownloadResourceService} DownloadResourceService */

/**
 * fetchをラップして、インターネットからファイルをダウンロードします。
 * @implements {DownloadResourceService}
 */
export class DefaultDownloadResourceService {
  /**
   * @param {string} url
   * @param {string} accept
   * @returns {Promise<ArrayBuffer>}
   */
  async downloadResource(url, accept) {
    const res = await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": userAgent,
      },
    });
    if (res.ok) {
      return await res.arrayBuffer();
    }
    throw new Error(
      `Failed to download ${url}: ${res.status} ${res.statusText}`,
    );
  }
}
