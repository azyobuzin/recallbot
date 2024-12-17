import { readFile } from "node:fs/promises";
import jsdom from "jsdom";

/**
 * @returns {Promise<Uint8Array>}
 */
export async function pressreleaseRdf20240908Binary(): Promise<Uint8Array> {
  return await readFile(
    new URL("./fixtures/pressrelease_20240908.rdf", import.meta.url),
  );
}

export async function pressreleaseRdf20241217Binary(): Promise<Uint8Array> {
  return await readFile(
    new URL("./fixtures/pressrelease_20241217.rdf", import.meta.url),
  );
}

export async function recall20240906(): Promise<jsdom.JSDOM> {
  const content = await readFile(
    new URL("./fixtures/jidosha08_hh_005221.html", import.meta.url),
    { encoding: "utf8" },
  );
  return new jsdom.JSDOM(content, {
    url: "https://www.mlit.go.jp/report/press/jidosha08_hh_005221.html",
    contentType: "text/html",
  });
}
