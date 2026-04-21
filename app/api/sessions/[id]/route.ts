import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import {
  apiSuccess,
  apiError,
  ValidationError,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/** Columns returned to the client (excludes geography `location`). */
const SESSION_COLUMNS =
  "id, user_id, check_id, latitude, longitude, address, status, result, is_protected, reminder_set, reminder_time, started_at, ends_at, ended_at, is_active" as const

// ---------------------------------------------------------------------------
// PUT /api/sessions/[id] – request body schema
// ---------------------------------------------------------------------------

const UpdateSessionBodySchema = z.object({
  ended_at: z
    .string()
    .datetime({ message: "ended_at must be a valid ISO 8601 datetime" })
    .nullable()
    .optional(),
  is_active: z.boolean().optional(),
  reminder_set: z.boolean().optional(),
  reminder_time: z
    .string()
    .datetime({ message: "reminder_time must be a valid ISO 8601 datetime" })
    .nullable()
    .optional(),
})

// ---------------------------------------------------------------------------
// PUT /api/sessions/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params

    const ip = getClientIp(request)
    const limit = rateLimit(`session-put:${ip}`, 30, 60_000)
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429)
    }

    const body = await validateBody(request, UpdateSessionBodySchema)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return apiError("Unauthorized", 401)
    }

    const { data, error } = await supabase
      .from("parking_sessions")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(SESSION_COLUMNS)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return apiError("Session not found", 404)
    }

    return apiSuccess({ session: data })
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, 400, err.details)
    }
    console.error("[API]", request.url, err)
    return apiError("Internal server error", 500)
  }
}
