import { userAgent } from "../constants.mjs";

export type DownloadResource = (
  url: string,
  acceptHeader: string,
) => Promise<Uint8Array>;

/**
 * インターネットからファイルをダウンロードします。
 */
export const downloadResource: DownloadResource = async (url, accept) => {
  const res = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": userAgent,
    },
  });
  if (res.ok) {
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
};

export const AcceptHeaderValue = {
  html: "text/html",
  rss: "application/rss+xml, application/xml, text/xml",
  pdf: "application/pdf",
};
