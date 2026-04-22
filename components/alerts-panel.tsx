"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, AlertTriangle, Clock, CloudRain, Car, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActiveAlerts, type SmartAlert } from "@/lib/smart-alerts"

interface AlertsPanelProps {
  location?: { lat: number; lng: number }
  onAction?: (alert: SmartAlert) => void
  onDismiss?: (alertId: string) => void
}

export function AlertsPanel({ location, onAction, onDismiss }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const dismissedRef = useRef<Set<string>>(new Set())

  const fetchAlerts = useCallback(() => {
    const activeAlerts = getActiveAlerts(location)
    setAlerts(activeAlerts.filter(a => !dismissedRef.current.has(a.id)))
  }, [location])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [fetchAlerts])

  const handleDismiss = (alertId: string) => {
    dismissedRef.current.add(alertId)
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    onDismiss?.(alertId)
  }

  const getAlertIcon = (type: SmartAlert["type"]) => {
    switch (type) {
      case "street_cleaning":
        return <Car className="h-4 w-4" />
      case "meter_expiring":
        return <Clock className="h-4 w-4" />
      case "weather":
        return <CloudRain className="h-4 w-4" />
      case "rush_hour":
      case "event":
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityStyles = (severity: SmartAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-900"
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-900"
      default:
        return "bg-blue-50 border-blue-200 text-blue-900"
    }
  }

  const getIconStyles = (severity: SmartAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100"
      case "warning":
        return "text-amber-600 bg-amber-100"
      default:
        return "text-blue-600 bg-blue-100"
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`relative p-4 rounded-2xl border ${getSeverityStyles(alert.severity)}`}
        >
          <button
            onClick={() => handleDismiss(alert.id)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>

          <div className="flex gap-3">
            <div className={`p-2 rounded-full shrink-0 ${getIconStyles(alert.severity)}`}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-semibold text-sm">{alert.title}</h3>
              <p className="text-sm opacity-80 mt-0.5">{alert.message}</p>
              
              {alert.actionLabel && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-8 text-xs bg-white/50 hover:bg-white/80"
                  onClick={() => onAction?.(alert)}
                >
                  {alert.actionLabel}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Compact version for home screen
export function AlertsBadge({ 
  location,
  onClick 
}: { 
  location?: { lat: number; lng: number }
  onClick?: () => void 
}) {
  const [alertCount, setAlertCount] = useState(0)
  const [topAlert, setTopAlert] = useState<SmartAlert | null>(null)

  useEffect(() => {
    const fetchAlerts = () => {
      const alerts = getActiveAlerts(location)
      setAlertCount(alerts.length)
      setTopAlert(alerts[0] || null)
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)

    return () => clearInterval(interval)
  }, [location])

  if (alertCount === 0) return null

  const getSeverityColor = (severity?: SmartAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-amber-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-card rounded-full card-elevated hover:shadow-md transition-shadow"
    >
      <span className={`w-2 h-2 rounded-full ${getSeverityColor(topAlert?.severity)} animate-pulse`} />
      <span className="text-sm font-medium">
        {alertCount} alert{alertCount !== 1 ? "s" : ""}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
