"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"

export function SwUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setShowUpdate(true)
          }
        })
      })
    })
  }, [])

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" })
    setShowUpdate(false)
    window.location.reload()
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] max-w-md mx-auto sw-update-enter">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderRadius: 16,
          background: "var(--park-fg)",
          color: "var(--park-bg)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <RefreshCw style={{ width: 18, height: 18, flexShrink: 0 }} strokeWidth={2} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
          New version available
        </span>
        <button
          onClick={handleUpdate}
          className="press"
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--park-accent)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Update
        </button>
      </div>
    </div>
  )
}
