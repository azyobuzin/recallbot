import { describe, expect, test } from "@jest/globals";
import { parseAndFilterItems } from "../lib/recall-retrieval-service.mjs";
import { pressreleaseRdf20240908 } from "../tests/fixtures.mjs";

describe("parseAndFilterItems", () => {
  test("2024-09-08時点のRSSをparseして「リコールの届出について」のみ抽出し古い順に出力する", async () => {
    const rss = await pressreleaseRdf20240908();
    const items = parseAndFilterItems(rss);
    expect(items).toEqual([
      {
        title: "リコールの届出について（マツダ　MAZDA CX-5　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005220.html",
      },
      {
        title: "リコールの届出について（ホンダ　GB350　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005222.html",
      },
      {
        title: "リコールの届出について（ドゥカティ　パニガーレV４　他）",
        link: "http://www.mlit.go.jp/report/press/jidosha08_hh_005221.html",
      },
    ]);
  });
});
