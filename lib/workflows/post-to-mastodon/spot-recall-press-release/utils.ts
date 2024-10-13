import { z } from "zod";
import type { AskAIToChooseToolOutput } from "../../../infrastructures/ask-ai-to-choose-tool.ts";
import type { SpotRecallListContent } from "../types.ts";

/**
 * プレスリリースのタイトルから車名（メーカー + 通称名）を抽出します。
 */
export function extractCarNameFromTitle(title: string): string {
  const s = title.indexOf("（");
  const e = title.lastIndexOf("）");
  if (s < 0 || e < 0) throw new Error("括弧が見つかりませんでした。");
  return title.slice(s + 1, e);
}

/**
 * AIアシスタントからのツール呼び出しをパースします。
 * 情報を抽出できた場合は、結果を返します。抽出成功を表すツール呼び出しがない場合はundefinedを返します。
 */
export function parseAssistantResult(
  chosenTool: AskAIToChooseToolOutput,
): SpotRecallListContent | undefined {
  if (chosenTool.name === "OutputResult") {
    return extractedRecallListSchema.parse(chosenTool.input);
  }
}

const extractedRecallListSchema = z.object({
  component: z.string(),
  situation: z.string(),
  // "9,972台" などの文字列が入ってくることがあるので対応する
  numCars: z.preprocess(
    (x) => (typeof x === "string" ? parseInt(x.replace(",", ""), 10) : x),
    z.number().int().positive(),
  ),
});
