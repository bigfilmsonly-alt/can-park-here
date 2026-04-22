"use client"

import { useState, useRef, useEffect } from "react"
import { X, Camera, ShieldCheck, Check } from "lucide-react"
import { showToast } from "@/components/ui/toast-notification"

interface ClaimFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export function ClaimForm({ isOpen, onClose, onSubmit }: ClaimFormProps) {
  const [ticketAmount, setTicketAmount] = useState("")
  const [ticketNumber, setTicketNumber] = useState("")
  const [description, setDescription] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  if (!isOpen) return null

  const handlePhotoSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(ticketAmount)
    if (!ticketAmount || isNaN(amount) || amount <= 0 || amount > 100) {
      showToast("error", "Invalid amount", "Ticket amount must be between $0.01 and $100")
      return
    }

    if (!description.trim()) {
      showToast("error", "Description required", "Please describe what happened")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_amount: amount,
          ticket_number: ticketNumber.trim() || null,
          description: description.trim(),
        }),
      })

      const json = await res.json()

      if (!mountedRef.current) return

      if (!res.ok || !json.ok) {
        showToast("error", "Submission failed", json.error || "Please try again")
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setIsSuccess(true)

      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        setIsSuccess(false)
        setTicketAmount("")
        setTicketNumber("")
        setDescription("")
        setPhotoFile(null)
        onSubmit()
        onClose()
      }, 2500)
    } catch {
      if (!mountedRef.current) return
      showToast("error", "Network error", "Please check your connection and try again")
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
        <div className="relative bg-background w-full max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-in-up">
          <div className="text-center py-12 px-6">
            <div
              className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Claim Submitted</h2>
            <p className="text-muted-foreground mt-2">
              We&apos;ll review within 48 hours.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative bg-background w-full max-w-md mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-in-up max-h-[90vh] flex flex-col">
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Submit Claim</h2>
                <p className="text-xs text-muted-foreground">Ticket protection guarantee</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center press-effect"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-4">
            {/* Ticket Amount */}
            <div className="mb-5">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Ticket Amount <span className="text-muted-foreground">(required)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  max="100"
                  required
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 pl-8 pr-4 rounded-[18px] border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Maximum $100 per claim</p>
            </div>

            {/* Ticket Number */}
            <div className="mb-5">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Ticket Number <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                placeholder="e.g. PKG-2026-04812"
                maxLength={100}
                className="w-full h-12 px-4 rounded-[18px] border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="text-sm font-medium text-foreground mb-2 block">
                What happened? <span className="text-muted-foreground">(required)</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation — where you parked, what the sign said, etc."
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-3 rounded-[18px] border border-border bg-card text-foreground text-base resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Photo of Ticket <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handlePhotoSelect}
                className="w-full h-12 px-4 rounded-[18px] border border-dashed border-border bg-card text-muted-foreground flex items-center justify-center gap-2 press-effect hover:border-foreground/30 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {photoFile ? photoFile.name : "Take or upload a photo"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Sticky CTA */}
        <div className="px-6 pt-2 pb-5 bg-background" style={{ borderTop: "1px solid var(--hairline)" }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !ticketAmount || !description.trim()}
            className="w-full py-4 rounded-full text-base font-bold press-effect disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Claim"
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2.5">
            Claims are reviewed within 48 hours
          </p>
        </div>
      </div>
    </div>
  )
}
