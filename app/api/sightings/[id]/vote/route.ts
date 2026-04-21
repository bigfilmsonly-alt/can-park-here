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

// ---------------------------------------------------------------------------
// POST /api/sightings/[id]/vote – request body schema
// ---------------------------------------------------------------------------

const VoteBodySchema = z.object({
  vote: z.enum(["up", "down"]),
})

// ---------------------------------------------------------------------------
// POST /api/sightings/[id]/vote
// ---------------------------------------------------------------------------

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params

    const ip = getClientIp(request)
    const limit = rateLimit(`sighting-vote:${ip}`, 30, 60_000)
    if (!limit.allowed) {
      return apiError("Too many requests. Please try again later.", 429)
    }

    const body = await validateBody(request, VoteBodySchema)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return apiError("Unauthorized", 401)
    }

    const { data, error } = await supabase.rpc("vote_on_sighting", {
      p_sighting_id: id,
      p_vote: body.vote,
    })

    if (error) {
      throw error
    }

    return apiSuccess({ result: data })
  } catch (err) {
    if (err instanceof ValidationError) {
      return apiError(err.message, 400, err.details)
    }
    console.error("[API]", request.url, err)
    return apiError("Internal server error", 500)
  }
}
