import { bumpDependency } from "@/lib/dependencies/detect";
import type { FileTransform } from "@/types";

const TARGET_RANGES: Record<string, string> = {
  openai: "^4.0.0",
};

export function targetDependencyRange(packageName: string, toVersion?: string) {
  if (TARGET_RANGES[packageName]) return TARGET_RANGES[packageName];
  if (toVersion && toVersion !== "unknown") return toVersion.startsWith("^") ? toVersion : `^${toVersion}`;
  return null;
}

export function bumpManifestFile(
  path: string,
  content: string,
  packageName: string,
  range: string,
): FileTransform {
  const modified = bumpDependency(content, packageName, range);
  if (!modified || modified === content) {
    return {
      path,
      original: content,
      modified: content,
      changed: false,
      skipped: false,
      skipReason: `${packageName} was not a dependency in ${path}, or the range is already satisfied.`,
      confidence: 1,
      edits: [],
    };
  }

  return {
    path,
    original: content,
    modified,
    changed: true,
    skipped: false,
    confidence: 0.99,
    edits: [`${packageName} dependency range → ${range}`],
  };
}
