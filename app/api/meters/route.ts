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

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const MetersQuerySchema = z.object({
  lat: LatitudeSchema,
  lng: LongitudeSchema,
  radius: z
    .number()
    .min(0.1, "radius must be at least 0.1 km")
    .max(50, "radius must be at most 50 km")
    .default(1),
})

const ReportMeterBodySchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  address: z
    .string()
    .max(500, "address must be 500 characters or fewer")
    .nullable()
    .optional(),
  status: z.enum(["working", "broken", "card_only", "coins_only", "free"]),
})

// ---------------------------------------------------------------------------
// GET /api/meters?lat=...&lng=...&radius=...
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`meters-get:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const { searchParams } = new URL(request.url)

  const rawLat = searchParams.get("lat")
  const rawLng = searchParams.get("lng")
  const rawRadius = searchParams.get("radius")

  const parsed = MetersQuerySchema.safeParse({
    lat: rawLat !== null ? Number(rawLat) : undefined,
    lng: rawLng !== null ? Number(rawLng) : undefined,
    radius: rawRadius !== null ? Number(rawRadius) : undefined,
  })

  if (!parsed.success) {
    return apiError(
      "Invalid query parameters",
      400,
      parsed.error.flatten(),
    )
  }

  const { lat, lng, radius } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase.rpc("get_nearby_meters", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: Math.round(radius * 1000), // convert km to meters
  })

  if (error) {
    throw error
  }

  return apiSuccess({ meters: data ?? [] })
})

// ---------------------------------------------------------------------------
// POST /api/meters
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`meters-post:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, ReportMeterBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("meter_reports")
    .insert({
      user_id: user.id,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address ?? null,
      status: body.status,
    })
    .select("id, user_id, latitude, longitude, address, status, created_at")
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ meter: data }, 201)
})
