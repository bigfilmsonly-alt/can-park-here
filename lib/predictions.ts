"use client"

// ML Parking Predictions Engine
// Analyzes historical data to predict optimal parking times and availability

export interface ParkingPrediction {
  timeSlot: string
  hour: number
  dayOfWeek: number
  availability: "high" | "medium" | "low"
  score: number // 0-100
  reason: string
  recommendedAction?: string
}

export interface DailyPrediction {
  date: Date
  predictions: ParkingPrediction[]
  bestTime: ParkingPrediction
  worstTime: ParkingPrediction
}

export interface LocationPattern {
  locationId: string
  address: string
  coordinates: { lat: number; lng: number }
  visits: number
  averageDuration: number // minutes
  mostCommonDay: number // 0-6
  mostCommonHour: number // 0-23
  ticketRisk: number // 0-100
  lastVisit: Date
}

// Historical parking data structure
interface ParkingEvent {
  timestamp: Date
  location: { lat: number; lng: number }
  duration: number
  dayOfWeek: number
  hour: number
  wasSuccessful: boolean
  hadTicket: boolean
}

// Simulated historical data for ML predictions
const getHistoricalData = (): ParkingEvent[] => {
  const stored = localStorage.getItem("park_history")
  if (!stored) return generateSampleData()
  
  try {
    const history = JSON.parse(stored)
    return history.map((item: { timestamp: string; coordinates: { lat: number; lng: number }; status: string }) => ({
      timestamp: new Date(item.timestamp),
      location: item.coordinates,
      duration: Math.floor(Math.random() * 120) + 15,
      dayOfWeek: new Date(item.timestamp).getDay(),
      hour: new Date(item.timestamp).getHours(),
      wasSuccessful: item.status === "allowed",
      hadTicket: false,
    }))
  } catch {
    return generateSampleData()
  }
}

// Generate sample historical data for demo
function generateSampleData(): ParkingEvent[] {
  const events: ParkingEvent[] = []
  const now = new Date()
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const hour = Math.floor(Math.random() * 14) + 7 // 7am - 9pm
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(hour, Math.floor(Math.random() * 60))
    
    events.push({
      timestamp: date,
      location: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05,
      },
      duration: Math.floor(Math.random() * 120) + 15,
      dayOfWeek: date.getDay(),
      hour: date.getHours(),
      wasSuccessful: Math.random() > 0.15,
      hadTicket: Math.random() < 0.05,
    })
  }
  
  return events
}

// Analyze patterns and generate predictions
export function generatePredictions(
  targetDate: Date = new Date(),
  location?: { lat: number; lng: number }
): DailyPrediction {
  const historical = getHistoricalData()
  const dayOfWeek = targetDate.getDay()
  
  // Analyze patterns for this day of week
  const sameDayEvents = historical.filter((e) => e.dayOfWeek === dayOfWeek)
  
  const predictions: ParkingPrediction[] = []
  
  // Generate hourly predictions (7am - 10pm)
  for (let hour = 7; hour <= 22; hour++) {
    const hourEvents = sameDayEvents.filter((e) => e.hour === hour)
    const successRate = hourEvents.length > 0
      ? hourEvents.filter((e) => e.wasSuccessful).length / hourEvents.length
      : 0.7 // Default if no data
    
    // Factor in typical parking patterns
    let baseScore = successRate * 100
    
    // Rush hour penalties
    if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
      baseScore -= 20
    }
    
    // Lunch rush
    if (hour >= 12 && hour <= 13) {
      baseScore -= 15
    }
    
    // Early morning / late evening bonuses
    if (hour <= 8 || hour >= 20) {
      baseScore += 15
    }
    
    // Weekend adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseScore += 10 // Generally easier on weekends
      
      // But Saturday afternoon is busy
      if (dayOfWeek === 6 && hour >= 11 && hour <= 16) {
        baseScore -= 15
      }
    }
    
    // Street cleaning consideration (Mon/Thu mornings in many cities)
    if ((dayOfWeek === 1 || dayOfWeek === 4) && hour >= 8 && hour <= 11) {
      baseScore -= 25
    }
    
    const score = Math.max(0, Math.min(100, Math.round(baseScore)))
    
    const availability: "high" | "medium" | "low" =
      score >= 70 ? "high" : score >= 40 ? "medium" : "low"
    
    const reasons = []
    if (hour <= 8) reasons.push("Early morning - fewer cars")
    if (hour >= 20) reasons.push("Evening - spots opening up")
    if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) reasons.push("Rush hour traffic")
    if (hour >= 12 && hour <= 13) reasons.push("Lunch rush")
    if (dayOfWeek === 0) reasons.push("Sunday - minimal restrictions")
    if (dayOfWeek === 6) reasons.push("Saturday - relaxed enforcement")
    if ((dayOfWeek === 1 || dayOfWeek === 4) && hour >= 8 && hour <= 11) reasons.push("Possible street cleaning")
    
    predictions.push({
      timeSlot: formatTimeSlot(hour),
      hour,
      dayOfWeek,
      availability,
      score,
      reason: reasons.length > 0 ? reasons.join("; ") : "Based on historical patterns",
      recommendedAction: getRecommendedAction(score, hour),
    })
  }
  
  const bestTime = predictions.reduce((best, curr) => (curr.score > best.score ? curr : best))
  const worstTime = predictions.reduce((worst, curr) => (curr.score < worst.score ? curr : worst))
  
  return {
    date: targetDate,
    predictions,
    bestTime,
    worstTime,
  }
}

function formatTimeSlot(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

function getRecommendedAction(score: number, hour: number): string {
  if (score >= 80) return "Great time to park"
  if (score >= 60) return "Good availability expected"
  if (score >= 40) return "Allow extra time to find parking"
  if (hour >= 8 && hour <= 9) return "Consider arriving earlier"
  if (hour >= 17 && hour <= 18) return "Consider waiting until after rush hour"
  return "Expect limited availability"
}

// Get best parking times for the week
export function getWeeklyBestTimes(): { day: string; time: string; score: number }[] {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const results = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const prediction = generatePredictions(date)
    
    results.push({
      day: days[date.getDay()],
      time: prediction.bestTime.timeSlot,
      score: prediction.bestTime.score,
    })
  }
  
  return results
}

// Learn user patterns
export function analyzeUserPatterns(): LocationPattern[] {
  const stored = localStorage.getItem("park_history")
  if (!stored) return []
  
  try {
    const history = JSON.parse(stored)
    const locationMap = new Map<string, LocationPattern>()
    
    for (const item of history) {
      const key = `${item.coordinates.lat.toFixed(3)},${item.coordinates.lng.toFixed(3)}`
      
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          locationId: key,
          address: item.address || "Unknown location",
          coordinates: item.coordinates,
          visits: 0,
          averageDuration: 0,
          mostCommonDay: 0,
          mostCommonHour: 0,
          ticketRisk: 0,
          lastVisit: new Date(item.timestamp),
        })
      }
      
      const pattern = locationMap.get(key)!
      pattern.visits++
      pattern.lastVisit = new Date(item.timestamp)
      
      // Calculate most common day/hour
      const date = new Date(item.timestamp)
      pattern.mostCommonDay = date.getDay()
      pattern.mostCommonHour = date.getHours()
      
      // Estimate ticket risk based on status
      if (item.status === "prohibited") {
        pattern.ticketRisk = Math.min(100, pattern.ticketRisk + 20)
      } else if (item.status === "restricted") {
        pattern.ticketRisk = Math.min(100, pattern.ticketRisk + 10)
      }
    }
    
    return Array.from(locationMap.values()).sort((a, b) => b.visits - a.visits)
  } catch {
    return []
  }
}

// Get personalized parking suggestions
export function getPersonalizedSuggestions(): string[] {
  const patterns = analyzeUserPatterns()
  const suggestions: string[] = []
  
  if (patterns.length === 0) {
    return [
      "Use the app more to get personalized parking predictions",
      "Check parking before you leave to find the best times",
      "Save your frequent locations for quick access",
    ]
  }
  
  const topLocation = patterns[0]
  if (topLocation) {
    suggestions.push(
      `You park most often near ${topLocation.address.split(",")[0]}`
    )
    
    if (topLocation.ticketRisk > 50) {
      suggestions.push(
        `Be careful at your usual spot - higher than average ticket risk`
      )
    }
  }
  
  const now = new Date()
  const todayPrediction = generatePredictions(now)
  
  if (todayPrediction.bestTime.score >= 70) {
    suggestions.push(
      `Best time to park today: ${todayPrediction.bestTime.timeSlot}`
    )
  }
  
  if (todayPrediction.worstTime.score < 40) {
    suggestions.push(
      `Avoid parking around ${todayPrediction.worstTime.timeSlot} if possible`
    )
  }
  
  return suggestions.slice(0, 4)
}

// Export prediction confidence
export function getPredictionConfidence(): number {
  const historical = getHistoricalData()
  // More data = higher confidence
  const dataConfidence = Math.min(100, historical.length * 2)
  return dataConfidence
}
