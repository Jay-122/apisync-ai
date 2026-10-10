import { ApiError } from "@/lib/security/errors";

export function githubConfig() {
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const appId = process.env.GITHUB_APP_ID;
  return {
    appId,
    privateKey,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    slug: process.env.GITHUB_APP_SLUG,
    configured: Boolean(appId && privateKey),
  };
}

export function assertGithubConfigured() {
  const config = githubConfig();
  if (!config.configured || !config.appId || !config.privateKey) {
    throw new ApiError(
      503,
      "github_not_configured",
      "GitHub App credentials are not configured on this server.",
    );
  }
  return config;
}
