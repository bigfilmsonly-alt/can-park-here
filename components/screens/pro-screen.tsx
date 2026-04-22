"use client"

import { useState } from "react"
import { X, Shield, Star, Check } from "lucide-react"

interface ProScreenProps {
  onUpgrade: () => void
  onBack: () => void
}

const benefits = [
  "Up to $100 ticket protection",
  "Unlimited parking checks",
  "AI sign scanner",
  "Priority support",
]

export function ProScreen({ onUpgrade, onBack }: ProScreenProps) {
  const [plan, setPlan] = useState<"annual" | "monthly">("annual")

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-y-auto">
      {/* Close button */}
      <div className="flex items-start px-4 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 8px)" }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center press-effect"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Go back"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-8 stagger-children">
        {/* Shield icon with glow */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "rgba(52,199,89,0.12)",
            boxShadow: "0 0 80px rgba(52,199,89,0.3)",
          }}
        >
          <Shield className="w-16 h-16 text-[var(--accent)]" />
        </div>

        {/* Headline */}
        <h1
          className="text-title text-white text-center mt-6"
          style={{ maxWidth: 280 }}
        >
          The only parking app that pays for your ticket
        </h1>

        {/* Star rating */}
        <div className="flex flex-col items-center mt-5">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-lg">4.9</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  style={{ color: "var(--accent)", fill: "var(--accent)" }}
                />
              ))}
            </div>
          </div>
          <p className="text-caption mt-1">2,400+ reviews</p>
        </div>

        {/* Benefits */}
        <div className="w-full mt-8 space-y-4">
          {benefits.map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(52,199,89,0.15)" }}
              >
                <Check className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <span className="text-white text-body">{text}</span>
            </div>
          ))}
        </div>

        {/* Plan toggle */}
        <div
          className="w-full mt-8 flex gap-2 p-1 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setPlan("monthly")}
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold transition-all press-effect"
            style={{
              background: plan === "monthly" ? "rgba(255,255,255,0.12)" : "transparent",
              color: plan === "monthly" ? "#ffffff" : "var(--muted-foreground)",
            }}
          >
            Monthly $4.99
          </button>
          <button
            onClick={() => setPlan("annual")}
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold transition-all relative press-effect"
            style={{
              background: plan === "annual" ? "rgba(255,255,255,0.12)" : "transparent",
              color: plan === "annual" ? "#ffffff" : "var(--muted-foreground)",
            }}
          >
            Annual $39.99
            <span
              className="absolute -top-2.5 right-2 text-micro px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--accent)",
                color: "#000000",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              BEST VALUE
            </span>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={onUpgrade}
          className="w-full mt-6 py-4 rounded-2xl text-base font-semibold text-black press-effect"
          style={{ background: "var(--accent)" }}
        >
          Start 7-Day Free Trial
        </button>

        {/* Trust line */}
        <p className="text-caption text-center mt-3">
          No charge today &middot; Cancel anytime
        </p>
      </div>
    </div>
  )
}
