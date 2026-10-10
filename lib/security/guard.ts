import { apiError } from "@/lib/security/errors";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export function guardRequest(request: Request, route: string) {
  const limit = rateLimit(`${route}:${clientKey(request)}`);
  if (!limit.ok) {
    return apiError(429, "rate_limited", "Too many requests. Wait a minute and try again.");
  }
  return null;
}
