"use client"

import { useState } from "react"
import { ShieldCheck, Check, Clock, X } from "lucide-react"
import { ParkLogo } from "@/components/park-logo"

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)

  const slides = [
    {
      isDark: true,
      title: "Can I park here?",
      sub: "A plain-English answer, in under a second. Wherever you are.",
      vis: (
        <div className="relative w-full h-80 flex items-center justify-center">
          <div
            className="absolute w-[260px] h-[260px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            }}
          />
          <ParkLogo size={150} />
        </div>
      ),
    },
    {
      isDark: false,
      title: (
        <>
          Three colors.
          <br />
          One clear answer.
        </>
      ),
      sub: "Green. Amber. Red. Soft enough to read calmly. Specific enough to act.",
      vis: (
        <div className="flex items-center justify-center h-72">
          <div className="relative w-[240px] h-[240px]">
            {[
              { y: 0, x: 0, rot: -6, bg: "var(--status-error-bg)", ink: "var(--status-error-foreground)", label: "Don\u2019t park", icon: <X className="w-[18px] h-[18px]" /> },
              { y: 44, x: 12, rot: 3, bg: "var(--status-warning-bg)", ink: "var(--status-warning-foreground)", label: "Until 6 PM", icon: <Clock className="w-[18px] h-[18px]" /> },
              { y: 88, x: -4, rot: -2, bg: "var(--status-success-bg)", ink: "var(--status-success-foreground)", label: "Allowed", icon: <Check className="w-[18px] h-[18px]" /> },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute flex items-center gap-2.5 px-[22px] py-5 rounded-[22px] font-semibold text-xl border border-border"
                style={{
                  top: c.y,
                  left: c.x,
                  transform: `rotate(${c.rot}deg)`,
                  width: 220,
                  background: c.bg,
                  color: c.ink,
                  letterSpacing: -0.4,
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                }}
              >
                {c.icon}
                {c.label}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      isDark: false,
      title: (<>Follow Park.<br />If you&apos;re wrong, we pay.</>),
      sub: "The Ticket Protection Guarantee reimburses up to $100 if you follow our guidance and still get a ticket.",
      vis: (
        <div className="px-9">
          <div
            className="relative p-7 rounded-[26px] bg-foreground text-background"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
          >
            <div
              className="w-[68px] h-[68px] rounded-[18px] flex items-center justify-center text-white"
              style={{ background: "var(--accent)" }}
            >
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div
              className="text-[13px] font-extrabold tracking-wider uppercase mt-6"
              style={{ color: "var(--accent)" }}
            >
              Ticket Guarantee
            </div>
            <div className="text-[32px] font-bold tracking-tight mt-1.5 leading-[1.05]">
              Up to $100,
              <br />
              three times a year.
            </div>
            <div className="text-[13px] opacity-70 mt-3 leading-relaxed">
              Included with Park Pro. Just send us the ticket.
            </div>
          </div>
        </div>
      ),
    },
  ]

  const slide = slides[step]

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-in"
      style={{
        background: slide.isDark
          ? `linear-gradient(180deg, var(--accent) 0%, var(--accent-deep) 100%)`
          : "var(--background)",
        color: slide.isDark ? "#fff" : "var(--foreground)",
      }}
    >
      <div className="flex-1 flex flex-col justify-center pt-16">
        <div className="spring-in">{slide.vis}</div>
        <div className="px-8 pt-10">
          <div className="count-reveal text-[30px] font-bold tracking-tight leading-[1.1]" style={{ textWrap: "balance" as never }}>
            {slide.title}
          </div>
          <div className="text-base opacity-75 mt-3 leading-relaxed">{slide.sub}</div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-11">
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-[3px] transition-all duration-300"
              style={{
                width: i === step ? 22 : 6,
                background:
                  i === step
                    ? slide.isDark
                      ? "#fff"
                      : "var(--accent)"
                    : slide.isDark
                      ? "rgba(255,255,255,0.35)"
                      : "var(--border)",
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="hover-lift-interactive w-full py-4 rounded-full text-base font-bold press-effect"
          style={{
            background: slide.isDark ? "#fff" : "var(--foreground)",
            color: slide.isDark ? "var(--accent-deep)" : "var(--background)",
          }}
        >
          {step < 2 ? "Continue" : "Sounds good"}
        </button>

        {step > 0 && (
          <button
            onClick={onSkip}
            className="w-full mt-3 text-sm"
            style={{ color: slide.isDark ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
