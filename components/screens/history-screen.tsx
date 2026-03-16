"use client"

import type { HistoryItem } from "@/lib/types"
import { ChevronRight } from "lucide-react"
import { EmptyHistory } from "@/components/ui/empty-states"

interface HistoryScreenProps {
  history: HistoryItem[]
  onItemClick: (item: HistoryItem) => void
  onCheckParking: () => void
}

const statusLabels = {
  allowed: "Allowed",
  restricted: "Restricted",
  prohibited: "No parking",
}

const statusColors = {
  allowed: "text-status-success-foreground",
  restricted: "text-status-warning-foreground",
  prohibited: "text-status-error-foreground",
}

const statusDotColors = {
  allowed: "bg-status-success-foreground",
  restricted: "bg-status-warning-foreground",
  prohibited: "bg-status-error-foreground",
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function HistoryScreen({ history, onItemClick, onCheckParking }: HistoryScreenProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">History</h1>
      <p className="text-sm text-muted-foreground mt-1">Your recent parking checks</p>

      {history.length > 0 ? (
        <div className="mt-8 space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted/50 transition-colors text-left group"
            >
              {/* Status indicator */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.status === "allowed" ? "bg-status-success/10" :
                item.status === "restricted" ? "bg-status-warning/10" :
                "bg-status-error/10"
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${statusDotColors[item.status]}`} />
              </div>

              {/* Location info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-foreground truncate">
                    {item.street}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{formatDate(item.date)}</span>
                  <span>·</span>
                  <span>{formatTime(item.date)}</span>
                </div>
              </div>

              {/* Status and arrow */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyHistory onCheckParking={onCheckParking} />
        </div>
      )}
    </div>
  )
}
