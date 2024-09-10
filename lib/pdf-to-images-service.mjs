import { pdf } from "pdf-to-img";

/** @typedef {import("../types/services.ts").PdfToImagesService} PdfToImagesService */

/**
 * PDFをPNGに変換します。
 * @implements {PdfToImagesService}
 */
export class DefaultPdfToImagesService {
  /**
   * @param {ArrayBuffer} pdfBuffer
   * @returns {Promise<Buffer[]>} PNG images
   */
  async convertPdfToImages(pdfBuffer) {
    const results = [];
    const doc = await pdf(new Uint8Array(pdfBuffer), { scale: 1.5 });
    for await (const page of doc) {
      results.push(page);

      // 最大4枚
      if (results.length >= 4) break;

    }
    return results;
  }
}
