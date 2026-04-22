"use client"

import type { HistoryItem } from "@/lib/types"
import { ChevronLeft, Check, Clock, Camera, MapPin, History as HistoryIcon } from "lucide-react"

interface HistoryScreenProps {
  history: HistoryItem[]
  onItemClick: (item: HistoryItem) => void
  onCheckParking: () => void
}

const statusDotColors: Record<string, string> = {
  allowed: "var(--status-success)",
  restricted: "var(--status-warning)",
  prohibited: "var(--status-error)",
}

const statusBgColors: Record<string, string> = {
  allowed: "var(--status-success-bg)",
  restricted: "var(--status-warning-bg)",
  prohibited: "var(--status-error-bg)",
}

const statusFgColors: Record<string, string> = {
  allowed: "var(--status-success-foreground)",
  restricted: "var(--status-warning-foreground)",
  prohibited: "var(--status-error-foreground)",
}

function formatAgo(date: Date): string {
  const d = Date.now() - date.getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

function StatusIcon({ status }: { status: string }) {
  if (status === "allowed") return <Check className="w-4 h-4" />
  if (status === "restricted") return <Clock className="w-4 h-4" />
  return <MapPin className="w-4 h-4" />
}

export function HistoryScreen({ history, onItemClick, onCheckParking }: HistoryScreenProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-28">
      <div className="pt-16 px-5.5">
        {/* Header */}
        <div className="px-0.5">
          <div className="text-[13px] font-semibold tracking-wider uppercase text-muted-foreground">
            Activity
          </div>
          <div className="text-[32px] font-bold tracking-tight mt-0.5">History</div>
          <div className="text-sm mt-1.5" style={{ color: "var(--fg2)" }}>
            {history.length} events
          </div>
        </div>

        {/* List */}
        <div className="mt-5">
          {history.length === 0 ? (
            <div
              className="bg-card card-elevated rounded-[22px] p-6 text-center"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}
            >
              <div className="w-14 h-14 rounded-[18px] bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                <HistoryIcon className="w-7 h-7" />
              </div>
              <div className="text-base font-bold mt-3.5">No activity yet</div>
              <div className="text-[13px] text-muted-foreground mt-1.5">
                Your checks, scans and timers will appear here.
              </div>
              <div className="mt-4">
                <button
                  onClick={onCheckParking}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold press-effect"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Check a spot
                </button>
              </div>
            </div>
          ) : (
            <div
              className="bg-card card-elevated rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}
            >
              {history.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-left press-effect"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{
                      background: statusBgColors[item.status] || "var(--muted)",
                      color: statusFgColors[item.status] || "var(--muted-foreground)",
                    }}
                  >
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {item.street}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {formatAgo(new Date(item.date))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
