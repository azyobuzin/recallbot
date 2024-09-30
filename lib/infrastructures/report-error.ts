import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import type { ServiceFactoryWithDefault } from "../types.ts";

export type ReportError = (error: unknown) => Promise<void>;

export type ReportErrorDependencies = {
  snsClient?: SNSClient;
  errorTopicArn?: string;
};

export type ReportErrorFactory = ServiceFactoryWithDefault<
  ReportError,
  ReportErrorDependencies
>;

export const reportError: ReportErrorFactory = (deps) => async (error) => {
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
