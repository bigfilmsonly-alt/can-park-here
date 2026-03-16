"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Shield, Bell, Sparkles, ChevronRight, Check } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

const slides = [
  {
    icon: MapPin,
    title: "Can I park here?",
    description: "Get instant answers about parking rules at your exact location. No more guessing or reading confusing signs.",
    color: "bg-foreground",
  },
  {
    icon: Shield,
    title: "Ticket Protection",
    description: "Follow our guidance and if you still get a ticket, we'll cover it. That's our guarantee.",
    color: "bg-status-success",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Set timers and get alerts before your meter expires or street cleaning begins. Never forget again.",
    color: "bg-status-warning",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Predictions",
    description: "Know the best times to park with predictions based on historical patterns and real-time data.",
    color: "bg-foreground",
  },
]

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const isLastSlide = currentSlide === slides.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      onComplete()
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full ${slide.color} flex items-center justify-center mb-8`}>
          <Icon className="w-10 h-10 text-background" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-foreground text-center mb-4">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground text-center max-w-sm leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-foreground w-6"
                : index < currentSlide
                  ? "bg-foreground/50"
                  : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10 flex gap-3">
        {currentSlide > 0 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1 h-14 text-base font-medium rounded-2xl bg-transparent"
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1 h-14 text-base font-medium rounded-2xl"
        >
          {isLastSlide ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Get Started
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
