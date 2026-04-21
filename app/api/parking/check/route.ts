import { checkParking } from "@/lib/parking-rules"
import { ParkingCheckBodySchema } from "@/lib/validation"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/**
 * POST /api/parking/check
 *
 * Accepts { latitude, longitude, accessibility? } and returns a
 * ParkingResult describing whether parking is allowed at that location.
 */
export const POST = withErrorHandler(async (request: Request) => {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`parking-check:${ip}`, 30, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const { latitude, longitude, accessibility } = await validateBody(
    request,
    ParkingCheckBodySchema,
  )

  const result = checkParking(latitude, longitude, accessibility ?? undefined)

  return apiSuccess(result)
})
