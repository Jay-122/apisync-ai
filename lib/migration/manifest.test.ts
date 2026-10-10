import { describe, expect, it } from "vitest";
import { bumpManifestFile } from "@/lib/migration/manifest";

describe("manifest bump", () => {
  it("bumps openai in package.json", () => {
    const source = `{
  "dependencies": {
    "openai": "^3.3.0"
  }
}
`;
    const result = bumpManifestFile("package.json", source, "openai", "^4.0.0");
    expect(result.changed).toBe(true);
    expect(result.modified).toContain('"openai": "^4.0.0"');
  });
});
