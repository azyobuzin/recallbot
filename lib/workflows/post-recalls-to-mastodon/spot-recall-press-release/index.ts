import {
  AcceptHeaderValue,
  type AskAIToChooseTool,
  type ExtractTablesFromPdf,
  type ConvertPdfToImages,
  type DownloadResource,
  type MediaToUpload,
} from "../../../infrastructures/index.ts";
import type { ServiceFactory } from "../../../types.ts";
import type {
  CompleteSpotRecallPressRelease,
  ContentToPost,
  SpotRecallPressReleasePage,
  SpotRecallListContent,
  SpotRecallPressReleaseWithPdf,
  SpotRecallPressReleaseWithPdfUrl,
} from "../types.ts";
import { extractWithBedrock } from "./extract-with-bedrock.ts";
import { extractWithDocumentIntelligence } from "./extract-with-document-intelligence.ts";
import { extractCarNameFromTitle } from "./utils.ts";

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
    illustrationPdfUrl: input.pdfLinks.find((x) => x.title === "改善箇所説明図")
      ?.href,
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
    const [recallListPdf, illustrationPdf] = await Promise.all([
      deps.downloadResource(input.recallListPdfUrl, AcceptHeaderValue.pdf),
      input.illustrationPdfUrl
        ? deps.downloadResource(input.illustrationPdfUrl, AcceptHeaderValue.pdf)
        : Promise.resolve(undefined),
    ]);

    return {
      pressReleaseUrl: input.pressReleaseUrl,
      carName: input.carName,
      preamble: input.preamble,
      recallListPdf: recallListPdf,
      illustrationPdf: illustrationPdf,
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
      downloadedPdfs.illustrationPdf
        ? deps.convertPdfToImages(downloadedPdfs.illustrationPdf)
        : Promise.resolve([]),
    ]);
    return {
      pressReleaseUrl: downloadedPdfs.pressReleaseUrl,
      carName: downloadedPdfs.carName,
      preamble: downloadedPdfs.preamble,
      ...extractedFromPdf,
      illustrations,
    };
  };

const toContentToPost = (
  input: CompleteSpotRecallPressRelease,
): ContentToPost => {
  const status = `${input.carName}
${input.preamble}

不具合の部位: ${input.component}
${input.situation}

リコール対象車の台数: ${input.numCars}台

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

type CreatePostForSpotRecallPressReleaseDeps =
  AnalyzeSpotRecallPressReleaseDeps;

export const createPostForSpotRecallPressRelease =
  (deps: CreatePostForSpotRecallPressReleaseDeps) =>
  async (input: SpotRecallPressReleasePage) => {
    const analyzed = await analyzeSpotRecallPressRelease(deps)(input);
    return toContentToPost(analyzed);
  };
