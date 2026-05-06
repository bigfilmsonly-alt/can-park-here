"use client"

import { useState } from "react"
import { X, ShieldCheck, Check, Minus, Star } from "lucide-react"

interface ProScreenProps {
  onUpgrade: () => void
  onBack: () => void
}

const features = [
  { label: "Plain-English answer", free: true, pro: true },
  { label: "Sign scanning", free: true, pro: true },
  { label: "Timer + reminders", free: true, pro: true },
  { label: "Ticket protection (3/yr)", free: false, pro: true },
  { label: "Priority dispute help", free: false, pro: true },
  { label: "Photo vault (unlimited)", free: false, pro: true },
]

const plans = {
  monthly: { price: "$4.99/mo", ctaSub: "then $4.99/mo", perDay: null },
  annual: { price: "$39.99/yr", ctaSub: "then $39.99/yr", perDay: "$0.11/day" },
}

export function ProScreen({ onUpgrade, onBack }: ProScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [activating, setActivating] = useState(false)

  const plan = plans[selectedPlan]

  const handleUpgrade = () => {
    setActivating(true)
    setTimeout(() => {
      onUpgrade()
    }, 600)
  }

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#fff",
        color: "#111",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Close button */}
      <button
        onClick={onBack}
        className="press"
        style={{
          position: "absolute",
          top: 58,
          left: 18,
          width: 36,
          height: 36,
          borderRadius: 999,
          background: "#f3f4f6",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#555",
          zIndex: 10,
        }}
      >
        <X style={{ width: 18, height: 18 }} strokeWidth={2} />
      </button>

      {/* Hero */}
      <div style={{ padding: "120px 24px 0", textAlign: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "#2563eb",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldCheck style={{ width: 40, height: 40 }} strokeWidth={1.75} />
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -0.8,
            lineHeight: 1.1,
            marginTop: 20,
            color: "#111",
          }}
        >
          If Park is wrong,
          <br />
          Park pays.
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#6b7280",
            marginTop: 12,
            lineHeight: 1.5,
            maxWidth: 320,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Follow our guidance, get a ticket anyway, and we reimburse up to $100. Pro covers 3 claims per year.
        </div>
      </div>

      {/* Plan toggle */}
      <div style={{ padding: "28px 18px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className="press"
            style={{
              position: "relative",
              padding: "16px 14px",
              borderRadius: 16,
              border: selectedPlan === "monthly" ? "2px solid #2563eb" : "2px solid #e5e7eb",
              background: selectedPlan === "monthly" ? "#eff6ff" : "#fff",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Monthly</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginTop: 4 }}>$4.99</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>/month</div>
          </button>

          {/* Annual */}
          <button
            onClick={() => setSelectedPlan("annual")}
            className="press"
            style={{
              position: "relative",
              padding: "16px 14px",
              borderRadius: 16,
              border: selectedPlan === "annual" ? "2px solid #2563eb" : "2px solid #e5e7eb",
              background: selectedPlan === "annual" ? "#eff6ff" : "#fff",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {/* Best Value badge */}
            <div
              style={{
                position: "absolute",
                top: -10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#2563eb",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                padding: "3px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              BEST VALUE
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Annual</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginTop: 4 }}>$3.33</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>/month</div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#2563eb",
                marginTop: 4,
              }}
            >
              $0.11/day
            </div>
          </button>
        </div>
      </div>

      {/* Feature comparison table */}
      <div style={{ padding: "24px 18px 0" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            style={{
              padding: "10px 16px",
              display: "grid",
              gridTemplateColumns: "1fr 50px 50px",
              alignItems: "center",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Feature</div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>Free</div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#2563eb", fontWeight: 700 }}>Pro</div>
          </div>

          {features.map((f, i) => (
            <div
              key={f.label}
              style={{
                padding: "13px 16px",
                display: "grid",
                gridTemplateColumns: "1fr 50px 50px",
                alignItems: "center",
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{f.label}</div>
              <div style={{ textAlign: "center", color: f.free ? "#22c55e" : "#d1d5db" }}>
                {f.free ? (
                  <Check style={{ width: 18, height: 18, margin: "0 auto" }} strokeWidth={2} />
                ) : (
                  <Minus style={{ width: 18, height: 18, margin: "0 auto" }} strokeWidth={2} />
                )}
              </div>
              <div style={{ textAlign: "center", color: f.pro ? "#2563eb" : "#d1d5db" }}>
                {f.pro ? (
                  <Check style={{ width: 18, height: 18, margin: "0 auto" }} strokeWidth={2} />
                ) : (
                  <Minus style={{ width: 18, height: 18, margin: "0 auto" }} strokeWidth={2} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "28px 18px 0" }}>
        <button
          onClick={handleUpgrade}
          disabled={activating}
          className="press"
          style={{
            width: "100%",
            padding: "18px 26px 14px",
            borderRadius: 999,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: activating ? "default" : "pointer",
            opacity: activating ? 0.7 : 1,
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            transition: "opacity 0.2s",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>
            {activating ? "Activating..." : "Start Free 7-Day Trial"}
          </div>
          {!activating && (
            <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
              {plan.ctaSub} · Cancel anytime
            </div>
          )}
        </button>
      </div>

      {/* Trust line */}
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#9ca3af",
          marginTop: 12,
          padding: "0 18px",
          fontWeight: 500,
        }}
      >
        No charge today · Cancel anytime · No commitment
      </div>

      {/* Testimonial */}
      <div style={{ padding: "24px 18px 48px" }}>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 16,
            padding: "18px 18px 18px 22px",
            borderLeft: "4px solid #2563eb",
          }}
        >
          <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                style={{ width: 14, height: 14, color: "#facc15", fill: "#facc15" }}
                strokeWidth={0}
              />
            ))}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: "#374151", fontStyle: "italic" }}>
            "Got a $76 ticket on Valencia. Filed a claim in the app. Park sent me $76 via Stripe 18 hours later."
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginTop: 10 }}>
            — Maria C., Mission District
          </div>
        </div>
      </div>
    </div>
  )
}
