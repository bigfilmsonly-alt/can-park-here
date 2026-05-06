"use client"

import { useState } from "react"
import {
  X,
  Star,
  PartyPopper,
  Share2,
  Flag,
  ChevronRight,
  Check,
  AlertTriangle,
  Clock,
  Sun,
  Lightbulb,
  ParkingCircle,
  Wrench,
  Shield,
  TreeDeciduous,
  Ruler,
  Sparkles,
} from "lucide-react"
import {
  addSpotTip,
  saveSpotRating,
  broadcastVacatingSpot,
  type SpotTag,
  SPOT_TAG_LABELS,
} from "@/lib/spot-tips"
import {
  incrementGamificationStat,
  addKarma,
} from "@/lib/gamification"

interface PostParkingModalProps {
  isOpen: boolean
  onClose: () => void
  onShare: () => void
  location: { lat: number; lng: number } | null
  address?: string
  ticketsAvoided?: number
  moneySaved?: number
}

type Step = "celebrate" | "ticket" | "rate" | "tip" | "done"

const QUICK_TIPS: { tag: SpotTag; label: string; Icon: typeof Star }[] = [
  { tag: "easy_to_find", label: "Easy to find", Icon: Check },
  { tag: "meter_works", label: "Meter works", Icon: ParkingCircle },
  { tag: "meter_broken", label: "Meter broken", Icon: Wrench },
  { tag: "free_after_6pm", label: "Free after 6pm", Icon: Clock },
  { tag: "free_sundays", label: "Free Sundays", Icon: Sun },
  { tag: "enforcement_frequent", label: "Enforcement frequent", Icon: AlertTriangle },
  { tag: "enforcement_rare", label: "Enforcement rare", Icon: Shield },
  { tag: "good_lighting", label: "Good lighting", Icon: Lightbulb },
  { tag: "shade_available", label: "Shade available", Icon: TreeDeciduous },
  { tag: "tight_space", label: "Tight space", Icon: Ruler },
]

export function PostParkingModal({
  isOpen,
  onClose,
  onShare,
  location,
  address,
  ticketsAvoided = 0,
  moneySaved = 0,
}: PostParkingModalProps) {
  const [step, setStep] = useState<Step>("celebrate")
  const [gotTicket, setGotTicket] = useState<boolean | null>(null)
  const [rating, setRating] = useState(0)
  const [selectedTips, setSelectedTips] = useState<SpotTag[]>([])
  const [leaving, setLeaving] = useState(false)
  const [karmaEarned, setKarmaEarned] = useState(0)

  if (!isOpen) return null

  const handleNoTicket = () => {
    setGotTicket(false)
    incrementGamificationStat("ticketsAvoided")
    setStep("rate")
  }

  const handleGotTicket = () => {
    setGotTicket(true)
    setStep("rate")
  }

  const handleRate = (stars: number) => {
    setRating(stars)
    if (location) saveSpotRating(location.lat, location.lng, stars)
    setStep("tip")
  }

  const toggleTip = (tag: SpotTag) => {
    setSelectedTips(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    if (!location) { setStep("done"); return }

    let earned = 0
    // Save tips
    selectedTips.forEach(tag => {
      addSpotTip(location.lat, location.lng, tag, rating)
    })
    // If they at least rated, give karma
    if (rating > 0) {
      const result = addKarma("confirmReport")
      earned += result.karma
    }
    // Extra karma for tips
    if (selectedTips.length > 0) {
      const result = addKarma("reportMeterStatus")
      earned += result.karma
    }

    setKarmaEarned(earned)
    setStep("done")
  }

  const handleLeaving = () => {
    if (!location) return
    setLeaving(true)
    broadcastVacatingSpot(location.lat, location.lng, address || "Current location")
    addKarma("helpfulReport")
    setTimeout(() => {
      setLeaving(false)
    }, 1000)
  }

  const handleClose = () => {
    setStep("celebrate")
    setGotTicket(null)
    setRating(0)
    setSelectedTips([])
    setKarmaEarned(0)
    onClose()
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
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={handleClose}
            className="press"
            style={{ width: 32, height: 32, borderRadius: 999, background: "var(--park-surface2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--park-muted-fg)", cursor: "pointer" }}
          >
            <X style={{ width: 16, height: 16 }} strokeWidth={2} />
          </button>
        </div>

        {/* ── STEP: CELEBRATE ── */}
        {step === "celebrate" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 999, margin: "0 auto 16px",
              background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 30px rgba(59,130,246,0.35)",
              animation: "springIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}>
              <PartyPopper style={{ width: 36, height: 36, color: "#fff" }} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--park-fg)", letterSpacing: -0.8, margin: 0 }}>
              You're back!
            </h2>
            <p style={{ fontSize: 14, color: "var(--park-muted-fg)", marginTop: 6 }}>
              How did it go?
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={handleNoTicket}
                className="press"
                style={{
                  flex: 1, padding: "16px 12px", borderRadius: 18,
                  background: "var(--park-ok-bg)", border: "2px solid var(--park-ok)",
                  color: "var(--park-ok-ink)", fontSize: 15, fontWeight: 700,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  cursor: "pointer",
                }}
              >
                <Sparkles style={{ width: 24, height: 24 }} strokeWidth={1.75} />
                No ticket!
              </button>
              <button
                onClick={handleGotTicket}
                className="press"
                style={{
                  flex: 1, padding: "16px 12px", borderRadius: 18,
                  background: "var(--park-err-bg)", border: "2px solid var(--park-err)",
                  color: "var(--park-err-ink)", fontSize: 15, fontWeight: 700,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  cursor: "pointer",
                }}
              >
                <Flag style={{ width: 24, height: 24 }} strokeWidth={1.75} />
                Got a ticket
              </button>
            </div>

            {/* "I'm leaving" broadcast button */}
            <button
              onClick={handleLeaving}
              disabled={leaving}
              className="press"
              style={{
                width: "100%", marginTop: 14, padding: "12px 16px", borderRadius: 14,
                background: "var(--park-accent-pale)", border: "1px solid var(--park-accent)",
                color: "var(--park-accent)", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", opacity: leaving ? 0.7 : 1,
              }}
            >
              <ParkingCircle style={{ width: 16, height: 16 }} strokeWidth={2} />
              {leaving ? "Spot shared!" : "Share my spot with nearby parkers"}
            </button>
          </div>
        )}

        {/* ── STEP: RATE ── */}
        {step === "rate" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            {gotTicket === false && (
              <div style={{
                width: 56, height: 56, borderRadius: 999, margin: "0 auto 12px",
                background: "var(--park-ok-bg)", color: "var(--park-ok-ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Check style={{ width: 28, height: 28 }} strokeWidth={2} />
              </div>
            )}
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--park-fg)", letterSpacing: -0.5, margin: 0 }}>
              {gotTicket ? "Sorry to hear that" : "Awesome! +1 ticket avoided"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--park-muted-fg)", marginTop: 6 }}>
              Rate this parking spot
            </p>

            {/* Star rating */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="press"
                  style={{
                    width: 48, height: 48, borderRadius: 14, border: "none", cursor: "pointer",
                    background: star <= rating ? "var(--park-accent)" : "var(--park-surface2)",
                    color: star <= rating ? "#fff" : "var(--park-muted-fg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}
                >
                  <Star style={{ width: 22, height: 22 }} strokeWidth={1.75} fill={star <= rating ? "#fff" : "none"} />
                </button>
              ))}
            </div>

            <button
              onClick={() => { setRating(0); setStep("tip") }}
              style={{
                background: "none", border: "none", color: "var(--park-muted-fg)",
                fontSize: 13, marginTop: 16, cursor: "pointer",
              }}
            >
              Skip
            </button>
          </div>
        )}

        {/* ── STEP: TIP ── */}
        {step === "tip" && (
          <div className="fade-in">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--park-fg)", letterSpacing: -0.4, margin: 0 }}>
              Leave a tip for others
            </h2>
            <p style={{ fontSize: 13, color: "var(--park-muted-fg)", marginTop: 4, marginBottom: 16 }}>
              Help the next parker - select any that apply
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {QUICK_TIPS.map(tip => {
                const selected = selectedTips.includes(tip.tag)
                return (
                  <button
                    key={tip.tag}
                    onClick={() => toggleTip(tip.tag)}
                    className="press"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                      background: selected ? "var(--park-accent-pale)" : "var(--park-surface2)",
                      border: selected ? "1.5px solid var(--park-accent)" : "1.5px solid transparent",
                      color: selected ? "var(--park-accent)" : "var(--park-fg)",
                      fontSize: 13, fontWeight: 600, transition: "all .15s",
                    }}
                  >
                    <tip.Icon style={{ width: 14, height: 14 }} strokeWidth={2} />
                    {tip.label}
                  </button>
                )
              })}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => { setSelectedTips([]); handleSubmit() }}
                className="press"
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 14,
                  border: "1px solid var(--park-border)", background: "var(--park-surface2)",
                  color: "var(--park-fg)", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className="press"
                style={{
                  flex: 2, padding: "14px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
                }}
              >
                Submit tips
                <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && (
          <div className="fade-in" style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, margin: "0 auto 16px",
              background: "var(--park-ok-bg)", color: "var(--park-ok-ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check style={{ width: 32, height: 32 }} strokeWidth={2} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--park-fg)", letterSpacing: -0.5, margin: 0 }}>
              Thanks for helping!
            </h2>
            {karmaEarned > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 999, marginTop: 10,
                background: "var(--park-accent-pale)", color: "var(--park-accent)",
                fontSize: 14, fontWeight: 700,
              }}>
                <Sparkles style={{ width: 14, height: 14 }} strokeWidth={2} />
                +{karmaEarned} karma earned
              </div>
            )}
            <p style={{ fontSize: 13, color: "var(--park-muted-fg)", marginTop: 8 }}>
              Your tips help other parkers stay safe
            </p>

            {/* Share win */}
            <button
              onClick={async () => {
                const shareData = {
                  title: "Park - Never get a parking ticket again",
                  text: "Just parked in SF without getting a ticket. Park tells you in 2 seconds if you can park - and pays your ticket if wrong. Try it free:",
                  url: "https://can-park-here.vercel.app",
                }
                if (navigator.share) {
                  try { await navigator.share(shareData) } catch {}
                } else {
                  onShare()
                }
              }}
              className="press"
              style={{
                width: "100%", marginTop: 20, padding: "14px 16px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, var(--park-accent), var(--park-accent-deep))",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 6px 20px rgba(59,130,246,0.3)",
              }}
            >
              <Share2 style={{ width: 16, height: 16 }} strokeWidth={2} />
              Share with friends
            </button>
            <button
              onClick={onShare}
              style={{
                background: "none", border: "none", color: "var(--park-accent)",
                fontSize: 13, fontWeight: 600, marginTop: 10, cursor: "pointer",
                textDecoration: "underline", textUnderlineOffset: 2,
              }}
            >
              Invite a friend
            </button>
            <button
              onClick={handleClose}
              style={{
                background: "none", border: "none", color: "var(--park-muted-fg)",
                fontSize: 14, fontWeight: 600, marginTop: 12, cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
