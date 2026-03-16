"use client"

import { WifiOff, Database } from "lucide-react"

interface OfflineBannerProps {
  cachedCount: number
}

export function OfflineBanner({ cachedCount }: OfflineBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-center gap-3 text-amber-800">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You're offline</span>
        {cachedCount > 0 && (
          <>
            <span className="text-amber-400">|</span>
            <span className="text-sm flex items-center gap-1">
              <Database className="h-3 w-3" />
              {cachedCount} saved location{cachedCount !== 1 ? "s" : ""} available
            </span>
          </>
        )}
      </div>
    </div>
  )
}
