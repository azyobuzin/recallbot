import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { defaultPostedUrlsTableName } from "./constants.mjs";
import { DefaultDownloadResourceService } from "./download-resource-service.mjs";
import { DefaultExtractRecallDetailsFromPdfService } from "./extract-recall-details-from-pdf-service.mjs";
import { DefaultPdfToImagesService } from "./pdf-to-images-service.mjs";
import { DefaultPostedUrlsRepository } from "./posted-urls-repository.mjs";
import { DefaultRecallbotService } from "./recallbot-service.mjs";
import { DefaultTootService } from "./toot-service.mjs";

/**
 * 環境変数を使ってRecallbotServiceを初期化します。
 * @returns {import("../types/services.ts").RecallbotService}
 */
export function createRecallbotService() {
  const tableName =
    process.env.RECALLBOT_POSTED_URLS_TABLE_NAME || defaultPostedUrlsTableName;
  const mastodonBaseUrl =
    process.env.RECALLBOT_MASTODON_BASE_URL || "https://xxx.azyobuzi.net/";
  const mastodonAccessToken = process.env.RECALLBOT_MASTODON_ACCESS_TOKEN;
  if (!mastodonAccessToken) {
    throw new Error("RECALLBOT_MASTODON_ACCESS_TOKEN is required.");
  }
  const deps = {
    downloadResourceService: new DefaultDownloadResourceService(),
    postedUrlsRepository: new DefaultPostedUrlsRepository(
      new DynamoDBClient(),
      tableName,
    ),
    extractRecallDetailsFromPdfService:
      new DefaultExtractRecallDetailsFromPdfService(new BedrockRuntimeClient()),
    pdfToImagesService: new DefaultPdfToImagesService(),
    tootService: new DefaultTootService(mastodonBaseUrl, mastodonAccessToken),
  };
  return new DefaultRecallbotService(deps);
}
