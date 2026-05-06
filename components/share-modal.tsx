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

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"invite" | "share">("invite")

  if (!isOpen) return null

  const referral = getReferralStats()
  const gamification = getGamificationState()
  const savings = getMoneySavedStats()

  const shareUrl = `https://canparkhere.com?ref=${referral.code}`
  const shareText = `I've avoided ${savings.ticketsAvoided} parking tickets and saved $${savings.total} with Park. Use my code ${referral.code} for bonus karma! ${shareUrl}`
  const inviteText = `Stop getting parking tickets! Park tells you if you can park somewhere in 2 seconds. Use my code ${referral.code} to get started. ${shareUrl}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referral.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleNativeShare = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Park - Never get a parking ticket again",
          text,
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed, try clipboard
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const glass: React.CSSProperties = {
    background: "var(--card-glass)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md animate-slide-up"
        style={{
          ...glass,
          borderRadius: "28px 28px 0 0",
          border: "1px solid var(--park-border)",
          borderBottom: "none",
          padding: "24px 22px 40px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--park-fg)", margin: 0 }}>
            Share Park
          </h2>
          <button
            onClick={onClose}
            className="press"
            style={{ width: 32, height: 32, borderRadius: 999, background: "var(--park-surface2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-muted-fg)", cursor: "pointer" }}
          >
            <X style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        </div>

        {/* Tab toggle */}
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

        {/* ── INVITE TAB ── */}
        {activeTab === "invite" && (
          <div className="fade-in">
            {/* Referral code card */}
            <div style={{
              padding: 20, borderRadius: 18,
              background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
              color: "#fff", textAlign: "center",
              boxShadow: "0 8px 30px rgba(59,130,246,0.3)",
            }}>
              <Gift style={{ width: 28, height: 28, margin: "0 auto 8px" }} strokeWidth={1.75} />
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Your referral code
              </div>
              <div style={{
                fontSize: 32, fontWeight: 800, letterSpacing: 3, marginTop: 6,
                fontFamily: "ui-monospace, 'SF Mono', monospace",
              }}>
                {referral.code}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Both you and your friend get 100 karma
              </div>
            </div>

            {/* Stats */}
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

            {/* Share buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={handleCopyCode}
                className="press"
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 14,
                  background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                  color: "var(--park-fg)", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  cursor: "pointer",
                }}
              >
                {copied ? <Check style={{ width: 14, height: 14, color: "var(--park-ok)" }} strokeWidth={2} /> : <Copy style={{ width: 14, height: 14 }} strokeWidth={2} />}
                {copied ? "Copied!" : "Copy code"}
              </button>
              <button
                onClick={() => handleNativeShare(inviteText)}
                className="press"
                style={{
                  flex: 2, padding: "12px 14px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
                }}
              >
                <Share2 style={{ width: 14, height: 14 }} strokeWidth={2} />
                Invite friends
              </button>
            </div>
          </div>
        )}

        {/* ── SHARE WINS TAB ── */}
        {activeTab === "share" && (
          <div className="fade-in">
            {/* Win card */}
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
                saved from {savings.ticketsAvoided} tickets
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

            {/* Share options */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => handleNativeShare(shareText)}
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
                onClick={handleCopyLink}
                className="press"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  background: "var(--park-surface2)", border: "1px solid var(--park-border)",
                  color: "var(--park-fg)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Link2 style={{ width: 15, height: 15 }} strokeWidth={2} />
                Copy invite link
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
