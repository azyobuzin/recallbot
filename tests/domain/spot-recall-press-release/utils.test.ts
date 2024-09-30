import { describe, test, type TestContext } from "node:test";
import {
  extractCarNameFromTitle,
  parseAssistantResult,
} from "../../../lib/domain/spot-recall-press-release/utils.ts";

describe("extractCarNameFromTitle", () => {
  test("正しく抽出できること", (t: TestContext) => {
    t.assert.strictEqual(
      extractCarNameFromTitle("リコールの届出について（いすゞ　ギガ　他）"),
      "いすゞ　ギガ　他",
    );
  });

  test("想定外のタイトルの場合、Errorをthrowすること", (t: TestContext) => {
    t.assert.throws(() =>
      extractCarNameFromTitle(
        "スマートインターチェンジの高速道路会社への事業許可および準備段階調査着手について",
      ),
    );
  });
});

describe("parseAssistantResult", () => {
  test("numCarsが整数でなくても処理できること", (t: TestContext) => {
    const actual = parseAssistantResult({
      name: "OutputResult",
      // 実際にBedrockから返ってきた例
      input: {
        component: "センターディスプレイ",
        situation:
          "センターディスプレイ（１０．２５インチタイプ）において、画面表示を補正するプログラムが不適切なため、テレビへの画面切り替えやテレビからナビ等の別画面への切り替え操作をした際、映像信号が乱れて補正できないことがある。そのため、乱れた映像信号により、画面に縞模様が表示され、カメラの映像を表示できないおそれがある。",
        numCars: "9,972台",
      },
    });
    t.assert.deepStrictEqual(actual, {
      component: "センターディスプレイ",
      situation:
        "センターディスプレイ（１０．２５インチタイプ）において、画面表示を補正するプログラムが不適切なため、テレビへの画面切り替えやテレビからナビ等の別画面への切り替え操作をした際、映像信号が乱れて補正できないことがある。そのため、乱れた映像信号により、画面に縞模様が表示され、カメラの映像を表示できないおそれがある。",
      numCars: 9972,
    });
  });
});
