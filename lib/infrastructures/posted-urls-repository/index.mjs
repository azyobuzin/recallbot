import {
  BatchGetItemCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { getEnv } from "../../env.mjs";

/** @type {import("./types.ts").PostedUrlsRepositoryFactory} */
export const postedUrlRepository = (deps) => ({
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
        "取得できないキーがありました。引数が多すぎた可能性があります。"
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
