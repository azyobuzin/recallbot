import jsdom from "jsdom";
import { userAgent } from "./constants.mjs";

/** @typedef {import("../types/services.ts").LoadPageService} LoadPageService */

/**
 * JSDOMをラップして、指定されたURLのページを読み込みます。
 * @implements {LoadPageService}
 */
export class DefaultLoadPageService {
  /**
   * @param {string} url
   * @returns {Promise<jsdom.JSDOM>}
   */
  async loadPage(url) {
    const resources = new jsdom.ResourceLoader({ userAgent: userAgent });
    return await jsdom.JSDOM.fromURL(url, { resources });
  }
}
