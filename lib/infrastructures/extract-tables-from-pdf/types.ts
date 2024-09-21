import type { DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { ServiceFactoryWithDefault } from "../../types.ts";

export type ExtractTablesFromPdf = (
  pdfBuffer: Uint8Array,
) => Promise<ExtractTablesFromPdfOutput>;

export type ExtractTablesFromPdfDependencies = {
  documentAnalysisClient: DocumentAnalysisClient;
};

export type ExtractTablesFromPdfFactory = ServiceFactoryWithDefault<
  ExtractTablesFromPdf,
  ExtractTablesFromPdfDependencies
>;

export type ExtractTablesFromPdfOutput = {
  /** 抽出された表をCSV形式で表したもの */
  csvs: string[];
};
