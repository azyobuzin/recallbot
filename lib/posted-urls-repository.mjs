import { BatchGetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

/** @typedef {import("../types/services.ts").PostedUrlsRepository} PostedUrlsRepository */

/** @implements {PostedUrlsRepository} */
export class DefaultPostedUrlsRepository {
  /**
   * @param {import("@aws-sdk/client-dynamodb").DynamoDBClient} client
   * @param {string} tableName
   */
  constructor(client, tableName) {
    this._client = client;
    this._tableName = tableName;
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
          Keys: urls.map((url) => ({ url: { S: url } })),
          ProjectionExpression: "url",
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
    return output.Responses?.[this._tableName]?.map((item) => item.url.S).filter(x => x != null) ?? [];
  }

  /**
   * @param {import("../types/objects.ts").PostedUrl} record
   * @returns {Promise<void>}
   */
  async put(record) {
    const command = new PutItemCommand({
      TableName: this._tableName,
      Item: {
        url: { S: record.url },
        createdAt: { N: record.createdAt.toString() },
      },
    });
    await this._client.send(command);
  }
}
