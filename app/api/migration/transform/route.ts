import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/http";
import { runDemoMigration } from "@/lib/migration/service";

export const POST = withApi("/api/migration/transform", async () => {
  const result = await runDemoMigration();
  return NextResponse.json({
    migrationId: result.migrationId,
    runId: result.runId,
    files: result.files,
    confidence: result.confidence,
    filesChanged: result.filesChanged,
    additions: result.additions,
    deletions: result.deletions,
    explanation: result.explanation,
  });
});
