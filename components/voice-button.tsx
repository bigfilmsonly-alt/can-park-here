"use client"

import { Mic, MicOff } from "lucide-react"

interface VoiceButtonProps {
  isListening: boolean
  isSupported: boolean
  transcript: string
  onToggle: () => void
}

export function VoiceButton({
  isListening,
  isSupported,
  transcript,
  onToggle,
}: VoiceButtonProps) {
  if (!isSupported) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
      {/* Transcript bubble */}
      {isListening && transcript && (
        <div className="bg-card border border-border rounded-2xl px-4 py-2 shadow-lg max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm text-foreground">{transcript}</p>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && !transcript && (
        <div className="bg-card border border-border rounded-2xl px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm text-muted-foreground">Listening...</p>
        </div>
      )}

      {/* Voice button */}
      <button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isListening
            ? "bg-foreground text-background scale-110"
            : "bg-card border border-border text-foreground hover:bg-muted"
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice command"}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="h-6 w-6" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-background/30" />
          </div>
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </button>

      {/* Help text on first use */}
      {!isListening && (
        <p className="text-xs text-muted-foreground mr-2 opacity-0 hover:opacity-100 transition-opacity">
          Say "Check parking"
        </p>
      )}
    </div>
  )
}
