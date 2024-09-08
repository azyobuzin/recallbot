import { readFile } from "node:fs/promises";

/**
 * @returns {Promise<string>}
 */
export async function pressreleaseRdf20240908() {
  const buf = await readFile(
    new URL("./pressrelease_20240908.rdf", import.meta.url),
  );
  return new TextDecoder("shift_jis").decode(buf);
}
