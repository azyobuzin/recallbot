import { readFile } from "node:fs/promises";
import jsdom from "jsdom";

/**
 * @returns {Promise<string>}
 * @deprecated
 */
export async function pressreleaseRdf20240908() {
  const buf = await readFile(
    new URL("./fixtures/pressrelease_20240908.rdf", import.meta.url),
  );
  return new TextDecoder("shift_jis").decode(buf);
}

/**
 * @returns {Promise<Uint8Array>}
 */
export async function pressreleaseRdf20240908Binary() {
  return await readFile(
    new URL("./fixtures/pressrelease_20240908.rdf", import.meta.url),
  );
}

/**
 * @returns {Promise<jsdom.JSDOM>}
 */
export async function recall20240906() {
  const content = await readFile(
    new URL("./fixtures/jidosha08_hh_005221.html", import.meta.url),
    { encoding: "utf8" },
  );
  return new jsdom.JSDOM(content, {
    url: "https://www.mlit.go.jp/report/press/jidosha08_hh_005221.html",
    contentType: "text/html",
  });
}
