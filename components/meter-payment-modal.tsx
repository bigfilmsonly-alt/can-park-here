"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  X,
  CreditCard,
  Clock,
  Plus,
  Minus,
  CheckCircle,
  MapPin,
  Smartphone,
} from "lucide-react"

interface MeterPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  currentAddress?: string
  onPaymentComplete: (minutes: number) => void
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

interface PaymentMethod {
  id: string
  type: "card" | "apple_pay" | "google_pay"
  label: string
  last4?: string
}

const HOURLY_RATE = 2.5 // $2.50 per hour
const MIN_TIME = 15 // 15 minutes minimum
const MAX_TIME = 240 // 4 hours max

export function MeterPaymentModal({
  isOpen,
  onClose,
  currentAddress,
  onPaymentComplete,
  showToast,
}: MeterPaymentModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(60)
  const [selectedPayment, setSelectedPayment] = useState<string>("apple_pay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    { id: "apple_pay", type: "apple_pay", label: "Apple Pay" },
    { id: "google_pay", type: "google_pay", label: "Google Pay" },
    { id: "card_1", type: "card", label: "Visa", last4: "4242" },
  ]

  const calculateCost = (minutes: number) => {
    return (minutes / 60) * HOURLY_RATE
  }

  const handleIncrement = () => {
    setSelectedMinutes((prev) => Math.min(prev + 15, MAX_TIME))
  }

  const handleDecrement = () => {
    setSelectedMinutes((prev) => Math.max(prev - 15, MIN_TIME))
  }

  const handlePresetTime = (minutes: number) => {
    setSelectedMinutes(minutes)
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setPaymentComplete(true)

    // After showing success, close and trigger callback
    setTimeout(() => {
      onPaymentComplete(selectedMinutes)
      setPaymentComplete(false)
      setSelectedMinutes(60)
      onClose()
      showToast(
        "success",
        "Meter paid",
        `You have ${selectedMinutes} minutes of parking time`
      )
    }, 1500)
  }

  if (!isOpen) return null

  // Success state
  if (paymentComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-background rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-status-success-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Payment Complete</h2>
            <p className="text-muted-foreground mt-2">
              {selectedMinutes} minutes added to your meter
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-background rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Pay Meter</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Location */}
        {currentAddress && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted mb-6">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{currentAddress}</p>
          </div>
        )}

        {/* Time selector */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Parking Time
          </label>

          {/* Time presets */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[30, 60, 90, 120].map((minutes) => (
              <button
                key={minutes}
                onClick={() => handlePresetTime(minutes)}
                className={`p-3 rounded-xl border text-center transition-colors ${
                  selectedMinutes === minutes
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground"
                }`}
              >
                <span className="text-sm font-medium">
                  {minutes >= 60 ? `${minutes / 60}hr` : `${minutes}m`}
                </span>
              </button>
            ))}
          </div>

          {/* Custom time adjuster */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleDecrement}
                disabled={selectedMinutes <= MIN_TIME}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-50"
              >
                <Minus className="h-5 w-5 text-foreground" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-3xl font-semibold text-foreground">
                    {selectedMinutes >= 60
                      ? `${Math.floor(selectedMinutes / 60)}:${String(selectedMinutes % 60).padStart(2, "0")}`
                      : `0:${String(selectedMinutes).padStart(2, "0")}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMinutes >= 60
                    ? `${Math.floor(selectedMinutes / 60)} hour${Math.floor(selectedMinutes / 60) > 1 ? "s" : ""}${selectedMinutes % 60 > 0 ? ` ${selectedMinutes % 60} min` : ""}`
                    : `${selectedMinutes} minutes`}
                </p>
              </div>

              <button
                onClick={handleIncrement}
                disabled={selectedMinutes >= MAX_TIME}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center disabled:opacity-50"
              >
                <Plus className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </Card>
        </div>

        {/* Payment methods */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Payment Method
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  selectedPayment === method.id
                    ? "border-foreground bg-muted"
                    : "border-border bg-background"
                }`}
              >
                {method.type === "card" ? (
                  <CreditCard className="h-5 w-5 text-foreground" />
                ) : (
                  <Smartphone className="h-5 w-5 text-foreground" />
                )}
                <span className="font-medium text-foreground">{method.label}</span>
                {method.last4 && (
                  <span className="text-muted-foreground ml-auto">
                    ****{method.last4}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Total and pay button */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
            <span className="text-foreground">Total</span>
            <span className="text-2xl font-semibold text-foreground">
              ${calculateCost(selectedMinutes).toFixed(2)}
            </span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay $${calculateCost(selectedMinutes).toFixed(2)}`
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Rate: ${HOURLY_RATE.toFixed(2)}/hour
          </p>
        </div>
      </div>
    </div>
  )
}
