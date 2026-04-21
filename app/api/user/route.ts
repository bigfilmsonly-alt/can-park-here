import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/** Columns returned to the client (never `SELECT *`). */
const USER_COLUMNS =
  "id, email, name, tier, city, checks_used, checks_reset_at, karma, level, streak, longest_streak, last_check_date, referral_code, referred_by, handicap_enabled, handicap_type, vehicle_plate, vehicle_make, vehicle_model, stats, accessibility, onboarding_complete, biometric_enabled, notifications_enabled, created_at, updated_at" as const

// ---------------------------------------------------------------------------
// PUT /api/user – request body schema
// ---------------------------------------------------------------------------

const UpdateUserBodySchema = z.object({
  name: z.string().max(200, "name must be 200 characters or fewer").optional(),
  city: z.string().max(200, "city must be 200 characters or fewer").optional(),
  handicap_enabled: z.boolean().optional(),
  handicap_type: z.string().max(100).nullable().optional(),
  vehicle_plate: z.string().max(20).nullable().optional(),
  vehicle_make: z.string().max(100).nullable().optional(),
  vehicle_model: z.string().max(100).nullable().optional(),
  accessibility: z
    .object({
      highContrast: z.boolean().optional(),
      largeText: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      dyslexiaFont: z.boolean().optional(),
      screenReaderMode: z.boolean().optional(),
      language: z.string().optional(),
    })
    .optional(),
  onboarding_complete: z.boolean().optional(),
  biometric_enabled: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/user
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`user-get:${ip}`, 60, 60_000)
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
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", user.id)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ user: data })
})

// ---------------------------------------------------------------------------
// PUT /api/user
// ---------------------------------------------------------------------------

export const PUT = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`user-put:${ip}`, 20, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, UpdateUserBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("users")
    .update(body)
    .eq("id", user.id)
    .select(USER_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ user: data })
})
