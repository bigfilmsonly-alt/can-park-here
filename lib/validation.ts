/**
 * Centralised Zod schemas for every API input.
 *
 * Keeping all schemas here means:
 *   - route handlers stay thin
 *   - frontend code can re-use the same schemas for client-side validation
 *   - changes to shared shapes are easy to find
 */

import { z } from "zod"

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const LatitudeSchema = z
  .number({
    required_error: "latitude is required",
    invalid_type_error: "latitude must be a number",
  })
  .min(-90, "latitude must be >= -90")
  .max(90, "latitude must be <= 90")

export const LongitudeSchema = z
  .number({
    required_error: "longitude is required",
    invalid_type_error: "longitude must be a number",
  })
  .min(-180, "longitude must be >= -180")
  .max(180, "longitude must be <= 180")

export const AccessibilitySchema = z.object({
  hasHandicapPlacard: z.boolean(),
  placardType: z
    .enum(["permanent", "temporary", "disabled-veteran"])
    .optional(),
  placardExpiry: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), {
      message: "placardExpiry must be a valid ISO date string",
    })
    .optional(),
})

// ---------------------------------------------------------------------------
// POST /api/parking/check
// ---------------------------------------------------------------------------

export const ParkingCheckBodySchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  accessibility: AccessibilitySchema.optional(),
})

export type ParkingCheckBody = z.infer<typeof ParkingCheckBodySchema>

// ---------------------------------------------------------------------------
// POST /api/scan
// ---------------------------------------------------------------------------

/** Maximum payload size for a base-64 data-URL image (5 MB encoded ~= 6.67 M chars). */
const MAX_DATA_URL_LENGTH = 5 * 1024 * 1024 * (4 / 3)

export const ScanBodySchema = z.object({
  imageDataUrl: z
    .string({ required_error: "imageDataUrl is required" })
    .min(1, "imageDataUrl must not be empty")
    .max(MAX_DATA_URL_LENGTH, "Image payload is too large (max 5 MB)")
    .refine(
      (s) =>
        s.startsWith("data:image/") ||
        s.startsWith("https://"),
      {
        message:
          "imageDataUrl must be a base-64 data URL (data:image/...) or an HTTPS image URL",
      },
    ),
})

export type ScanBody = z.infer<typeof ScanBodySchema>

// ---------------------------------------------------------------------------
// GET /api/community/reports  (query params)
// ---------------------------------------------------------------------------

export const CommunityReportsQuerySchema = z.object({
  lat: LatitudeSchema,
  lng: LongitudeSchema,
  /** Search radius in kilometres (clamped to a sensible maximum). */
  radius: z
    .number()
    .min(0.1, "radius must be at least 0.1 km")
    .max(50, "radius must be at most 50 km")
    .default(1),
})

export type CommunityReportsQuery = z.infer<typeof CommunityReportsQuerySchema>

// ---------------------------------------------------------------------------
// POST /api/community/reports
// ---------------------------------------------------------------------------

export const CommunityReportBodySchema = z.object({
  type: z.enum(["enforcement", "meter", "issue"]),
  subtype: z
    .string()
    .min(1, "subtype is required")
    .max(100, "subtype must be 100 characters or fewer"),
  coordinates_lat: LatitudeSchema,
  coordinates_lng: LongitudeSchema,
  address: z
    .string()
    .max(500, "address must be 500 characters or fewer")
    .optional(),
  description: z
    .string()
    .max(2000, "description must be 2000 characters or fewer")
    .optional(),
  expires_at: z
    .string()
    .datetime({ message: "expires_at must be a valid ISO 8601 datetime" })
    .optional(),
})

export type CommunityReportBody = z.infer<typeof CommunityReportBodySchema>
