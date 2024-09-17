import type { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

export type AskAIToChooseToolDependencies = {
  bedrockRuntimeClient: BedrockRuntimeClient;
};

export type AskAIToChooseTool = (
  message: ChatMessageContentBlock[],
  tools: ToolSpec[],
) => Promise<AskAIToChooseToolOutput>;

export type ChatMessageContentBlock =
  | { text: string }
  | {
      document: {
        format: "pdf";
        name: string;
        source: {
          bytes: Uint8Array;
        };
      };
    };

export type ToolSpec = {
  name: string;
  description: string;
  inputSchema: {
    json: unknown;
  };
};

export type AskAIToChooseToolOutput =
  | {
      name: string;
      input: unknown;
    }
  | undefined;
