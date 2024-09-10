import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { z } from "zod";

/**
 * @typedef {import("../types/services.ts").ExtractRecallDetailsService} ExtractRecallDetailsService
 * @typedef {import("../types/objects.ts").RecallDetails} RecallDetails
 */

/**
 * @typedef DefaultExtractRecallDetailsServiceDependencies
 * @property {import("@aws-sdk/client-bedrock-runtime").BedrockRuntimeClient} bedrockRuntimeClient
 * @property {import("@azure/ai-form-recognizer").DocumentAnalysisClient} documentAnalysisClient
 */

/**
 * 「リコール届出一覧表」PDFから必要な情報を抽出します。
 * @implements {ExtractRecallDetailsService}
 */
export class DefaultExtractRecallDetailsService {
  /**
   * @param {DefaultExtractRecallDetailsServiceDependencies} deps
   */
  constructor(deps) {
    this._deps = deps;
  }

  static createDefault() {
    const documentIntelligenceEndpoint =
      process.env.RECALLBOT_DOCUMENT_INTELLIGENCE_ENDPOINT ||
      "https://japaneast.api.cognitive.microsoft.com/";
    const documentIntelligenceApiKey =
      process.env.RECALLBOT_DOCUMENT_INTELLIGENCE_API_KEY;

    if (!documentIntelligenceApiKey) {
      throw new Error("RECALLBOT_DOCUMENT_INTELLIGENCE_API_KEY is required.");
    }

    return new DefaultExtractRecallDetailsService({
      bedrockRuntimeClient: new BedrockRuntimeClient(),
      documentAnalysisClient: new DocumentAnalysisClient(
        documentIntelligenceEndpoint,
        new AzureKeyCredential(documentIntelligenceApiKey),
      ),
    });
  }

  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<RecallDetails>}
   */
  async extractRecallDetailsFromPdf(pdfBuffer) {
    // Document Intelligenceで表を抽出
    const ocrPoller =
      await this._deps.documentAnalysisClient.beginAnalyzeDocument(
        "prebuilt-layout",
        pdfBuffer,
        { locale: "ja-JP" },
      );
    const ocrResult = await ocrPoller.pollUntilDone();

    const tables = ocrResult.tables;
    if (!tables) throw new Error("tables is null");

    const prompt = createPrompt(tables);
    console.log(prompt);

    const command = new ConverseCommand({
      ...commandBase,
      messages: [
        {
          role: "user",
          content: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const output = await this._deps.bedrockRuntimeClient.send(command);
    const message = output.output?.message;
    if (!message) throw new Error("message is null");

    console.log("Bedrock Response: " + JSON.stringify(message));

    return parseAssistantMessage(message);
  }
}

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報をOCRで読み取り、CSV形式で表したものです。";

const prompt2 = `ドキュメントから次の項目を読み取り、原文のまま抽出してください。ただし単語の途中にある不要な空白は削除してください。

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計`;

/** @satisfies {Partial<import("@aws-sdk/client-bedrock-runtime").ConverseCommandInput>} */
const commandBase = {
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
    ],
    toolChoice: {
      any: {},
    },
  },
};

/**
 * @param {import("@azure/ai-form-recognizer").DocumentTable} table
 * @returns {string}
 */
function tableToCsv(table) {
  /** @type {string[][]} */
  const rows = [];

  for (const cell of table.cells) {
    // 改行をスペースに変換
    let content = cell.content.trim().replace(/[\r\n]+/g, " ");
    // ダブルクオート、カンマが含まれていたらダブルクオートで囲む
    if (content.match(/[",]/)) content = `"${content.replace(/"/g, '""')}"`;

    const columns = (rows[cell.rowIndex] ||= []);
    columns.push(content);
  }

  return rows.map((x) => x.join(",")).join("\n");
}

/**
 * @param {import("@azure/ai-form-recognizer").DocumentTable[]} tables
 * @returns {string}
 */
function createPrompt(tables) {
  // 表をCSV形式にして、プロンプトに含ませる
  let prompt = prompt1 + "\n\n";
  prompt += "<documents>\n";
  for (const table of tables) {
    prompt += "<document>\n" + tableToCsv(table) + "\n</document>\n";
  }
  prompt += "</documents>\n\n";
  prompt += prompt2;
  return prompt;
}

/**
 * @param {import("@aws-sdk/client-bedrock-runtime").Message} message
 * @returns {RecallDetails}
 */
export function parseAssistantMessage(message) {
  const toolUse = message.content?.map((x) => x.toolUse).find((x) => x != null);
  return recallDetailsSchema.parse(toolUse?.input);
}

const recallDetailsSchema = z.object({
  component: z.string(),
  situation: z.string(),
  // "9,972台" などの文字列が入ってくることがあるので対応する
  numCars: z.preprocess(
    (x) => (typeof x === "string" ? parseInt(x.replace(",", ""), 10) : x),
    z.number().int().positive(),
  ),
});
