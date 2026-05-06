import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Park — Can I Park Here? We pay your ticket if we're wrong. Up to $100."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(155deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Left side — result card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "460px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "24px",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Status badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "999px",
                padding: "6px 14px",
                width: "fit-content",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#166534", letterSpacing: "0.02em" }}>
                ALLOWED · 95% CONFIDENT
              </span>
            </div>

            {/* Headline */}
            <div style={{ fontSize: 42, fontWeight: 800, color: "#0f172a", letterSpacing: -1.5, marginTop: 16, lineHeight: 1 }}>
              Yes — park here.
            </div>

            {/* Location */}
            <div style={{ fontSize: 16, color: "#64748b", marginTop: 10 }}>
              Valencia St & 20th · Mission, SF
            </div>

            {/* Guarantee */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: "12px",
                padding: "10px 14px",
                marginTop: 20,
              }}
            >
              <span style={{ fontSize: 18 }}>🛡</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>
                Protected by $100 Ticket Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Right side — headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingLeft: "60px",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.05 }}>
            Can I park
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1.05 }}>
            here?
          </div>

          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.8)", marginTop: 16, lineHeight: 1.5 }}>
            We pay your ticket if we're wrong.
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#4ade80", marginTop: 4 }}>
            Up to $100.
          </div>

          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
            No other app does this.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "48px",
            background: "rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>95% accuracy</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>24hr payouts</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>SF + Miami Live</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>can-park-here.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
