"use client"

import { useState } from "react"
import { ShieldCheck, Check, X, Star, Loader2, Zap, Clock, Camera } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void | Promise<void>
}

const benefits = [
  { icon: ShieldCheck, text: "Ticket protection up to $100", sub: "3 claims per year" },
  { icon: Camera, text: "Unlimited sign scanning", sub: "AI-powered instant results" },
  { icon: Clock, text: "Smart timer with push alerts", sub: "Never get a ticket again" },
  { icon: Zap, text: "Priority dispute support", sub: "We handle the paperwork" },
]

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<"annual" | "monthly">("annual")

  if (!isOpen) return null

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      await onUpgrade()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        onClick={loading ? undefined : onClose}
      />

      <div
        className="relative w-full max-w-md rounded-t-[28px] overflow-hidden animate-slide-in-up max-h-[92vh] flex flex-col"
        style={{
          background: "var(--park-bg)",
          border: "1px solid var(--park-border)",
          borderBottom: "none",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
        }}
      >
        <div className="overflow-y-auto flex-1">
          {/* Close */}
          <div className="flex justify-end px-5 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full flex items-center justify-center press"
              style={{ background: "var(--park-muted)" }}
            >
              <X className="w-4 h-4" style={{ color: "var(--park-muted-fg)" }} />
            </button>
          </div>

          <div className="px-6 pt-2 pb-4">
            {/* Shield hero */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-[22px] flex items-center justify-center"
                  style={{ background: "var(--park-accent-pale)" }}
                >
                  <ShieldCheck className="w-10 h-10" style={{ color: "var(--park-accent)" }} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2
              className="text-center font-bold"
              style={{
                fontSize: 26,
                letterSpacing: "-0.03em",
                color: "var(--park-fg)",
                lineHeight: 1.15,
              }}
            >
              The only parking app that{" "}
              <span style={{ color: "var(--park-accent)" }}>pays for your ticket</span>
            </h2>

            {/* Benefits */}
            <div className="mt-7 space-y-2.5">
              {benefits.map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-[16px]"
                  style={{ background: "var(--park-muted)", border: "1px solid var(--park-hairline)" }}
                >
                  <div
                    className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ background: "var(--park-accent-pale)" }}
                  >
                    <Check className="w-4 h-4" style={{ color: "var(--park-accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--park-fg)", letterSpacing: "-0.01em" }}>{b.text}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--park-muted-fg)" }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan toggle */}
            <div
              className="mt-7 p-1 rounded-[16px] grid grid-cols-2 gap-1"
              style={{ background: "var(--park-muted)" }}
            >
              <button
                onClick={() => setPlan("monthly")}
                className="py-3 rounded-[12px] text-center relative press"
                style={{
                  background: plan === "monthly" ? "var(--park-surface)" : "transparent",
                  color: plan === "monthly" ? "var(--park-fg)" : "var(--park-muted-fg)",
                  boxShadow: plan === "monthly" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <p className="text-[11px] font-medium">Monthly</p>
                <p className="text-[17px] font-bold mt-0.5" style={{ letterSpacing: "-0.02em" }}>
                  $4.99<span className="text-[11px] font-normal opacity-50">/mo</span>
                </p>
              </button>
              <button
                onClick={() => setPlan("annual")}
                className="py-3 rounded-[12px] text-center relative press"
                style={{
                  background: plan === "annual" ? "var(--park-surface)" : "transparent",
                  color: plan === "annual" ? "var(--park-fg)" : "var(--park-muted-fg)",
                  boxShadow: plan === "annual" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  border: plan === "annual" ? "1px solid var(--park-accent-pale)" : "1px solid transparent",
                }}
              >
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.06em]"
                  style={{ background: "var(--park-accent)", color: "#fff" }}
                >
                  Best value
                </span>
                <p className="text-[11px] font-medium">Annual</p>
                <p className="text-[17px] font-bold mt-0.5" style={{ letterSpacing: "-0.02em" }}>
                  $39.99<span className="text-[11px] font-normal opacity-50">/yr</span>
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--park-accent)" }}>Save 33%</p>
              </button>
            </div>

            {/* Testimonial */}
            <div
              className="mt-6 p-4 rounded-[16px]"
              style={{ background: "var(--park-muted)", border: "1px solid var(--park-hairline)" }}
            >
              <div className="flex items-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[13px] leading-[1.55]" style={{ color: "var(--park-fg2)" }}>
                &ldquo;Got a $95 street cleaning ticket my first week in SF. Park would have caught it. Signed up for Pro immediately.&rdquo;
              </p>
              <p className="text-[11px] mt-2" style={{ color: "var(--park-muted-fg)" }}>
                &mdash; Jamie M., San Francisco
              </p>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div
          className="px-5 pt-3 pb-8"
          style={{ background: "var(--park-bg)", borderTop: "1px solid var(--park-hairline)" }}
        >
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 rounded-full text-[15px] font-semibold press-effect disabled:opacity-70"
            style={{
              background: "var(--park-accent)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting...
              </span>
            ) : (
              "Start Free 7-Day Trial"
            )}
          </button>
          <p className="text-center text-[11px] mt-2.5" style={{ color: "var(--park-muted-fg)" }}>
            then {plan === "annual" ? "$39.99/yr" : "$4.99/mo"} &middot; Cancel anytime
          </p>
          <p className="text-center text-[11px] mt-1" style={{ color: "var(--park-muted-fg)", opacity: 0.7 }}>
            No charge today &middot; No commitment
          </p>
        </div>
      </div>
    </div>
  )
}
