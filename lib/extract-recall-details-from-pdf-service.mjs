import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { z } from "zod";

/** @typedef {import("../types/services.ts").ExtractRecallDetailsFromPdfService} ExtractRecallDetailsFromPdfService */

/**
 * 「リコール届出一覧表」PDFから必要な情報を抽出します。
 * @implements {ExtractRecallDetailsFromPdfService}
 */
export class DefaultExtractRecallDetailsFromPdfService {
  /**
   * @param {import("@aws-sdk/client-bedrock-runtime").BedrockRuntimeClient} client
   */
  constructor(client) {
    this._client = client;
  }

  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<import("../types/objects.ts").RecallDetails>}
   */
  async extractRecallDetailsFromPdf(pdfBuffer) {
    /** @type {import("@aws-sdk/client-bedrock-runtime").Message[]} */
    const messages = [
      {
        role: "user",
        content: [
          {
            text: prompt1,
          },
          {
            document: {
              format: "pdf",
              name: "RecallList",
              source: {
                bytes: new Uint8Array(pdfBuffer),
              },
            },
          },
          {
            text: prompt2,
          },
        ],
      },
    ];

    const command = new ConverseCommand({
      ...commandBase,
      messages,
    });
    const output = await this._client.send(command);

    const toolUse = output.output?.message?.content
      ?.map((x) => x.toolUse)
      .find((x) => x != null);
    return recallDetailsSchema.parse(toolUse?.input);
  }
}

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報です";

const prompt2 = `ドキュメントから次の項目を抽出してください

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計`;

/** @satisfies {Partial<import("@aws-sdk/client-bedrock-runtime").ConverseCommandInput>} */
const commandBase = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  inferenceConfig: {
    maxTokens: 2048,
  },
  toolConfig: {
    tools: [
      {
        toolSpec: {
          name: "OutputResult",
          inputSchema: {
            json: {
              type: "object",
              properties: {
                component: {
                  type: "string",
                  description: "不具合の部位（部品名）",
                },
                situation: {
                  type: "string",
                  description:
                    "基準不適合状態にあると認める構造、装置又は性能の状況及びその原因",
                },
                numCars: {
                  type: "integer",
                  description: "リコール対象車の台数 合計",
                },
              },
              required: ["component", "situation", "numCars"],
            },
          },
        },
      },
    ],
    toolChoice: {
      tool: { name: "OutputResult" },
    },
  },
};

const recallDetailsSchema = z.object({
  component: z.string(),
  situation: z.string(),
  // "9,972台" などの文字列が入ってくることがあるので対応する
  numCars: z.preprocess(
    (x) => (typeof x === "string" ? parseInt(x.replaceAll(",", ""), 10) : x),
    z.number().int().positive(),
  ),
});
