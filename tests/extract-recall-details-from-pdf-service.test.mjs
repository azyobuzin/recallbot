import { describe, expect, jest, test } from "@jest/globals";
import { DefaultExtractRecallDetailsFromPdfService } from "../lib/extract-recall-details-from-pdf-service.mjs";

const mockBedrockRuntimeClient = {
  /** @type {jest.Mock<(command: unknown) => Promise<unknown>>} */
  send: jest.fn(),
};

describe("DefaultExtractRecallDetailsFromPdfService", () => {
  test("numCarsが整数でなくても処理できること", async () => {
    mockBedrockRuntimeClient.send.mockResolvedValue({
      output: {
        message: {
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
        },
      },
    });

    const service = new DefaultExtractRecallDetailsFromPdfService(
      // @ts-expect-error
      mockBedrockRuntimeClient,
    );

    const actual = await service.extractRecallDetailsFromPdf(
      new ArrayBuffer(0),
    );
    expect(actual).toEqual({
      component: "センターディスプレイ",
      situation:
        "センターディスプレイ（１０．２５インチタイプ）において、画面表示を補正するプログラムが不適切なため、テレビへの画面切り替えやテレビからナビ等の別画面への切り替え操作をした際、映像信号が乱れて補正できないことがある。そのため、乱れた映像信号により、画面に縞模様が表示され、カメラの映像を表示できないおそれがある。",
      numCars: 9972,
    });
    expect(mockBedrockRuntimeClient.send).toHaveBeenCalledTimes(1);
  });
});
