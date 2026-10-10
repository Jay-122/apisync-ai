export type MigrationRule = {
  id: string;
  packageName: string;
  fromVersion: string;
  toVersion: string;
  description: string;
  oldMethod: string;
  newMethod: string;
  confidence: number;
  paramRenames: Record<string, string>;
  unwrapData: boolean;
};

export const MIGRATION_RULES: MigrationRule[] = [
  {
    id: "openai-create-completion",
    packageName: "openai",
    fromVersion: "3.x",
    toVersion: "4.x",
    description:
      "OpenAI SDK v4 removed createCompletion() and replaced it with completions.create(). The engine parameter was renamed to model.",
    oldMethod: "createCompletion",
    newMethod: "completions.create",
    confidence: 0.97,
    paramRenames: { engine: "model" },
    unwrapData: true,
  },
  {
    id: "openai-create-chat-completion",
    packageName: "openai",
    fromVersion: "3.x",
    toVersion: "4.x",
    description:
      "OpenAI SDK v4 removed createChatCompletion() and replaced it with chat.completions.create(). Responses are returned directly, without a data wrapper.",
    oldMethod: "createChatCompletion",
    newMethod: "chat.completions.create",
    confidence: 0.97,
    paramRenames: {},
    unwrapData: true,
  },
];

export function rulesForPackage(packageName: string) {
  return MIGRATION_RULES.filter((rule) => rule.packageName === packageName);
}

export const AUTO_TRANSFORM_THRESHOLD = 0.8;
export const AUTO_PROPOSE_THRESHOLD = 0.95;
