"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, TrendingUp, Clock, Calendar, Sparkles, ChevronRight } from "lucide-react"
import {
  generatePredictions,
  getWeeklyBestTimes,
  getPersonalizedSuggestions,
  getPredictionConfidence,
  type ParkingPrediction,
  type DailyPrediction,
} from "@/lib/predictions"

interface PredictionsScreenProps {
  onBack: () => void
  currentLocation?: { lat: number; lng: number }
}

export function PredictionsScreen({ onBack, currentLocation }: PredictionsScreenProps) {
  const [selectedDay, setSelectedDay] = useState(0) // 0 = today
  const [dailyPrediction, setDailyPrediction] = useState<DailyPrediction | null>(null)
  const [weeklyBest, setWeeklyBest] = useState<{ day: string; time: string; score: number }[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + selectedDay)
    setDailyPrediction(generatePredictions(date, currentLocation))
    setWeeklyBest(getWeeklyBestTimes())
    setSuggestions(getPersonalizedSuggestions())
    setConfidence(getPredictionConfidence())
  }, [selectedDay, currentLocation])

  const days = ["Today", "Tomorrow"]
  for (let i = 2; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    days.push(date.toLocaleDateString("en-US", { weekday: "short" }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return "bg-emerald-50 border-emerald-200"
    if (score >= 40) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return "text-emerald-700"
    if (score >= 40) return "text-amber-700"
    return "text-red-700"
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Parking Predictions</h1>
          <p className="text-sm text-muted-foreground">AI-powered insights</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{confidence}% confidence</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-6">
        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDay === index
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Best & Worst Times */}
        {dailyPrediction && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border ${getScoreBgColor(dailyPrediction.bestTime.score)}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Best Time</span>
              </div>
              <p className="text-2xl font-semibold text-emerald-900">{dailyPrediction.bestTime.timeSlot}</p>
              <p className="text-xs text-emerald-700 mt-1">{dailyPrediction.bestTime.score}% availability</p>
            </div>
            <div className={`p-4 rounded-2xl border ${getScoreBgColor(dailyPrediction.worstTime.score)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">Avoid</span>
              </div>
              <p className="text-2xl font-semibold text-red-900">{dailyPrediction.worstTime.timeSlot}</p>
              <p className="text-xs text-red-700 mt-1">{dailyPrediction.worstTime.score}% availability</p>
            </div>
          </div>
        )}

        {/* Hourly Timeline */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Hourly Breakdown</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {dailyPrediction?.predictions.map((prediction, index) => (
              <div
                key={prediction.hour}
                className={`flex items-center gap-3 px-4 py-3 ${
                  index !== dailyPrediction.predictions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="w-16 text-sm font-medium">{prediction.timeSlot}</span>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(prediction.score)} transition-all`}
                      style={{ width: `${prediction.score}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium w-12 text-right ${getScoreTextColor(prediction.score)}`}>
                  {prediction.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Overview */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">This Week</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {weeklyBest.map((day, index) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(index)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors ${
                  index !== weeklyBest.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Best: {day.time}</span>
                  <div className={`w-2 h-2 rounded-full ${getScoreColor(day.score)}`} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Personalized Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Your Insights</h2>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card rounded-2xl border border-border"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
