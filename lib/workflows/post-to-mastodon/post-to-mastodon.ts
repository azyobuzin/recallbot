import {
  AskAIToChooseTool,
  ConvertPdfToImages,
  DownloadResource,
  ExtractTablesFromPdf,
  MediaToUpload,
  PostToMastodon,
  ReportError,
  SavePostedUrl,
  UploadMediaToMastodon,
} from "../../infrastructures/index.ts";
import { createPostsFromPressReleases } from "./create-posts-from-press-releases.ts";
import { ContentToPost } from "./types.ts";

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

type PostToMastodonDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  convertPdfToImages: ConvertPdfToImages;
  downloadResource: DownloadResource;
  extractTablesFromPdf: ExtractTablesFromPdf;
  postToMastodon: PostToMastodon;
  reportError: ReportError;
  savePostedUrl: SavePostedUrl;
  uploadMediaToMastodon: UploadMediaToMastodon;
};

export const postToMastodon = (deps: PostToMastodonDeps) => async () => {
  const posts = await createPostsFromPressReleases(deps)();
  for (const result of posts) {
    await result
      .mapCatching(postAndSave(deps))
      .getOrElse((error) => deps.reportError(error));
  }
};