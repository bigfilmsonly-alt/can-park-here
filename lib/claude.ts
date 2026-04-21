import Anthropic from "@anthropic-ai/sdk"
import { type ParsedSign, parseSignText } from "./sign-parser"

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return client
}

const SYSTEM_PROMPT = `You are a parking sign analysis expert. You will be shown an image of a parking sign. Your job is to extract all parking rules from the sign and return a structured JSON response.

Analyze the sign and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "type": one of "parking", "no-parking", "time-limit", "permit", "loading", "handicap", "unknown",
  "status": one of "allowed", "restricted", "prohibited",
  "timeLimit": number in minutes (only if there is a time limit, e.g. 120 for 2 hours) or null,
  "hours": { "start": "8:00 AM", "end": "6:00 PM" } or null if no hour restriction,
  "days": ["Mon", "Tue", ...] or null if no day restriction. Use 3-letter abbreviations.,
  "permit": permit zone or type string, or null if not a permit sign,
  "message": a clear one-sentence human-readable summary of the parking rule,
  "confidence": a number from 0-100 indicating how confident you are in the reading. Use 90+ if the text is clearly legible, 70-89 if partially obscured, below 70 if very hard to read,
  "rawText": an array of strings representing the text lines you can read on the sign
}

Rules for classification:
- "no-parking": Signs that say No Parking, No Standing, No Stopping, Tow Away Zone, Street Cleaning
- "time-limit": Signs with hour limits like "2 Hour Parking" or "30 Minute Parking"
- "permit": Signs requiring a parking permit or residential permit
- "loading": Loading zones, commercial vehicle zones
- "handicap": Handicap/disabled/accessible parking signs
- "parking": General parking allowed with no special restrictions
- "unknown": Cannot determine the sign type

For status:
- "prohibited": Parking is not allowed at all (no parking, tow away, etc.)
- "restricted": Parking is allowed but with conditions (time limits, permits, hours, etc.)
- "allowed": Parking is freely allowed with no restrictions`

const USER_PROMPT = `Please analyze this parking sign image. Extract all parking rules, time restrictions, day restrictions, and any other relevant information. Return your analysis as JSON only.`

/**
 * Analyze a parking sign image using Claude Vision.
 * Falls back to the regex-based parser if the API call fails.
 */
export async function analyzeSignImage(imageDataUrl: string): Promise<ParsedSign> {
  try {
    const anthropic = getClient()

    const imageContent = buildImageContent(imageDataUrl)

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            imageContent,
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude")
    }

    const parsed = parseClaudeResponse(textBlock.text)
    return parsed
  } catch (error) {
    console.error("Claude Vision analysis failed, falling back to regex parser:", error)
    return parseSignText(["Unable to read sign"])
  }
}

/**
 * Build the image content block for the Claude API.
 * Supports both base64 data URLs and regular HTTP(S) URLs.
 */
function buildImageContent(imageDataUrl: string): Anthropic.Messages.ImageBlockParam {
  if (imageDataUrl.startsWith("data:")) {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      throw new Error("Invalid data URL format")
    }
    const mediaType = match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    const base64Data = match[2]

    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64Data,
      },
    }
  }

  return {
    type: "image",
    source: {
      type: "url",
      url: imageDataUrl,
    },
  }
}

/**
 * Parse Claude's JSON response into a ParsedSign object.
 * Validates and sanitizes the response to match the expected interface.
 */
function parseClaudeResponse(text: string): ParsedSign {
  // Strip potential markdown code fences
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim()

  const data = JSON.parse(cleaned)

  const validTypes = ["parking", "no-parking", "time-limit", "permit", "loading", "handicap", "unknown"] as const
  const validStatuses = ["allowed", "restricted", "prohibited"] as const

  const type = validTypes.includes(data.type) ? data.type : "unknown"
  const status = validStatuses.includes(data.status) ? data.status : "allowed"

  const result: ParsedSign = {
    type,
    status,
    message: typeof data.message === "string" ? data.message : "Could not interpret sign",
    confidence: typeof data.confidence === "number" ? Math.min(100, Math.max(0, Math.round(data.confidence))) : 50,
    rawText: Array.isArray(data.rawText) ? data.rawText.map(String) : [],
  }

  if (typeof data.timeLimit === "number" && data.timeLimit > 0) {
    result.timeLimit = data.timeLimit
  }

  if (data.hours && typeof data.hours.start === "string" && typeof data.hours.end === "string") {
    result.hours = { start: data.hours.start, end: data.hours.end }
  }

  if (Array.isArray(data.days) && data.days.length > 0) {
    result.days = data.days.map(String)
  }

  if (typeof data.permit === "string" && data.permit) {
    result.permit = data.permit
  }

  return result
}
