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

/** Columns returned to the client. */
const CLAIM_COLUMNS =
  "id, user_id, session_id, ticket_amount, ticket_photo_path, ticket_number, description, status, payout_amount, resolved_at, created_at" as const

// ---------------------------------------------------------------------------
// POST /api/claims – request body schema
// ---------------------------------------------------------------------------

const CreateClaimBodySchema = z.object({
  session_id: z.string().uuid("session_id must be a valid UUID").optional(),
  ticket_amount: z
    .number()
    .positive("ticket_amount must be positive")
    .max(100, "ticket_amount must be $100 or less"),
  ticket_number: z
    .string()
    .max(100, "ticket_number must be 100 characters or fewer")
    .nullable()
    .optional(),
  description: z
    .string()
    .min(1, "description is required")
    .max(2000, "description must be 2000 characters or fewer"),
})

// ---------------------------------------------------------------------------
// GET /api/claims
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`claims-get:${ip}`, 60, 60_000)
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
    .from("protection_claims")
    .select(CLAIM_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return apiSuccess({ claims: data ?? [] })
})

// ---------------------------------------------------------------------------
// POST /api/claims
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`claims-post:${ip}`, 5, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, CreateClaimBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  // When a session_id is provided, verify it belongs to the user and has
  // protection enabled. The claim form may omit session_id when the user
  // submits directly from the claim modal.
  let sessionId: string | null = null

  if (body.session_id) {
    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id, is_protected")
      .eq("id", body.session_id)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return apiError("Session not found", 404)
    }

    if (!session.is_protected) {
      return apiError("Session does not have protection enabled", 400)
    }

    sessionId = session.id
  }

  const { data, error } = await supabase
    .from("protection_claims")
    .insert({
      user_id: user.id,
      session_id: sessionId,
      ticket_amount: body.ticket_amount,
      ticket_number: body.ticket_number ?? null,
      description: body.description,
      status: "submitted",
    })
    .select(CLAIM_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ claim: data }, 201)
})
