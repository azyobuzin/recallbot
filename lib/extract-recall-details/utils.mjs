import { z } from "zod";

/**
 * @param {import("@aws-sdk/client-bedrock-runtime").Message} message
 * @returns {import("../../types/objects.ts").RecallDetails | undefined}
 */
export function parseAssistantMessage(message) {
  const toolUse = message.content?.map((x) => x.toolUse).find((x) => x != null);
  if (toolUse?.name === "OutputResult") {
    return recallDetailsSchema.parse(toolUse.input);
  }
}

const recallDetailsSchema = z.object({
  component: z.string(),
  situation: z.string(),
  // "9,972台" などの文字列が入ってくることがあるので対応する
  numCars: z.preprocess(
    (x) => (typeof x === "string" ? parseInt(x.replace(",", ""), 10) : x),
    z.number().int().positive(),
  ),
});
