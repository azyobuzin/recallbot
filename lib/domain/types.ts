import type { MediaToUpload } from "../infrastructures/index.ts";

export type RssFeedItem = {
  title: string;
  link: string;
};

export type RecallPressReleaseType =
  | "spot" // 100件以上のリコール
  | "monthly"; // 月1回発表される100件未満のリコール

export type RecallPressReleaseFeedItem<
  T extends RecallPressReleaseType = RecallPressReleaseType,
> = {
  recallPressReleaseType: T;
} & RssFeedItem;

export type RecallPressReleasePageHtml<
  T extends RecallPressReleaseType = RecallPressReleaseType,
> = RecallPressReleaseFeedItem<T> & {
  html: string;
};

export type RecallPressReleasePage<
  T extends RecallPressReleaseType = RecallPressReleaseType,
> = {
  recallPressReleaseType: T;
  pressReleaseUrl: string;
  title: string;
  preamble: string;
  pdfLinks: PdfLink[];
};

export type PdfLink = {
  title: string;
  href: string;
};

export type SpotRecallPressReleaseWithPdfUrl = {
  /** プレスリリースのURL */
  pressReleaseUrl: string;
  /** 車名 + 通称名 */
  carName: string;
  /** プレスリリース本文 */
  preamble: string;
  /** リコール届出一覧表 */
  recallListPdfUrl: string;
  /** 改善箇所説明図 */
  illustrationPdfUrl: string | undefined;
};

export type SpotRecallPressReleaseWithPdf = {
  /** プレスリリースのURL */
  pressReleaseUrl: string;
  /** 車名 + 通称名 */
  carName: string;
  /** プレスリリース本文 */
  preamble: string;
  /** リコール届出一覧表 */
  recallListPdf: Uint8Array;
  /** 改善箇所説明図 */
  illustrationPdf: Uint8Array | undefined;
};

export type SpotRecallListContent = {
  /** 不具合の部位（部品名） */
  component: string;
  /** 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因 */
  situation: string;
  /** リコール対象車の台数 合計 */
  numCars: number;
};

export type CompleteSpotRecallPressRelease = {
  /** プレスリリースのURL */
  pressReleaseUrl: string;
  /** 車名 + 通称名 */
  carName: string;
  /** プレスリリース本文 */
  preamble: string;
  /** 不具合の部位（部品名） */
  component: string;
  /** 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因 */
  situation: string;
  /** リコール対象車の台数 合計 */
  numCars: number;
  /** 改善箇所説明図をPNG形式にしたもの */
  illustrations: Uint8Array[];
};

export type ContentToPost = {
  status: string;
  media: MediaToUpload[];
};
