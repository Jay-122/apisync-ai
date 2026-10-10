import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { log } from "@/lib/security/logger";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function toErrorResponse(error: unknown, route: string) {
  if (error instanceof ZodError) {
    return apiError(400, "invalid_input", "Request body failed validation.");
  }

  if (error instanceof ApiError) {
    log("api_error", { route, code: error.code, status: error.status }, "warn");
    return apiError(error.status, error.code, error.message);
  }

  log("api_unexpected", { route, name: error instanceof Error ? error.name : "unknown" }, "error");
  return apiError(500, "internal_error", "Something went wrong. Try again.");
}
