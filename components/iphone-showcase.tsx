import { ReactNode } from "react"

export function ShowcaseWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="showcase-root">
      {/* iPhone device — phone only, no surrounding text */}
      <div className="iphone-device">
        <div className="iphone-btn iphone-btn-silent" />
        <div className="iphone-btn iphone-btn-vol-up" />
        <div className="iphone-btn iphone-btn-vol-down" />
        <div className="iphone-btn iphone-btn-power" />

        <div className="iphone-frame">
          <div className="iphone-screen">
            <div className="iphone-island" />
            <div className="iphone-app">{children}</div>
            <div className="iphone-home" />
          </div>
        </div>
      </div>
    </div>
  )
}
