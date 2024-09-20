import * as B from "@aws-sdk/client-bedrock-runtime";

/**
 * Claude 3 Haikuモデルとチャットし、ツールを選択させます。
 * @type {import("./types.ts").AskAIToChooseToolFactory}
 */
export const askAIToChooseTool = (deps) => async (message, tools) => {
  /** @type {B.Message[]} */
  const messages = [
    {
      role: "user",
      content: message,
    },
  ];

  /** @type {B.ToolConfiguration} */
  const toolConfig = {
    tools: tools.map((x) => ({
      toolSpec: /** @type {B.ToolSpecification} */ (x),
    })),
    toolChoice: {
      // いずれかのtoolを呼び出す
      any: {},
    },
  };

  const command = new B.ConverseCommand({
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
    bedrockRuntimeClient: new B.BedrockRuntimeClient(),
  });

/** @satisfies {Partial<B.ConverseCommandInput>} */
const commandBase = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  inferenceConfig: {
    maxTokens: 2048,
    temperature: 0,
  },
};

/**
 * @param {B.ConverseCommandOutput} bedrockOutput
 * @returns {import("./types.ts").AskAIToChooseToolOutput}
 */
function toOutput(bedrockOutput) {
  const result = bedrockOutput.output?.message?.content
    ?.map((x) => x.toolUse)
    .find((x) => x?.name != null);

  if (!result) throw new Error("No toolUse in bedrockOutput");

  return {
    name: /** @type {string} */ (result.name),
    input: result.input,
  };
}
