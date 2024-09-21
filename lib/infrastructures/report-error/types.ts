import type { SNSClient } from "@aws-sdk/client-sns";
import { ServiceFactoryWithDefault } from "../../types.ts";

export type ReportError = (error: unknown) => Promise<void>;

export type ReportErrorDependencies = {
  snsClient?: SNSClient;
  errorTopicArn?: string;
};

export type ReportErrorFactory = ServiceFactoryWithDefault<
  ReportError,
  ReportErrorDependencies
>;
