const SECRET_KEYS = [
  "privatekey",
  "private_key",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "password",
  "content",
  "source",
  "code",
];

function isSecretKey(key: string) {
  const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return SECRET_KEYS.some((secret) => normalized.includes(secret));
}

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    output[key] = isSecretKey(key) ? "[redacted]" : redact(entry);
  }
  return output;
}

export function log(
  event: string,
  fields: Record<string, unknown> = {},
  level: "info" | "warn" | "error" = "info",
) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(redact(fields) as Record<string, unknown>),
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
