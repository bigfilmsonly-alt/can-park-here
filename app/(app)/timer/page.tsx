"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ShieldCheck, Bell } from "lucide-react"
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

  const SIZE = 240
  const CENTER = SIZE / 2
  const R = 100
  const CIRCUMFERENCE = 2 * Math.PI * R
  const arcLength = CIRCUMFERENCE * (minutes / 240)

  if (timerActive && timerRemainingSeconds !== null) {
    return (
      <div className="flex flex-col min-h-screen pb-28 fade-in" style={{ background: "#fff", color: "#0f172a" }}>
        <div style={{ padding: "16px 20px 0" }}>
          <button onClick={() => router.push("/")} className="press" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
            <ChevronLeft style={{ width: 20, height: 20 }} strokeWidth={1.75} />
          </button>
        </div>
        <div style={{ padding: "0 22px" }}>
          <TimerDisplay
            remainingSeconds={timerRemainingSeconds}
            formatTime={formatTimeDisplay}
            onCancel={handleCancelTimer}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-28 fade-in" style={{ background: "#fff", color: "#0f172a" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0" }}>
        <button onClick={() => router.back()} className="press" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
          <ChevronLeft style={{ width: 20, height: 20 }} strokeWidth={1.75} />
        </button>
      </div>

      {/* Title */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>New timer</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.2, marginTop: 4 }}>How long?</div>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>We'll alert you 15, 5, and 1 minute before.</div>
      </div>

      {/* Circular dial */}
      <div style={{ display: "flex", justifyContent: "center", padding: "32px 0 16px" }}>
        <div style={{ position: "relative", width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle cx={CENTER} cy={CENTER} r={R} stroke="#f1f5f9" strokeWidth="20" fill="none" />
            <circle cx={CENTER} cy={CENTER} r={R} stroke="#2563eb" strokeWidth="20" fill="none" strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`} strokeLinecap="round" transform={`rotate(-90 ${CENTER} ${CENTER})`} style={{ transition: "stroke-dasharray 0.25s" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>Minutes</div>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{minutes}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>ends at {endsAt}</div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div style={{ padding: "0 28px" }}>
        <input type="range" min={5} max={240} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={{ width: "100%", accentColor: "#2563eb" }} />
      </div>

      {/* Presets */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 20px 0" }}>
        {PRESETS.map((p) => (
          <button key={p.value} onClick={() => setMinutes(p.value)} className="press" style={{ padding: "8px 16px", borderRadius: 999, background: minutes === p.value ? "#0f172a" : "#f1f5f9", color: minutes === p.value ? "#fff" : "#0f172a", border: "none", fontSize: 13, fontWeight: 600 }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Notification info */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "#eff6ff", border: "1px solid #dbeafe", display: "flex", alignItems: "center", gap: 12 }}>
          <Bell style={{ width: 18, height: 18, color: "#2563eb", flexShrink: 0 }} strokeWidth={1.75} />
          <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.4 }}>
            You'll get alerts at <b>15 min</b>, <b>5 min</b>, and <b>1 min</b> before your time is up.
          </div>
        </div>
      </div>

      {/* Start CTA */}
      <div style={{ padding: "24px 20px 0", marginTop: "auto" }}>
        <button onClick={() => handleSetTimer(minutes)} className="press" style={{ width: "100%", padding: "18px", borderRadius: 999, background: "#2563eb", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
          Start timer
        </button>
      </div>
    </div>
  )
}
