import type { PostedUrl } from "./objects.js";

export type DownloadResourceService = {
  readonly downloadResource: (
    url: string,
    accept: string,
  ) => Promise<ArrayBuffer>;
};

export type LoadPageService = {
  readonly loadPage: (url: string) => Promise<import("jsdom").JSDOM>;
};

export type PdfToImagesService = {
  readonly convertPdfToImages: (pdfBuffer: ArrayBuffer) => Promise<Buffer[]>;
};

export type PostedUrlsRepository = {
  readonly getStoredUrls: (urls: string[]) => Promise<string[]>;
  readonly put: (record: PostedUrl) => Promise<void>;
};
