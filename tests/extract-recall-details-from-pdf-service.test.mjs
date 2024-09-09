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
                  component: "エンジンオイルクーラーホース",
                  numCars: "155台",
                  situation:
                    "エンジンのオイルクーラーホースにおいて、製造工程が不適切なため、ホース内壁に細かなくぼみ等が形成され、厚さが不均等になっているものがある。このホース内壁の薄い部位に、エンジン作動中に発生する油圧（約7.85 bar）がかかると、当該部位周辺から破裂しオイルが漏れ、警告灯が点灯する。最悪の場合、漏れたオイルが高温部にかかり、火災となるおそれがある。",
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
      component: "エンジンオイルクーラーホース",
      situation:
        "エンジンのオイルクーラーホースにおいて、製造工程が不適切なため、ホース内壁に細かなくぼみ等が形成され、厚さが不均等になっているものがある。このホース内壁の薄い部位に、エンジン作動中に発生する油圧（約7.85 bar）がかかると、当該部位周辺から破裂しオイルが漏れ、警告灯が点灯する。最悪の場合、漏れたオイルが高温部にかかり、火災となるおそれがある。",
      numCars: 155,
    });
    expect(mockBedrockRuntimeClient.send).toHaveBeenCalledTimes(1);
  });
});
