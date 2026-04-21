import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock next/server before importing the route handler
vi.mock("next/server", () => {
  return {
    NextResponse: {
      json: (body: unknown, init?: ResponseInit) => {
        return {
          status: init?.status ?? 200,
          json: async () => body,
          headers: new Headers(init?.headers),
        }
      },
    },
    NextRequest: vi.fn(),
  }
})

import { GET } from "@/app/api/health/route"

describe("GET /api/health", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    // Restore env vars after each test
    process.env = { ...originalEnv }
  })

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it("returns status ok", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.status).toBe("ok")
  })

  it("returns a valid ISO timestamp", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.timestamp).toBeDefined()
    const parsed = new Date(body.timestamp)
    expect(parsed.getTime()).not.toBeNaN()
  })

  it("returns supabase not_configured when env vars are not set", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await GET()
    const body = await response.json()

    expect(body.services.supabase).toBe("not_configured")
  })

  it("returns supabase configured when both env vars are set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"

    const response = await GET()
    const body = await response.json()

    expect(body.services.supabase).toBe("configured")
  })

  it("returns supabase not_configured when only URL is set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await GET()
    const body = await response.json()

    expect(body.services.supabase).toBe("not_configured")
  })

  it("returns supabase not_configured when only anon key is set", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"

    const response = await GET()
    const body = await response.json()

    expect(body.services.supabase).toBe("not_configured")
  })

  it("returns 200 status code", async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  it("includes Cache-Control no-store header", async () => {
    const response = await GET()
    expect(response.headers.get("Cache-Control")).toBe("no-store")
  })

  it("response body contains exactly the expected keys", async () => {
    const response = await GET()
    const body = await response.json()

    const keys = Object.keys(body).sort()
    expect(keys).toEqual(["services", "status", "timestamp"])
  })
})
