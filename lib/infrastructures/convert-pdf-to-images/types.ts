export type ConvertPdfToImages = (
  pdfBuffer: Uint8Array,
) => Promise<Uint8Array[]>;
