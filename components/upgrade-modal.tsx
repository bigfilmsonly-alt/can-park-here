"use client"

import { Button } from "@/components/ui/button"
import { Shield, Check, X } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  if (!isOpen) return null

  const features = [
    "Unlimited parking checks",
    "Ticket protection guarantee (up to $100)",
    "Up to 3 claims per year",
    "Priority support",
    "No ads, ever",
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-4 sm:mx-auto overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-status-success/15 flex items-center justify-center">
              <Shield className="h-8 w-8 text-status-success-foreground" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mt-6">
            <h2 className="text-2xl font-semibold text-foreground">Park Pro</h2>
            <p className="mt-2 text-muted-foreground">
              Unlimited checks and ticket protection
            </p>
          </div>

          {/* Price */}
          <div className="text-center mt-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-semibold text-foreground">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">or $49/year (save 18%)</p>
          </div>

          {/* Features */}
          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-status-success/15 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-status-success-foreground" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full h-14 text-base font-medium rounded-2xl"
            >
              Start Free Trial
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              7-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
