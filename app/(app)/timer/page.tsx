"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ShieldCheck } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { TimerDisplay } from "@/components/timer-display"

const PRESETS = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "4h", value: 240 },
]

export default function TimerPage() {
  const router = useRouter()
  const {
    timerActive,
    timerRemainingSeconds,
    formatTimeDisplay,
    handleSetTimer,
    handleCancelTimer,
  } = useAppContext()

  const [minutes, setMinutes] = useState(60)

  const endsAt = useMemo(() => {
    const end = new Date(Date.now() + minutes * 60 * 1000)
    return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }, [minutes])

  // SVG dial constants
  const SIZE = 240
  const CENTER = SIZE / 2
  const R = 100
  const CIRCUMFERENCE = 2 * Math.PI * R
  const arcFraction = minutes / 240
  const arcLength = CIRCUMFERENCE * arcFraction

  // If a timer is already running, show the existing TimerDisplay component
  if (timerActive && timerRemainingSeconds !== null) {
    return (
      <div className="flex flex-col min-h-screen px-[22px] pt-16 pb-28">
        <TimerDisplay
          remainingSeconds={timerRemainingSeconds}
          formatTime={formatTimeDisplay}
          onCancel={handleCancelTimer}
        />
      </div>
    )
  }

  // Timer SET screen
  return (
    <div className="flex flex-col min-h-screen px-[22px] pt-16 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center press-effect"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Title */}
      <div className="mt-6">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          NEW TIMER
        </p>
        <h1
          className="font-bold mt-1"
          style={{ fontSize: 36, letterSpacing: -1.4 }}
        >
          How long?
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "var(--fg2)" }}>
          We&apos;ll nudge you 15, 5, and 1 minute before it&apos;s up.
        </p>
      </div>

      {/* Circular dial */}
      <div className="flex justify-center mt-8">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Outer track */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R}
              stroke="var(--muted)"
              strokeWidth="20"
              fill="none"
            />
            {/* Filled arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R}
              stroke="var(--accent)"
              strokeWidth="20"
              fill="none"
              strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              className="transition-all duration-300"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: 12, color: "var(--muted-foreground)" }}
            >
              MINUTES
            </p>
            <p
              className="font-bold tabular-nums"
              style={{ fontSize: 64, lineHeight: 1, letterSpacing: -2.5, color: "var(--foreground)" }}
            >
              {minutes}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
              ends at {endsAt}
            </p>
          </div>
        </div>
      </div>

      {/* Range slider */}
      <div className="mt-6 px-2">
        <input
          type="range"
          min={5}
          max={240}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
          aria-label="Set timer minutes"
        />
      </div>

      {/* Preset buttons */}
      <div className="flex justify-center gap-2 mt-5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setMinutes(p.value)}
            className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors press-effect ${
              minutes === p.value
                ? "bg-foreground text-background"
                : "bg-muted text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Info card */}
      <div className="mt-6 bg-card border border-border rounded-[18px] p-3.5 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-pale)" }}
        >
          <ShieldCheck className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <p className="text-sm font-medium">Within the 2h limit</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your meter time is covered</p>
        </div>
      </div>

      {/* Start timer CTA */}
      <div className="mt-auto pt-6">
        <button
          onClick={() => handleSetTimer(minutes)}
          className="w-full py-4 rounded-full font-bold text-white press-effect"
          style={{ background: "var(--accent)" }}
        >
          Start timer
        </button>
      </div>
    </div>
  )
}
