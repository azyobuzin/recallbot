type EnvironmentVariableDefinition =
  | { required: true }
  | { required?: false; defaultValue?: string };

/** 使用する環境変数の一覧 */
const environmentVariableDefinitions = {
  RECALLBOT_POSTED_URLS_TABLE_NAME: {
    defaultValue: "recallbot_dev_posted_urls",
  },
  RECALLBOT_DOCUMENT_INTELLIGENCE_ENDPOINT: {
    defaultValue: "https://japaneast.api.cognitive.microsoft.com/",
  },
  RECALLBOT_DOCUMENT_INTELLIGENCE_API_KEY: { required: true },
  RECALLBOT_MASTODON_BASE_URL: { defaultValue: "https://xxx.azyobuzi.net/" },
  RECALLBOT_MASTODON_ACCESS_TOKEN: { required: true },
  RECALLBOT_ERROR_TOPIC_ARN: { required: false },
} as const satisfies Record<string, EnvironmentVariableDefinition>;

type EnvValue<K extends keyof typeof environmentVariableDefinitions> =
  (typeof environmentVariableDefinitions)[K] extends
    | { readonly required: true }
    | { readonly defaultValue: string }
    ? string
    : string | undefined;

/** 環境変数を取得します。設定されていない場合はデフォルト値を返します。 */
export function getEnv<K extends keyof typeof environmentVariableDefinitions>(
  key: K,
): EnvValue<K> {
  const def: EnvironmentVariableDefinition =
    environmentVariableDefinitions[key];
  const value: string | undefined = process.env[key];
  if (def.required && value == null) {
    throw new EnvError(key);
  }
  // @ts-expect-error
  return value ?? def.defaultValue;
}

export class EnvError extends Error {
  constructor(key: string) {
    super(`${key} is required.`);
    this.name = "EnvError";
  }
}
