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

  useEffect(() => {
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
              onCommand(command.action)
              break
            }
          }
          
          // Stop listening after final result
          setTimeout(() => {
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
      }
    }
  }, [onCommand])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setLastCommand(null)
      recognitionRef.current.start()
      setIsListening(true)
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
