import { createClient } from "@/lib/supabase/server"
import {
  CommunityReportsQuerySchema,
  CommunityReportBodySchema,
} from "@/lib/validation"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/** Columns returned to the client (never `SELECT *`). */
const REPORT_COLUMNS =
  "id, type, subtype, coordinates_lat, coordinates_lng, address, description, expires_at, created_at" as const

// ---------------------------------------------------------------------------
// GET /api/community/reports?lat=...&lng=...&radius=...
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  if (!isSupabaseConfigured()) {
    return apiSuccess({ reports: [] })
  }

  // Rate limit: 60 reads per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`community-get:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  // Validate query params through Zod
  const { searchParams } = new URL(request.url)

  const rawLat = searchParams.get("lat")
  const rawLng = searchParams.get("lng")
  const rawRadius = searchParams.get("radius")

  const parsed = CommunityReportsQuerySchema.safeParse({
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

  // Bounding-box approximation (degrees per km at the given latitude).
  const latDelta = radius / 111
  const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))

  const { data, error } = await supabase
    .from("community_reports")
    .select(REPORT_COLUMNS)
    .gte("coordinates_lat", lat - latDelta)
    .lte("coordinates_lat", lat + latDelta)
    .gte("coordinates_lng", lng - lngDelta)
    .lte("coordinates_lng", lng + lngDelta)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    throw error
  }

  return apiSuccess({ reports: data ?? [] })
})

// ---------------------------------------------------------------------------
// POST /api/community/reports
// ---------------------------------------------------------------------------

export const POST = withErrorHandler(async (request: Request) => {
  if (!isSupabaseConfigured()) {
    return apiError(
      "Community reports are not available at this time",
      503,
    )
  }

  // Rate limit: 10 writes per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`community-post:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const body = await validateBody(request, CommunityReportBodySchema)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Authentication required", 401)
  }

  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      user_id: user.id,
      type: body.type,
      subtype: body.subtype,
      coordinates_lat: body.coordinates_lat,
      coordinates_lng: body.coordinates_lng,
      address: body.address ?? null,
      description: body.description ?? null,
      expires_at: body.expires_at ?? null,
    })
    .select(REPORT_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return apiSuccess({ report: data }, 201)
})
