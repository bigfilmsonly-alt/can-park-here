"use client"

import { useState } from "react"
import { X, Wallet, Clock, MapPin, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { showToast } from "@/components/ui/toast-notification"

interface WalletPassProps {
  isOpen: boolean
  onClose: () => void
  location: string
  address: string
  timeLimit?: number
  expiresAt?: Date
  isProtected: boolean
}

export function WalletPassModal({
  isOpen,
  onClose,
  location,
  address,
  timeLimit,
  expiresAt,
  isProtected,
}: WalletPassProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  if (!isOpen) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleAddToWallet = async (type: "apple" | "google") => {
    setIsAdding(true)
    
    // Simulate adding to wallet
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsAdding(false)
    setIsAdded(true)
    
    showToast(
      "success",
      "Pass created",
      type === "apple" 
        ? "Check your Apple Wallet" 
        : "Check your Google Wallet"
    )
    
    setTimeout(() => {
      onClose()
      setIsAdded(false)
    }, 2000)
  }

  const now = new Date()
  const expires = expiresAt || (timeLimit ? new Date(now.getTime() + timeLimit * 60000) : null)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add to Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pass Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl p-5 text-background shadow-lg">
            {/* Pass Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-medium opacity-60 uppercase tracking-wider">Parking Pass</p>
                <h3 className="text-xl font-bold mt-1">Park</h3>
              </div>
              {isProtected && (
                <div className="flex items-center gap-1 px-2 py-1 bg-background/20 rounded-full">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs font-medium">Protected</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 opacity-60" />
                <div>
                  <p className="font-semibold">{location}</p>
                  <p className="text-sm opacity-70">{address}</p>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-6 pt-4 border-t border-background/20">
              <div>
                <p className="text-xs opacity-60 uppercase">Valid From</p>
                <p className="font-semibold">{formatTime(now)}</p>
                <p className="text-xs opacity-70">{formatDate(now)}</p>
              </div>
              {expires && (
                <div>
                  <p className="text-xs opacity-60 uppercase">Expires</p>
                  <p className="font-semibold">{formatTime(expires)}</p>
                  <p className="text-xs opacity-70">{formatDate(expires)}</p>
                </div>
              )}
            </div>

            {/* Barcode placeholder */}
            <div className="mt-6 pt-4 border-t border-background/20">
              <div className="h-12 bg-background/20 rounded-lg flex items-center justify-center">
                <div className="flex gap-0.5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-background rounded-full"
                      style={{ height: `${12 + Math.random() * 20}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          {isAdded ? (
            <div className="flex items-center justify-center gap-2 py-4 text-status-success-foreground">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Added to Wallet</span>
            </div>
          ) : (
            <>
              <Button
                onClick={() => handleAddToWallet("apple")}
                disabled={isAdding}
                className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90"
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Add to Apple Wallet
                  </span>
                )}
              </Button>

              <Button
                onClick={() => handleAddToWallet("google")}
                disabled={isAdding}
                variant="outline"
                className="w-full h-14 rounded-2xl"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Add to Google Wallet
                </span>
              </Button>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground pt-2">
            Access your parking pass from your lock screen
          </p>
        </div>
      </div>
    </div>
  )
}
