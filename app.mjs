import { DefaultRecallbotService } from "./lib/recallbot-service.mjs";

/**
 * @type {import("aws-lambda").EventBridgeHandler<string, unknown, void>}
 */
export async function handler(event, context) {
  await DefaultRecallbotService.createDefault().execute();
}
