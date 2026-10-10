import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/security/errors";
import { guardRequest } from "@/lib/security/guard";

export function withApi(
  route: string,
  handler: (request: Request) => Promise<NextResponse | Response>,
) {
  return async (request: Request) => {
    const limited = guardRequest(request, route);
    if (limited) return limited;
    try {
      return await handler(request);
    } catch (error) {
      return toErrorResponse(error, route);
    }
  };
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be JSON.");
  }
}
