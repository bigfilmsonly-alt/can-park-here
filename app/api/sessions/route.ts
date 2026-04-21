import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LatitudeSchema, LongitudeSchema } from "@/lib/validation"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/** Columns returned to the client (excludes geography `location`). */
const SESSION_COLUMNS =
  "id, user_id, check_id, latitude, longitude, address, status, result, is_protected, reminder_set, reminder_time, started_at, ends_at, ended_at, is_active" as const

// ---------------------------------------------------------------------------
// POST /api/sessions – request body schema
// ---------------------------------------------------------------------------

const CreateSessionBodySchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  address: z.string().max(500, "address must be 500 characters or fewer"),
  status: z.string().min(1, "status is required").max(50),
  result: z.record(z.unknown()).default({}),
  is_protected: z.boolean().default(false),
  ends_at: z
    .string()
    .datetime({ message: "ends_at must be a valid ISO 8601 datetime" })
    .nullable()
    .optional(),
})

// ---------------------------------------------------------------------------
// GET /api/sessions
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sessions-get:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("parking_sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("started_at", { ascending: false })

  if (error) {
    throw error
  }

  return apiSuccess({ sessions: data ?? [] })
})

// ---------------------------------------------------------------------------
// POST /api/sessions
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sessions-post:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, CreateSessionBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("parking_sessions")
    .insert({
      user_id: user.id,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address,
      status: body.status,
      result: body.result,
      is_protected: body.is_protected,
      ends_at: body.ends_at ?? null,
      is_active: true,
    })
    .select(SESSION_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ session: data }, 201)
})
