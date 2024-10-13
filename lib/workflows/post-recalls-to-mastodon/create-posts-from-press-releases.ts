import { Result } from "typescript-result";
import {
  AskAIToChooseTool,
  ConvertPdfToImages,
  DownloadResource,
  ExtractTablesFromPdf,
} from "../../infrastructures/index.ts";
import { retrieveRecallPressReleaseFeedItems } from "./press-release-rss.ts";
import { analyzeRecallPressReleasePage } from "./recall-press-release-page/index.ts";
import { createPostForSpotRecallPressRelease } from "./spot-recall-press-release/index.ts";
import { ContentToPost, SpotRecallPressReleasePage } from "./types.ts";

type CreatePostsFromPressReleasesDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  convertPdfToImages: ConvertPdfToImages;
  downloadResource: DownloadResource;
  extractTablesFromPdf: ExtractTablesFromPdf;
};

export const createPostsFromPressReleases =
  (deps: CreatePostsFromPressReleasesDeps) =>
  (): Promise<Result<ContentToPost, unknown>[]> =>
    Array.fromAsync(
      (async function* () {
        const feedItems = await retrieveRecallPressReleaseFeedItems(deps)();
        for (const feedItem of feedItems) {
          try {
            const page = await analyzeRecallPressReleasePage(deps)(feedItem);
            switch (page.recallPressReleaseType) {
              case "spot":
                yield Result.ok(
                  await createPostForSpotRecallPressRelease(deps)(
                    page as SpotRecallPressReleasePage,
                  ),
                );
                break;
              case "monthly":
                // TODO
                break;
            }
          } catch (e) {
            yield Result.error(e);
          }
        }
      })(),
    );
