import type {
  AskAIToChooseTool,
  ExtractTablesFromPdf,
  ToolSpec,
} from "../../../infrastructures/index.ts";
import type { SpotRecallListContent } from "../types.ts";
import { parseAssistantResult } from "./utils.ts";

type ExtractWithDocumentIntelligenceDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  extractTablesFromPdf: ExtractTablesFromPdf;
};

/**
 * Azure Document IntelligenceでPDFに含まれる表を抽出してから、LLMを使って情報を抽出します。
 * 画像のみが含まれるPDFにも対応しています。
 */
export const extractWithDocumentIntelligence =
  (deps: ExtractWithDocumentIntelligenceDeps) =>
  async (pdfBuffer: Uint8Array): Promise<SpotRecallListContent | undefined> => {
    const { csvs } = await deps.extractTablesFromPdf(pdfBuffer);

    const prompt = createPrompt(csvs);
    console.log(prompt);

    const chosenTool = await deps.askAIToChooseTool(
      [{ text: prompt }],
      [toolOutputResult],
    );

    return parseAssistantResult(chosenTool);
  };

const prompt1 =
  "次のドキュメントは国土交通省が公開する自動車のリコール情報をOCRで読み取り、CSV形式で表したものです。";

const prompt2 = `ドキュメントから次の項目を読み取り、原文のまま抽出してください。ただし単語の途中にある不要な空白は削除してください。

* 不具合の部位（部品名）
* 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
* リコール対象車の台数 合計`;

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

function createPrompt(csvs: string[]): string {
  // 表をCSV形式にして、プロンプトに含ませる
  let prompt = `${prompt1}\n\n`;
  prompt += "<documents>\n";
  for (const csv of csvs) {
    prompt += `<document>\n${csv}\n</document>\n`;
  }
  prompt += "</documents>\n\n";
  prompt += prompt2;
  return prompt;
}
