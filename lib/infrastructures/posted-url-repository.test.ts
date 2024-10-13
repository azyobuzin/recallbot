import { afterEach, describe, mock, test, type TestContext } from "node:test";
import {
  postedUrlRepository,
  type PostedUrlsRepositoryDependencies,
} from "./posted-urls-repository.ts";
import type {
  BatchGetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

const mockDynamoDbClient = {
  send: mock.fn<(command: unknown) => Promise<unknown>>(),
};

const tableName = "table_name";

const deps: PostedUrlsRepositoryDependencies = {
  // @ts-expect-error
  dynamoDbClient: mockDynamoDbClient,
  postedUrlsTableName: tableName,
};

afterEach(() => mockDynamoDbClient.send.mock.resetCalls());

describe("getStoredUrls", () => {
  test("正しくリクエストを作成できていること", async (t: TestContext) => {
    mockDynamoDbClient.send.mock.mockImplementation(() =>
      Promise.resolve({
        Responses: {
          [tableName]: [{ posted_url: { S: "url1" } }],
        },
      }),
    );

    const { getStoredUrls } = postedUrlRepository(deps);

    // モックレスポンスを読み取れていることを確認
    t.assert.deepStrictEqual(await getStoredUrls(["url1", "url2"]), ["url1"]);

    t.assert.strictEqual(mockDynamoDbClient.send.mock.callCount(), 1);

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    const input = (
      mockDynamoDbClient.send.mock.calls[0].arguments[0] as BatchGetItemCommand
    ).input;
    t.assert.deepStrictEqual(input, {
      RequestItems: {
        [tableName]: {
          Keys: [{ posted_url: { S: "url1" } }, { posted_url: { S: "url2" } }],
          ProjectionExpression: "posted_url",
        },
      },
    });
  });

  test("UnprocessedKeysがある場合、Errorをthrowすること", async (t: TestContext) => {
    mockDynamoDbClient.send.mock.mockImplementation(() =>
      Promise.resolve({
        Responses: {
          [tableName]: [{ posted_url: { S: "url1" } }],
        },
        UnprocessedKeys: {
          [tableName]: {
            Keys: [{ posted_url: { S: "url2" } }],
          },
        },
      }),
    );

    const { getStoredUrls } = postedUrlRepository(deps);

    await t.assert.rejects(() => getStoredUrls(["url1", "url2"]));
  });
});

describe("savePostedUrl", () => {
  test("正しくリクエストを作成できていること", async (t: TestContext) => {
    const { savePostedUrl } = postedUrlRepository(deps);

    await savePostedUrl({
      url: "url1",
      createdAt: 1725807298,
    });

    t.assert.strictEqual(mockDynamoDbClient.send.mock.callCount(), 1);

    // 入力引数を加工して正しくリクエストを送信できていることを確認
    const input = (
      mockDynamoDbClient.send.mock.calls[0].arguments[0] as PutItemCommand
    ).input;
    t.assert.deepStrictEqual(input, {
      TableName: tableName,
      Item: {
        posted_url: { S: "url1" },
        createdAt: { N: "1725807298" },
      },
    });
  });
});
