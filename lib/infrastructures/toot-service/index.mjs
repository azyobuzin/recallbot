import { userAgent } from "../../constants.mjs";
import { getEnv } from "../../env.mjs";

/** @type {import("./types.ts").TootServiceFactory} */
export const tootService = (deps) => {
  return {
    async uploadMediaToMastodon(media, description) {
      const body = new FormData();
      body.append(
        "file",
        new Blob([media.bytes], { type: media.mimeType }),
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

  /**
   * @param {string} url
   * @param {RequestInit} options
   * @returns {Promise<Response>}
   */
  async function request(url, options) {
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
