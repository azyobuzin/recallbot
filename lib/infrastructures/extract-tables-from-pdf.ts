import {
  AzureKeyCredential,
  DocumentAnalysisClient,
  type DocumentTable,
} from "@azure/ai-form-recognizer";
import { getEnv } from "../env.ts";
import type { ServiceFactoryWithDefault } from "../types.ts";

export type ExtractTablesFromPdf = (
  pdfBuffer: Uint8Array,
) => Promise<ExtractTablesFromPdfOutput>;

export type ExtractTablesFromPdfDeps = {
  documentAnalysisClient: DocumentAnalysisClient;
};

type ExtractTablesFromPdfFactory = ServiceFactoryWithDefault<
  ExtractTablesFromPdf,
  ExtractTablesFromPdfDeps
>;

export type ExtractTablesFromPdfOutput = {
  /** 抽出された表をCSV形式で表したもの */
  csvs: string[];
};

/**
 * Azure AI Document Intelligenceを使ってPDFから表を抽出し、CSV形式で返します。
 */
export const extractTablesFromPdf: ExtractTablesFromPdfFactory =
  (deps) => async (pdfBuffer) => {
    const ocrPoller = await deps.documentAnalysisClient.beginAnalyzeDocument(
      "prebuilt-layout",
      pdfBuffer,
      { locale: "ja-JP" },
    );
    const ocrResult = await ocrPoller.pollUntilDone();
    const tables = ocrResult.tables;
    if (!tables) throw new Error("tables is null");
    return { csvs: tables.map(tableToCsv) };
  };

extractTablesFromPdf.withDefaultDeps = () => {
  const documentIntelligenceEndpoint = getEnv(
    "RECALLBOT_DOCUMENT_INTELLIGENCE_ENDPOINT",
  );
  const documentIntelligenceApiKey = getEnv(
    "RECALLBOT_DOCUMENT_INTELLIGENCE_API_KEY",
  );
  return extractTablesFromPdf({
    documentAnalysisClient: new DocumentAnalysisClient(
      documentIntelligenceEndpoint,
      new AzureKeyCredential(documentIntelligenceApiKey),
    ),
  });
};

function tableToCsv(table: DocumentTable): string {
  const rows: string[][] = [];

  for (const cell of table.cells) {
    // 改行をスペースに変換
    let content = cell.content.trim().replace(/[\r\n]+/g, " ");
    // ダブルクオート、カンマが含まれていたらダブルクオートで囲む
    if (content.match(/[",]/)) content = `"${content.replace(/"/g, '""')}"`;

    if (rows[cell.rowIndex]) {
      rows[cell.rowIndex].push(content);
    } else {
      rows[cell.rowIndex] = [content];
    }
  }

  return rows.map((x) => x.join(",")).join("\n");
}
