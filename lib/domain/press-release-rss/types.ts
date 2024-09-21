import type { DownloadResource } from "../../infrastructures/types.ts";
import type { ServiceFactory } from "../../types.ts";
import type { RecallPressReleaseFeedItem, RssFeedItem } from "../types.ts";

export type DownloadPressReleaseRss = () => Promise<Uint8Array>;

export type DownloadPressReleaseRssDependencies = {
  downloadResource: DownloadResource;
};

export type DownloadPressReleaseRssFactory = ServiceFactory<
  DownloadPressReleaseRss,
  DownloadPressReleaseRssDependencies
>;

export type DecodeShiftJIS = (input: Uint8Array) => string;

export type ParseRss = (rss: string) => RssFeedItem[];

export type PickRecallPressReleaseFeedItems = (
  feedItems: RssFeedItem[],
) => RecallPressReleaseFeedItem[];

export type RetrieveRecallPressReleaseFeedItems = () => Promise<
  RecallPressReleaseFeedItem[]
>;

export type RetrieveRecallPressReleaseFeedItemsDependencies =
  DownloadPressReleaseRssDependencies;

export type RetrieveRecallPressReleaseFeedItemsFactory = ServiceFactory<
  RetrieveRecallPressReleaseFeedItems,
  DownloadPressReleaseRssDependencies
>;
