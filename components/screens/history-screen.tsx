"use client"

import { useMemo } from "react"
import type { HistoryItem } from "@/lib/types"
import { Check, Clock, X, ChevronRight, History as HistoryIcon } from "lucide-react"

interface HistoryScreenProps {
  history: HistoryItem[]
  onItemClick: (item: HistoryItem) => void
  onCheckParking: () => void
}

const AVERAGE_SF_FINE = 73

function formatAgo(date: Date): string {
  const d = Date.now() - date.getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

function getStatusConfig(status: string) {
  if (status === "allowed") return { bg: "#dcfce7", ink: "#16a34a", icon: Check, label: "Allowed" }
  if (status === "restricted") return { bg: "#fef9c3", ink: "#d97706", icon: Clock, label: "Restricted" }
  return { bg: "#fee2e2", ink: "#dc2626", icon: X, label: "Prohibited" }
}

function groupByDay(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000

  const groups: Map<string, HistoryItem[]> = new Map()
  for (const item of items) {
    const ts = new Date(item.date).getTime()
    let label = "Earlier"
    if (ts >= today) label = "Today"
    else if (ts >= yesterday) label = "Yesterday"
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(item)
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export function HistoryScreen({ history, onItemClick, onCheckParking }: HistoryScreenProps) {
  const stats = useMemo(() => {
    const sessions = history.length
    const allowedCount = history.filter(h => h.status === "allowed").length
    const saved = allowedCount * AVERAGE_SF_FINE
    const tickets = 0
    return { sessions, saved, tickets }
  }, [history])

  const groups = useMemo(() => groupByDay(history), [history])

  return (
    <div className="fade-in park-scroll" style={{ background: "#fff", color: "#0f172a", minHeight: "100vh", paddingBottom: 120 }}>
      {/* Stats Bar */}
      <div style={{ padding: "76px 22px 0" }}>
        <div style={{
          background: "#2563eb",
          borderRadius: 16,
          padding: "18px 0",
          display: "flex",
        }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>{stats.sessions}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Sessions</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)", margin: "4px 0" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>${stats.saved}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Saved</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)", margin: "4px 0" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>{stats.tickets}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Tickets</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 22px 0" }}>
        {history.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}>
              <HistoryIcon style={{ width: 28, height: 28, color: "#94a3b8" }} strokeWidth={1.75} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 20, color: "#0f172a" }}>No sessions yet</div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>
              Every time you check a location or scan a sign, it appears here.
            </div>
            <button
              onClick={onCheckParking}
              className="press"
              style={{
                marginTop: 24,
                padding: "14px 28px",
                borderRadius: 999,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Check My First Location
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                padding: "0 4px 8px",
              }}>
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.items.map((item, i) => {
                  const cfg = getStatusConfig(item.status)
                  const Icon = cfg.icon
                  return (
                    <button
                      key={item.id || i}
                      onClick={() => onItemClick(item)}
                      className="press"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 16,
                        textAlign: "left",
                        color: "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: cfg.bg,
                        color: cfg.ink,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: 16, height: 16 }} strokeWidth={1.75} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 600,
                          letterSpacing: -0.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#0f172a",
                        }}>
                          {item.location || "Unknown location"}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>
                          {cfg.label} · {formatAgo(new Date(item.date))}
                        </div>
                      </div>
                      <ChevronRight style={{ width: 14, height: 14, color: "#94a3b8", flexShrink: 0 }} strokeWidth={1.75} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
