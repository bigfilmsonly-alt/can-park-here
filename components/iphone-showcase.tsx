import { ReactNode } from "react"
import { ParkLogo, Wordmark } from "@/components/park-logo"

export function ShowcaseWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="showcase-root">
      {/* Marketing header — desktop only (hidden on mobile via CSS) */}
      <div className="showcase-header">
        <div className="flex items-center gap-3 mb-3">
          <ParkLogo size={40} />
          <Wordmark size={28} className="text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
          Can I Park Here?
        </h1>
        <p className="text-sm lg:text-base text-white/50 mt-1.5">
          Clear answers. No tickets. No confusion.
        </p>
      </div>

      {/* iPhone device — frame elements hidden on mobile via CSS */}
      <div className="iphone-device">
        {/* Side buttons */}
        <div className="iphone-btn iphone-btn-silent" />
        <div className="iphone-btn iphone-btn-vol-up" />
        <div className="iphone-btn iphone-btn-vol-down" />
        <div className="iphone-btn iphone-btn-power" />

        {/* Titanium frame */}
        <div className="iphone-frame">
          <div className="iphone-screen">
            {/* Dynamic Island */}
            <div className="iphone-island" />

            {/* App content — always rendered, frame wraps on desktop */}
            <div className="iphone-app">{children}</div>

            {/* Home indicator */}
            <div className="iphone-home" />
          </div>
        </div>
      </div>

      {/* Footer — desktop only */}
      <div className="showcase-footer">
        <p className="text-xs text-white/30">
          Built with Next.js &middot; Powered by AI
        </p>
      </div>
    </div>
  )
}
