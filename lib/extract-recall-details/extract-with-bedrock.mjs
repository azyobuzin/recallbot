import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantMessage } from "./utils.mjs";

/**
 * @typedef ExtractWithBedrockDependencies
 * @property {import("@aws-sdk/client-bedrock-runtime").BedrockRuntimeClient} bedrockRuntimeClient
 */

/**
 * Claude 3 Haikuモデルを使ってPDFを読み取り、リコール情報を抽出します。
 * 画像のみが含まれるPDFには対応しておらず、その場合はundefinedを返します。
 * @param {ArrayBuffer} pdfBuffer
 * @param {Readonly<ExtractWithBedrockDependencies>} deps
 * @returns {Promise<import("../../types/objects.ts").RecallDetails | undefined>}
 */
export async function extractWithBedrock(pdfBuffer, deps) {
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

  const output = await deps.bedrockRuntimeClient.send(command);
  console.log(JSON.stringify(output));

  const message = output.output?.message;
  if (!message) throw new Error("message is null");

  return parseAssistantMessage(message);
}

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報です。";

const prompt2 = `ドキュメントから次の項目を読み取り、原文のまま抽出してください

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計

結果が得られたらOutputResultを呼び出してください。ドキュメントを読み取れなかったらFallbackを呼び出してください`;

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
        type: "object",
      },
    },
  },
};

/** @satisfies {Partial<import("@aws-sdk/client-bedrock-runtime").ConverseCommandInput>} */
const commandBase = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  inferenceConfig: {
    maxTokens: 2048,
    temperature: 0,
  },
  toolConfig: {
    tools: [toolOutputResult, toolFallback],
    toolChoice: {
      // いずれかのtoolを呼び出す
      any: {},
    },
  },
};
