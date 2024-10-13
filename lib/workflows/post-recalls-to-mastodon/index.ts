import {
  askAIToChooseTool,
  AskAIToChooseTool,
  convertPdfToImages,
  ConvertPdfToImages,
  downloadResource,
  DownloadResource,
  extractTablesFromPdf,
  ExtractTablesFromPdf,
  MediaToUpload,
  postedUrlRepository,
  PostToMastodon,
  reportError,
  ReportError,
  SavePostedUrl,
  tootService,
  UploadMediaToMastodon,
} from "../../infrastructures/index.ts";
import { ServiceFactoryWithDefault } from "../../types.ts";
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

type PostRecallsToMastodon = () => Promise<void>;

type PostRecallsToMastodonDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  convertPdfToImages: ConvertPdfToImages;
  downloadResource: DownloadResource;
  extractTablesFromPdf: ExtractTablesFromPdf;
  postToMastodon: PostToMastodon;
  reportError: ReportError;
  savePostedUrl: SavePostedUrl;
  uploadMediaToMastodon: UploadMediaToMastodon;
};

type PostRecallsToMastodonFactory = ServiceFactoryWithDefault<
  PostRecallsToMastodon,
  PostRecallsToMastodonDeps
>;

export const postRecallsToMastodon: PostRecallsToMastodonFactory =
  (deps: PostRecallsToMastodonDeps) => async () => {
    const posts = await createPostsFromPressReleases(deps)();
    for (const result of posts) {
      await result
        .mapCatching(postAndSave(deps))
        .getOrElse((error) => deps.reportError(error));
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
    postToMastodon: defaultTootService.postToMastodon,
    reportError: reportError.withDefaultDeps(),
    savePostedUrl: defaultPostedUrlRepository.savePostedUrl,
    uploadMediaToMastodon: defaultTootService.uploadMediaToMastodon,
  });
};
