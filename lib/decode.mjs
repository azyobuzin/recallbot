/** @type {(encoding: string) => (input: Uint8Array) => string} */
const makeDecoder = (encoding) => {
  const decoder = new TextDecoder(encoding);
  return (input) => decoder.decode(input);
};

export const decodeUtf8 = makeDecoder("utf8");
export const decodeShiftJIS = makeDecoder("shift_jis");
