import { userAgent } from "../../constants.mjs";

/**
 * インターネットからファイルをダウンロードします。
 * @type {import("./types.ts").DownloadResource}
 */
export const downloadResource = async (url, accept) => {
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
  Html: "text/html",
  Rss: "application/rss+xml, application/xml, text/xml",
  Pdf: "application/pdf",
};
