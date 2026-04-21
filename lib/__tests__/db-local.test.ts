import { describe, it, expect, beforeEach } from "vitest"
import {
  getLocalUser,
  createLocalUser,
  signInLocal,
  signOutLocal,
  updateLocalUser,
  updateLocalUserStats,
  getLocalActiveSessions,
  getLocalActiveSession,
  createLocalSession,
  endLocalSession,
  addLocalParkingCheck,
  getLocalParkingChecks,
  getLocalSavedLocations,
  saveLocalLocation,
  removeLocalSavedLocation,
  getLocalNearbySightings,
  addLocalSighting,
  voteLocalSighting,
  isLocalOnboardingComplete,
  completeLocalOnboarding,
  resetLocalOnboarding,
  exportLocalAll,
  clearLocalAll,
} from "../db-local"

// crypto.randomUUID and crypto.subtle are needed by db-local
// jsdom provides crypto but subtle may not have digest in all environments
let uuidCounter = 0
beforeEach(() => {
  uuidCounter = 0
})

if (!globalThis.crypto?.subtle?.digest) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => `test-uuid-${++uuidCounter}`,
      subtle: {
        digest: async (_algo: string, data: ArrayBuffer) => {
          const arr = new Uint8Array(data)
          const result = new Uint8Array(32)
          for (let i = 0; i < arr.length && i < 32; i++) {
            result[i] = arr[i]
          }
          return result.buffer
        },
      },
    },
    writable: true,
  })
}

describe("User management", () => {
  it("returns null when no user exists", async () => {
    const user = await getLocalUser()
    expect(user).toBeNull()
  })

  it("creates a user and persists it", async () => {
    const user = await createLocalUser("test@example.com", "Test User", "password123")
    expect(user.email).toBe("test@example.com")
    expect(user.name).toBe("Test User")
    expect(user.tier).toBe("free")
    expect(user.id).toBeTruthy()

    const fetched = await getLocalUser()
    expect(fetched).not.toBeNull()
    expect(fetched!.email).toBe("test@example.com")
  })

  it("signs in with correct credentials", async () => {
    await createLocalUser("test@example.com", "Test", "secret")
    const user = await signInLocal("test@example.com", "secret")
    expect(user).not.toBeNull()
    expect(user!.email).toBe("test@example.com")
  })

  it("rejects sign-in with wrong password", async () => {
    await createLocalUser("test@example.com", "Test", "secret")
    const user = await signInLocal("test@example.com", "wrong")
    expect(user).toBeNull()
  })

  it("rejects sign-in for non-existent user", async () => {
    const user = await signInLocal("nobody@example.com", "pass")
    expect(user).toBeNull()
  })

  it("signs out by removing current user", async () => {
    await createLocalUser("test@example.com", "Test", "secret")
    await signOutLocal()
    const user = await getLocalUser()
    expect(user).toBeNull()
  })

  it("updates user fields", async () => {
    await createLocalUser("test@example.com", "Test", "secret")
    const updated = await updateLocalUser({ name: "New Name" })
    expect(updated).not.toBeNull()
    expect(updated!.name).toBe("New Name")
  })

  it("returns null when updating non-existent user", async () => {
    const result = await updateLocalUser({ name: "Nobody" })
    expect(result).toBeNull()
  })

  it("increments user stats", async () => {
    await createLocalUser("test@example.com", "Test", "secret")
    await updateLocalUserStats("checks", 5)
    const user = await getLocalUser()
    expect(user!.stats.checks).toBe(5)
  })
})

describe("Parking sessions", () => {
  it("returns empty active sessions initially", async () => {
    const sessions = await getLocalActiveSessions()
    expect(sessions).toEqual([])
  })

  it("creates and retrieves a parking session", async () => {
    const session = await createLocalSession({
      check_id: null,
      latitude: 37.78,
      longitude: -122.41,
      address: "123 Main St",
      status: "allowed",
      result: {},
      is_protected: true,
      reminder_set: false,
      reminder_time: null,
      started_at: new Date().toISOString(),
      ends_at: null,
      ended_at: null,
      is_active: true,
    })
    expect(session.address).toBe("123 Main St")
    expect(session.id).toBeTruthy()

    const active = await getLocalActiveSession()
    expect(active).not.toBeNull()
    expect(active!.id).toBe(session.id)
  })

  it("ends a session", async () => {
    const session = await createLocalSession({
      check_id: null,
      latitude: 37.78,
      longitude: -122.41,
      address: "123 Main St",
      status: "allowed",
      result: {},
      is_protected: false,
      reminder_set: false,
      reminder_time: null,
      started_at: new Date().toISOString(),
      ends_at: null,
      ended_at: null,
      is_active: true,
    })
    await endLocalSession(session.id)
    const active = await getLocalActiveSession()
    expect(active).toBeNull()
  })
})

describe("Parking checks (history)", () => {
  it("returns empty checks initially", async () => {
    const checks = await getLocalParkingChecks()
    expect(checks).toEqual([])
  })

  it("adds and retrieves parking checks", async () => {
    const check = await addLocalParkingCheck({
      latitude: 37.79,
      longitude: -122.42,
      address: "456 Oak Ave",
      street: "Oak Ave",
      city: "San Francisco",
      status: "allowed",
      result: { reason: "test" },
      confidence: 0.9,
    })
    expect(check.address).toBe("456 Oak Ave")
    const checks = await getLocalParkingChecks()
    expect(checks.length).toBe(1)
  })

  it("respects limit parameter", async () => {
    for (let i = 0; i < 5; i++) {
      await addLocalParkingCheck({
        latitude: 0,
        longitude: 0,
        address: `Location ${i}`,
        street: null,
        city: null,
        status: "allowed",
        result: {},
        confidence: null,
      })
    }
    const checks = await getLocalParkingChecks(2)
    expect(checks.length).toBe(2)
  })
})

describe("Saved locations", () => {
  it("saves and retrieves locations", async () => {
    const loc = await saveLocalLocation({
      name: "Home",
      address: "789 Elm St",
      latitude: 37.80,
      longitude: -122.43,
      notes: null,
      last_result: null,
    })
    expect(loc.name).toBe("Home")
    const all = await getLocalSavedLocations()
    expect(all.length).toBe(1)
  })

  it("removes a saved location", async () => {
    const loc = await saveLocalLocation({
      name: "Work",
      address: "101 Pine St",
      latitude: 37.81,
      longitude: -122.44,
      notes: null,
      last_result: null,
    })
    await removeLocalSavedLocation(loc.id)
    const all = await getLocalSavedLocations()
    expect(all.length).toBe(0)
  })
})

describe("Enforcement sightings", () => {
  it("adds and retrieves nearby sightings", async () => {
    await addLocalSighting({
      type: "parking_officer",
      latitude: 37.78,
      longitude: -122.41,
      address: "Main St",
      notes: "Officer spotted",
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
    const sightings = await getLocalNearbySightings(37.78, -122.41, 1)
    expect(sightings.length).toBe(1)
  })

  it("filters out distant sightings", async () => {
    await addLocalSighting({
      type: "parking_officer",
      latitude: 37.78,
      longitude: -122.41,
      address: null,
      notes: null,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
    const sightings = await getLocalNearbySightings(40.0, -100.0, 1)
    expect(sightings.length).toBe(0)
  })

  it("votes on a sighting", async () => {
    const sighting = await addLocalSighting({
      type: "tow_truck",
      latitude: 37.78,
      longitude: -122.41,
      address: null,
      notes: null,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
    await voteLocalSighting(sighting.id, "up")
    await voteLocalSighting(sighting.id, "up")
    await voteLocalSighting(sighting.id, "down")
    const sightings = await getLocalNearbySightings(37.78, -122.41)
    // Vote updates depend on user: same anon user means vote is updated not added
    // Since no user is signed in, all votes come from "anonymous"
    // First up, second replaces to up (no change), third replaces to down
    // So net: 1 upvote added initially, then replaced, then replaced with down = 1 up, 1 down from increment logic
    expect(sightings[0].upvotes + sightings[0].downvotes).toBeGreaterThan(0)
  })
})

describe("Onboarding", () => {
  it("defaults to not complete", () => {
    expect(isLocalOnboardingComplete()).toBe(false)
  })

  it("can be completed and reset", () => {
    completeLocalOnboarding()
    expect(isLocalOnboardingComplete()).toBe(true)
    resetLocalOnboarding()
    expect(isLocalOnboardingComplete()).toBe(false)
  })
})

describe("Export and clear", () => {
  it("exports all data", () => {
    const data = exportLocalAll()
    expect(data).toHaveProperty("user")
    expect(data).toHaveProperty("sessions")
    expect(data).toHaveProperty("parkingChecks")
    expect(data).toHaveProperty("savedLocations")
    expect(data).toHaveProperty("sightings")
    expect(data).toHaveProperty("photoEvidence")
    expect(data).toHaveProperty("onboardingComplete")
  })

  it("clears all data", async () => {
    await createLocalUser("test@example.com", "Test", "pass")
    completeLocalOnboarding()
    clearLocalAll()
    const user = await getLocalUser()
    expect(user).toBeNull()
    expect(isLocalOnboardingComplete()).toBe(false)
  })
})
