import {
  type AskAIToChooseTool,
  type ConvertPdfToImages,
  type DownloadResource,
  type ExtractTablesFromPdf,
  type GetStoredUrls,
  type MediaToUpload,
  type PostToMastodon,
  type ReportError,
  type SavePostedUrl,
  type UploadMediaToMastodon,
  askAIToChooseTool,
  convertPdfToImages,
  downloadResource,
  extractTablesFromPdf,
  postedUrlRepository,
  reportError,
  tootService,
} from "../../infrastructures/index.ts";
import type { ServiceFactoryWithDefault } from "../../types.ts";
import { createPostsFromPressReleases } from "./create-posts-from-press-releases.ts";
import type { ContentToPost } from "./types.ts";

type UploadMediaInParallelDeps = {
  uploadMediaToMastodon: UploadMediaToMastodon;
};

const uploadMediaInParallel =
  (deps: UploadMediaInParallelDeps) => (media: MediaToUpload[]) =>
    Promise.all(media.map((x) => deps.uploadMediaToMastodon(x)));

type PostAndSaveDeps = {
  postToMastodon: PostToMastodon;
  uploadMediaToMastodon: UploadMediaToMastodon;
  savePostedUrl: SavePostedUrl;
};

const postAndSave =
  (deps: PostAndSaveDeps) => async (contentToPost: ContentToPost) => {
    const uploadedMedia = await uploadMediaInParallel(deps)(
      contentToPost.media,
    );
    await deps.postToMastodon(
      contentToPost.status,
      uploadedMedia.map((x) => x.id),
    );
    // 投稿に成功したら、投稿済みであることを記録する
    await deps.savePostedUrl({
      url: contentToPost.pressReleaseUrl,
      createdAt: Date.now() / 1000,
    });
  };

type HandlerErrorDeps = {
  reportError: ReportError;
};

const handleError = (deps: HandlerErrorDeps) => async (error: unknown) => {
  try {
    console.error(error);
    await deps.reportError(error);
  } catch (errorInReporting) {
    console.error(errorInReporting);
  }
};

type PostRecallsToMastodon = () => Promise<void>;

type PostRecallsToMastodonDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  convertPdfToImages: ConvertPdfToImages;
  downloadResource: DownloadResource;
  extractTablesFromPdf: ExtractTablesFromPdf;
  getStoredUrls: GetStoredUrls;
  postToMastodon: PostToMastodon;
  reportError: ReportError;
  savePostedUrl: SavePostedUrl;
  uploadMediaToMastodon: UploadMediaToMastodon;
};

type PostRecallsToMastodonFactory = ServiceFactoryWithDefault<
  PostRecallsToMastodon,
  PostRecallsToMastodonDeps
>;

/** 未投稿のリコール情報を取得して、Mastodonに投稿します。 */
export const postRecallsToMastodon: PostRecallsToMastodonFactory =
  (deps: PostRecallsToMastodonDeps) => async () => {
    const posts = await createPostsFromPressReleases(deps)();
    for (const result of posts) {
      await result.mapCatching(postAndSave(deps)).getOrElse(handleError(deps));
    }
  };

postRecallsToMastodon.withDefaultDeps = () => {
  const defaultPostedUrlRepository = postedUrlRepository.withDefaultDeps();
  const defaultTootService = tootService.withDefaultDeps();
  return postRecallsToMastodon({
    askAIToChooseTool: askAIToChooseTool.withDefaultDeps(),
    convertPdfToImages: convertPdfToImages,
    downloadResource: downloadResource,
    extractTablesFromPdf: extractTablesFromPdf.withDefaultDeps(),
    getStoredUrls: defaultPostedUrlRepository.getStoredUrls,
    postToMastodon: defaultTootService.postToMastodon,
    reportError: reportError.withDefaultDeps(),
    savePostedUrl: defaultPostedUrlRepository.savePostedUrl,
    uploadMediaToMastodon: defaultTootService.uploadMediaToMastodon,
  });
};
