import { describe, expect, jest, test } from "@jest/globals";
import { postedUrlRepository } from "./index.mjs";

const mockDynamoDbClient = {
  /** @type {jest.Mock<(command: unknown) => Promise<unknown>>} */
  send: jest.fn(),
};

const tableName = "table_name";

/** @type {import("./types.ts").PostedUrlsRepositoryDependencies} */
const deps = {
  // @ts-expect-error
  dynamoDbClient: mockDynamoDbClient,
  postedUrlsTableName: tableName,
};

describe("getStoredUrls", () => {
  test("正しくリクエストを作成できていること", async () => {
    mockDynamoDbClient.send.mockResolvedValue({
      Responses: {
        [tableName]: [{ posted_url: { S: "url1" } }],
      },
    });

    const { getStoredUrls } = postedUrlRepository(deps);

    // モックレスポンスを読み取れていることを確認
    await expect(getStoredUrls(["url1", "url2"])).resolves.toEqual(["url1"]);

    expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1);

    /** @type {import("@aws-sdk/client-dynamodb").BatchGetItemCommandInput} */
    // @ts-expect-error
    const input = mockDynamoDbClient.send.mock.lastCall[0].input;

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    expect(input).toEqual({
      RequestItems: {
        [tableName]: {
          Keys: [{ posted_url: { S: "url1" } }, { posted_url: { S: "url2" } }],
          ProjectionExpression: "posted_url",
        },
      },
    });
  });

  test("UnprocessedKeysがある場合、Errorをthrowすること", async () => {
    mockDynamoDbClient.send.mockResolvedValue({
      Responses: {
        [tableName]: [{ posted_url: { S: "url1" } }],
      },
      UnprocessedKeys: {
        [tableName]: {
          Keys: [{ posted_url: { S: "url2" } }],
        },
      },
    });

    const { getStoredUrls } = postedUrlRepository(deps);

    await expect(getStoredUrls(["url1", "url2"])).rejects.toThrow();
  });
});

describe("savePostedUrl", () => {
  test("正しくリクエストを作成できていること", async () => {
    const { savePostedUrl } = postedUrlRepository(deps);

    await savePostedUrl({
      url: "url1",
      createdAt: 1725807298,
    });

    expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1);

    /** @type {import("@aws-sdk/client-dynamodb").PutItemCommandInput} */
    // @ts-ignore
    const input = mockDynamoDbClient.send.mock.lastCall[0].input;

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    expect(input).toEqual({
      TableName: tableName,
      Item: {
        posted_url: { S: "url1" },
        createdAt: { N: "1725807298" },
      },
    });
  });
});
