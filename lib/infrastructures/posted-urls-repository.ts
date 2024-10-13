import {
  BatchGetItemCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { getEnv } from "../env.ts";
import type { ServiceFactoryWithDefault } from "../types.ts";

export type PostedUrlsRepository = {
  /** 指定されたURLのうち、データベースに保存されているものを返します。 */
  getStoredUrls: GetStoredUrls;
  /** ポスト済みのプレスリリースのURLを保存します。 */
  savePostedUrl: SavePostedUrl;
};

export type GetStoredUrls = (urls: string[]) => Promise<string[]>;

export type SavePostedUrl = (record: PostedUrl) => Promise<void>;

export type PostedUrlsRepositoryDeps = {
  dynamoDbClient: DynamoDBClient;
  postedUrlsTableName: string;
};

export type PostedUrlsRepositoryFactory = ServiceFactoryWithDefault<
  PostedUrlsRepository,
  PostedUrlsRepositoryDeps
>;

export type PostedUrl = {
  url: string;
  createdAt: number; // Unix seconds
};

export const postedUrlRepository: PostedUrlsRepositoryFactory = (deps) => ({
  async getStoredUrls(urls) {
    const command = new BatchGetItemCommand({
      RequestItems: {
        [deps.postedUrlsTableName]: {
          Keys: urls.map((url) => ({ posted_url: { S: url } })),
          ProjectionExpression: "posted_url",
        },
      },
    });
    const output = await deps.dynamoDbClient.send(command);
    const unprocessedKeys =
      output.UnprocessedKeys?.[deps.postedUrlsTableName]?.Keys;
    if (unprocessedKeys && unprocessedKeys.length > 0) {
      throw new Error(
        "取得できないキーがありました。引数が多すぎた可能性があります。",
      );
    }
    return (
      output.Responses?.[deps.postedUrlsTableName]
        ?.map((item) => item.posted_url.S)
        .filter((x) => x != null) ?? []
    );
  },
  async savePostedUrl(record) {
    const command = new PutItemCommand({
      TableName: deps.postedUrlsTableName,
      Item: {
        posted_url: { S: record.url },
        createdAt: { N: record.createdAt.toString() },
      },
    });
    await deps.dynamoDbClient.send(command);
  },
});

postedUrlRepository.withDefaultDeps = () =>
  postedUrlRepository({
    dynamoDbClient: new DynamoDBClient(),
    postedUrlsTableName: getEnv("RECALLBOT_POSTED_URLS_TABLE_NAME"),
  });
