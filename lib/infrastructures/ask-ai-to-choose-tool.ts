import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandInput,
  type ConverseCommandOutput,
  type Message,
  type ToolConfiguration,
  type ToolSpecification,
} from "@aws-sdk/client-bedrock-runtime";
import type { ServiceFactoryWithDefault } from "../types.ts";

export type AskAIToChooseTool = (
  message: ChatMessageContentBlock[],
  tools: ToolSpec[],
) => Promise<AskAIToChooseToolOutput>;

export type AskAIToChooseToolDeps = {
  bedrockRuntimeClient: BedrockRuntimeClient;
};

export type AskAIToChooseToolFactory = ServiceFactoryWithDefault<
  AskAIToChooseTool,
  AskAIToChooseToolDeps
>;

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

export type AskAIToChooseToolOutput = {
  name: string;
  input: unknown;
};

/**
 * Claude 3 Haikuモデルとチャットし、ツールを選択させます。
 */
export const askAIToChooseTool: AskAIToChooseToolFactory =
  (deps) => async (message, tools) => {
    const messages: Message[] = [
      {
        role: "user",
        content: message,
      },
    ];

    const toolConfig: ToolConfiguration = {
      tools: tools.map((x) => ({
        toolSpec: x as ToolSpecification,
      })),
      toolChoice: {
        // いずれかのtoolを呼び出す
        any: {},
      },
    };

    const command = new ConverseCommand({
      ...commandBase,
      messages,
      toolConfig,
    });

    const output = await deps.bedrockRuntimeClient.send(command);
    console.log(JSON.stringify(output));

    return toOutput(output);
  };

askAIToChooseTool.withDefaultDeps = () =>
  askAIToChooseTool({
    bedrockRuntimeClient: new BedrockRuntimeClient(),
  });

const commandBase = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  inferenceConfig: {
    maxTokens: 2048,
    temperature: 0,
  },
} satisfies Partial<ConverseCommandInput>;

function toOutput(
  bedrockOutput: ConverseCommandOutput,
): AskAIToChooseToolOutput {
  const result = bedrockOutput.output?.message?.content
    ?.map((x) => x.toolUse)
    .find((x) => x?.name != null);

  if (!result) throw new Error("No toolUse in bedrockOutput");

  return {
    name: result.name!,
    input: result.input,
  };
}
