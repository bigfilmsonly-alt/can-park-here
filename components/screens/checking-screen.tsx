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

    if (phase === phases.length - 1 && onComplete) {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-fade-in"
      style={{ background: "var(--park-bg)" }}
    >
      {/* Ambient radial pulse */}
      <div
        className="absolute inset-0 radial-pulse pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, var(--park-accent-pale) 0%, transparent 55%)",
        }}
      />

      {/* Spinning ring + pin */}
      <div className="relative breathe-glow rounded-full" style={{ width: 140, height: 140 }}>
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
            strokeWidth="2.5"
            stroke="var(--park-border)"
          />
          <circle
            cx="70"
            cy="70"
            r="67"
            fill="none"
            strokeWidth="2.5"
            stroke="var(--park-accent)"
            strokeDasharray="105 316"
            strokeLinecap="round"
          />
        </svg>

        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 92,
            height: 92,
            top: 24,
            left: 24,
            background: "var(--park-accent-pale)",
          }}
        >
          <MapPin
            style={{ width: 46, height: 46, color: "var(--park-accent)" }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Title */}
      <h2
        className="mt-8 font-semibold"
        style={{ fontSize: 22, letterSpacing: "-0.02em", color: "var(--park-fg)" }}
      >
        Reading your spot
      </h2>

      {/* Phase text */}
      <p
        key={phase}
        className="mt-2 count-reveal"
        style={{
          fontSize: 14,
          color: "var(--park-muted-fg)",
          minHeight: 20,
        }}
      >
        {phases[phase]}
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-3 mt-6">
        {phases.map((_, i) => {
          const isCurrentPhase = i === phase
          const isFilled = i <= phase

          return (
            <div key={i} className="relative flex items-center justify-center" style={{ width: 14, height: 14 }}>
              {isCurrentPhase && (
                <div className="sonar-ring" style={{ color: "var(--park-accent)" }} />
              )}
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: 7,
                  height: 7,
                  background: isFilled ? "var(--park-accent)" : "transparent",
                  border: isFilled ? "none" : "1.5px solid var(--park-border)",
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
