import { writeFile } from "node:fs/promises";
import {
  AcceptHeaderValue,
  convertPdfToImages,
  downloadResource,
} from "./lib/infrastructures/index.ts";

if (process.argv.length !== 3) {
  console.error("Usage: node debug-pdf-to-images.mjs <PDF URL>");
  process.exit(1);
}

const url = process.argv[2];

const pdf = await downloadResource(url, AcceptHeaderValue.pdf);
const buffers = await convertPdfToImages(pdf);

await Promise.all(
  buffers.map((buf, i) => writeFile(`debug-page${i + 1}.png`, buf)),
);
