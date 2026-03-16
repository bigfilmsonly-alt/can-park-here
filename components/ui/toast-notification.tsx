"use client"

import React from "react"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Bell, X } from "lucide-react"

interface Toast {
  id: string
  type: "success" | "error" | "info"
  title: string
  description?: string
}

let toastListeners: ((toast: Toast) => void)[] = []

export function showToast(type: Toast["type"], title: string, description?: string) {
  const toast: Toast = {
    id: crypto.randomUUID(),
    type,
    title,
    description,
  }

  toastListeners.forEach((listener) => listener(toast))
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])

      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 4000)
    }

    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-status-success-foreground" />,
    error: <AlertCircle className="h-5 w-5 text-status-error-foreground" />,
    info: <Bell className="h-5 w-5 text-foreground/70" />,
  }

  return (
    <>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 max-w-md mx-auto pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-card border border-border rounded-2xl p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
