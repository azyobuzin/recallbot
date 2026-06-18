import { afterEach, mock, type TestContext, test } from "node:test";
import { tootService } from "./toot-service.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("uploadMediaToMastodonでmedia idを取得できること", async (t: TestContext) => {
  globalThis.fetch = mock.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(JSON.stringify({ id: "media-id" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ),
  );

  const service = tootService({
    mastodonBaseUrl: "https://example.com/",
    mastodonAccessToken: "token",
  });

  const actual = await service.uploadMediaToMastodon({
    bytes: new Uint8Array([1, 2, 3]),
    mimeType: "image/png",
  });

  t.assert.deepStrictEqual(actual, { id: "media-id" });
});

test("postToMastodonで400エラー本文を含めてthrowすること", async (t: TestContext) => {
  globalThis.fetch = mock.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(JSON.stringify({ error: "Validation failed" }), {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ),
  );

  const service = tootService({
    mastodonBaseUrl: "https://example.com/",
    mastodonAccessToken: "token",
  });

  await t.assert.rejects(() => service.postToMastodon("hello", ["media-id"]), {
    message:
      'Failed to request Mastodon API api/v1/statuses: 400 Bad Request; response body: {"error":"Validation failed"}',
  });
});

test("レスポンス本文が空でもエラーに含めること", async (t: TestContext) => {
  globalThis.fetch = mock.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(null, {
        status: 400,
        statusText: "Bad Request",
      }),
    ),
  );

  const service = tootService({
    mastodonBaseUrl: "https://example.com/",
    mastodonAccessToken: "token",
  });

  await t.assert.rejects(() => service.postToMastodon("hello", []), {
    message:
      "Failed to request Mastodon API api/v1/statuses: 400 Bad Request; response body: (empty)",
  });
});
