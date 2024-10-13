import jsdom from "jsdom";
import { decodeUtf8 } from "../../../decode.ts";
import {
  AcceptHeaderValue,
  DownloadResource,
} from "../../../infrastructures/index.ts";
import type {
  RecallPressReleaseFeedItem,
  RecallPressReleasePage,
  RecallPressReleasePageHtml,
} from "../types.ts";
import { extractPdfLinks, extractPreamble } from "./utils.ts";

type DownloadPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

/** フィードに添付されたURLのページをダウンロードします。 */
const downloadRecallPressReleasePage =
  (deps: DownloadPressReleasePageDependencies) =>
  async (
    feedItem: RecallPressReleaseFeedItem,
  ): Promise<RecallPressReleasePageHtml> => {
    const buf = await deps.downloadResource(
      feedItem.link,
      AcceptHeaderValue.html,
    );
    return {
      ...feedItem,
      html: decodeUtf8(buf),
    };
  };

const parseRecallPressReleasePage = (
  pageWithHtml: RecallPressReleasePageHtml,
): RecallPressReleasePage => {
  const dom = new jsdom.JSDOM(pageWithHtml.html, {
    url: pageWithHtml.link,
    contentType: "text/html",
  });
  return {
    recallPressReleaseType: pageWithHtml.recallPressReleaseType,
    pressReleaseUrl: pageWithHtml.link,
    title: pageWithHtml.title,
    preamble: extractPreamble(dom),
    pdfLinks: extractPdfLinks(dom),
  };
};

type RetrieveRecallPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

/** プレスリリースのページを解析し、本文と添付されたPDFへのリンクを取得します。 */
export const analyzeRecallPressReleasePage =
  (deps: RetrieveRecallPressReleasePageDependencies) =>
  async (feedItem: RecallPressReleaseFeedItem) => {
    const pageWithHtml = await downloadRecallPressReleasePage(deps)(feedItem);
    return parseRecallPressReleasePage(pageWithHtml);
  };
