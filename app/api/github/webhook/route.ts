import { NextResponse } from "next/server";
import { receiveWebhook } from "@/lib/github/webhook";
import { toErrorResponse } from "@/lib/security/errors";
import { guardRequest } from "@/lib/security/guard";

export async function POST(request: Request) {
  const limited = guardRequest(request, "/api/github/webhook");
  if (limited) return limited;

  try {
    const payload = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const eventName = request.headers.get("x-github-event") ?? "unknown";
    const result = await receiveWebhook(payload, signature, eventName);
    return NextResponse.json({ message: result.message }, { status: result.status });
  } catch (error) {
    return toErrorResponse(error, "/api/github/webhook");
  }
}
