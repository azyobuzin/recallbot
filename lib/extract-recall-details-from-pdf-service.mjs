import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { z } from "zod";

/**
 * @typedef {import("../types/services.ts").ExtractRecallDetailsFromPdfService} ExtractRecallDetailsFromPdfService
 * @typedef {import("../types/objects.ts").RecallDetails} RecallDetails
 */

/**
 * 「リコール届出一覧表」PDFから必要な情報を抽出します。
 * @implements {ExtractRecallDetailsFromPdfService}
 */
export class DefaultExtractRecallDetailsFromPdfService {
  /**
   * @param {import("@aws-sdk/client-bedrock-runtime").BedrockRuntimeClient} client
   * @param {import("../types/services.ts").PdfToImagesService} pdfToImagesService
   */
  constructor(client, pdfToImagesService) {
    this._client = client;
    this._pdfToImagesService = pdfToImagesService;
  }

  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<RecallDetails>}
   */
  async extractRecallDetailsFromPdf(pdfBuffer) {
    const result = await this._tryExtractFromPdf(pdfBuffer);
    return result ?? this._extractFromImage(pdfBuffer);
  }

  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<RecallDetails | undefined>}
   */
  async _tryExtractFromPdf(pdfBuffer) {
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
              text: prompt2 + prompt3,
            },
          ],
        },
      ];

      const command = new ConverseCommand({
        ...commandBase,
        toolConfig: {
          tools: [
            toolOutputResult,
            toolFallback
          ],
          toolChoice: {
            any: {}
          }
        },
        messages,
      });
      const output = await this._client.send(command);

      console.log("AI returns: " + JSON.stringify(output.output?.message?.content));
  
      const toolUse = output.output?.message?.content
        ?.map((x) => x.toolUse)
        .find((x) => x != null);

      switch (toolUse?.name) {
        case "OutputResult":
          return recallDetailsSchema.parse(toolUse.input);
        case "Fallback":
          return undefined;
        default:
          throw new Error(`Unexpected tool name: ${toolUse?.name}`);
      }
  }

 /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<RecallDetails>}
   */
  async _extractFromImage(pdfBuffer) {
    /** @type {import("@aws-sdk/client-bedrock-runtime").ContentBlock[]} */
    const images = (await this._pdfToImagesService.convertPdfToImages(pdfBuffer)).map((x) => ({
      image: {
        format: "png",
        source: { bytes: new Uint8Array(x) },
      }
    }))

    /** @type {import("@aws-sdk/client-bedrock-runtime").Message[]} */
    const messages = [
      {
        role: "user",
        content: [
          {
            text: prompt1 + prompt2,
          },
          ...images
        ],
      },
    ];

    const command = new ConverseCommand({
      ...commandBase,
      toolConfig: {
        tools: [
          toolOutputResult,
        ],
        toolChoice: {
          any: {}
        }
      },
      messages,
    });
    const output = await this._client.send(command);

    console.log("AI returns: " + JSON.stringify(output.output?.message?.content));

    const toolUse = output.output?.message?.content
      ?.map((x) => x.toolUse)
      .find((x) => x != null);

    switch (toolUse?.name) {
      case "OutputResult":
        return recallDetailsSchema.parse(toolUse.input);
      default:
        throw new Error(`Unexpected tool name: ${toolUse?.name}`);
    }
  }
}

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報です。";

const prompt2 = `ドキュメントから次の項目を読み取り、原文のまま抽出してください

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計`;

const prompt3 = `

結果が得られたらOutputResultを呼び出してください。ドキュメントを読み取れなかったらFallbackを呼び出してください`;

/** @satisfies {Partial<import("@aws-sdk/client-bedrock-runtime").ConverseCommandInput>} */
const commandBase = {
  //modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  inferenceConfig: {
    maxTokens: 2048,
    temperature: 0,
  },
  toolConfig: {
    tools: [
      {
        toolSpec: {
          name: "OutputResult",
          description: "抽出結果を出力",
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
      {
        toolSpec: {
          name: "Fallback",
          description: "ドキュメントを読み取れなかったことを通知",
          inputSchema: {
            json: {}
          }
        }
      }
    ],
    toolChoice: {
      // いずれかのtoolを呼び出す
      any: {}
    },
  },
};

/** @type {import("@aws-sdk/client-bedrock-runtime").Tool} */
const toolOutputResult = {
  toolSpec: {
    name: "OutputResult",
    description: "抽出結果を出力",
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
};

/** @type {import("@aws-sdk/client-bedrock-runtime").Tool} */
const toolFallback = {
  toolSpec: {
    name: "Fallback",
    description: "ドキュメントを読み取れなかったことを通知",
    inputSchema: {
      json: {
        type: "object"
      }
    }
  }
}

const recallDetailsSchema = z.object({
  component: z.string(),
  situation: z.string(),
  // "9,972台" などの文字列が入ってくることがあるので対応する
  numCars: z.preprocess(
    (x) => (typeof x === "string" ? parseInt(x.replaceAll(",", ""), 10) : x),
    z.number().int().positive(),
  ),
});
