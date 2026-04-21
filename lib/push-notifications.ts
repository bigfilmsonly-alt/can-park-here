/**
 * Push Notification client utilities.
 *
 * Handles service worker registration, push subscription management,
 * and communication with the server-side subscription API.
 */

// ---------------------------------------------------------------------------
// Browser support check
// ---------------------------------------------------------------------------

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

// ---------------------------------------------------------------------------
// Service Worker registration
// ---------------------------------------------------------------------------

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    // Wait for the SW to become active if it isn't already
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing!.addEventListener("statechange", function handler() {
          if (this.state === "activated") {
            this.removeEventListener("statechange", handler)
            resolve()
          }
        })
      })
    }

    return registration
  } catch (error) {
    console.error("Service worker registration failed:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Notification permission
// ---------------------------------------------------------------------------

export type PermissionState = "granted" | "denied" | "default"

export async function getNotificationPermission(): Promise<PermissionState> {
  if (!("Notification" in window)) return "denied"

  if (Notification.permission === "default") {
    const result = await Notification.requestPermission()
    return result as PermissionState
  }

  return Notification.permission as PermissionState
}

// ---------------------------------------------------------------------------
// Push subscription
// ---------------------------------------------------------------------------

/**
 * Subscribe the current browser to push notifications.
 * Returns the PushSubscription on success, or null on failure.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  const permission = await getNotificationPermission()
  if (permission !== "granted") return null

  const registration = await registerServiceWorker()
  if (!registration) return null

  // Check for an existing subscription first
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    await sendSubscriptionToServer(existing)
    return existing
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    console.error("VAPID public key is not configured")
    return null
  }

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    })

    await sendSubscriptionToServer(subscription)
    return subscription
  } catch (error) {
    console.error("Push subscription failed:", error)
    return null
  }
}

/**
 * Unsubscribe the current browser from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return true

    // Remove from server first
    await removeSubscriptionFromServer(subscription)

    // Then unsubscribe locally
    const success = await subscription.unsubscribe()
    return success
  } catch (error) {
    console.error("Push unsubscribe failed:", error)
    return false
  }
}

// ---------------------------------------------------------------------------
// Server communication
// ---------------------------------------------------------------------------

/**
 * Send the push subscription to the server so it can send notifications later.
 */
export async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        },
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to send subscription to server:", error)
    return false
  }
}

async function removeSubscriptionFromServer(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const response = await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to remove subscription from server:", error)
    return false
  }
}

// ---------------------------------------------------------------------------
// Background sync helper: queue a community report for later submission
// ---------------------------------------------------------------------------

export async function queueCommunityReport(
  reportData: Record<string, unknown>
): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false
  }

  try {
    // Store the report in IndexedDB
    const db = await openSyncDB()
    const tx = db.transaction("pending-reports", "readwrite")
    tx.objectStore("pending-reports").add({ data: reportData })

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()

    // Request a background sync
    const registration = await navigator.serviceWorker.ready
    await (registration as ServiceWorkerRegistration & {
      sync: { register: (tag: string) => Promise<void> }
    }).sync.register("sync-community-reports")

    return true
  } catch (error) {
    console.error("Failed to queue community report:", error)
    return false
  }
}

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("park-sync", 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("pending-reports")) {
        db.createObjectStore("pending-reports", {
          keyPath: "id",
          autoIncrement: true,
        })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

/**
 * Convert a VAPID base64url string to a Uint8Array for applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Convert an ArrayBuffer (from PushSubscription keys) to a base64 string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ""
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
