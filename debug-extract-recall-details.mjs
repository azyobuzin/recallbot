import { acceptPdf } from "./lib/constants.mjs";
import { DefaultExtractRecallDetailsFromPdfService } from "./lib/extract-recall-details-from-pdf-service.mjs";
import { DefaultDownloadResourceService } from "./lib/download-resource-service.mjs";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

if (process.argv.length !== 3) {
  console.error("Usage: node debug-extract-recall-details.mjs <PDF URL>");
  process.exit(1);
}

const url = process.argv[2];

const pdf = await new DefaultDownloadResourceService().downloadResource(
  url,
  acceptPdf,
);

const recallDetails = await new DefaultExtractRecallDetailsFromPdfService(
  new BedrockRuntimeClient(),
).extractRecallDetailsFromPdf(pdf);

console.log(recallDetails);
