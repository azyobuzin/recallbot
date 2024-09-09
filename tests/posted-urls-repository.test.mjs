import { describe, expect, jest, test } from "@jest/globals";
import { defaultPostedUrlsTableName } from "../lib/constants.mjs";
import { DefaultPostedUrlsRepository } from "../lib/posted-urls-repository.mjs";

const mockDynamoDbClient = {
  /** @type {jest.Mock<(command: unknown) => Promise<unknown>>} */
  send: jest.fn(),
};

describe("DefaultPostedUrlsRepository.getStoredUrls", () => {
  test("正しくリクエストを作成できていること", async () => {
    mockDynamoDbClient.send.mockResolvedValue({
      Responses: {
        [defaultPostedUrlsTableName]: [{ posted_url: { S: "url1" } }],
      },
    });

    const repository = new DefaultPostedUrlsRepository(
      // @ts-expect-error
      mockDynamoDbClient,
      defaultPostedUrlsTableName,
    );

    // モックレスポンスを読み取れていることを確認
    await expect(repository.getStoredUrls(["url1", "url2"])).resolves.toEqual([
      "url1",
    ]);

    expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1);

    /** @type {import("@aws-sdk/client-dynamodb").BatchGetItemCommandInput} */
    // @ts-ignore
    const input = mockDynamoDbClient.send.mock.lastCall[0].input;

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    expect(input).toEqual({
      RequestItems: {
        [defaultPostedUrlsTableName]: {
          Keys: [{ posted_url: { S: "url1" } }, { posted_url: { S: "url2" } }],
          ProjectionExpression: "posted_url",
        },
      },
    });
  });

  test("UnprocessedKeysがある場合、Errorをthrowすること", async () => {
    mockDynamoDbClient.send.mockResolvedValue({
      Responses: {
        [defaultPostedUrlsTableName]: [{ posted_url: { S: "url1" } }],
      },
      UnprocessedKeys: {
        [defaultPostedUrlsTableName]: {
          Keys: [{ posted_url: { S: "url2" } }],
        },
      },
    });

    const repository = new DefaultPostedUrlsRepository(
      // @ts-expect-error
      mockDynamoDbClient,
      defaultPostedUrlsTableName,
    );

    await expect(repository.getStoredUrls(["url1", "url2"])).rejects.toThrow();
  });
});

describe("DefaultPostedUrlsRepository.put", () => {
  test("正しくリクエストを作成できていること", async () => {
    const repository = new DefaultPostedUrlsRepository(
      // @ts-expect-error
      mockDynamoDbClient,
      defaultPostedUrlsTableName,
    );

    await repository.put({
      url: "url1",
      createdAt: 1725807298,
    });

    expect(mockDynamoDbClient.send).toHaveBeenCalledTimes(1);

    /** @type {import("@aws-sdk/client-dynamodb").PutItemCommandInput} */
    // @ts-ignore
    const input = mockDynamoDbClient.send.mock.lastCall[0].input;

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    expect(input).toEqual({
      TableName: defaultPostedUrlsTableName,
      Item: {
        posted_url: { S: "url1" },
        createdAt: { N: "1725807298" },
      },
    });
  });
});
