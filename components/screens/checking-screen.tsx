"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

interface CheckingScreenProps {
  onComplete?: () => void
}

const phases = [
  "Reading the signs\u2026",
  "Checking city rules\u2026",
  "Cross-checking the clock\u2026",
]

export function CheckingScreen({ onComplete }: CheckingScreenProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (phase < phases.length - 1) {
      const timer = setTimeout(() => setPhase((p) => p + 1), 550)
      return () => clearTimeout(timer)
    }

    // Final phase reached -- fire onComplete after a short delay
    if (phase === phases.length - 1 && onComplete) {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
      style={{ background: "var(--background)" }}
    >
      {/* Subtle radial gradient pulse background */}
      <div
        className="absolute inset-0 radial-pulse pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(52,199,89,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Spinning ring + pin */}
      <div className="relative breathe-glow rounded-full" style={{ width: 140, height: 140 }}>
        {/* Outer spinning ring */}
        <svg
          className="absolute inset-0 animate-checking-spin"
          width="140"
          height="140"
          viewBox="0 0 140 140"
        >
          <circle
            cx="70"
            cy="70"
            r="67"
            fill="none"
            strokeWidth="3"
            stroke="var(--border)"
          />
          <circle
            cx="70"
            cy="70"
            r="67"
            fill="none"
            strokeWidth="3"
            stroke="var(--accent)"
            strokeDasharray="105 316"
            strokeLinecap="round"
          />
        </svg>

        {/* Inner circle with map pin */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 92,
            height: 92,
            top: 24,
            left: 24,
            background: "var(--accent-pale)",
          }}
        >
          <MapPin
            style={{ width: 50, height: 50, color: "var(--accent)" }}
            strokeWidth={1.8}
          />
        </div>
      </div>

      {/* Title */}
      <h2
        className="mt-8 font-bold"
        style={{ fontSize: 24, letterSpacing: -0.8, color: "var(--foreground)" }}
      >
        Reading your spot
      </h2>

      {/* Phase text with count-reveal transition */}
      <p
        key={phase}
        className="mt-2 count-reveal"
        style={{
          fontSize: 14,
          color: "var(--muted-foreground)",
          minHeight: 20,
        }}
      >
        {phases[phase]}
      </p>

      {/* Progress dots with sonar ring on active */}
      <div className="flex items-center gap-3 mt-6">
        {phases.map((_, i) => {
          const isCurrentPhase = i === phase
          const isFilled = i <= phase

          return (
            <div key={i} className="relative flex items-center justify-center" style={{ width: 14, height: 14 }}>
              {/* Sonar ring on the currently active dot */}
              {isCurrentPhase && (
                <div
                  className="sonar-ring"
                  style={{ color: "var(--accent)" }}
                />
              )}
              <div
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: isFilled ? "var(--accent)" : "transparent",
                  border: isFilled ? "none" : "1.5px solid var(--border)",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
