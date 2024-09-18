import { pdf } from "pdf-to-img";

/** @type {import("./types.ts").ConvertPdfToImages} */
export const convertPdfToImages = async (pdfBuffer) => {
  const results = [];
  const doc = await pdf(pdfBuffer, { scale: 1.5 });
  for await (const page of doc) {
    results.push(page);
  }
  return results;
};
