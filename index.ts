import { EventBridgeHandler } from "aws-lambda";
import { DefaultRecallbotService } from "./lib/recallbot-service.mjs";

export const handler: EventBridgeHandler<string, unknown, void>  = async () => {
  await DefaultRecallbotService.createDefault().execute();
}
