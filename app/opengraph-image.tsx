import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Park — Can I Park Here? We pay your ticket if we're wrong."
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f17",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Top: location chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#10b981",
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 600, color: "#10b981" }}>
            San Francisco · Live
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#f8fafc",
            letterSpacing: -3,
            lineHeight: 1,
            textAlign: "center",
            margin: 0,
          }}
        >
          Can I Park Here?
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "#cbd5e1",
            marginTop: 16,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          We'll pay your ticket if we're wrong.{" "}
          <span style={{ color: "#3b82f6", fontWeight: 700 }}>Up to $100.</span>
        </p>

        {/* Result card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 44,
            padding: "24px 36px",
            borderRadius: 22,
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.25)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              fontSize: 28,
            }}
          >
            ✓
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#10b981",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Yes, park here
            </span>
            <span style={{ fontSize: 16, color: "#94a3b8", marginTop: 4 }}>
              95% confidence · Protected by Ticket Guarantee
            </span>
          </div>
        </div>

        {/* Footer trust line */}
        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            marginTop: 40,
            letterSpacing: 1,
          }}
        >
          95% accuracy · 24h payouts · SF Coverage Live
        </p>
      </div>
    ),
    { ...size },
  )
}
