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

const SightingsQuerySchema = z.object({
  lat: LatitudeSchema,
  lng: LongitudeSchema,
  radius: z
    .number()
    .min(0.1, "radius must be at least 0.1 km")
    .max(50, "radius must be at most 50 km")
    .default(1),
})

const CreateSightingBodySchema = z.object({
  type: z.enum(["parking_officer", "tow_truck", "meter_maid", "police"]),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  address: z
    .string()
    .max(500, "address must be 500 characters or fewer")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(2000, "notes must be 2000 characters or fewer")
    .nullable()
    .optional(),
})

// ---------------------------------------------------------------------------
// GET /api/sightings?lat=...&lng=...&radius=...
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sightings-get:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const { searchParams } = new URL(request.url)

  const rawLat = searchParams.get("lat")
  const rawLng = searchParams.get("lng")
  const rawRadius = searchParams.get("radius")

  const parsed = SightingsQuerySchema.safeParse({
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

  const { data, error } = await supabase.rpc("get_nearby_sightings", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: Math.round(radius * 1000), // convert km to meters
  })

  if (error) {
    throw error
  }

  return apiSuccess({ sightings: data ?? [] })
})

// ---------------------------------------------------------------------------
// POST /api/sightings
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`sightings-post:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, CreateSightingBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  const { data, error } = await supabase
    .from("enforcement_sightings")
    .insert({
      user_id: user.id,
      type: body.type,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address ?? null,
      notes: body.notes ?? null,
    })
    .select("id, user_id, type, latitude, longitude, address, notes, upvotes, downvotes, expires_at, created_at")
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ sighting: data }, 201)
})
