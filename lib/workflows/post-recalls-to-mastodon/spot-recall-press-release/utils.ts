import { z } from "zod/v4";
import type {
  AskAIToChooseToolOutput,
  ConvertPdfToImages,
  MediaToUpload,
} from "../../../infrastructures/index.ts";
import type {
  CompleteSpotRecallPressRelease,
  ContentToPost,
  PdfLink,
  SpotRecallListContent,
} from "../types.ts";

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
 * 添付資料から改善箇所説明図のPDFのURLを抽出します。
 */
export function extractIllustrationPdfUrls(pdfLinks: PdfLink[]): string[] {
  return pdfLinks
    .filter((x) => x.title.startsWith("改善箇所説明図"))
    .map((x) => x.href);
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
    (x) =>
      typeof x === "string" ? Number.parseInt(x.replace(",", ""), 10) : x,
    z.number().int().positive(),
  ),
});

export async function convertPdfsToImages(
  convertPdfToImages: ConvertPdfToImages,
  pdfs: Uint8Array[],
): Promise<Uint8Array[]> {
  const results = [];
  for (const pdfBuffer of pdfs) {
    results.push(...(await convertPdfToImages(pdfBuffer)));
  }
  return results;
}

export const makeContentToPost = (
  input: CompleteSpotRecallPressRelease,
): ContentToPost => {
  const formattedNumCars = input.numCars.toLocaleString("ja-JP");
  const status = `${input.carName}
${input.preamble}

不具合の部位: ${input.component}
${input.situation}

リコール対象車の台数: ${formattedNumCars}台

${input.pressReleaseUrl}`;

  const media = input.illustrations.map(
    (bytes): MediaToUpload => ({
      description: "改善箇所説明図",
      bytes,
      mimeType: "image/png",
    }),
  );

  return { pressReleaseUrl: input.pressReleaseUrl, status, media };
};
