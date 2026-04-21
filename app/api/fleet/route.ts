import { createClient } from "@/lib/supabase/server"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/** Columns returned for fleet organisations. */
const ORG_COLUMNS =
  "id, name, owner_id, tier, stripe_subscription_id, vehicle_limit, created_at" as const

/** Columns returned for fleet vehicles. */
const VEHICLE_COLUMNS =
  "id, org_id, plate, make, model, year, driver_id, created_at" as const

// ---------------------------------------------------------------------------
// GET /api/fleet
// ---------------------------------------------------------------------------

export const GET = withErrorHandler(async (request: Request) => {
  const ip = getClientIp(request)
  const limit = rateLimit(`fleet-get:${ip}`, 60, 60_000)
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

  // Find the organisation owned by the user
  const { data: org, error: orgError } = await supabase
    .from("fleet_orgs")
    .select(ORG_COLUMNS)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (orgError) {
    throw orgError
  }

  if (!org) {
    return apiSuccess({ org: null, vehicles: [] })
  }

  // Fetch vehicles belonging to the organisation
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("fleet_vehicles")
    .select(VEHICLE_COLUMNS)
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })

  if (vehiclesError) {
    throw vehiclesError
  }

  return apiSuccess({ org, vehicles: vehicles ?? [] })
})
