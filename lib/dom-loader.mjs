import jsdom from "jsdom";
import { userAgent } from "./constants.mjs";

/** @type {import("../types/services.ts").DomLoader} */
export const defaultDomLoader = {
  async loadUrl(url) {
    const resources = new jsdom.ResourceLoader({ userAgent: userAgent });
    return await jsdom.JSDOM.fromURL(url, { resources });
  },
};
