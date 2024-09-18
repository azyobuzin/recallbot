/**
 * @typedef {{ required: true } | { required?: false, defaultValue?: string }} EnvironmentVariableDefinition
 */

/**
 * 使用する環境変数の一覧
 * @satisfies {Record<string, EnvironmentVariableDefinition>}
 */
const environmentVariableDefinitions = /** @type {const} */ ({
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
});

/**
 * @template {keyof typeof environmentVariableDefinitions} K
 * @param {K} key
 * @returns {typeof environmentVariableDefinitions[K] extends ({ readonly required: true } | { readonly defaultValue: string })
 *           ? string : string | undefined}
 */
export function getEnv(key) {
  /** @type {EnvironmentVariableDefinition} */
  const def = environmentVariableDefinitions[key];
  /** @type {string | undefined} */
  const value = process.env[key];
  if (def.required && value == null) {
    throw new EnvError(key);
  }
  // @ts-expect-error
  return value ?? def.defaultValue;
}

export class EnvError extends Error {
  /** @param {string} key */
  constructor(key) {
    super(`${key} is required.`);
    this.name = "EnvError";
  }
}
