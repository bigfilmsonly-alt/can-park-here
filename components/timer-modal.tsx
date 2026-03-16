"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Minus, Plus } from "lucide-react"

interface TimerModalProps {
  isOpen: boolean
  onClose: () => void
  onSetTimer: (minutes: number) => void
}

export function TimerModal({ isOpen, onClose, onSetTimer }: TimerModalProps) {
  const [minutes, setMinutes] = useState(60)

  if (!isOpen) return null

  const presets = [15, 30, 60, 120]

  const handleIncrement = () => {
    setMinutes((prev) => Math.min(prev + 15, 480))
  }

  const handleDecrement = () => {
    setMinutes((prev) => Math.max(prev - 15, 15))
  }

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    if (remainingMins === 0) return `${hours} hr`
    return `${hours} hr ${remainingMins} min`
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-foreground">Set a reminder</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Time picker */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={handleDecrement}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="text-center min-w-32">
            <span className="text-5xl font-light tracking-tight text-foreground tabular-nums">
              {formatTime(minutes)}
            </span>
          </div>
          <button
            onClick={handleIncrement}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="flex justify-center gap-2 mb-8">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setMinutes(preset)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                minutes === preset
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {formatTime(preset)}
            </button>
          ))}
        </div>

        {/* Action button */}
        <Button
          onClick={() => onSetTimer(minutes)}
          className="w-full h-14 text-base font-medium rounded-2xl"
        >
          Start timer
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          We'll notify you when time is almost up
        </p>
      </div>
    </div>
  )
}
