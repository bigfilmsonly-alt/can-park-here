import { analyzeSignImage } from "@/lib/claude"
import { parseSignText, interpretSignForUser } from "@/lib/sign-parser"
import { ScanBodySchema } from "@/lib/validation"
import {
  apiSuccess,
  apiError,
  withErrorHandler,
  validateBody,
  rateLimit,
  getClientIp,
} from "@/lib/api-utils"

/**
 * POST /api/scan
 *
 * Accepts { imageDataUrl } (a base-64 data URL or HTTPS URL of a
 * parking sign photo) and returns the parsed sign data + a
 * human-readable interpretation.
 *
 * Uses Claude Vision when ANTHROPIC_API_KEY is set; otherwise falls
 * back to a regex-based parser.
 */
export const POST = withErrorHandler(async (request: Request) => {
  // Rate limit: scanning is expensive -- 10 requests per minute per IP
  const ip = getClientIp(request)
  const limit = rateLimit(`scan:${ip}`, 10, 60_000)
  if (!limit.allowed) {
    return apiError("Too many requests. Please try again later.", 429)
  }

  const { imageDataUrl } = await validateBody(request, ScanBodySchema)

  let sign
  let aiPowered = false

  if (process.env.ANTHROPIC_API_KEY) {
    sign = await analyzeSignImage(imageDataUrl)
    aiPowered = true
  } else {
    // No API key configured -- fall back to the regex-based parser.
    // Without OCR the image cannot actually be read, so we return a
    // best-effort result based on an empty text input.
    console.warn("ANTHROPIC_API_KEY not set. Using regex fallback parser.")
    sign = parseSignText([""])
  }

  const interpretation = interpretSignForUser(sign)

  return apiSuccess({ sign, interpretation, aiPowered })
})
