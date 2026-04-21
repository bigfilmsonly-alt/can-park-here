import { NextResponse } from "next/server"
import type { z } from "zod"

// ---------------------------------------------------------------------------
// Standard API response helpers
// ---------------------------------------------------------------------------

interface ApiErrorBody {
  ok: false
  error: string
  details?: unknown
}

interface ApiSuccessBody<T> {
  ok: true
  data: T
}

/**
 * Return a standardised JSON error response.
 */
export function apiError(
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { ok: false, error: message }
  if (details !== undefined) {
    body.details = details
  }
  return NextResponse.json(body, { status })
}

/**
 * Return a standardised JSON success response.
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ ok: true, data }, { status })
}

// ---------------------------------------------------------------------------
// Validation error – thrown by validateBody so withErrorHandler can catch it
// ---------------------------------------------------------------------------

export class ValidationError extends Error {
  details: unknown

  constructor(message: string, details: unknown) {
    super(message)
    this.name = "ValidationError"
    this.details = details
  }
}

// ---------------------------------------------------------------------------
// Request body validator
// ---------------------------------------------------------------------------

/**
 * Parse the JSON body of a Request against a Zod schema.
 * Throws a `ValidationError` if parsing fails – caught by `withErrorHandler`.
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw new ValidationError("Invalid JSON in request body", null)
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new ValidationError(
      "Request validation failed",
      result.error.flatten(),
    )
  }

  return result.data
}

// ---------------------------------------------------------------------------
// Error-handling wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps an API route handler so that any unhandled error is converted into
 * a safe 500 response with no stack trace leakage.
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>,
): (req: Request) => Promise<NextResponse> {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (err) {
      if (err instanceof ValidationError) {
        return apiError(err.message, 400, err.details)
      }

      // Log full error on the server for debugging
      console.error("[API]", req.url, err)

      return apiError("Internal server error", 500)
    }
  }
}

// ---------------------------------------------------------------------------
// Auth wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a handler with Supabase auth checking.
 *
 * When Supabase is configured, it verifies the user session and passes the
 * authenticated `userId` to the inner handler. When Supabase is **not**
 * configured (local dev), it falls back to reading an `x-user-id` header,
 * or defaults to `"anonymous"`.
 */
export function withAuth(
  handler: (req: Request, userId: string) => Promise<NextResponse>,
): (req: Request) => Promise<NextResponse> {
  return withErrorHandler(async (req: Request): Promise<NextResponse> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      // Dynamic import so the module is not loaded when Supabase is absent
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return apiError("Unauthorized", 401)
      }

      return handler(req, user.id)
    }

    // Fallback: simple header or anonymous
    const headerUserId = req.headers.get("x-user-id")
    return handler(req, headerUserId || "anonymous")
  })
}

// ---------------------------------------------------------------------------
// In-memory rate limiter
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent unbounded growth
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanupExpiredEntries(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Simple in-memory rate limiter (suitable for single-instance deployments).
 *
 * Returns `{ allowed: true }` when the request is within the limit, or
 * `{ allowed: false, retryAfterMs }` when the limit is exceeded.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  cleanupExpiredEntries()

  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt <= now) {
    // First request in window or previous window expired
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count < maxRequests) {
    entry.count += 1
    return { allowed: true }
  }

  return { allowed: false, retryAfterMs: entry.resetAt - now }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the client IP from a request (best-effort).
 * Uses the standard `x-forwarded-for` header, falling back to
 * `x-real-ip` or a constant when running locally.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1"
}
