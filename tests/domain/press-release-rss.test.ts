import { test, type TestContext } from "node:test";
import { retrieveRecallPressReleaseFeedItems } from "../../lib/domain/press-release-rss/index.mjs";
import { pressreleaseRdf20240908Binary } from "../fixtures.mjs";

test("2024-09-08時点のRSSをparseして「リコールの届出について」のみを古い順に出力すること", async (t: TestContext) => {
  const fn = retrieveRecallPressReleaseFeedItems({
    downloadResource: pressreleaseRdf20240908Binary,
  });
  const actual = await fn();
  t.assert.deepStrictEqual(actual, [
    {
      title: "リコールの届出について（マツダ　MAZDA CX-5　他）",
      link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005220.html",
      recallPressReleaseType: "spot",
    },
    {
      title: "リコールの届出について（ホンダ　GB350　他）",
      link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005222.html",
      recallPressReleaseType: "spot",
    },
    {
      title: "リコールの届出について（ドゥカティ　パニガーレV４　他）",
      link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005221.html",
      recallPressReleaseType: "spot",
    },
  ]);
});

// TODO: monthlyのケースのテスト
