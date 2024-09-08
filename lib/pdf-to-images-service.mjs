import { pdf } from "pdf-to-img";

/** @typedef {import("../types/services.ts").PdfToImagesService} PdfToImagesService */

/** @implements {PdfToImagesService} */
export class DefaultPdfToImagesService {
  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<Buffer[]>} PNG images
   */
  async convertPdfToImages(pdfBuffer) {
    const results = []; // NOTE: Node 22以降になったらArray.fromAsyncを使えるようになる
    const doc = await pdf(new Uint8Array(pdfBuffer), { scale: 1.5 });
    for await (const page of doc) {
      results.push(page);
    }
    return results;
  }
}
