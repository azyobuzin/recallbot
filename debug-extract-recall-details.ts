import {
  AcceptHeaderValue,
  askAIToChooseTool,
  downloadResource,
  extractTablesFromPdf,
} from "./lib/infrastructures/index.ts";
import { extractFromPdf } from "./lib/workflows/post-recalls-to-mastodon/spot-recall-press-release/index.ts";

if (process.argv.length !== 3) {
  console.error("Usage: node debug-extract-recall-details.mjs <PDF URL>");
  process.exit(1);
}

const url = process.argv[2];

const pdf = await downloadResource(url, AcceptHeaderValue.pdf);

const defaultExtractFromPdf = extractFromPdf({
  askAIToChooseTool: askAIToChooseTool.withDefaultDeps(),
  extractTablesFromPdf: extractTablesFromPdf.withDefaultDeps(),
});
const recallDetails = await defaultExtractFromPdf(pdf);

console.log(recallDetails);
