import "@testing-library/jest-dom/vitest"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
})

// Mock navigator.geolocation
const geolocationMock: Geolocation = {
  getCurrentPosition: vi.fn((success) => {
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })
  }),
  watchPosition: vi.fn(() => 1),
  clearWatch: vi.fn(),
}

Object.defineProperty(globalThis.navigator, "geolocation", {
  value: geolocationMock,
  writable: true,
})

// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear()
})
