import { z } from "zod";

export const breakingChangeSchema = z.object({
  description: z.string().min(1),
  oldPattern: z.string().min(1),
  newPattern: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const changelogSchema = z.object({
  package: z.string().min(1),
  fromVersion: z.string().min(1),
  toVersion: z.string().min(1),
  breakingChanges: z.array(breakingChangeSchema),
});

export type ChangelogDraft = z.infer<typeof changelogSchema>;

export const migrationRequestSchema = z.object({
  mode: z.enum(["demo", "github"]).default("demo"),
  dependency: z.string().min(1).optional(),
  owner: z.string().min(1).optional(),
  repo: z.string().min(1).optional(),
  createPr: z.boolean().optional(),
  releaseNotes: z.string().max(20_000).optional(),
});

export const scanRequestSchema = z.object({
  mode: z.enum(["demo", "github"]).default("demo"),
  owner: z.string().min(1).optional(),
  repo: z.string().min(1).optional(),
});

export const githubRepoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string().min(1).optional(),
  dependency: z.string().min(1).optional(),
});
