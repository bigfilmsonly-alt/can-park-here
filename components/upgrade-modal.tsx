"use client"

import { useState } from "react"
import { ShieldCheck, Check, X, Star, Loader2 } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void | Promise<void>
}

const features: [string, boolean, boolean][] = [
  ["Plain-English answers", true, true],
  ["Sign scanning", true, true],
  ["Timer + reminders", true, true],
  ["Ticket protection ($100 x 3/yr)", false, true],
  ["Priority dispute help", false, true],
  ["Unlimited photo vault", false, true],
]

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

      <div className="relative bg-background w-full max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-in-up max-h-[90vh] flex flex-col">
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Close */}
          <div className="flex justify-end px-5.5 pt-3.5">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center press-effect"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pt-4 pb-4">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <ShieldCheck className="w-11 h-11" />
            </div>

            {/* Headline */}
            <div className="text-[44px] font-bold tracking-tighter mt-5.5 leading-none">
              If Park is wrong,
              <br />
              Park pays.
            </div>
            <div className="text-base mt-3.5 leading-relaxed" style={{ color: "var(--fg2)" }}>
              Follow our guidance, get a ticket? We reimburse up to $100. Pro covers 3 claims a year.
            </div>

            {/* Comparison table */}
            <div className="mt-6.5 bg-card border border-border rounded-[18px] overflow-hidden">
              {features.map(([label, free, pro], i) => (
                <div
                  key={label}
                  className="grid items-center gap-0 px-4.5 py-3"
                  style={{
                    gridTemplateColumns: "1fr 54px 54px",
                    borderTop: i > 0 ? "1px solid var(--hairline)" : "none",
                  }}
                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className="flex justify-center" style={{ color: free ? "var(--status-success)" : "var(--muted-foreground)" }}>
                    {free ? <Check className="w-[18px] h-[18px]" /> : <X className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex justify-center" style={{ color: "var(--accent)" }}>
                    <Check className="w-[18px] h-[18px]" />
                  </div>
                </div>
              ))}
              {/* Labels row */}
              <div
                className="grid items-center gap-0 px-4.5 py-2.5"
                style={{ gridTemplateColumns: "1fr 54px 54px", borderTop: "1px solid var(--hairline)" }}
              >
                <div />
                <div className="text-center text-[11px] font-bold text-muted-foreground">FREE</div>
                <div className="text-center text-[11px] font-extrabold" style={{ color: "var(--accent)" }}>PRO</div>
              </div>
            </div>

            {/* Testimonial */}
            <div
              className="mt-5 p-3.5 rounded-[18px] border flex items-center gap-2.5"
              style={{ background: "var(--accent-pale)", borderColor: "var(--accent)" }}
            >
              <Star className="w-5 h-5 shrink-0" style={{ color: "var(--accent)" }} />
              <div className="text-[12.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>
                "Saved me $95 in tickets this month alone." — Jamie, SF
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="px-4 pt-2 pb-5 bg-background border-t border-hairline">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 rounded-full text-base font-bold press-effect disabled:opacity-70"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting...
              </span>
            ) : (
              "Start Pro — $4.99/mo"
            )}
          </button>
          <div className="text-center text-xs text-muted-foreground mt-2.5">
            7-day free trial · Cancel anytime
          </div>
        </div>
      </div>
    </div>
  )
}
