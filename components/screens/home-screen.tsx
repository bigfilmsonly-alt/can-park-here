"use client"

import {
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Scan,
  Star,
  Zap,
  Check,
  AlertTriangle,
  Share2,
  Gift,
} from "lucide-react"
import type { ProtectionSession } from "@/lib/protection"
import { formatTimeRemaining } from "@/lib/parking-rules"
import { CityToggle } from "@/components/city-toggle"
import { useI18n } from "@/lib/i18n"

interface HomeScreenProps {
  onCheckParking: () => void
  onResumeSession: () => void
  onScanSign: () => void
  onSetTimer: () => void
  onOpenMap: () => void
  onOpenSaved?: () => void
  loading?: boolean
  error?: string | null
  activeSession: ProtectionSession | null
  sessionTimeRemaining: number | null
  remainingChecks: number
  onUpgrade: () => void
  currentLocation?: { lat: number; lng: number }
  timerActive: boolean
  timerRemainingSeconds: number
  formatTimerDisplay: (seconds: number) => string
  onCancelTimer: () => void
  onOpenSettings?: () => void
  onOpenHistory?: () => void
  onShare?: () => void
}

export function HomeScreen({
  onCheckParking,
  onResumeSession,
  onScanSign,
  onSetTimer,
  loading,
  error,
  activeSession,
  sessionTimeRemaining,
  onUpgrade,
  timerActive,
  timerRemainingSeconds,
  formatTimerDisplay,
  onCancelTimer,
  onOpenSettings,
  onOpenHistory,
  onShare,
}: HomeScreenProps) {
  const { t } = useI18n()
  const hasActiveSession = activeSession?.status === "active"

  return (
    <div className="flex flex-col pb-28 park-scroll fade-in" style={{ background: "#fff", color: "#0f172a", minHeight: "100vh" }}>
      {/* ── Header ── */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>P</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>park</span>
        </div>
        <CityToggle />
      </div>

      {/* ── Active timer ── */}
      {(hasActiveSession || timerActive) && (
        <button onClick={hasActiveSession ? onResumeSession : undefined} className="press" style={{ margin: "10px 20px 0", padding: "10px 14px", borderRadius: 12, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "calc(100% - 40px)" }}>
          <Clock style={{ width: 16, height: 16 }} strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Timer running</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{timerActive ? formatTimerDisplay(timerRemainingSeconds) : sessionTimeRemaining !== null ? formatTimeRemaining(sessionTimeRemaining) : ""} remaining</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, opacity: 0.5 }} strokeWidth={2} />
        </button>
      )}

      {/* ══════════════════════════════════════
          HERO — #1 conversion element
         ══════════════════════════════════════ */}
      <div style={{ padding: "16px 20px 0" }}>
        <button onClick={onCheckParking} disabled={loading} className="press" style={{ width: "100%", padding: "32px 24px 28px", borderRadius: 22, background: "linear-gradient(155deg, #3b82f6 0%, #2563eb 45%, #1d4ed8 100%)", color: "#fff", border: "none", textAlign: "left", boxShadow: "0 16px 48px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)", opacity: loading ? 0.8 : 1, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>{t("home.hero")}</div>
            <p style={{ fontSize: 15, opacity: 0.85, marginTop: 8, fontWeight: 400, lineHeight: 1.5 }}>
              {t("home.sub")}{" "}
              <span style={{ color: "#4ade80", fontWeight: 700 }}>{t("home.sub.amount")}</span>{" "}
              {t("home.sub.unique")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600 }}>
                <Zap style={{ width: 11, height: 11 }} strokeWidth={2.5} />{t("home.badge.speed")}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600 }}>
                <Check style={{ width: 11, height: 11 }} strokeWidth={2.5} />{t("home.badge.accuracy")}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600 }}>
                <ShieldCheck style={{ width: 11, height: 11 }} strokeWidth={2} />{t("home.badge.guarantee")}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* ── Peek result card (static demo) ── */}
      <div style={{ position: "relative", padding: "8px 20px 0" }}>
        <div style={{ padding: "14px 16px", borderRadius: 16, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dcfce7", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check style={{ width: 18, height: 18, color: "#22c55e" }} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#166534" }}>YES, PARK HERE</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Valencia St & 20th &middot; Mission, SF</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 5, background: "#dcfce7", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "95%", background: "#22c55e", borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>95%</span>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>SF MTA data</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div style={{ padding: "10px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={onScanSign} className="press" style={{ padding: "14px 12px", borderRadius: 14, background: "#fff", border: "1px solid #e2e8f0", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scan style={{ width: 18, height: 18 }} strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t("home.scan")}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{t("home.scan.sub")}</div>
          </div>
        </button>
        <button onClick={onSetTimer} className="press" style={{ padding: "14px 12px", borderRadius: 14, background: "#fff", border: "1px solid #e2e8f0", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Clock style={{ width: 18, height: 18 }} strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{t("home.timer")}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>{t("home.timer.sub")}</div>
          </div>
        </button>
      </div>

      {/* ── Ticket Protection CTA ── */}
      <div style={{ padding: "12px 20px 0" }}>
        <button onClick={onUpgrade} className="press" style={{ width: "100%", padding: "16px", borderRadius: 14, background: "#0f172a", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck style={{ width: 20, height: 20, color: "#fff" }} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("home.protection")}</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{t("home.protection.sub")}</div>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#2563eb", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{t("home.tryFree")}</span>
        </button>
      </div>

      {/* ── Testimonial ── */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #2563eb" }}>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, fontStyle: "italic" }}>
            &ldquo;Got a $76 ticket on Valencia. Filed a claim in the app. Park sent me $76 via Stripe 18 hours later. This is the only app I trust.&rdquo;
          </p>
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, fontWeight: 600 }}>&mdash; Maria C., Mission District</p>
        </div>
      </div>

      {/* ── Social proof ── */}
      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex" }}>
            {["#3b82f6", "#6366f1", "#8b5cf6", "#2563eb"].map((bg, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 999, background: bg, border: "2px solid #fff", marginLeft: i > 0 ? -7 : 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>
                {["J", "M", "A", "K"][i]}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {[1,2,3,4,5].map((i) => (<Star key={i} style={{ width: 11, height: 11, color: "#f59e0b", fill: "#f59e0b" }} />))}
              <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 4 }}>4.9</span>
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{t("home.drivers")}</div>
          </div>
        </div>
      </div>

      {/* ── Invite friends ── */}
      {onShare && (
        <div style={{ padding: "10px 20px 0" }}>
          <button
            onClick={onShare}
            className="press"
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 14,
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none", color: "#fff", textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Gift style={{ width: 18, height: 18 }} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Invite friends, earn karma</div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>Both get 100 karma per invite</div>
            </div>
            <Share2 style={{ width: 16, height: 16, opacity: 0.7 }} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ padding: "14px 20px 0", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "#cbd5e1" }}>{t("home.footer")}</span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ margin: "12px 20px 0", padding: 12, borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <AlertTriangle style={{ width: 14, height: 14 }} strokeWidth={2} />{error}
        </div>
      )}
    </div>
  )
}
