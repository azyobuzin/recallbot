import type { SNSClient } from "@aws-sdk/client-sns";

export type ReportError = (error: unknown) => Promise<void>;

export type ReportErrorDependencies = {
  snsClient?: SNSClient;
  errorTopicArn?: string;
};

export type ReportErrorFactory = {
  (deps: ReportErrorDependencies): ReportError;
  withDefaultDeps(): ReportError;
};
