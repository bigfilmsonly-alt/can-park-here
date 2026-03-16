"use client"

import { WifiOff, CloudOff } from "lucide-react"

interface OfflineIndicatorProps {
  isOnline: boolean
  cachedCount: number
}

export function OfflineIndicator({ isOnline, cachedCount }: OfflineIndicatorProps) {
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>You're offline</span>
        {cachedCount > 0 && (
          <span className="opacity-75">
            · {cachedCount} saved location{cachedCount !== 1 ? "s" : ""} available
          </span>
        )}
      </div>
    </div>
  )
}

export function OfflineBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
      <CloudOff className="h-3 w-3" />
      <span>Cached</span>
    </div>
  )
}
