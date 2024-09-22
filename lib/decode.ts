const makeDecoder = (encoding: string) => {
  const decoder = new TextDecoder(encoding);
  return (input: Uint8Array) => decoder.decode(input);
};

export const decodeUtf8 = makeDecoder("utf8");
export const decodeShiftJIS = makeDecoder("shift_jis");
