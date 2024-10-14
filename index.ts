import type { EventBridgeHandler } from "aws-lambda";
import { postRecallsToMastodon } from "./lib/workflows/index.ts";

export const handler: EventBridgeHandler<string, unknown, void> = async () => {
  const workflow = postRecallsToMastodon.withDefaultDeps();
  await workflow();
};
