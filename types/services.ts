import type { PostedUrl } from "./objects.js";

export type LoadPageService = {
  readonly loadPage: (url: string) => Promise<import("jsdom").JSDOM>;
};

export type PostedUrlsRepository = {
  readonly getStoredUrls: (urls: string[]) => Promise<string[]>;
  readonly put: (record: PostedUrl) => Promise<void>;
};

export type DownloadRssService = {
  readonly downloadRss: () => Promise<string>;
};
