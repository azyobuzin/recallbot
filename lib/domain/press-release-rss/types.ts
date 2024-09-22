import type { DownloadResource } from "../../infrastructures/index.ts";
import type { ServiceFactory } from "../../types.ts";
import type { RecallPressReleaseFeedItem } from "../types.ts";

export type RetrieveRecallPressReleaseFeedItems = () => Promise<
  RecallPressReleaseFeedItem[]
>;

export type RetrieveRecallPressReleaseFeedItemsDependencies = {
  downloadResource: DownloadResource;
};

export type RetrieveRecallPressReleaseFeedItemsFactory = ServiceFactory<
  RetrieveRecallPressReleaseFeedItems,
  RetrieveRecallPressReleaseFeedItemsDependencies
>;
