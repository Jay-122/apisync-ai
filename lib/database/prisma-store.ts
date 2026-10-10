import type { MigrationResult } from "@/types";

export async function persistMigration(result: MigrationResult) {
  const { prisma } = await import("@/lib/database/client");
  const migration = await prisma.migration.create({
    data: {
      fromVersion: result.fromVersion,
      toVersion: result.toVersion,
      status: result.status,
      confidence: result.confidence,
      changes: {
        create: result.files
          .filter((file) => file.changed)
          .map((file) => ({
            filePath: file.path,
            description: file.edits.join("; ") || "updated",
            confidence: file.confidence,
          })),
      },
      runs: {
        create: {
          id: result.runId,
          status: result.status,
          timeline: result.timeline,
        },
      },
      pullRequest: {
        create: {
          number: result.pullRequest.number,
          url: result.pullRequest.url,
          branch: result.pullRequest.branch,
          base: result.pullRequest.base,
          status: result.pullRequest.status,
          simulated: result.pullRequest.simulated,
          title: result.pullRequest.title,
          body: result.pullRequest.body,
        },
      },
    },
  });

  return migration.id;
}
