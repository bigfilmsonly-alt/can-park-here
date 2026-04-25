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
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={loading ? undefined : onClose} />

      <div
        className="relative w-full max-w-md rounded-t-[28px] overflow-hidden animate-slide-in-up max-h-[92vh] flex flex-col"
        style={{ background: "#0b0f17", border: "1px solid #2d3447", borderBottom: "none" }}
      >
        <div className="overflow-y-auto flex-1">
          {/* Close */}
          <div className="flex justify-end px-5 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#262c3b" }}
            >
              <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </button>
          </div>

          <div className="px-6 pt-2 pb-4">
            {/* Shield hero with pulse */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-[22px] flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  <ShieldCheck className="w-10 h-10" style={{ color: "#3b82f6" }} />
                </div>
                <div
                  className="absolute inset-0 rounded-[22px] animate-ping"
                  style={{ background: "rgba(59,130,246,0.08)", animationDuration: "2s" }}
                />
              </div>
            </div>

            {/* Headline */}
            <h2
              className="text-center font-bold"
              style={{ fontSize: 28, letterSpacing: -1, color: "#f8fafc", lineHeight: 1.15 }}
            >
              The only parking app that{" "}
              <span style={{ color: "#3b82f6" }}>pays for your ticket</span>
            </h2>

            {/* Benefits */}
            <div className="mt-7 space-y-3">
              {benefits.map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(59,130,246,0.12)" }}
                  >
                    <Check className="w-4.5 h-4.5" style={{ color: "#3b82f6" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#f8fafc" }}>{b.text}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan toggle */}
            <div
              className="mt-7 p-1 rounded-2xl grid grid-cols-2 gap-1"
              style={{ background: "#262c3b" }}
            >
              <button
                onClick={() => setPlan("monthly")}
                className="py-3 rounded-xl text-center relative"
                style={{
                  background: plan === "monthly" ? "#1a1f2b" : "transparent",
                  color: plan === "monthly" ? "#f8fafc" : "#94a3b8",
                }}
              >
                <p className="text-xs font-semibold">Monthly</p>
                <p className="text-lg font-bold mt-0.5">$4.99<span className="text-xs font-normal opacity-50">/mo</span></p>
              </button>
              <button
                onClick={() => setPlan("annual")}
                className="py-3 rounded-xl text-center relative"
                style={{
                  background: plan === "annual" ? "rgba(59,130,246,0.12)" : "transparent",
                  border: plan === "annual" ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                  color: plan === "annual" ? "#f8fafc" : "#94a3b8",
                }}
              >
                {/* Best value badge */}
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}
                >
                  Best value
                </span>
                <p className="text-xs font-semibold">Annual</p>
                <p className="text-lg font-bold mt-0.5">$39.99<span className="text-xs font-normal opacity-50">/yr</span></p>
                <p className="text-[10px] mt-0.5" style={{ color: "#3b82f6" }}>Save 33%</p>
              </button>
            </div>

            {/* Testimonial */}
            <div
              className="mt-6 p-4 rounded-2xl"
              style={{ background: "#1a1f2b", border: "1px solid #2d3447" }}
            >
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5" fill="#f59e0b" style={{ color: "#f59e0b" }} />
                ))}
              </div>
              <p className="text-sm" style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
                "Got a $95 street cleaning ticket my first week in SF. Park would have caught it. Signed up for Pro immediately."
              </p>
              <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                — Jamie M., San Francisco
              </p>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="px-5 pt-3 pb-8" style={{ background: "#0b0f17", borderTop: "1px solid #2d3447" }}>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 rounded-full text-base font-bold press-effect disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}
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
          <p className="text-center text-[11px] mt-2.5" style={{ color: "#94a3b8" }}>
            then {plan === "annual" ? "$39.99/yr" : "$4.99/mo"} · Cancel anytime
          </p>
          <p className="text-center text-[11px] mt-1.5" style={{ color: "#64748b" }}>
            No charge today · Cancel anytime · No commitment
          </p>
        </div>
      </div>
    </div>
  )
}
