import type { DownloadResource } from "../../infrastructures/types.ts";
import type { ServiceFactory } from "../../types.ts";
import type {
  RecallPressReleaseFeedItem,
  RecallPressReleasePage,
  RecallPressReleasePageHtml,
  RecallPressReleaseType,
} from "../types.ts";

export type DownloadRecallPressReleasePage = <T extends RecallPressReleaseType>(
  feedItem: RecallPressReleaseFeedItem<T>,
) => Promise<RecallPressReleasePageHtml<T>>;

export type DownloadPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

export type DownloadPressReleasePageFactory = ServiceFactory<
  DownloadRecallPressReleasePage,
  DownloadPressReleasePageDependencies
>;

export type ParseRecallPressReleasePage = <T extends RecallPressReleaseType>(
  pageWithHtml: RecallPressReleasePageHtml<T>,
) => RecallPressReleasePage<T>;

export type RetrieveRecallPressReleasePage = <T extends RecallPressReleaseType>(
  feedItem: RecallPressReleaseFeedItem<T>,
) => Promise<RecallPressReleasePage<T>>;

export type RetrieveRecallPressReleasePageDependencies =
  DownloadPressReleasePageDependencies;

export type RetrieveRecallPressReleasePageFactory = ServiceFactory<
  RetrieveRecallPressReleasePage,
  RetrieveRecallPressReleasePageDependencies
>;
