import { Webhooks } from "@octokit/webhooks";
import { githubConfig } from "@/lib/github/config";
import { log } from "@/lib/security/logger";

const HANDLED = new Set(["push", "installation", "repository", "pull_request"]);

export async function receiveWebhook(payload: string, signature: string | null, eventName: string) {
  const { webhookSecret } = githubConfig();
  if (!webhookSecret) {
    return { ok: false as const, status: 503, message: "Webhook secret is not configured." };
  }
  if (!signature) {
    return { ok: false as const, status: 401, message: "Missing webhook signature." };
  }

  const webhooks = new Webhooks({ secret: webhookSecret });
  const valid = await webhooks.verify(payload, signature);
  if (!valid) {
    return { ok: false as const, status: 401, message: "Webhook signature did not match." };
  }

  if (!HANDLED.has(eventName)) {
    log("github_webhook_ignored", { event: eventName });
    return { ok: true as const, status: 202, message: "Event ignored." };
  }

  let body: { action?: string; repository?: { full_name?: string } };
  try {
    body = JSON.parse(payload) as { action?: string; repository?: { full_name?: string } };
  } catch {
    return { ok: false as const, status: 400, message: "Webhook payload was not JSON." };
  }
  log("github_webhook", {
    event: eventName,
    action: body.action ?? "none",
    repository: body.repository?.full_name ?? "unknown",
  });

  return {
    ok: true as const,
    status: 202,
    message: "Webhook accepted. Automatic migration still waits for a reviewable proposal.",
  };
}
