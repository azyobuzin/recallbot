import { createRecallbotService } from "./lib/create-recallbot-service.mjs";

/**
 * @type {import("aws-lambda").EventBridgeHandler<string, unknown, void>}
 */
export async function handler(event, context) {
  await createRecallbotService().execute();
}
