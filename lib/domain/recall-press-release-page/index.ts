import jsdom from "jsdom";
import { decodeUtf8 } from "../../decode.ts";
import {
  AcceptHeaderValue,
  DownloadResource,
} from "../../infrastructures/index.ts";
import type { ServiceFactory } from "../../types.ts";
import type {
  RecallPressReleaseFeedItem,
  RecallPressReleasePage,
  RecallPressReleasePageHtml,
  RecallPressReleaseType,
} from "../types.ts";
import { extractPdfLinks, extractPreamble } from "./utils.ts";

type DownloadPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

/** フィードに添付されたURLのページをダウンロードします。 */
const downloadRecallPressReleasePage =
  (deps: DownloadPressReleasePageDependencies) =>
  async <T extends RecallPressReleaseType>(
    feedItem: RecallPressReleaseFeedItem<T>,
  ): Promise<RecallPressReleasePageHtml<T>> => {
    const buf = await deps.downloadResource(
      feedItem.link,
      AcceptHeaderValue.html,
    );
    return {
      ...feedItem,
      html: decodeUtf8(buf),
    };
  };

const parseRecallPressReleasePage = <T extends RecallPressReleaseType>(
  pageWithHtml: RecallPressReleasePageHtml<T>,
): RecallPressReleasePage<T> => {
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

export type RetrieveRecallPressReleasePage = <T extends RecallPressReleaseType>(
  feedItem: RecallPressReleaseFeedItem<T>,
) => Promise<RecallPressReleasePage<T>>;

export type RetrieveRecallPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

export type RetrieveRecallPressReleasePageFactory = ServiceFactory<
  RetrieveRecallPressReleasePage,
  RetrieveRecallPressReleasePageDependencies
>;

/** プレスリリースのページを解析し、本文と添付されたPDFへのリンクを取得します。 */
export const analyzeRecallPressReleasePage: RetrieveRecallPressReleasePageFactory =
  (deps) => async (feedItem) => {
    const pageWithHtml = await downloadRecallPressReleasePage(deps)(feedItem);
    return parseRecallPressReleasePage(pageWithHtml);
  };
