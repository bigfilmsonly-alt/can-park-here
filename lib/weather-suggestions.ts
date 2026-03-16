"use client"

// Weather-Based Parking Suggestions
// Provides smart parking recommendations based on weather conditions

export interface WeatherData {
  condition: "clear" | "cloudy" | "rain" | "snow" | "storm" | "fog"
  temperature: number // Fahrenheit
  precipitation: number // percentage chance
  windSpeed: number // mph
  visibility: number // miles
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  hour: number
  condition: WeatherData["condition"]
  precipitation: number
  temperature: number
}

export interface ParkingSuggestion {
  type: "covered" | "shaded" | "open" | "garage" | "avoid"
  priority: "high" | "medium" | "low"
  reason: string
  tip: string
}

// Simulated weather data (would come from weather API in production)
export function getCurrentWeather(lat: number, lng: number): WeatherData {
  const hour = new Date().getHours()
  const month = new Date().getMonth()
  
  // Simulate seasonal/time-based weather patterns
  const isWinter = month >= 11 || month <= 2
  const isSummer = month >= 5 && month <= 8
  const isEvening = hour >= 17 || hour <= 6
  
  // Base temperature by season
  let baseTemp = 65
  if (isWinter) baseTemp = 45
  if (isSummer) baseTemp = 80
  if (isEvening) baseTemp -= 10
  
  // Random variation
  const tempVariation = (Math.random() - 0.5) * 20
  const temperature = Math.round(baseTemp + tempVariation)
  
  // Weather condition probabilities
  const conditions: WeatherData["condition"][] = ["clear", "cloudy", "rain", "snow", "storm", "fog"]
  let conditionWeights = [40, 30, 15, 0, 5, 10]
  
  if (isWinter) conditionWeights = [20, 30, 20, 20, 5, 5]
  if (isSummer) conditionWeights = [50, 25, 15, 0, 10, 0]
  
  const totalWeight = conditionWeights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  let condition: WeatherData["condition"] = "clear"
  
  for (let i = 0; i < conditions.length; i++) {
    random -= conditionWeights[i]
    if (random <= 0) {
      condition = conditions[i]
      break
    }
  }
  
  // Generate 6-hour forecast
  const forecast: WeatherForecast[] = []
  for (let i = 1; i <= 6; i++) {
    const forecastHour = (hour + i) % 24
    forecast.push({
      hour: forecastHour,
      condition: Math.random() > 0.7 ? getRandomCondition(isWinter) : condition,
      precipitation: condition === "rain" || condition === "snow" ? Math.round(Math.random() * 80 + 20) : Math.round(Math.random() * 20),
      temperature: temperature + Math.round((Math.random() - 0.5) * 10),
    })
  }
  
  return {
    condition,
    temperature,
    precipitation: condition === "rain" || condition === "snow" || condition === "storm" ? Math.round(Math.random() * 60 + 40) : Math.round(Math.random() * 20),
    windSpeed: Math.round(Math.random() * 20 + 5),
    visibility: condition === "fog" ? Math.round(Math.random() * 3 + 0.5) : Math.round(Math.random() * 5 + 8),
    forecast,
  }
}

function getRandomCondition(isWinter: boolean): WeatherData["condition"] {
  const conditions: WeatherData["condition"][] = isWinter 
    ? ["clear", "cloudy", "rain", "snow"]
    : ["clear", "cloudy", "rain"]
  return conditions[Math.floor(Math.random() * conditions.length)]
}

// Get parking suggestions based on weather
export function getWeatherParkingSuggestions(weather: WeatherData): ParkingSuggestion[] {
  const suggestions: ParkingSuggestion[] = []
  
  // Rain suggestions
  if (weather.condition === "rain" || weather.precipitation > 50) {
    suggestions.push({
      type: "covered",
      priority: "high",
      reason: "Rain expected",
      tip: "Look for covered parking or parking garages to keep your car dry.",
    })
    
    if (weather.precipitation > 70) {
      suggestions.push({
        type: "avoid",
        priority: "medium",
        reason: "Heavy rain",
        tip: "Avoid parking in low areas that may flood during heavy rain.",
      })
    }
  }
  
  // Snow suggestions
  if (weather.condition === "snow") {
    suggestions.push({
      type: "garage",
      priority: "high",
      reason: "Snow conditions",
      tip: "Parking garages protect from snow accumulation and make leaving easier.",
    })
    
    suggestions.push({
      type: "avoid",
      priority: "high",
      reason: "Snow emergency routes",
      tip: "Avoid parking on snow emergency routes - your car may be towed.",
    })
  }
  
  // Storm suggestions
  if (weather.condition === "storm") {
    suggestions.push({
      type: "garage",
      priority: "high",
      reason: "Storm warning",
      tip: "Park in a garage if possible to protect from hail and debris.",
    })
    
    suggestions.push({
      type: "avoid",
      priority: "high",
      reason: "Wind hazard",
      tip: "Avoid parking under trees or near signs that could blow over.",
    })
  }
  
  // Hot weather suggestions
  if (weather.temperature > 85) {
    suggestions.push({
      type: "shaded",
      priority: "high",
      reason: `High temperature (${weather.temperature}°F)`,
      tip: "Park in shaded areas to keep your car cooler and protect the interior.",
    })
    
    if (weather.temperature > 95) {
      suggestions.push({
        type: "garage",
        priority: "medium",
        reason: "Extreme heat",
        tip: "Parking garages stay cooler than outdoor spots in extreme heat.",
      })
    }
  }
  
  // Cold weather suggestions
  if (weather.temperature < 32) {
    suggestions.push({
      type: "garage",
      priority: "medium",
      reason: `Freezing temperature (${weather.temperature}°F)`,
      tip: "Covered parking helps prevent ice on your windshield.",
    })
  }
  
  // Fog suggestions
  if (weather.condition === "fog" || weather.visibility < 3) {
    suggestions.push({
      type: "open",
      priority: "low",
      reason: "Low visibility",
      tip: "Use well-lit parking areas and keep your lights on when parking.",
    })
  }
  
  // High wind suggestions
  if (weather.windSpeed > 25) {
    suggestions.push({
      type: "avoid",
      priority: "medium",
      reason: `High winds (${weather.windSpeed} mph)`,
      tip: "Avoid parking near trees, construction sites, or loose objects.",
    })
  }
  
  // Clear weather - suggest open parking
  if (weather.condition === "clear" && weather.temperature >= 50 && weather.temperature <= 75) {
    suggestions.push({
      type: "open",
      priority: "low",
      reason: "Great weather",
      tip: "Perfect conditions for any parking spot!",
    })
  }
  
  return suggestions
}

// Get weather icon
export function getWeatherIcon(condition: WeatherData["condition"]): string {
  switch (condition) {
    case "clear": return "sun"
    case "cloudy": return "cloud"
    case "rain": return "cloud-rain"
    case "snow": return "snowflake"
    case "storm": return "cloud-lightning"
    case "fog": return "cloud-fog"
    default: return "sun"
  }
}

// Get weather description
export function getWeatherDescription(weather: WeatherData): string {
  const conditionText: Record<WeatherData["condition"], string> = {
    clear: "Clear skies",
    cloudy: "Cloudy",
    rain: "Rainy",
    snow: "Snowing",
    storm: "Stormy",
    fog: "Foggy",
  }
  
  return `${conditionText[weather.condition]}, ${weather.temperature}°F`
}

// Check if weather will change soon
export function willWeatherChange(weather: WeatherData): {
  willChange: boolean
  changeHour: number
  newCondition: WeatherData["condition"]
  warning: string
} | null {
  const currentCondition = weather.condition
  
  for (const forecast of weather.forecast) {
    if (forecast.condition !== currentCondition) {
      const isBadChange = 
        (currentCondition === "clear" && (forecast.condition === "rain" || forecast.condition === "storm" || forecast.condition === "snow")) ||
        (forecast.condition === "storm")
      
      if (isBadChange) {
        return {
          willChange: true,
          changeHour: forecast.hour,
          newCondition: forecast.condition,
          warning: `${forecast.condition === "rain" ? "Rain" : forecast.condition === "storm" ? "Storm" : "Snow"} expected around ${formatHour(forecast.hour)}. Consider covered parking.`,
        }
      }
    }
  }
  
  return null
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}
