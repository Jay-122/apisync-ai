type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();
const LIMIT = 30;
const WINDOW_MS = 60_000;

export function rateLimit(key: string, limit = LIMIT) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor(elapsed / WINDOW_MS) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + refill);
  bucket.updatedAt = refill > 0 ? now : bucket.updatedAt;

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return { ok: false as const, retryAfter: 60 };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true as const, retryAfter: 0 };
}

export function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
