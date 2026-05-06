"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Eye,
  Type,
  Zap,
  Globe,
  Car,
  Accessibility,
  Fuel,
  Lock,
  Bell,
  Check,
} from "lucide-react"
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingsScreenProps {
  onBack: () => void
}

type AccentId = "blue" | "teal" | "indigo" | "slate"

const ACCENT_SWATCHES: { id: AccentId; hex: string }[] = [
  { id: "blue", hex: "#3b82f6" },
  { id: "teal", hex: "#14b8a6" },
  { id: "indigo", hex: "#6366f1" },
  { id: "slate", hex: "#475569" },
]

/* ------------------------------------------------------------------ */
/*  Inline styles (design-token aware)                                 */
/* ------------------------------------------------------------------ */

const S = {
  /* Page */
  page: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100%",
    background: "var(--park-bg)",
    padding: "0 20px 48px",
    overflowY: "auto" as const,
  },

  /* Header */
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    display: "flex",
    alignItems: "center" as const,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "var(--park-muted)",
    border: "none",
    color: "var(--park-fg)",
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    cursor: "pointer",
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: -0.8,
    color: "var(--park-fg)",
  },

  /* Section header */
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
    color: "var(--park-muted-fg)",
    padding: "0 8px 6px",
  },

  /* Card */
  card: {
    background: "var(--park-surface)",
    border: "1px solid var(--park-border)",
    borderRadius: 18,
  },

  /* Row */
  row: {
    display: "flex",
    alignItems: "center" as const,
    gap: 12,
    padding: "14px 16px",
  },
  hairline: {
    height: 1,
    background: "var(--park-hairline)",
    margin: "0 16px",
  },

  /* Icon box */
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "var(--park-muted)",
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  },

  /* Row label */
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    color: "var(--park-fg)",
  },

  /* Row value */
  rowValue: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--park-muted-fg)",
  },
} as const

/* ------------------------------------------------------------------ */
/*  Toggle switch                                                      */
/* ------------------------------------------------------------------ */

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="press"
      style={{
        width: 34,
        height: 20,
        borderRadius: 999,
        background: on ? "var(--park-accent)" : "var(--park-border)",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "#fff",
          position: "absolute",
          top: 1,
          left: on ? 15 : 1,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Settings screen                                                    */
/* ------------------------------------------------------------------ */

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [accent, setAccent] = useState<AccentId>("blue")
  const [showLangPicker, setShowLangPicker] = useState(false)

  /* Accessibility toggles — persist to localStorage */
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  /* Privacy toggles */
  const [biometricLock, setBiometricLock] = useState(true)

  /* Hydration guard for useTheme */
  useEffect(() => {
    setMounted(true)
    try {
      setHighContrast(localStorage.getItem("park.highContrast") === "true")
      setReducedMotion(localStorage.getItem("park.reducedMotion") === "true")
      setBiometricLock(localStorage.getItem("park.biometricLock") !== "false")
    } catch { /* SSR */ }
  }, [])

  /* Load accent from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("park.accent") as AccentId | null
      if (saved && ACCENT_SWATCHES.some((s) => s.id === saved)) {
        setAccent(saved)
      }
    } catch {
      /* SSR / privacy mode */
    }
  }, [])

  const handleAccentChange = useCallback((id: AccentId) => {
    setAccent(id)
    try {
      localStorage.setItem("park.accent", id)
      window.dispatchEvent(new CustomEvent("park-accent-change", { detail: id }))
    } catch {
      /* ignore */
    }
  }, [])

  /* Resolve displayed theme label */
  const resolvedTheme = mounted ? theme ?? "system" : "system"

  const themeOptions: { id: string; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ]

  return (
    <div style={S.page} className="park-scroll">
      {/* ── Header ── */}
      <div style={S.header}>
        <button onClick={onBack} className="press" style={S.backBtn} aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
        <h1 style={S.title}>Settings</h1>
      </div>

      {/* ── Profile card ── */}
      <button
        className="press"
        style={{
          ...S.card,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          textAlign: "left" as const,
          cursor: "pointer",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 18,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          AM
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--park-fg)", margin: 0 }}>
            Alex Morton
          </p>
          <p style={{ fontSize: 13, color: "var(--park-muted-fg)", margin: "2px 0 0" }}>
            alex@morton.co &middot; Free plan
          </p>
        </div>
        <ChevronRight size={18} color="var(--park-muted-fg)" />
      </button>

      {/* ── Pro upsell card ── */}
      <div
        style={{
          background: "var(--park-fg)",
          borderRadius: 18,
          padding: "14px 16px",
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(59,130,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} color="#3b82f6" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--park-bg)", margin: 0 }}>
            Ticket Protection Pro
          </p>
          <p style={{ fontSize: 13, color: "var(--park-muted-fg)", margin: "2px 0 0" }}>
            3 claims/yr &middot; $4.99/mo
          </p>
        </div>
        <button
          className="press"
          style={{
            background: "var(--park-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Upgrade
        </button>
      </div>

      {/* ── Appearance ── */}
      <div style={{ marginTop: 32 }}>
        <p style={S.sectionLabel}>Appearance</p>
        <div style={S.card}>
          {/* Theme toggle */}
          <div style={S.row}>
            <span style={S.rowLabel}>Theme</span>
            <div style={{ display: "flex", gap: 4 }}>
              {themeOptions.map((opt) => {
                const active = resolvedTheme === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className="press"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: "none",
                      background: active ? "var(--park-fg)" : "var(--park-muted)",
                      color: active ? "var(--park-bg)" : "var(--park-fg2)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={S.hairline} />

          {/* Accent color */}
          <div style={S.row}>
            <span style={S.rowLabel}>Accent color</span>
            <div style={{ display: "flex", gap: 8 }}>
              {ACCENT_SWATCHES.map((swatch) => {
                const active = accent === swatch.id
                return (
                  <button
                    key={swatch.id}
                    onClick={() => handleAccentChange(swatch.id)}
                    className="press"
                    aria-label={`${swatch.id} accent color`}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      background: swatch.hex,
                      border: "none",
                      cursor: "pointer",
                      outline: active
                        ? `2px solid ${swatch.hex}`
                        : "2px solid transparent",
                      outlineOffset: 2,
                      transition: "outline 0.15s",
                      padding: 0,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Accessibility ── */}
      <div style={{ marginTop: 32 }}>
        <p style={S.sectionLabel}>Accessibility</p>
        <div style={S.card}>
          {/* High contrast */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Eye size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>High contrast</span>
            <Toggle on={highContrast} onToggle={() => { const v = !highContrast; setHighContrast(v); try { localStorage.setItem("park.highContrast", String(v)) } catch {} }} />
          </div>

          <div style={S.hairline} />

          {/* Large text */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Type size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Large text</span>
            <span style={S.rowValue}>118%</span>
          </div>

          <div style={S.hairline} />

          {/* Reduced motion */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Zap size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Reduced motion</span>
            <Toggle on={reducedMotion} onToggle={() => { const v = !reducedMotion; setReducedMotion(v); try { localStorage.setItem("park.reducedMotion", String(v)) } catch {} }} />
          </div>

          <div style={S.hairline} />

          {/* Language */}
          <button
            className="press"
            onClick={() => setShowLangPicker(!showLangPicker)}
            style={{ ...S.row, width: "100%", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const }}
          >
            <div style={S.iconBox}>
              <Globe size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>{t("settings.language")}</span>
            <span style={S.rowValue}>{LANGUAGES.find(l => l.id === lang)?.native || "English"}</span>
          </button>

          {/* Language picker dropdown */}
          {showLangPicker && (
            <div style={{ padding: "4px 8px 8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    className="press"
                    onClick={() => { setLang(l.id); setShowLangPicker(false) }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: lang === l.id ? "2px solid #2563eb" : "1px solid var(--park-border)",
                      background: lang === l.id ? "#eff6ff" : "var(--park-surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      textAlign: "left" as const,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--park-fg)" }}>{l.native}</div>
                      <div style={{ fontSize: 10, color: "var(--park-muted-fg)", marginTop: 1 }}>{l.label}</div>
                    </div>
                    {lang === l.id && <Check size={14} color="#2563eb" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Vehicle ── */}
      <div style={{ marginTop: 32 }}>
        <p style={S.sectionLabel}>Vehicle</p>
        <div style={S.card}>
          {/* Vehicle */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Car size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Vehicle</span>
            <div style={{ textAlign: "right" as const }}>
              <p style={{ ...S.rowValue, margin: 0 }}>2022 Honda Fit</p>
              <p style={{ fontSize: 12, color: "var(--park-muted-fg)", margin: "1px 0 0", fontWeight: 500 }}>
                7AKJ203
              </p>
            </div>
          </div>

          <div style={S.hairline} />

          {/* Handicap placard */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Accessibility size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Handicap placard</span>
            <span style={S.rowValue}>None</span>
          </div>

          <div style={S.hairline} />

          {/* EV/Hybrid */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Fuel size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>EV/Hybrid</span>
            <span style={S.rowValue}>No</span>
          </div>
        </div>
      </div>

      {/* ── Privacy & Security ── */}
      <div style={{ marginTop: 32 }}>
        <p style={S.sectionLabel}>Privacy & Security</p>
        <div style={S.card}>
          {/* Biometric lock */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Lock size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Biometric lock</span>
            <Toggle on={biometricLock} onToggle={() => { const v = !biometricLock; setBiometricLock(v); try { localStorage.setItem("park.biometricLock", String(v)) } catch {} }} />
          </div>

          <div style={S.hairline} />

          {/* Notifications */}
          <div style={S.row}>
            <div style={S.iconBox}>
              <Bell size={15} color="var(--park-muted-fg)" />
            </div>
            <span style={S.rowLabel}>Notifications</span>
            <span style={S.rowValue}>Smart</span>
          </div>
        </div>
      </div>
    </div>
  )
}
