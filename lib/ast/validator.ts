import { ModuleKind, ModuleResolutionKind, Project, ScriptKind, ScriptTarget, type Diagnostic } from "ts-morph";

export type ParseCheck = {
  valid: boolean;
  diagnostics: string[];
};

export function parseSource(path: string, content: string): ParseCheck {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
  });
  const source = project.createSourceFile(path, content, {
    overwrite: true,
    scriptKind: scriptKind(path),
  });
  const diagnostics = project.getProgram().getSyntacticDiagnostics(source).map(formatDiagnostic);
  return { valid: diagnostics.length === 0, diagnostics };
}

export function typecheckSources(files: { path: string; content: string }[]) {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      strict: true,
      target: ScriptTarget.ES2022,
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
      skipLibCheck: true,
      noEmit: true,
    },
  });

  project.createSourceFile(
    "apisync-env.d.ts",
    `declare const process: { env: Record<string, string | undefined> };
declare module "openai" {
  export default class OpenAI {
    constructor(args?: { apiKey?: string });
    completions: { create(input: { model?: string; prompt?: string; max_tokens?: number }): Promise<{ choices: { text?: string }[] }> };
    chat: { completions: { create(input: { model?: string; messages?: unknown[] }): Promise<{ choices: { message?: { content?: string } }[] }> } };
  }
}
declare module "stripe" {
  export default class Stripe {
    constructor(key: string, options?: { apiVersion?: string });
    paymentIntents: { create(input: { amount: number; currency: string; customer: string }): Promise<unknown> };
  }
}
declare module "twilio" {
  export default function twilio(accountSid?: string, authToken?: string): {
    messages: { create(input: { to: string; from?: string; body: string }): Promise<unknown> };
  };
}
`,
  );

  for (const file of files) {
    project.createSourceFile(file.path, file.content, {
      overwrite: true,
      scriptKind: scriptKind(file.path),
    });
  }

  const diagnostics = project
    .getPreEmitDiagnostics()
    .filter((diagnostic) => !isResolutionDiagnostic(diagnostic))
    .map(formatDiagnostic);

  return { valid: diagnostics.length === 0, diagnostics };
}

function isResolutionDiagnostic(diagnostic: Diagnostic) {
  const code = diagnostic.getCode();
  return code === 2307 || code === 2304 || code === 2580 || code === 2792;
}

function formatDiagnostic(diagnostic: Diagnostic) {
  const message = diagnostic.getMessageText();
  return typeof message === "string" ? message : message.getMessageText();
}

function scriptKind(path: string) {
  if (path.endsWith(".tsx")) return ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ScriptKind.JSX;
  if (path.endsWith(".js") || path.endsWith(".mjs") || path.endsWith(".cjs")) return ScriptKind.JS;
  return ScriptKind.TS;
}
