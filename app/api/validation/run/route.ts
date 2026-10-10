import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/http";
import { runDemoMigration } from "@/lib/migration/service";

export const POST = withApi("/api/validation/run", async () => {
  const result = await runDemoMigration();
  return NextResponse.json({
    migrationId: result.migrationId,
    status: result.status,
    validation: result.validation,
    pullRequest: {
      status: result.pullRequest.status,
      simulated: result.pullRequest.simulated,
    },
  });
});
