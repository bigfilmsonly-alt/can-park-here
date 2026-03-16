"use client"

// Fleet/Business Account Management System

export interface Vehicle {
  id: string
  name: string
  licensePlate: string
  type: "car" | "truck" | "van" | "motorcycle"
  assignedDriver?: string
  status: "parked" | "moving" | "unknown"
  lastLocation?: {
    lat: number
    lng: number
    address: string
    timestamp: Date
  }
  parkingSession?: {
    startTime: Date
    endTime?: Date
    location: string
    status: "active" | "expiring" | "expired"
  }
}

export interface Driver {
  id: string
  name: string
  email: string
  phone?: string
  assignedVehicles: string[]
  totalParkingChecks: number
  ticketsAvoided: number
}

export interface FleetAccount {
  id: string
  companyName: string
  plan: "starter" | "professional" | "enterprise"
  vehicles: Vehicle[]
  drivers: Driver[]
  monthlyBudget?: number
  spentThisMonth: number
  ticketsSaved: number
  moneySaved: number
  createdAt: Date
}

export interface FleetStats {
  totalVehicles: number
  activeParking: number
  expiringSoon: number
  ticketsThisMonth: number
  ticketsAvoided: number
  totalSpent: number
  totalSaved: number
}

const FLEET_STORAGE_KEY = "park_fleet_account"

// Plan limits
const PLAN_LIMITS = {
  starter: { vehicles: 5, drivers: 5, price: 29 },
  professional: { vehicles: 25, drivers: 25, price: 99 },
  enterprise: { vehicles: 999, drivers: 999, price: 299 },
}

export function getFleetAccount(): FleetAccount | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(FLEET_STORAGE_KEY)
  if (!stored) return null
  const account = JSON.parse(stored)
  account.createdAt = new Date(account.createdAt)
  account.vehicles = account.vehicles.map((v: Vehicle) => ({
    ...v,
    lastLocation: v.lastLocation
      ? { ...v.lastLocation, timestamp: new Date(v.lastLocation.timestamp) }
      : undefined,
    parkingSession: v.parkingSession
      ? {
          ...v.parkingSession,
          startTime: new Date(v.parkingSession.startTime),
          endTime: v.parkingSession.endTime ? new Date(v.parkingSession.endTime) : undefined,
        }
      : undefined,
  }))
  return account
}

export function createFleetAccount(companyName: string, plan: FleetAccount["plan"]): FleetAccount {
  const account: FleetAccount = {
    id: `fleet_${Date.now()}`,
    companyName,
    plan,
    vehicles: [],
    drivers: [],
    spentThisMonth: 0,
    ticketsSaved: 0,
    moneySaved: 0,
    createdAt: new Date(),
  }
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(account))
  return account
}

export function updateFleetAccount(account: FleetAccount): void {
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(account))
}

export function addVehicle(
  licensePlate: string,
  name: string,
  type: Vehicle["type"]
): Vehicle | null {
  const account = getFleetAccount()
  if (!account) return null

  const limit = PLAN_LIMITS[account.plan].vehicles
  if (account.vehicles.length >= limit) return null

  const vehicle: Vehicle = {
    id: `v_${Date.now()}`,
    name,
    licensePlate: licensePlate.toUpperCase(),
    type,
    status: "unknown",
  }

  account.vehicles.push(vehicle)
  updateFleetAccount(account)
  return vehicle
}

export function removeVehicle(vehicleId: string): boolean {
  const account = getFleetAccount()
  if (!account) return false

  account.vehicles = account.vehicles.filter((v) => v.id !== vehicleId)
  account.drivers = account.drivers.map((d) => ({
    ...d,
    assignedVehicles: d.assignedVehicles.filter((id) => id !== vehicleId),
  }))
  updateFleetAccount(account)
  return true
}

export function addDriver(name: string, email: string, phone?: string): Driver | null {
  const account = getFleetAccount()
  if (!account) return null

  const limit = PLAN_LIMITS[account.plan].drivers
  if (account.drivers.length >= limit) return null

  const driver: Driver = {
    id: `d_${Date.now()}`,
    name,
    email,
    phone,
    assignedVehicles: [],
    totalParkingChecks: 0,
    ticketsAvoided: 0,
  }

  account.drivers.push(driver)
  updateFleetAccount(account)
  return driver
}

export function removeDriver(driverId: string): boolean {
  const account = getFleetAccount()
  if (!account) return false

  account.drivers = account.drivers.filter((d) => d.id !== driverId)
  updateFleetAccount(account)
  return true
}

export function assignVehicleToDriver(vehicleId: string, driverId: string): boolean {
  const account = getFleetAccount()
  if (!account) return false

  const vehicle = account.vehicles.find((v) => v.id === vehicleId)
  const driver = account.drivers.find((d) => d.id === driverId)
  if (!vehicle || !driver) return false

  vehicle.assignedDriver = driverId
  if (!driver.assignedVehicles.includes(vehicleId)) {
    driver.assignedVehicles.push(vehicleId)
  }

  updateFleetAccount(account)
  return true
}

export function startVehicleParking(
  vehicleId: string,
  location: { lat: number; lng: number; address: string }
): boolean {
  const account = getFleetAccount()
  if (!account) return false

  const vehicle = account.vehicles.find((v) => v.id === vehicleId)
  if (!vehicle) return false

  vehicle.status = "parked"
  vehicle.lastLocation = {
    ...location,
    timestamp: new Date(),
  }
  vehicle.parkingSession = {
    startTime: new Date(),
    location: location.address,
    status: "active",
  }

  updateFleetAccount(account)
  return true
}

export function endVehicleParking(vehicleId: string): boolean {
  const account = getFleetAccount()
  if (!account) return false

  const vehicle = account.vehicles.find((v) => v.id === vehicleId)
  if (!vehicle || !vehicle.parkingSession) return false

  vehicle.status = "moving"
  vehicle.parkingSession.endTime = new Date()
  vehicle.parkingSession.status = "expired"

  updateFleetAccount(account)
  return true
}

export function getFleetStats(): FleetStats {
  const account = getFleetAccount()
  if (!account) {
    return {
      totalVehicles: 0,
      activeParking: 0,
      expiringSoon: 0,
      ticketsThisMonth: 0,
      ticketsAvoided: 0,
      totalSpent: 0,
      totalSaved: 0,
    }
  }

  const activeParking = account.vehicles.filter(
    (v) => v.parkingSession?.status === "active"
  ).length
  const expiringSoon = account.vehicles.filter(
    (v) => v.parkingSession?.status === "expiring"
  ).length

  return {
    totalVehicles: account.vehicles.length,
    activeParking,
    expiringSoon,
    ticketsThisMonth: 0,
    ticketsAvoided: account.ticketsSaved,
    totalSpent: account.spentThisMonth,
    totalSaved: account.moneySaved,
  }
}

export function getPlanLimits(plan: FleetAccount["plan"]) {
  return PLAN_LIMITS[plan]
}

export function upgradePlan(newPlan: FleetAccount["plan"]): boolean {
  const account = getFleetAccount()
  if (!account) return false

  account.plan = newPlan
  updateFleetAccount(account)
  return true
}

// Generate sample fleet data for demo
export function generateSampleFleetData(): FleetAccount {
  const account = createFleetAccount("Acme Delivery Co.", "professional")
  
  const vehicles: Omit<Vehicle, "id">[] = [
    { name: "Delivery Van #1", licensePlate: "ABC-1234", type: "van", status: "parked" },
    { name: "Delivery Van #2", licensePlate: "DEF-5678", type: "van", status: "moving" },
    { name: "Service Truck", licensePlate: "GHI-9012", type: "truck", status: "parked" },
    { name: "Compact Car", licensePlate: "JKL-3456", type: "car", status: "unknown" },
  ]

  vehicles.forEach((v) => addVehicle(v.licensePlate, v.name, v.type))
  
  addDriver("John Smith", "john@acme.com", "555-0101")
  addDriver("Sarah Johnson", "sarah@acme.com", "555-0102")
  addDriver("Mike Wilson", "mike@acme.com")

  const updatedAccount = getFleetAccount()!
  updatedAccount.ticketsSaved = 12
  updatedAccount.moneySaved = 1450
  updatedAccount.spentThisMonth = 89
  updateFleetAccount(updatedAccount)

  return updatedAccount
}
