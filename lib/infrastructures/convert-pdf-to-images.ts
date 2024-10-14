import { pdf } from "pdf-to-img";

export type ConvertPdfToImages = (
  pdfBuffer: Uint8Array,
) => Promise<Uint8Array[]>;

export const convertPdfToImages: ConvertPdfToImages = async (pdfBuffer) => {
  const results = [];
  const doc = await pdf(pdfBuffer, { scale: 1.5 });
  for await (const page of doc) {
    results.push(page);
  }
  return results;
};
