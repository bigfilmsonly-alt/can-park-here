"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface VoiceCommand {
  phrases: string[]
  action: string
}

const COMMANDS: VoiceCommand[] = [
  { phrases: ["check parking", "can i park here", "can i park", "check", "park here"], action: "check" },
  { phrases: ["scan sign", "scan", "read sign", "what does the sign say"], action: "scan" },
  { phrases: ["set timer", "start timer", "timer", "remind me"], action: "timer" },
  { phrases: ["cancel timer", "stop timer", "clear timer"], action: "cancel-timer" },
  { phrases: ["history", "show history", "past checks"], action: "history" },
  { phrases: ["settings", "preferences", "options"], action: "settings" },
  { phrases: ["home", "go home", "main screen"], action: "home" },
  { phrases: ["saved", "saved places", "favorites", "my places"], action: "saved" },
  { phrases: ["help", "what can you do", "commands"], action: "help" },
]

export interface UseVoiceCommandsReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  lastCommand: string | null
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

export function useVoiceCommands(
  onCommand: (action: string) => void
): UseVoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onCommandRef = useRef(onCommand)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep callback ref in sync without triggering effect re-runs
  useEffect(() => {
    onCommandRef.current = onCommand
  }, [onCommand])

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript.toLowerCase().trim()

        setTranscript(text)

        if (result.isFinal) {
          // Match against commands
          for (const command of COMMANDS) {
            if (command.phrases.some((phrase) => text.includes(phrase))) {
              setLastCommand(command.action)
              onCommandRef.current(command.action)
              break
            }
          }

          // Stop listening after final result
          timeoutRef.current = setTimeout(() => {
            setIsListening(false)
            setTranscript("")
          }, 500)
        }
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, []) // Stable: no deps, uses refs for callbacks

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setLastCommand(null)
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        // Catch InvalidStateError if recognition is already started
        console.error("Failed to start speech recognition:", e)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}
