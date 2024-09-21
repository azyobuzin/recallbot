import jsdom from "jsdom";
import { decodeUtf8 } from "../../decode.mjs";
import { AcceptHeaderValue } from "../../infrastructures/index.mjs";
import { extractPdfLinks, extractPreamble } from "./utils.mjs";

/** @type {import("./types.ts").DownloadPressReleasePageFactory} */
const downloadRecallPressReleasePage = (deps) => async (feedItem) => {
  const buf = await deps.downloadResource(
    feedItem.link,
    AcceptHeaderValue.html,
  );
  return {
    ...feedItem,
    html: decodeUtf8(buf),
  };
};

/** @type {import("./types.ts").ParseRecallPressReleasePage} */
const parseRecallPressReleasePage = (pageWithHtml) => {
  const dom = new jsdom.JSDOM(pageWithHtml.html, {
    url: pageWithHtml.link,
    contentType: "text/html",
  });
  return {
    recallPressReleaseType: pageWithHtml.recallPressReleaseType,
    title: pageWithHtml.title,
    preamble: extractPreamble(dom),
    pdfLinks: extractPdfLinks(dom),
  };
};

/** @type {import("./types.ts").RetrieveRecallPressReleasePageFactory} */
export const retrieveRecallPressReleasePage = (deps) => async (feedItem) => {
  const pageWithHtml = await downloadRecallPressReleasePage(deps)(feedItem);
  return parseRecallPressReleasePage(pageWithHtml);
};
