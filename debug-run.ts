import { postRecallsToMastodon } from "./lib/workflows/index.ts";

const workflow = postRecallsToMastodon.withDefaultDeps();
await workflow();
