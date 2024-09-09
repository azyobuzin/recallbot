import type { PostedUrl, RecallDetails } from "./objects.ts";

export type ExtractRecallDetailsFromPdfService = {
  readonly extractRecallDetailsFromPdf: (
    pdfBuffer: ArrayBuffer,
  ) => Promise<RecallDetails>;
};

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

export type TootService = {
  readonly uploadMedia: (
    media: Buffer,
    description?: string,
  ) => Promise<string>;
  readonly postStatus: (status: string, mediaIds: string[]) => Promise<void>;
};
