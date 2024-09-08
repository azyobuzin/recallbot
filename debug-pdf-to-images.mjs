import { writeFile } from "node:fs/promises";
import { acceptPdf } from "./lib/constants.mjs";
import { DefaultDownloadResourceService } from "./lib/download-resource-service.mjs";
import { DefaultPdfToImagesService } from "./lib/pdf-to-images-service.mjs";

if (process.argv.length !== 3) {
  console.error("Usage: node debug-pdf-to-images.mjs <URL>");
  process.exit(1);
}

const url = process.argv[2];

const pdf = await new DefaultDownloadResourceService().downloadResource(
  url,
  acceptPdf,
);
const buffers = await new DefaultPdfToImagesService().convertPdfToImages(pdf);

await Promise.all(
  buffers.map((buf, i) => writeFile(`debug-page${i + 1}.png`, buf)),
);
