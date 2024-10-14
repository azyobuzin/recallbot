import { Result } from "typescript-result";
import type {
  AskAIToChooseTool,
  ConvertPdfToImages,
  DownloadResource,
  ExtractTablesFromPdf,
  GetStoredUrls,
} from "../../infrastructures/index.ts";
import { retrieveRecallPressReleaseFeedItems } from "./press-release-rss.ts";
import { analyzeRecallPressReleasePage } from "./recall-press-release-page/index.ts";
import { createPostForSpotRecallPressRelease } from "./spot-recall-press-release/index.ts";
import type {
  ContentToPost,
  RecallPressReleaseFeedItem,
  SpotRecallPressReleasePage,
} from "./types.ts";

type FilterPostedRecallsDeps = {
  getStoredUrls: GetStoredUrls;
};

const filterPostedRecalls =
  (deps: FilterPostedRecallsDeps) =>
  async (
    feedItems: RecallPressReleaseFeedItem[],
  ): Promise<RecallPressReleaseFeedItem[]> => {
    const postedUrls = await deps.getStoredUrls(feedItems.map((x) => x.link));
    return feedItems.filter((x) => !postedUrls.includes(x.link));
  };

type CreatePostsFromPressReleasesDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  convertPdfToImages: ConvertPdfToImages;
  downloadResource: DownloadResource;
  extractTablesFromPdf: ExtractTablesFromPdf;
  getStoredUrls: GetStoredUrls;
};

export const createPostsFromPressReleases =
  (deps: CreatePostsFromPressReleasesDeps) =>
  async (): Promise<Result<ContentToPost, unknown>[]> => {
    const results = []; // Array.fromAsyncはNode 22から
    const feedItems = await retrieveRecallPressReleaseFeedItems(deps)();
    const filteredFeedItems = await filterPostedRecalls(deps)(feedItems);
    for (const feedItem of filteredFeedItems) {
      try {
        const page = await analyzeRecallPressReleasePage(deps)(feedItem);
        switch (page.recallPressReleaseType) {
          case "spot":
            results.push(
              Result.ok(
                await createPostForSpotRecallPressRelease(deps)(
                  page as SpotRecallPressReleasePage,
                ),
              ),
            );
            break;
          case "monthly":
            // TODO
            break;
        }
      } catch (e) {
        results.push(Result.error(e));
      }
    }
    return results;
  };
