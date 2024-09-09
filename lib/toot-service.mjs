import { userAgent } from "./constants.mjs";

/** @typedef {import("../types/services.ts").TootService} TootService */

export class DefaultTootService {
  /**
   * @param {string | URL} baseUrl
   * @param {string} accessToken
   */
  constructor(baseUrl, accessToken) {
    this._baseUrl = baseUrl;
    this._accessToken = accessToken;
  }

  /**
   * @param {Buffer} media
   * @param {string=} description
   */
  async uploadMedia(media, description) {
    const body = new FormData();
    body.append("file", new Blob([media], { type: "image/png" }), "image.png");
    if (description != null) {
      body.append("description", description);
    }
    const res = await (
      await this._request("api/v1/media", {
        method: "POST",
        body,
      })
    ).json();
    const mediaId = res.id;
    if (mediaId == null) {
      throw new Error("mediaId is null");
    }
    return mediaId;
  }

  /**
   * @param {string} status
   * @param {string[]} mediaIds
   */
  async postStatus(status, mediaIds) {
    const body = new FormData();
    body.append("status", status);
    body.append("visibility", "unlisted");
    body.append("language", "ja");
    for (const mediaId of mediaIds) {
      body.append("media_ids[]", mediaId);
    }
    await this._request("api/v1/statuses", {
      method: "POST",
      body,
    });
  }

  /**
   * @param {string} url
   * @param {RequestInit} options
   * @returns {Promise<Response>}
   */
  async _request(url, options) {
    const res = await fetch(new URL(url, this._baseUrl), {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this._accessToken}`,
        "User-Agent": userAgent,
      },
    });
    if (res.ok) return res;
    throw new Error(
      `Failed to request Mastodon API ${url}: ${res.status} ${res.statusText}`,
    );
  }
}

/**
 * 画像アップロードとポストの一連の流れ
 */
export class TootProcedure {
  /**
   * @param {TootService} tootService
   */
  constructor(tootService) {
    this._tootService = tootService;
    /** @type {Promise<string>[]} */
    this._mediaPromises = [];
  }

  /**
   * @param {Buffer} media
   * @param {string=} description
   */
  uploadMedia(media, description) {
    this._mediaPromises.push(this._tootService.uploadMedia(media, description));
  }

  /**
   * @param {string} status
   */
  async postStatus(status) {
    const mediaIds = await Promise.all(this._mediaPromises);
    await this._tootService.postStatus(status, mediaIds);
  }
}
