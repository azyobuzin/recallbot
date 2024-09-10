import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { extractWithBedrock } from "./extract-recall-details/extract-with-bedrock.mjs";
import { extractWithDocumentIntelligence } from "./extract-recall-details/extract-with-document-intelligence.mjs";

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
   * @param {Readonly<DefaultExtractRecallDetailsServiceDependencies>} deps
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
    // NOTE: Document Intelligenceでは https://www.mlit.go.jp/report/press/jidosha08_hh_005143.html を正しく抽出できなかったため、先にBedrockのみを試す
    let result = await extractWithBedrock(pdfBuffer, this._deps);
    if (result) return result;

    result = await extractWithDocumentIntelligence(pdfBuffer, this._deps);
    if (result) return result;

    throw new Error("Failed to extract recall details.");
  }
}
