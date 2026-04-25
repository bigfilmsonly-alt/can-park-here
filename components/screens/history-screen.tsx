"use client"

import { useMemo } from "react"
import type { HistoryItem } from "@/lib/types"
import { Check, Clock, MapPin, History as HistoryIcon, ChevronRight, ShieldCheck, DollarSign, Ticket } from "lucide-react"

interface HistoryScreenProps {
  history: HistoryItem[]
  onItemClick: (item: HistoryItem) => void
  onCheckParking: () => void
}

const statusLabels: Record<string, string> = {
  allowed: "Allowed",
  restricted: "Limited",
  prohibited: "No parking",
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

function statusColor(status: string) {
  if (status === "allowed") return "#10b981"
  if (status === "restricted") return "#f59e0b"
  return "#ef4444"
}

export function HistoryScreen({ history, onItemClick, onCheckParking }: HistoryScreenProps) {
  const stats = useMemo(() => {
    const sessions = history.length
    const ticketsAvoided = history.filter(h => h.status === "prohibited").length
    const saved = history.filter(h => h.status !== "prohibited").length * 75
    return { sessions, ticketsAvoided, saved }
  }, [history])

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-5rem)] pb-28"
      style={{ paddingLeft: 22, paddingRight: 22, background: "#0b0f17" }}
    >
      {/* Header */}
      <div className="pt-14">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
          Activity
        </p>
        <h1
          style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, color: "#f8fafc", marginTop: 4 }}
        >
          History
        </h1>
      </div>

      {/* Stats Bar */}
      {history.length > 0 && (
        <div
          className="grid grid-cols-3 mt-5 rounded-2xl overflow-hidden"
          style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
        >
          {[
            { value: stats.sessions, label: "Sessions", icon: <HistoryIcon className="w-3.5 h-3.5" /> },
            { value: `$${stats.saved}`, label: "Saved", icon: <DollarSign className="w-3.5 h-3.5" /> },
            { value: stats.ticketsAvoided, label: "Tickets", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-4"
              style={{ borderLeft: i > 0 ? "1px solid #2d3447" : "none" }}
            >
              <div className="flex items-center gap-1.5 mb-1" style={{ color: "#94a3b8" }}>
                {stat.icon}
              </div>
              <p className="text-lg font-bold" style={{ color: "#f8fafc" }}>{stat.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="mt-5">
        {history.length === 0 ? (
          /* Empty State */
          <div
            className="flex flex-col items-center text-center py-16 px-6 rounded-[22px]"
            style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "#262c3b" }}
            >
              <HistoryIcon className="w-8 h-8" style={{ color: "#64748b" }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#f8fafc" }}>No sessions yet</h2>
            <p className="text-sm mt-2" style={{ color: "#94a3b8", maxWidth: 260, lineHeight: 1.5 }}>
              Check your first location to start building your parking history.
            </p>
            <button
              onClick={onCheckParking}
              className="mt-6 px-6 py-3 rounded-full text-sm font-bold press-effect"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}
            >
              Check first location
            </button>
          </div>
        ) : (
          /* Session List */
          <div
            className="rounded-[22px] overflow-hidden"
            style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
          >
            {history.map((item, i) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left press-effect"
                style={{ borderTop: i > 0 ? "1px solid #2d3447" : "none" }}
              >
                {/* Status dot */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${statusColor(item.status)}15`, color: statusColor(item.status) }}
                >
                  <StatusIcon status={item.status} />
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: "#f8fafc" }}>
                      {item.street}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: statusColor(item.status), background: `${statusColor(item.status)}15` }}
                    >
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
                    {formatAgo(new Date(item.date))} · {item.location}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
