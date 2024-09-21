import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ServiceFactoryWithDefault } from "../../types.ts";

export type PostedUrlsRepository = {
  /** 指定されたURLのうち、データベースに保存されているものを返します。 */
  getStoredUrls: GetStoredUrls;
  /** ポスト済みのプレスリリースのURLを保存します。 */
  savePostedUrl: SavePostedUrl;
};

export type GetStoredUrls = (urls: string[]) => Promise<string[]>;

export type SavePostedUrl = (record: PostedUrl) => Promise<void>;

export type PostedUrlsRepositoryDependencies = {
  dynamoDbClient: DynamoDBClient;
  postedUrlsTableName: string;
};

export type PostedUrlsRepositoryFactory = ServiceFactoryWithDefault<
  PostedUrlsRepository,
  PostedUrlsRepositoryDependencies
>;

export type PostedUrl = {
  url: string;
  createdAt: number; // Unix seconds
};
