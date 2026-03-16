"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Clock, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  Wind,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Lightbulb,
  Trophy,
  Target
} from "lucide-react"
import { generatePredictions, getPersonalizedSuggestions, type DailyPrediction } from "@/lib/predictions"
import { getActiveAlerts, type SmartAlert } from "@/lib/smart-alerts"
import { getCurrentWeather, getWeatherParkingSuggestions, willWeatherChange, type WeatherData, type ParkingSuggestion } from "@/lib/weather-suggestions"
import { getUserInsights, getFrequentLocations, predictNextParkingNeed, type UserInsight, type ParkingHabit } from "@/lib/habit-learning"

interface InsightsScreenProps {
  currentLocation?: { lat: number; lng: number }
  onCheckParking: () => void
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

export function InsightsScreen({ currentLocation, onCheckParking, showToast }: InsightsScreenProps) {
  const [predictions, setPredictions] = useState<DailyPrediction | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherSuggestions, setWeatherSuggestions] = useState<ParkingSuggestion[]>([])
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [frequentLocations, setFrequentLocations] = useState<ParkingHabit[]>([])
  const [nextPrediction, setNextPrediction] = useState<ReturnType<typeof predictNextParkingNeed>>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Load all predictive data
    const pred = generatePredictions()
    setPredictions(pred)
    
    const weatherData = getCurrentWeather(
      currentLocation?.lat || 37.7749,
      currentLocation?.lng || -122.4194
    )
    setWeather(weatherData)
    setWeatherSuggestions(getWeatherParkingSuggestions(weatherData))
    
    setAlerts(getActiveAlerts(currentLocation))
    setInsights(getUserInsights())
    setFrequentLocations(getFrequentLocations())
    setNextPrediction(predictNextParkingNeed())
    setSuggestions(getPersonalizedSuggestions())
  }, [currentLocation])

  const getWeatherIcon = (condition: WeatherData["condition"]) => {
    switch (condition) {
      case "clear": return <Sun className="h-5 w-5 text-amber-500" />
      case "cloudy": return <Cloud className="h-5 w-5 text-muted-foreground" />
      case "rain": return <CloudRain className="h-5 w-5 text-blue-500" />
      case "snow": return <Snowflake className="h-5 w-5 text-sky-400" />
      case "storm": return <CloudLightning className="h-5 w-5 text-amber-600" />
      case "fog": return <Wind className="h-5 w-5 text-muted-foreground" />
      default: return <Sun className="h-5 w-5" />
    }
  }

  const getInsightIcon = (type: UserInsight["type"]) => {
    switch (type) {
      case "pattern": return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "suggestion": return <Lightbulb className="h-4 w-4 text-amber-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "achievement": return <Trophy className="h-4 w-4 text-emerald-500" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const weatherChange = weather ? willWeatherChange(weather) : null

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered parking predictions</p>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border ${
                  alert.severity === "critical" 
                    ? "bg-red-50 border-red-200" 
                    : alert.severity === "warning"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === "critical" ? "text-red-600" : 
                    alert.severity === "warning" ? "text-amber-600" : "text-blue-600"
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      alert.severity === "critical" ? "text-red-900" : 
                      alert.severity === "warning" ? "text-amber-900" : "text-blue-900"
                    }`}>{alert.title}</p>
                    <p className={`text-sm mt-0.5 ${
                      alert.severity === "critical" ? "text-red-700" : 
                      alert.severity === "warning" ? "text-amber-700" : "text-blue-700"
                    }`}>{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather & Suggestions */}
      {weather && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Weather Parking Tips</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.condition)}
                <div>
                  <p className="font-medium text-foreground capitalize">{weather.condition}</p>
                  <p className="text-sm text-muted-foreground">{weather.temperature}°F</p>
                </div>
              </div>
              {weather.precipitation > 30 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {weather.precipitation}% rain
                </span>
              )}
            </div>
            
            {weatherChange && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-amber-800">{weatherChange.warning}</p>
              </div>
            )}
            
            {weatherSuggestions.length > 0 && (
              <div className="space-y-2">
                {weatherSuggestions.slice(0, 2).map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{suggestion.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Best Times Today */}
      {predictions && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Best Times Today</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-foreground">{predictions.bestTime.timeSlot}</span>
              </div>
              <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                Best time
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {predictions.predictions.slice(0, 8).map((pred) => (
                <div
                  key={pred.hour}
                  className={`text-center py-2 px-1 rounded-lg ${
                    pred.availability === "high" 
                      ? "bg-emerald-50 text-emerald-700"
                      : pred.availability === "medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <p className="text-xs font-medium">{pred.timeSlot.split(":")[0]}</p>
                  <p className="text-xs">{pred.timeSlot.includes("PM") ? "PM" : "AM"}</p>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              {predictions.bestTime.reason}
            </p>
          </div>
        </div>
      )}

      {/* Your Patterns */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Your Patterns</h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
                    {insight.actionLabel && (
                      <button 
                        className="text-sm text-primary font-medium mt-2 flex items-center gap-1"
                        onClick={() => {
                          if (insight.actionType === "view_location") {
                            onCheckParking()
                          } else {
                            showToast("success", "Reminder set", "We'll notify you at the right time")
                          }
                        }}
                      >
                        {insight.actionLabel}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequent Locations */}
      {frequentLocations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Frequent Spots</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {frequentLocations.slice(0, 3).map((location, i) => (
              <div key={location.id}>
                {i > 0 && <div className="h-px bg-border mx-4" />}
                <button
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                  onClick={onCheckParking}
                >
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {location.location.address.split(",")[0]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {location.frequency} visits
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">For You</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prediction Confidence */}
      {nextPrediction && (
        <div className="mb-6">
          <div className="bg-muted/50 rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Prediction confidence: <span className="font-medium text-foreground">{nextPrediction.confidence}%</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your parking history
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && frequentLocations.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Learning Your Patterns</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Use the app a few more times and we'll start showing personalized parking predictions.
          </p>
          <Button onClick={onCheckParking} className="mt-6 rounded-xl">
            Check Parking Now
          </Button>
        </div>
      )}
    </div>
  )
}
