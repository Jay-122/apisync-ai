import { Node, Project, SyntaxKind } from "ts-morph";
import type { CodebaseDependencyUsage } from "@/types";

const SUPPORTED = ["openai", "stripe", "twilio"] as const;

export function analyzeDependencyUsage(
  files: { path: string; content: string }[],
  versions: Record<string, string>,
): CodebaseDependencyUsage[] {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { strict: true },
  });

  const usage = new Map<string, CodebaseDependencyUsage>();

  for (const file of files) {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file.path)) continue;
    const source = project.createSourceFile(file.path, file.content, { overwrite: true });

    for (const statement of source.getImportDeclarations()) {
      const packageName = supportedPackage(statement.getModuleSpecifierValue());
      if (!packageName) continue;

      const current = usage.get(packageName) ?? {
        packageName,
        version: versions[packageName] ?? "unknown",
        files: [],
        imports: [],
        usageCount: 0,
      };

      if (!current.files.includes(file.path)) current.files.push(file.path);

      const imported = [
        statement.getDefaultImport()?.getText(),
        ...statement.getNamedImports().map((item) => item.getName()),
      ].filter((name): name is string => Boolean(name));

      for (const name of imported) {
        if (!current.imports.includes(name)) current.imports.push(name);
      }

      current.usageCount += source.getDescendantsOfKind(SyntaxKind.Identifier).filter((node) => {
        if (!imported.includes(node.getText())) return false;
        const parent = node.getParent();
        return !Node.isImportSpecifier(parent) && !Node.isImportClause(parent);
      }).length;

      usage.set(packageName, current);
    }
  }

  return [...usage.values()];
}

function supportedPackage(moduleName: string) {
  return SUPPORTED.find((name) => moduleName === name || moduleName.startsWith(`${name}/`));
}
