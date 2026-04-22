import { z } from "zod"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

// ---------------------------------------------------------------------------
// POST body schema
// ---------------------------------------------------------------------------

const SyncGamificationBodySchema = z.object({
  karma: z.number().int().min(0),
  level: z.number().int().min(1),
  streak: z.number().int().min(0),
  longest_streak: z.number().int().min(0),
  last_check_date: z.string().nullable(),
})

// ---------------------------------------------------------------------------
// GET /api/user/sync-gamification
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sync-gamification-get:${ip}`, 30, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return apiSuccess(null)
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiSuccess(null)
  }

  const { data, error } = await supabase
    .from("users")
    .select("karma, level, streak, longest_streak, last_check_date")
    .eq("id", user.id)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess(data)
})

// ---------------------------------------------------------------------------
// POST /api/user/sync-gamification
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sync-gamification-post:${ip}`, 30, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return apiSuccess(null)
  }

  const body = await validateBody(request, SyncGamificationBodySchema)

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiSuccess(null)
  }

  const { error } = await supabase
    .from("users")
    .update({
      karma: body.karma,
      level: body.level,
      streak: body.streak,
      longest_streak: body.longest_streak,
      last_check_date: body.last_check_date,
    })
    .eq("id", user.id)

  if (error) {
    throw error
  }

  return apiSuccess({ synced: true })
})
