"use client"

import type { ParkingResult } from "@/lib/parking-rules"
import {
  Check,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Share2,
  Timer,
  Navigation,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react"

interface StatusScreenProps {
  result: ParkingResult
  location: string
  fullAddress: string
  coordinates: { lat: number; lng: number }
  onBack: () => void
  onSetReminder: () => void
  onEndSession: () => void
  isSaved: boolean
  onSaveLocation: () => void
  onRemoveLocation: () => void
  isProtected: boolean
  reminderSet: boolean
}

const variants = {
  allowed: {
    bg: "#f0fdf4", ink: "#166534", accent: "#22c55e", border: "#bbf7d0",
    head: "Yes \u2014 park here.",
    icon: Check, iconBg: "#dcfce7",
  },
  restricted: {
    bg: "#fffbeb", ink: "#92400e", accent: "#f59e0b", border: "#fde68a",
    head: "Limited time.",
    icon: Clock, iconBg: "#fef3c7",
  },
  prohibited: {
    bg: "#fef2f2", ink: "#991b1b", accent: "#ef4444", border: "#fecaca",
    head: "Don\u2019t park here.",
    icon: X, iconBg: "#fee2e2",
  },
}

export function StatusScreen({
  result,
  location,
  onBack,
  onSetReminder,
  isProtected,
}: StatusScreenProps) {
  const v = variants[result.status]
  const conf = (result as { confidence?: number }).confidence ?? 95
  const headline = (result as { headline?: string }).headline || v.head
  const reason = (result as { reason?: string }).reason || result.description || ""
  const restrictions = (result as { restrictions?: string[] }).restrictions || []
  const Icon = v.icon

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "#fff", color: "#0f172a" }}>
      <div className="park-scroll" style={{ paddingTop: 16, paddingBottom: 120 }}>
        {/* Top bar */}
        <div style={{ padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} className="press" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", border: "none", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft style={{ width: 20, height: 20 }} strokeWidth={1.75} />
          </button>
          <button className="press" style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", border: "none", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 style={{ width: 18, height: 18 }} strokeWidth={1.75} />
          </button>
        </div>

        {/* Status hero */}
        <div style={{ padding: "24px 24px 0" }}>
          {/* Status badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: v.bg, border: `1px solid ${v.border}`, color: v.ink, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: v.accent }} />
            {result.status === "allowed" ? "ALLOWED" : result.status === "restricted" ? "LIMITED" : "PROHIBITED"}
            <span style={{ opacity: 0.6 }}>&middot;</span>
            {conf}% confident
          </div>

          {/* Big headline */}
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2, lineHeight: 1, marginTop: 16, color: "#0f172a" }}>
            {headline}
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <MapPin style={{ width: 14, height: 14, color: "#94a3b8" }} strokeWidth={1.75} />
            <span style={{ fontSize: 14, color: "#64748b" }}>{location || "Current location"}</span>
          </div>

          {/* Reason */}
          <div style={{ fontSize: 16, color: "#334155", marginTop: 12, lineHeight: 1.55 }}>
            {reason}
          </div>
        </div>

        {/* Restrictions bullets */}
        {restrictions.length > 0 && (
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
              {restrictions.map((r, i) => (
                <div key={i} style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", borderTop: i ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: v.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guarantee card */}
        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            <ShieldCheck style={{ width: 22, height: 22, color: "#2563eb", flexShrink: 0 }} strokeWidth={1.75} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", lineHeight: 1.4 }}>
              This answer is protected. Get a ticket? We pay up to $100.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs — always visible */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "linear-gradient(0deg, #fff 70%, transparent 100%)", zIndex: 55 }}>
        <div style={{ maxWidth: 448, margin: "0 auto", display: "flex", gap: 10 }}>
          <button onClick={onBack} className="press" style={{ flex: 1, padding: "16px", borderRadius: 999, background: "#f1f5f9", color: "#0f172a", border: "none", fontSize: 15, fontWeight: 600 }}>
            Done
          </button>
          <button onClick={onSetReminder} className="press" style={{ flex: 2, padding: "16px", borderRadius: 999, background: "#2563eb", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
            {result.status === "prohibited" ? (
              <><Navigation style={{ width: 18, height: 18 }} strokeWidth={1.75} /> Find legal spot</>
            ) : (
              <><Timer style={{ width: 18, height: 18 }} strokeWidth={1.75} /> Set timer</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
