import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeChangelog } from "@/lib/ai/changelogAnalyzer";
import { withApi, readJson } from "@/lib/api/http";

const schema = z.object({
  packageName: z.string().min(1),
  fromVersion: z.string().optional(),
  toVersion: z.string().optional(),
  releaseNotes: z.string().max(20_000).optional(),
});

export const POST = withApi("/api/migration/analyze", async (request) => {
  const body = schema.parse(await readJson(request));
  const analysis = await analyzeChangelog(body);
  return NextResponse.json(analysis);
});
