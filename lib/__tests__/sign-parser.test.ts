import { describe, it, expect } from "vitest"
import { parseSignText, interpretSignForUser, type ParsedSign } from "../sign-parser"

describe("parseSignText", () => {
  it("detects no-parking signs", () => {
    const result = parseSignText(["NO PARKING", "ANY TIME"])
    expect(result.type).toBe("no-parking")
    expect(result.status).toBe("prohibited")
  })

  it("detects time-limit signs with hours", () => {
    const result = parseSignText(["2 HOUR PARKING", "8 AM TO 6 PM"])
    expect(result.type).toBe("time-limit")
    expect(result.status).toBe("restricted")
    expect(result.timeLimit).toBe(120)
  })

  it("detects time-limit signs with minutes", () => {
    const result = parseSignText(["30 MINUTE PARKING"])
    expect(result.type).toBe("time-limit")
    expect(result.timeLimit).toBe(30)
  })

  it("detects permit-only signs", () => {
    const result = parseSignText(["PERMIT ONLY", "ZONE A"])
    expect(result.type).toBe("permit")
    expect(result.status).toBe("restricted")
  })

  it("detects loading zone signs", () => {
    const result = parseSignText(["LOADING ZONE"])
    expect(result.type).toBe("loading")
    expect(result.status).toBe("restricted")
  })

  it("detects handicap signs", () => {
    const result = parseSignText(["HANDICAP PARKING ONLY"])
    expect(result.type).toBe("handicap")
    expect(result.status).toBe("restricted")
  })

  it("detects street cleaning signs", () => {
    const result = parseSignText(["STREET CLEANING", "TUESDAY 8AM-10AM"])
    expect(result.type).toBe("no-parking")
    expect(result.status).toBe("prohibited")
    expect(result.message).toBe("Street cleaning in effect")
  })

  it("returns 'unknown' for unrecognized signs", () => {
    const result = parseSignText(["SPEED LIMIT 25"])
    expect(result.type).toBe("unknown")
    expect(result.status).toBe("allowed")
    expect(result.confidence).toBe(60)
  })

  it("extracts day restrictions from text", () => {
    const result = parseSignText(["NO PARKING", "MONDAY WEDNESDAY FRIDAY"])
    expect(result.type).toBe("no-parking")
    expect(result.days).toBeDefined()
    expect(result.days!.length).toBe(3)
  })

  it("preserves raw text in result", () => {
    const input = ["SOME SIGN", "TEXT HERE"]
    const result = parseSignText(input)
    expect(result.rawText).toEqual(input)
  })
})

describe("interpretSignForUser", () => {
  it("interprets no-parking sign as cannot park", () => {
    const sign: ParsedSign = {
      type: "no-parking",
      status: "prohibited",
      message: "No Parking zone",
      confidence: 95,
      rawText: ["NO PARKING"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(false)
    expect(result.headline).toBe("Don't park here")
  })

  it("interprets time-limit sign as can park with limit", () => {
    const sign: ParsedSign = {
      type: "time-limit",
      status: "restricted",
      timeLimit: 120,
      message: "2 hour parking limit",
      confidence: 90,
      rawText: ["2 HOUR PARKING"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(true)
    expect(result.headline).toContain("2 hours")
    expect(result.timeLimit).toBe(120)
    expect(result.warnings).toContain("Set a timer so you don't overstay")
  })

  it("interprets permit sign as cannot park", () => {
    const sign: ParsedSign = {
      type: "permit",
      status: "restricted",
      message: "Permit required",
      confidence: 90,
      rawText: ["PERMIT ONLY"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(false)
    expect(result.headline).toBe("Permit required")
  })

  it("interprets handicap sign as cannot park without placard", () => {
    const sign: ParsedSign = {
      type: "handicap",
      status: "restricted",
      message: "Handicap parking",
      confidence: 95,
      rawText: ["HANDICAP"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(false)
    expect(result.headline).toBe("Handicap parking")
  })

  it("interprets unknown sign as can park with warning", () => {
    const sign: ParsedSign = {
      type: "unknown",
      status: "allowed",
      message: "No restrictions detected",
      confidence: 60,
      rawText: ["SOMETHING"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(true)
    expect(result.headline).toBe("Parking appears allowed")
    expect(result.warnings).toContain("Low confidence reading - double check the sign yourself")
  })

  it("adds low-confidence warning when confidence is below 80", () => {
    const sign: ParsedSign = {
      type: "no-parking",
      status: "prohibited",
      message: "No Parking zone",
      confidence: 70,
      rawText: ["NO PARKING"],
    }
    const result = interpretSignForUser(sign)
    expect(result.warnings).toContain("Low confidence reading - double check the sign yourself")
  })

  it("interprets loading zone as cannot park", () => {
    const sign: ParsedSign = {
      type: "loading",
      status: "restricted",
      message: "Loading zone",
      confidence: 90,
      rawText: ["LOADING ZONE"],
    }
    const result = interpretSignForUser(sign)
    expect(result.canPark).toBe(false)
    expect(result.headline).toBe("Loading zone")
  })
})
