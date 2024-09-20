import * as Afr from "@azure/ai-form-recognizer";
import { getEnv } from "../../env.mjs";

/**
 * Azure AI Document Intelligenceを使ってPDFから表を抽出し、CSV形式で返します。
 * @type {import("./types.ts").ExtractTablesFromPdfFactory}
 */
export const extractTablesFromPdf = (deps) => async (pdfBuffer) => {
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
    documentAnalysisClient: new Afr.DocumentAnalysisClient(
      documentIntelligenceEndpoint,
      new Afr.AzureKeyCredential(documentIntelligenceApiKey),
    ),
  });
};

/**
 * @param {Afr.DocumentTable} table
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
