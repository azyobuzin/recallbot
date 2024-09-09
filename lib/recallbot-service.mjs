import jsdom from "jsdom";
import { acceptHtml, acceptPdf, acceptRss, rssUrl } from "./constants.mjs";
import {
  extractCarNameFromTitle,
  extractPdfLinksFromPressReleasePage,
  extractPreambleFromPressReleasePage,
  parseRssAndFilterRecalls,
} from "./logics.mjs";
import { TootProcedure } from "./toot-service.mjs";

/** @typedef {import("../types/services.ts").RecallbotService} RecallbotService */

/**
 * @typedef DefaultRecallbotServiceDependencies
 * @property {import("../types/services.ts").DownloadResourceService} downloadResourceService
 * @property {import("../types/services.ts").PostedUrlsRepository} postedUrlsRepository
 * @property {import("../types/services.ts").ExtractRecallDetailsFromPdfService} extractRecallDetailsFromPdfService
 * @property {import("../types/services.ts").PdfToImagesService} pdfToImagesService
 * @property {import("../types/services.ts").TootService} tootService
 */

/**
 * リコール情報の取得からポストまでの一連の流れを実行します。
 * @implements {RecallbotService}
 */
export class DefaultRecallbotService {
  /** @param {Readonly<DefaultRecallbotServiceDependencies>} deps  */
  constructor(deps) {
    this._deps = deps;
  }

  async execute() {
    for (const feedItem of await this._getTargetFeedItems()) {
      try {
        await this._post(feedItem);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async _getTargetFeedItems() {
    // RSSを取得
    const rssBuf = await this._deps.downloadResourceService.downloadResource(
      rssUrl,
      acceptRss,
    );
    const rss = new TextDecoder("shift_jis").decode(rssBuf);
    let feedItems = parseRssAndFilterRecalls(rss);

    // すでにポスト済みのものを除外
    const postedUrls = await this._deps.postedUrlsRepository.getStoredUrls(
      feedItems.map((x) => x.link),
    );
    return feedItems.filter((x) => !postedUrls.includes(x.link));
  }

  /** @param {import("../types/objects.ts").FeedItem} feedItem */
  async _post(feedItem) {
    console.log(`Post: ${feedItem.title}`);

    const carName = extractCarNameFromTitle(feedItem.title);

    // ページ以外のリソースを読み込まないように、HTMLだけをダウンロードしてJSDOMに渡す
    const html = new TextDecoder("utf8").decode(
      await this._deps.downloadResourceService.downloadResource(
        feedItem.link,
        acceptHtml,
      ),
    );
    const dom = new jsdom.JSDOM(html, {
      url: feedItem.link,
      contentType: "text/html",
    });

    const preamble = extractPreambleFromPressReleasePage(dom);
    const pdfLinks = extractPdfLinksFromPressReleasePage(dom);

    const recallListPdfUrl = pdfLinks.find(
      (x) => x.title === "リコール届出一覧表",
    )?.href;
    if (!recallListPdfUrl) {
      throw new Error("リコール届出一覧表が見つかりませんでした。");
    }

    const recallListPdfBuf =
      await this._deps.downloadResourceService.downloadResource(
        recallListPdfUrl,
        acceptPdf,
      );
    const recallDetails =
      await this._deps.extractRecallDetailsFromPdfService.extractRecallDetailsFromPdf(
        recallListPdfBuf,
      );

    const status = `${carName}
${preamble}

不具合の部位: ${recallDetails.component}
${recallDetails.situation}

リコール対象車の台数: ${recallDetails.numCars}台

${feedItem.link}`;

    const tootPrecedure = new TootProcedure(this._deps.tootService);
    const illustrationPdfUrl = pdfLinks.find(
      (x) => x.title === "改善箇所説明図",
    )?.href;

    // 改善箇所説明図があるならば画像をアップロード
    if (illustrationPdfUrl) {
      const illustrationPdfBuf =
        await this._deps.downloadResourceService.downloadResource(
          illustrationPdfUrl,
          acceptPdf,
        );
      const images =
        await this._deps.pdfToImagesService.convertPdfToImages(
          illustrationPdfBuf,
        );
      for (const img of images) tootPrecedure.uploadMedia(img);
    }

    await tootPrecedure.postStatus(status);

    // ポスト済みのURLを保存
    await this._deps.postedUrlsRepository.put({
      url: feedItem.link,
      createdAt: Date.now() / 1000,
    });
  }
}
