import type { MigrationResult } from "@/types";
import { log } from "@/lib/security/logger";

const runs: MigrationResult[] = [];

export function listRuns() {
  return runs;
}

export function getRun(id: string) {
  return runs.find((run) => run.migrationId === id || run.runId === id) ?? null;
}

export async function recordMigration(result: MigrationResult) {
  runs.unshift(result);
  if (runs.length > 50) runs.pop();

  if (!process.env.DATABASE_URL) {
    return { persisted: "memory" as const };
  }

  try {
    const { persistMigration } = await import("@/lib/database/prisma-store");
    await Promise.race([
      persistMigration(result),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("database_timeout")), 2000);
      }),
    ]);
    return { persisted: "postgres" as const };
  } catch (error) {
    log("database_persist_failed", { name: error instanceof Error ? error.name : "unknown" }, "warn");
    return { persisted: "memory" as const };
  }
}
