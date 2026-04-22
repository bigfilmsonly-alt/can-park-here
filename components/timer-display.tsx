"use client"

import { Bell, ChevronLeft, Plus } from "lucide-react"

interface TimerDisplayProps {
  remainingSeconds: number
  formatTime: (seconds: number) => string
  onCancel: () => void
}

export function TimerDisplay({
  remainingSeconds,
  formatTime,
  onCancel,
}: TimerDisplayProps) {
  const isUrgent = remainingSeconds <= 600
  const isCritical = remainingSeconds <= 300
  const totalSeconds = 7200 // 2 hours default
  const pct = Math.max(0, remainingSeconds / totalSeconds)

  const R = 118
  const C = 2 * Math.PI * R
  const color = isCritical
    ? "var(--status-error)"
    : isUrgent
      ? "var(--status-warning)"
      : "var(--status-success)"
  const label = isCritical
    ? "Move soon"
    : isUrgent
      ? "20 minutes left"
      : "Plenty of time"

  return (
    <div className="flex flex-col items-center px-5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-3.5 py-[9px] rounded-full bg-muted text-[13px] font-semibold">
          Timer
        </span>
        <button
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Circular progress ring */}
      <div className="relative w-[280px] h-[280px]">
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className={isCritical ? "ring-glow-error" : isUrgent ? "ring-glow-warning" : "ring-glow-success"}
        >
          <circle
            cx="140"
            cy="140"
            r={R}
            stroke="var(--muted)"
            strokeWidth="14"
            fill="none"
          />
          <circle
            cx="140"
            cy="140"
            r={R}
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${C * pct} ${C}`}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {label}
          </p>
          <p
            className="text-[56px] font-bold tracking-tight mt-1.5 count-reveal"
            style={{
              letterSpacing: -2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(remainingSeconds)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            expires{" "}
            {new Date(Date.now() + remainingSeconds * 1000).toLocaleTimeString(
              [],
              { hour: "numeric", minute: "2-digit" }
            )}
          </p>
        </div>
      </div>

      {/* Notification schedule */}
      <div
        className="w-full mt-6 rounded-[22px] bg-card border border-border p-4"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)",
        }}
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Notifications
        </p>
        <div className="mt-2.5 stagger-spring">
          {[
            {
              t: "20 min",
              s: "Gentle reminder",
              done: isUrgent || isCritical,
            },
            { t: "10 min", s: "Move or extend", done: isCritical },
            { t: "5 min", s: "Ticket risk high", done: false },
          ].map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5"
              style={{
                borderTop: i
                  ? "1px solid var(--hairline)"
                  : "none",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: n.done
                    ? "var(--status-success)"
                    : "var(--muted)",
                  color: n.done ? "#fff" : "var(--muted-foreground)",
                }}
              >
                {n.done ? "\u2713" : i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold tracking-tight">
                  {n.t}
                </p>
                <p className="text-[13px] text-muted-foreground">{n.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2.5 w-full mt-6">
        <button className="flex-1 h-14 rounded-full bg-muted flex items-center justify-center gap-2 text-base font-semibold hover-lift-interactive">
          <Plus className="w-[18px] h-[18px]" />
          Extend
        </button>
        <button
          onClick={onCancel}
          className="flex-1 h-14 rounded-full flex items-center justify-center text-base font-semibold text-white hover-lift-interactive"
          style={{ background: "var(--foreground)" }}
        >
          Stop timer
        </button>
      </div>
    </div>
  )
}
