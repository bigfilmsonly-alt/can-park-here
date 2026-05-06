/*
 * FIELD TEST CHECKLIST — Run before any public launch
 *
 * Test 1: Clear 2-hour meter sign
 *   Expected: status=allowed, confidence>80, maxMinutes=120
 *
 * Test 2: Street cleaning sign (Tue 7-9AM)
 *   Expected: status=restricted, warnings includes day and time
 *
 * Test 3: Red NO PARKING sign
 *   Expected: status=prohibited, confidence>80
 *
 * Test 4: Cover camera with hand (black frame)
 *   Expected: confidence<30, yellow warning card shown
 *
 * Test 5: Photo of a wall (no sign)
 *   Expected: confidence<30, yellow warning card shown
 *
 * Test 6: Blurry/shaky sign photo
 *   Expected: confidence 30-59, yellow warning card shown
 *
 * Target: 90%+ accuracy across all real-world sign tests
 */

import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a parking sign expert. Analyze the parking sign in this image.
Return ONLY valid JSON — no markdown, no explanation, no backticks, nothing else:
{
  "status": "allowed" | "restricted" | "prohibited",
  "restrictions": [{
    "days": [1,2,3,4,5],
    "startTime": "08:00",
    "endTime": "18:00",
    "maxMinutes": 120,
    "fineAmount": 8200
  }],
  "warnings": ["Street cleaning Tue 7-9AM"],
  "confidence": 92,
  "rawText": "2 HR PARKING 8AM-6PM MON-FRI"
}
Rules:
- fineAmount is in cents (8200 = $82.00)
- days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
- If image has no visible parking sign text: confidence = 0 to 25
- If sign is partially visible or blurry: confidence = 26 to 59
- If sign is clearly readable: confidence = 60 to 100
- status "allowed": parking is legal right now, no immediate restriction
- status "restricted": parking allowed but with limits or upcoming restriction
- status "prohibited": no parking permitted right now
- Return ONLY the JSON. No other text before or after.`

export async function POST(req: NextRequest) {
  try {
    const { image, lat, lng, userId } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 })
    }

    // Call OpenAI GPT-4o Vision
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SYSTEM_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("OpenAI error:", response.status, errText)
      if (response.status === 429) {
        return NextResponse.json({ error: "Too many requests. Try again." }, { status: 429 })
      }
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? "{}"
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({
        status: "restricted",
        confidence: 0,
        reason: "Could not read sign \u2014 please check manually",
        restrictions: [],
        warnings: ["Unable to parse sign. Verify rules before parking."],
        source: "scan",
      })
    }

    return NextResponse.json({
      status: parsed.status ?? "restricted",
      confidence: parsed.confidence ?? 50,
      reason: parsed.rawText ?? "Sign scanned via camera",
      restrictions: parsed.restrictions ?? [],
      warnings: parsed.warnings ?? [],
      source: "scan",
    })
  } catch (err) {
    console.error("scan-sign error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
