import { describe, expect, test } from "@jest/globals";
import { parseAssistantMessage } from "../lib/extract-recall-details-service.mjs";

describe("parseAssistantMessage", () => {
  test("numCarsが整数でなくても処理できること", async () => {
    const actual = parseAssistantMessage({
      role: "assistant",
      content: [
        {
          toolUse: {
            toolUseId: "foo",
            name: "OutputResult",
            // 実際にBedrockから返ってきた例
            input: {
              component: "センターディスプレイ",
              situation:
                "センターディスプレイ（１０．２５インチタイプ）において、画面表示を補正するプログラムが不適切なため、テレビへの画面切り替えやテレビからナビ等の別画面への切り替え操作をした際、映像信号が乱れて補正できないことがある。そのため、乱れた映像信号により、画面に縞模様が表示され、カメラの映像を表示できないおそれがある。",
              numCars: "9,972台",
            },
          },
        },
      ],
    });
    expect(actual).toEqual({
      component: "センターディスプレイ",
      situation:
        "センターディスプレイ（１０．２５インチタイプ）において、画面表示を補正するプログラムが不適切なため、テレビへの画面切り替えやテレビからナビ等の別画面への切り替え操作をした際、映像信号が乱れて補正できないことがある。そのため、乱れた映像信号により、画面に縞模様が表示され、カメラの映像を表示できないおそれがある。",
      numCars: 9972,
    });
  });
});
