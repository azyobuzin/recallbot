import {
  AcceptHeaderValue,
  type AskAIToChooseTool,
  type ConvertPdfToImages,
  type DownloadResource,
  type ExtractTablesFromPdf,
} from "../../../infrastructures/index.ts";
import type {
  CompleteSpotRecallPressRelease,
  SpotRecallListContent,
  SpotRecallPressReleasePage,
  SpotRecallPressReleaseWithPdf,
  SpotRecallPressReleaseWithPdfUrl,
} from "../types.ts";
import { extractWithBedrock } from "./extract-with-bedrock.ts";
import { extractWithDocumentIntelligence } from "./extract-with-document-intelligence.ts";
import {
  convertPdfsToImages,
  extractCarNameFromTitle,
  extractIllustrationPdfUrls,
  makeContentToPost,
} from "./utils.ts";

const extractFromHtml = (
  input: SpotRecallPressReleasePage,
): SpotRecallPressReleaseWithPdfUrl => {
  const recallListPdfUrl = input.pdfLinks.find(
    (x) => x.title === "リコール届出一覧表",
  )?.href;
  if (!recallListPdfUrl) {
    throw new Error("リコール届出一覧表が見つかりませんでした。");
  }

  return {
    pressReleaseUrl: input.pressReleaseUrl,
    carName: extractCarNameFromTitle(input.title),
    preamble: input.preamble,
    recallListPdfUrl: recallListPdfUrl,
    illustrationPdfUrls: extractIllustrationPdfUrls(input.pdfLinks),
  };
};

type DownloadPdfsDeps = {
  downloadResource: DownloadResource;
};

const downloadPdfs =
  (deps: DownloadPdfsDeps) =>
  async (
    input: SpotRecallPressReleaseWithPdfUrl,
  ): Promise<SpotRecallPressReleaseWithPdf> => {
    const [recallListPdf, illustrationPdfs] = await Promise.all([
      deps.downloadResource(input.recallListPdfUrl, AcceptHeaderValue.pdf),
      Promise.all(
        input.illustrationPdfUrls.map((url) =>
          deps.downloadResource(url, AcceptHeaderValue.pdf),
        ),
      ),
    ]);

    return {
      pressReleaseUrl: input.pressReleaseUrl,
      carName: input.carName,
      preamble: input.preamble,
      recallListPdf,
      illustrationPdfs,
    };
  };

type ExtractFromPdfDeps = {
  askAIToChooseTool: AskAIToChooseTool;
  extractTablesFromPdf: ExtractTablesFromPdf;
};

export const extractFromPdf =
  (deps: ExtractFromPdfDeps) =>
  async (recallListPdf: Uint8Array): Promise<SpotRecallListContent> => {
    // NOTE: Document Intelligenceでは https://www.mlit.go.jp/report/press/jidosha08_hh_005143.html を正しく抽出できなかったため、先にBedrockのみを試す
    let result = await extractWithBedrock(deps)(recallListPdf);
    if (result) return result;

    result = await extractWithDocumentIntelligence(deps)(recallListPdf);
    if (result) return result;

    throw new Error("Failed to extract recall details.");
  };

type AnalyzeSpotRecallPressReleaseDeps = DownloadPdfsDeps &
  ExtractFromPdfDeps & {
    convertPdfToImages: ConvertPdfToImages;
  };

const analyzeSpotRecallPressRelease =
  (deps: AnalyzeSpotRecallPressReleaseDeps) =>
  async (
    input: SpotRecallPressReleasePage,
  ): Promise<CompleteSpotRecallPressRelease> => {
    const extractedFromHtml = extractFromHtml(input);
    const downloadedPdfs = await downloadPdfs(deps)(extractedFromHtml);
    const [extractedFromPdf, illustrations] = await Promise.all([
      extractFromPdf(deps)(downloadedPdfs.recallListPdf),
      convertPdfsToImages(
        deps.convertPdfToImages,
        downloadedPdfs.illustrationPdfs,
      ),
    ]);
    return {
      pressReleaseUrl: downloadedPdfs.pressReleaseUrl,
      carName: downloadedPdfs.carName,
      preamble: downloadedPdfs.preamble,
      ...extractedFromPdf,
      illustrations,
    };
  };

type CreatePostForSpotRecallPressReleaseDeps =
  AnalyzeSpotRecallPressReleaseDeps;

export const createPostForSpotRecallPressRelease =
  (deps: CreatePostForSpotRecallPressReleaseDeps) =>
  async (input: SpotRecallPressReleasePage) => {
    const analyzed = await analyzeSpotRecallPressRelease(deps)(input);
    return makeContentToPost(analyzed);
  };
