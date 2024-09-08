import type { PostedUrl } from "./objects.js";

export type DomLoader = {
  readonly loadUrl: (url: string) => Promise<import("jsdom").JSDOM>;
};

export type PostedUrlsRepository = {
  readonly getStoredUrls: (urls: string[]) => Promise<string[]>;
  readonly put: (record: PostedUrl) => Promise<void>;
};

export type RssDownloader = {
  readonly downloadRss: () => Promise<string>;
};
