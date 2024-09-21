import { ServiceFactoryWithDefault } from "../../types.ts";

export type TootService = {
  uploadMediaToMastodon: UploadMediaToMastodon;
  postToMastodon: PostToMastodon;
};

export type UploadMediaToMastodon = (
  media: MediaToUpload,
  description?: string,
) => Promise<MastodonMedia>;

export type PostToMastodon = (
  status: string,
  mediaIds: string[],
) => Promise<void>;

export type TootServiceDependencies = {
  mastodonBaseUrl: string | URL;
  mastodonAccessToken: string;
};

export type TootServiceFactory = ServiceFactoryWithDefault<
  TootService,
  TootServiceDependencies
>;

export type MediaToUpload = {
  bytes: Uint8Array;
  mimeType: "image/png";
};

export type MastodonMedia = {
  id: string;
};
