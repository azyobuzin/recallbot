import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

/** @type {import("./types.ts").ReportErrorFactory} */
export const reportError = (deps) => async (error) => {
  if (error == null || deps.snsClient == null || deps.errorTopicArn == null) {
    return;
  }

  const message =
    (error instanceof Error ? error.stack : undefined) || error.toString();

  await deps.snsClient.send(
    new PublishCommand({
      TopicArn: deps.errorTopicArn,
      Subject: "Recallbot Error",
      Message: message,
    }),
  );
};

reportError.withDefaultDeps = () => {
  const errorTopicArn = process.env.RECALLBOT_ERROR_TOPIC_ARN;
  const deps = errorTopicArn
    ? { snsClient: new SNSClient(), errorTopicArn }
    : {};
  return reportError(deps);
};
