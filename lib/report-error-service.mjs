import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

/** @typedef {import("../types/services.ts").ReportErrorService} ReportErrorService */

/** @implements {ReportErrorService} */
export class DefaultReportErrorService {
  /**
   * @param {import("@aws-sdk/client-sns").SNSClient | null | undefined} snsClient
   * @param {string | null | undefined} topicArn
   */
  constructor(snsClient, topicArn) {
    this._snsClient = snsClient;
    this._topicArn = topicArn;
  }

  static createDefault() {
    const topicArn = process.env.RECALLBOT_ERROR_TOPIC_ARN;
    return topicArn
      ? new DefaultReportErrorService(new SNSClient(), topicArn)
      : new DefaultReportErrorService(undefined, undefined);
  }

  /**
   * @param {unknown} error
   * @returns {Promise<void>}
   */
  async reportError(error) {
    if (error == null || this._snsClient == null || this._topicArn == null) {
      return;
    }

    const message =
      (error instanceof Error ? error.stack : undefined) || error.toString();
    await this._snsClient.send(
      new PublishCommand({
        TopicArn: this._topicArn,
        Subject: "Recallbot Error",
        Message: message,
      }),
    );
  }
}
