"use client"

import { useState } from "react"
import {
  X,
  Copy,
  Check,
  Share2,
  Gift,
  Users,
  Sparkles,
  MessageCircle,
  Link2,
  Trophy,
  Shield,
  Zap,
} from "lucide-react"
import {
  getReferralStats,
  getGamificationState,
  getMoneySavedStats,
} from "@/lib/gamification"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

type CopyTarget = "code" | "inviteLink" | "statsLink" | null

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null)
  const [activeTab, setActiveTab] = useState<"invite" | "share">("invite")

  if (!isOpen) return null

  const referral = getReferralStats()
  const gamification = getGamificationState()
  const savings = getMoneySavedStats()

  const BASE_URL = "https://can-park-here.vercel.app"
  const shareUrl = `${BASE_URL}?ref=${referral.code}`

  // -- Compelling copy that sells the pain point and the solution --
  const inviteText = [
    `Parking tickets cost $98 in SF.`,
    `This app tells you in 2 seconds if you can park somewhere -- and they PAY your ticket (up to $100) if they're wrong.`,
    savings.total > 0 ? `Already saved me $${savings.total}.` : `Already saving me from tickets.`,
    `Try it free with my link:`,
    shareUrl,
  ].join(" ")

  const shareStatsText = [
    `I've dodged ${savings.ticketsAvoided} parking ticket${savings.ticketsAvoided !== 1 ? "s" : ""} and saved $${savings.total} with Park.`,
    `It checks if you can park in 2 seconds -- and covers your ticket up to $100 if it's wrong.`,
    `Get it free:`,
    shareUrl,
  ].join(" ")

  const smsBody = encodeURIComponent(inviteText)
  const smsLink = `sms:?&body=${smsBody}`

  // -- Copy helpers (per-button tracking) --
  const copyToClipboard = async (text: string, target: CopyTarget) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers / non-HTTPS
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand("copy")
      } catch {
        // Last-resort: do nothing
      }
      document.body.removeChild(textarea)
    }
    setCopiedTarget(target)
    setTimeout(() => setCopiedTarget(null), 2000)
  }

  // -- Native share with clipboard fallback --
  const handleNativeShare = async (text: string, fallbackTarget: CopyTarget) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Park - Never get a parking ticket again",
          text,
          url: shareUrl,
        })
        return
      } catch {
        // User cancelled or API unavailable -- fall through to copy
      }
    }
    // Desktop / fallback: copy the full text
    await copyToClipboard(`${text}\n${shareUrl}`, fallbackTarget)
  }

  const glass: React.CSSProperties = {
    background: "var(--card-glass)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  }

  const isCopied = (target: CopyTarget) => copiedTarget === target

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md animate-slide-in-up"
        style={{
          ...glass,
          borderRadius: "28px 28px 0 0",
          border: "1px solid var(--park-border)",
          borderBottom: "none",
          padding: "24px 22px 40px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--park-fg)", margin: 0 }}>
            Invite & Share
          </h2>
          <button
            onClick={onClose}
            className="press"
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: "var(--park-surface2)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--park-muted-fg)", cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        </div>

        {/* ── Tab toggle ── */}
        <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 14, background: "var(--park-surface2)", marginBottom: 20 }}>
          {(["invite", "share"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="press"
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 11, border: "none", cursor: "pointer",
                background: activeTab === tab ? "var(--park-accent)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--park-muted-fg)",
                fontSize: 13, fontWeight: 700, transition: "all .2s",
              }}
            >
              {tab === "invite" ? "Invite Friends" : "Share Wins"}
            </button>
          ))}
        </div>

        {/* ================================================================
            INVITE FRIENDS TAB
            ================================================================ */}
        {activeTab === "invite" && (
          <div className="fade-in">
            {/* Referral code gradient card */}
            <div style={{
              padding: "22px 20px 18px", borderRadius: 18,
              background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
              color: "#fff", textAlign: "center",
              boxShadow: "0 8px 30px rgba(59,130,246,0.3)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Subtle shimmer overlay */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.08,
                background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s ease-in-out infinite",
              }} />
              <Gift style={{ width: 28, height: 28, margin: "0 auto 8px" }} strokeWidth={1.75} />
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Your referral code
              </div>
              <div style={{
                fontSize: 32, fontWeight: 800, letterSpacing: 3, marginTop: 6,
                fontFamily: "ui-monospace, 'SF Mono', monospace",
                position: "relative",
              }}>
                {referral.code}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                You both get 100 karma when a friend joins
              </div>
            </div>

            {/* Value prop blurb -- the hook */}
            <div style={{
              marginTop: 14, padding: "14px 16px", borderRadius: 14,
              background: "var(--park-surface2)", border: "1px solid var(--park-border)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--park-fg)", marginBottom: 6, lineHeight: 1.35 }}>
                Parking tickets cost $98 in SF.
              </div>
              <div style={{ fontSize: 13, color: "var(--park-muted-fg)", lineHeight: 1.5 }}>
                Park tells you in 2 seconds if you can park -- and <span style={{ color: "var(--park-accent)", fontWeight: 600 }}>pays your ticket up to $100</span> if it gets it wrong.
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <div style={{ padding: "14px 12px", borderRadius: 14, background: "var(--park-surface2)", textAlign: "center" }}>
                <Users style={{ width: 18, height: 18, color: "var(--park-accent)", margin: "0 auto 6px" }} strokeWidth={1.75} />
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--park-fg)" }}>{referral.referrals}</div>
                <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>friends joined</div>
              </div>
              <div style={{ padding: "14px 12px", borderRadius: 14, background: "var(--park-surface2)", textAlign: "center" }}>
                <Sparkles style={{ width: 18, height: 18, color: "var(--park-accent)", margin: "0 auto 6px" }} strokeWidth={1.75} />
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--park-fg)" }}>{referral.earnings}</div>
                <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>karma earned</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {/* Invite via text -- SMS deep link */}
              <a
                href={smsLink}
                className="press"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
                  textDecoration: "none",
                }}
              >
                <MessageCircle style={{ width: 16, height: 16 }} strokeWidth={2} />
                Invite via text
              </a>

              {/* Share link -- native share API */}
              <button
                onClick={() => handleNativeShare(inviteText, "inviteLink")}
                className="press"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                  color: "var(--park-fg)", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Share2 style={{ width: 15, height: 15 }} strokeWidth={2} />
                Share link
              </button>

              {/* Copy row: code + link side by side */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => copyToClipboard(referral.code, "code")}
                  className="press"
                  style={{
                    flex: 1, padding: "12px 14px", borderRadius: 14,
                    background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                    color: "var(--park-fg)", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    cursor: "pointer",
                  }}
                >
                  {isCopied("code")
                    ? <Check style={{ width: 14, height: 14, color: "var(--park-ok)" }} strokeWidth={2} />
                    : <Copy style={{ width: 14, height: 14 }} strokeWidth={2} />}
                  {isCopied("code") ? "Copied!" : "Copy code"}
                </button>
                <button
                  onClick={() => copyToClipboard(shareUrl, "inviteLink")}
                  className="press"
                  style={{
                    flex: 1, padding: "12px 14px", borderRadius: 14,
                    background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                    color: "var(--park-fg)", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    cursor: "pointer",
                  }}
                >
                  {isCopied("inviteLink")
                    ? <Check style={{ width: 14, height: 14, color: "var(--park-ok)" }} strokeWidth={2} />
                    : <Link2 style={{ width: 14, height: 14 }} strokeWidth={2} />}
                  {isCopied("inviteLink") ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>

            {/* Karma incentive nudge */}
            <div style={{
              marginTop: 14, padding: "12px 14px", borderRadius: 14,
              background: "var(--park-accent-pale)", border: "1px solid var(--park-accent)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Zap style={{ width: 20, height: 20, color: "var(--park-accent)", flexShrink: 0 }} strokeWidth={1.75} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--park-accent)" }}>
                  100 karma for every friend who joins
                </div>
                <div style={{ fontSize: 11, color: "var(--park-muted-fg)", marginTop: 1 }}>
                  They get 50 karma too -- everybody wins
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            SHARE WINS TAB
            ================================================================ */}
        {activeTab === "share" && (
          <div className="fade-in">
            {/* Stats card */}
            <div style={{
              padding: 24, borderRadius: 18,
              background: "var(--park-surface2)",
              border: "1px solid var(--park-border)",
              textAlign: "center",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 999, margin: "0 auto 12px",
                background: "var(--park-ok-bg)", color: "var(--park-ok-ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield style={{ width: 24, height: 24 }} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "var(--park-fg)", letterSpacing: -1.5, lineHeight: 1 }}>
                ${savings.total}
              </div>
              <div style={{ fontSize: 13, color: "var(--park-muted-fg)", marginTop: 4 }}>
                saved from {savings.ticketsAvoided} ticket{savings.ticketsAvoided !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--park-fg)" }}>{gamification.currentStreak}</div>
                  <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>day streak</div>
                </div>
                <div style={{ width: 1, background: "var(--park-hairline)" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--park-fg)" }}>{gamification.karma}</div>
                  <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>karma</div>
                </div>
                <div style={{ width: 1, background: "var(--park-hairline)" }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--park-fg)" }}>Lv{gamification.level}</div>
                  <div style={{ fontSize: 11, color: "var(--park-muted-fg)" }}>level</div>
                </div>
              </div>
            </div>

            {/* Share actions */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => handleNativeShare(shareStatsText, "statsLink")}
                className="press"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
                }}
              >
                <Share2 style={{ width: 16, height: 16 }} strokeWidth={2} />
                Share my stats
              </button>
              <button
                onClick={() => copyToClipboard(shareUrl, "statsLink")}
                className="press"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                  color: "var(--park-fg)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {isCopied("statsLink")
                  ? <Check style={{ width: 15, height: 15, color: "var(--park-ok)" }} strokeWidth={2} />
                  : <Link2 style={{ width: 15, height: 15 }} strokeWidth={2} />}
                {isCopied("statsLink") ? "Link copied!" : "Copy invite link"}
              </button>
            </div>

            {/* Referral nudge */}
            <div style={{
              marginTop: 14, padding: "12px 14px", borderRadius: 14,
              background: "var(--park-accent-pale)", border: "1px solid var(--park-accent)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Trophy style={{ width: 20, height: 20, color: "var(--park-accent)", flexShrink: 0 }} strokeWidth={1.75} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--park-accent)" }}>
                  Earn 100 karma per invite
                </div>
                <div style={{ fontSize: 11, color: "var(--park-muted-fg)", marginTop: 1 }}>
                  Your friends get 50 karma too
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
