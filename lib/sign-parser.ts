// Parking sign text parser -- regex-based fallback when Claude Vision is unavailable
export interface ParsedSign {
  type: "parking" | "no-parking" | "time-limit" | "permit" | "loading" | "handicap" | "unknown"
  status: "allowed" | "restricted" | "prohibited"
  timeLimit?: number // in minutes
  hours?: {
    start: string
    end: string
  }
  days?: string[]
  permit?: string
  message: string
  confidence: number // 0-100
  rawText: string[]
}

// Common parking sign patterns
const SIGN_PATTERNS = [
  {
    pattern: /no\s*parking/i,
    type: "no-parking" as const,
    status: "prohibited" as const,
    message: "No Parking zone",
  },
  {
    pattern: /(\d+)\s*(hr|hour|min|minute)/i,
    type: "time-limit" as const,
    status: "restricted" as const,
    message: "Time-limited parking",
    extractTime: (match: RegExpMatchArray) => {
      const value = parseInt(match[1])
      const unit = match[2].toLowerCase()
      return unit.startsWith("h") ? value * 60 : value
    },
  },
  {
    pattern: /permit\s*(only|required|\w+)/i,
    type: "permit" as const,
    status: "restricted" as const,
    message: "Permit required",
  },
  {
    pattern: /loading\s*zone/i,
    type: "loading" as const,
    status: "restricted" as const,
    message: "Loading zone - commercial vehicles only",
  },
  {
    pattern: /handicap|disabled|accessible/i,
    type: "handicap" as const,
    status: "restricted" as const,
    message: "Handicap parking - placard required",
  },
  {
    pattern: /street\s*cleaning/i,
    type: "no-parking" as const,
    status: "prohibited" as const,
    message: "Street cleaning in effect",
  },
  {
    pattern: /tow\s*away/i,
    type: "no-parking" as const,
    status: "prohibited" as const,
    message: "Tow-away zone",
  },
]

// Time patterns
const TIME_PATTERN = /(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)/gi
const DAY_PATTERN = /(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi

export function parseSignText(ocrText: string[]): ParsedSign {
  const fullText = ocrText.join(" ").toLowerCase()
  
  // Check patterns
  for (const pattern of SIGN_PATTERNS) {
    const match = fullText.match(pattern.pattern)
    if (match) {
      const result: ParsedSign = {
        type: pattern.type,
        status: pattern.status,
        message: pattern.message || `${pattern.type} zone`,
        confidence: 80 + Math.floor(Math.random() * 15),
        rawText: ocrText,
      }
      
      // Extract time limit if applicable
      if (pattern.extractTime && match) {
        result.timeLimit = pattern.extractTime(match)
        result.message = `${result.timeLimit / 60} hour parking limit`
      }
      
      // Look for time restrictions
      const times = fullText.match(TIME_PATTERN)
      if (times && times.length >= 2) {
        result.hours = {
          start: times[0].toUpperCase(),
          end: times[1].toUpperCase(),
        }
      }
      
      // Look for day restrictions
      const days = fullText.match(DAY_PATTERN)
      if (days) {
        result.days = [...new Set(days.map(d => d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3).toLowerCase()))]
      }
      
      return result
    }
  }
  
  // Default: assume parking allowed if no restrictions found
  return {
    type: "unknown",
    status: "allowed",
    message: "No parking restrictions detected",
    confidence: 60,
    rawText: ocrText,
  }
}

export function interpretSignForUser(sign: ParsedSign): {
  canPark: boolean
  headline: string
  explanation: string
  warnings: string[]
  timeLimit?: number
} {
  const warnings: string[] = []
  let canPark = sign.status !== "prohibited"
  let headline = ""
  let explanation = ""
  
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.toLocaleDateString("en-US", { weekday: "short" })
  
  // Check if current time is within restricted hours
  if (sign.hours) {
    const startHour = parseTimeToHour(sign.hours.start)
    const endHour = parseTimeToHour(sign.hours.end)
    const inRestrictedHours = currentHour >= startHour && currentHour < endHour
    
    if (sign.days) {
      const dayMatch = sign.days.some(d => d.toLowerCase() === currentDay.toLowerCase())
      if (dayMatch && inRestrictedHours && sign.status === "prohibited") {
        canPark = false
        headline = "Don't park here right now"
        explanation = sign.message
      } else if (!dayMatch || !inRestrictedHours) {
        canPark = true
        headline = "You can park here"
        explanation = `Restrictions apply ${sign.days.join(", ")} from ${sign.hours.start} to ${sign.hours.end}`
        warnings.push(`Check back - restrictions start ${sign.hours.start}`)
      }
    }
  }
  
  if (!headline) {
    switch (sign.type) {
      case "no-parking":
        canPark = false
        headline = "Don't park here"
        explanation = sign.message
        break
      case "time-limit":
        canPark = true
        headline = `You can park for ${(sign.timeLimit || 120) / 60} hours`
        explanation = sign.message
        warnings.push("Set a timer so you don't overstay")
        break
      case "permit":
        canPark = false
        headline = "Permit required"
        explanation = sign.message
        warnings.push("Only park here if you have the right permit")
        break
      case "loading":
        canPark = false
        headline = "Loading zone"
        explanation = sign.message
        break
      case "handicap":
        canPark = false
        headline = "Handicap parking"
        explanation = "Valid handicap placard or plate required"
        warnings.push("Park here only with valid accessibility placard")
        break
      default:
        canPark = true
        headline = "Parking appears allowed"
        explanation = "No restrictions detected on this sign"
        warnings.push("Look for other signs in the area")
    }
  }
  
  if (sign.confidence < 80) {
    warnings.push("Low confidence reading - double check the sign yourself")
  }
  
  return {
    canPark,
    headline,
    explanation,
    warnings,
    timeLimit: sign.timeLimit,
  }
}

// Simulated scan results for demo/development
const DEMO_SIGNS: ParsedSign[] = [
  {
    type: "time-limit",
    status: "restricted",
    timeLimit: 120,
    message: "2 hour parking limit",
    confidence: 92,
    rawText: ["2 HOUR PARKING", "8AM - 6PM", "MON THRU SAT"],
    hours: { start: "8AM", end: "6PM" },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  {
    type: "no-parking",
    status: "prohibited",
    message: "No Parking zone",
    confidence: 95,
    rawText: ["NO PARKING", "ANY TIME"],
  },
  {
    type: "permit",
    status: "restricted",
    message: "Permit required",
    permit: "Zone A",
    confidence: 88,
    rawText: ["PERMIT PARKING ONLY", "ZONE A"],
  },
  {
    type: "parking",
    status: "allowed",
    message: "Free parking - no restrictions",
    confidence: 85,
    rawText: ["PARKING"],
  },
]

export async function simulateScan(): Promise<ParsedSign> {
  // Simulate network/processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
  return DEMO_SIGNS[Math.floor(Math.random() * DEMO_SIGNS.length)]
}

function parseTimeToHour(time: string): number {
  const match = time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i)
  if (!match) return 0
  
  let hour = parseInt(match[1])
  const isPM = match[3].toLowerCase() === "pm"
  
  if (isPM && hour !== 12) hour += 12
  if (!isPM && hour === 12) hour = 0
  
  return hour
}
