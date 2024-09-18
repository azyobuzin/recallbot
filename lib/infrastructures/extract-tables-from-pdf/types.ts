import type { DocumentAnalysisClient } from "@azure/ai-form-recognizer";

export type ExtractTablesFromPdf = (
  pdfBuffer: Uint8Array
) => Promise<ExtractTablesFromPdfOutput>;

export type ExtractTablesFromPdfDependencies = {
  documentAnalysisClient: DocumentAnalysisClient;
};

export type ExtractTablesFromPdfFactory = (
  deps: ExtractTablesFromPdfDependencies
) => ExtractTablesFromPdf;

export type ExtractTablesFromPdfOutput = {
  /** 抽出された表をCSV形式で表したもの */
  csvs: string[];
};
