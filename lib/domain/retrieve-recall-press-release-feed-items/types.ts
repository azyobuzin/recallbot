import { DownloadResource } from "../../infrastructures/types.ts";
import { RecallPressReleaseFeedItem, RssFeedItem } from "../types.ts";

export type DownloadPressReleaseRss = (deps: {
  downloadResource: DownloadResource;
}) => () => Promise<Uint8Array>;

export type DecodeShiftJIS = (input: Uint8Array) => string;

export type ParseRss = (rss: string) => RssFeedItem[];

export type PickRecallPressReleaseFeedItems = (
  feedItems: RssFeedItem[],
) => RecallPressReleaseFeedItem[];

export type RetrieveRecallPressReleaseFeedItems = (deps: {
  downloadResource: DownloadResource;
}) => () => Promise<RecallPressReleaseFeedItem[]>;
