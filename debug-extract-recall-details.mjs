import { acceptPdf } from "./lib/constants.mjs";
import { DefaultExtractRecallDetailsService } from "./lib/extract-recall-details-service.mjs";
import { DefaultDownloadResourceService } from "./lib/download-resource-service.mjs";

if (process.argv.length !== 3) {
  console.error("Usage: node debug-extract-recall-details.mjs <PDF URL>");
  process.exit(1);
}

const url = process.argv[2];

const pdf = await new DefaultDownloadResourceService().downloadResource(
  url,
  acceptPdf,
);

const recallDetails =
  await DefaultExtractRecallDetailsService.createDefault().extractRecallDetailsFromPdf(
    pdf,
  );

console.log(recallDetails);
