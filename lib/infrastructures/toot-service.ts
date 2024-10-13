import { userAgent } from "../constants.ts";
import { getEnv } from "../env.ts";
import type { ServiceFactoryWithDefault } from "../types.ts";

export type TootService = {
  uploadMediaToMastodon: UploadMediaToMastodon;
  postToMastodon: PostToMastodon;
};

export type UploadMediaToMastodon = (
  media: MediaToUpload,
) => Promise<MastodonMedia>;

export type PostToMastodon = (
  status: string,
  mediaIds: string[],
) => Promise<void>;

export type TootServiceDeps = {
  mastodonBaseUrl: string | URL;
  mastodonAccessToken: string;
};

type TootServiceFactory = ServiceFactoryWithDefault<
  TootService,
  TootServiceDeps
>;

export type MediaToUpload = {
  description?: string;
  bytes: Uint8Array;
  mimeType: "image/png";
};

export type MastodonMedia = {
  id: string;
};

export const tootService: TootServiceFactory = (deps) => {
  return {
    async uploadMediaToMastodon({ description, bytes, mimeType }) {
      const body = new FormData();
      body.append(
        "file",
        new Blob([bytes], { type: mimeType }),
        "image.png", // TODO: mimeTypeがpng以外に対応したら拡張子を変える
      );
      if (description != null) {
        body.append("description", description);
      }
      const res = await request("api/v1/media", {
        method: "POST",
        body,
      });
      const json = await res.json();
      const mediaId = json.id;
      if (mediaId == null) {
        throw new Error("mediaId is null");
      }
      return { id: mediaId };
    },
    async postToMastodon(status, mediaIds) {
      const body = new FormData();
      body.append("status", status);
      body.append("visibility", "unlisted");
      body.append("language", "ja");
      for (const mediaId of mediaIds) {
        body.append("media_ids[]", mediaId);
      }
      await request("api/v1/statuses", {
        method: "POST",
        body,
      });
    },
  };

  async function request(url: string, options: RequestInit): Promise<Response> {
    const res = await fetch(new URL(url, deps.mastodonBaseUrl), {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${deps.mastodonAccessToken}`,
        "User-Agent": userAgent,
      },
    });
    if (res.ok) return res;
    throw new Error(
      `Failed to request Mastodon API ${url}: ${res.status} ${res.statusText}`,
    );
  }
};

tootService.withDefaultDeps = () =>
  tootService({
    mastodonBaseUrl: getEnv("RECALLBOT_MASTODON_BASE_URL"),
    mastodonAccessToken: getEnv("RECALLBOT_MASTODON_ACCESS_TOKEN"),
  });
