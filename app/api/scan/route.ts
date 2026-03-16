import { NextResponse } from "next/server"
import { z } from "zod"

const BodySchema = z.object({
  imageDataUrl: z.string().refine((s) => s.startsWith("data:image/") || s.startsWith("http"), {
    message: "Must be a data URL or image URL",
  }),
})

/**
 * Scan parking sign from image.
 * Placeholder - in production integrate with Google Cloud Vision OCR.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // TODO: Integrate Google Cloud Vision OCR
    // const vision = require('@google-cloud/vision');
    // const [result] = await client.textDetection({ image: { content: base64 } });

    return NextResponse.json({
      success: true,
      text: "",
      rules: [],
      message: "OCR not yet integrated. Using mock data.",
    })
  } catch (e) {
    console.error("Scan error:", e)
    return NextResponse.json({ error: "Failed to scan image" }, { status: 500 })
  }
}
