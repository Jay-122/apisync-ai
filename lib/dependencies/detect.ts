export function bumpDependency(manifest: string, packageName: string, range: string) {
  let parsed: { dependencies?: Record<string, string> };
  try {
    parsed = JSON.parse(manifest) as { dependencies?: Record<string, string> };
  } catch {
    return null;
  }

  if (!parsed.dependencies?.[packageName]) return null;
  parsed.dependencies[packageName] = range;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function readDependencyVersions(manifest: string) {
  try {
    const parsed = JSON.parse(manifest) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {}),
    };
  } catch {
    return {};
  }
}

export function detectPackageManager(paths: string[]) {
  if (paths.some((path) => path.endsWith("pnpm-lock.yaml"))) return "pnpm" as const;
  if (paths.some((path) => path.endsWith("yarn.lock"))) return "yarn" as const;
  if (paths.some((path) => path.endsWith("package-lock.json") || path.endsWith("package.json"))) {
    return "npm" as const;
  }
  return "unknown" as const;
}

export function detectEcosystem(paths: string[]) {
  if (paths.some((path) => path.endsWith("package.json"))) return "node" as const;
  if (paths.some((path) => path.endsWith("requirements.txt") || path.endsWith("pyproject.toml"))) {
    return "python" as const;
  }
  if (paths.some((path) => path.endsWith("pom.xml") || path.endsWith("build.gradle"))) return "java" as const;
  if (paths.some((path) => path.endsWith("go.mod"))) return "go" as const;
  return "unknown" as const;
}
