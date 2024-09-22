import type { DownloadResource } from "../../infrastructures/index.ts";
import type { ServiceFactory } from "../../types.ts";
import type {
  RecallPressReleaseFeedItem,
  RecallPressReleasePage,
  RecallPressReleaseType,
} from "../types.ts";

export type RetrieveRecallPressReleasePage = <T extends RecallPressReleaseType>(
  feedItem: RecallPressReleaseFeedItem<T>,
) => Promise<RecallPressReleasePage<T>>;

export type RetrieveRecallPressReleasePageDependencies = {
  downloadResource: DownloadResource;
};

export type RetrieveRecallPressReleasePageFactory = ServiceFactory<
  RetrieveRecallPressReleasePage,
  RetrieveRecallPressReleasePageDependencies
>;
