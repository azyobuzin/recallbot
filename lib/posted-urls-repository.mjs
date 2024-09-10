import {
  BatchGetItemCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { defaultPostedUrlsTableName } from "./constants.mjs";

/** @typedef {import("../types/services.ts").PostedUrlsRepository} PostedUrlsRepository */

/**
 * ポスト済みのプレスリリースのURLを取得・保存します。
 * @implements {PostedUrlsRepository}
 */
export class DefaultPostedUrlsRepository {
  /**
   * @param {import("@aws-sdk/client-dynamodb").DynamoDBClient} client
   * @param {string} tableName
   */
  constructor(client, tableName) {
    this._client = client;
    this._tableName = tableName;
  }

  static createDefault() {
    const tableName =
      process.env.RECALLBOT_POSTED_URLS_TABLE_NAME ||
      defaultPostedUrlsTableName;
    return new DefaultPostedUrlsRepository(new DynamoDBClient(), tableName);
  }

  /**
   * 指定されたURLのうち、DynamoDBに保存されているものを返します。
   * @param {string[]} urls
   * @returns {Promise<string[]>}
   */
  async getStoredUrls(urls) {
    const command = new BatchGetItemCommand({
      RequestItems: {
        [this._tableName]: {
          Keys: urls.map((url) => ({ posted_url: { S: url } })),
          ProjectionExpression: "posted_url",
        },
      },
    });
    const output = await this._client.send(command);
    const unprocessedKeys = output.UnprocessedKeys?.[this._tableName]?.Keys;
    if (unprocessedKeys && unprocessedKeys.length > 0) {
      throw new Error(
        "取得できないキーがありました。引数が多すぎた可能性があります。",
      );
    }
    return (
      output.Responses?.[this._tableName]
        ?.map((item) => item.posted_url.S)
        .filter((x) => x != null) ?? []
    );
  }

  /**
   * @param {import("../types/objects.ts").PostedUrl} record
   * @returns {Promise<void>}
   */
  async put(record) {
    const command = new PutItemCommand({
      TableName: this._tableName,
      Item: {
        posted_url: { S: record.url },
        createdAt: { N: record.createdAt.toString() },
      },
    });
    await this._client.send(command);
  }
}
