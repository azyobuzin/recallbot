import { downloadResource } from "./lib/infrastructures/download-resource.ts";
import { retrieveRecallPressReleaseFeedItems } from "./lib/workflows/post-recalls-to-mastodon/press-release-rss.ts";

const deps = { downloadResource };
const results = await retrieveRecallPressReleaseFeedItems(deps)();
console.log(JSON.stringify(results));
