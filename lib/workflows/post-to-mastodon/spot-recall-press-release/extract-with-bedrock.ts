import type {
  AskAIToChooseTool,
  ChatMessageContentBlock,
  ToolSpec,
} from "../../../infrastructures/index.ts";
import type { SpotRecallListContent } from "../types.ts";
import { parseAssistantResult } from "./utils.ts";

type ExtractWithBedrockDependencies = {
  askAIToChooseTool: AskAIToChooseTool;
};

/**
 * Claude 3 Haikuモデルを使ってPDFを読み取り、リコール情報を抽出します。
 * 画像のみが含まれるPDFには対応しておらず、その場合はundefinedを返します。
 */
export const extractWithBedrock =
  (deps: ExtractWithBedrockDependencies) =>
  async (pdfBuffer: Uint8Array): Promise<SpotRecallListContent | undefined> => {
    const userMessage: ChatMessageContentBlock[] = [
      {
        text: prompt1,
      },
      {
        document: {
          format: "pdf",
          name: "RecallList",
          source: {
            bytes: pdfBuffer,
          },
        },
      },
      {
        text: prompt2,
      },
    ];

    const chosenTool = await deps.askAIToChooseTool(userMessage, [
      toolOutputResult,
      toolFallback,
    ]);

    return parseAssistantResult(chosenTool);
  };

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報です。";

const prompt2 = `ドキュメントから次の項目を読み取り、原文のまま抽出してください

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計

結果が得られたらOutputResultを呼び出してください。ドキュメントを読み取れなかったらFallbackを呼び出してください`;

const toolOutputResult: ToolSpec = {
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
};

const toolFallback: ToolSpec = {
  name: "Fallback",
  description: "ドキュメントを読み取れなかったことを通知",
  inputSchema: {
    json: {
      type: "object",
    },
  },
};
