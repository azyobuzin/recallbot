import { pdf } from "pdf-to-img";
import type { ConvertPdfToImages } from "./types.ts";

export type * from "./types.ts";

export const convertPdfToImages: ConvertPdfToImages = async (pdfBuffer) => {
  const results = [];
  const doc = await pdf(pdfBuffer, { scale: 1.5 });
  for await (const page of doc) {
    results.push(page);
  }
  return results;
};
