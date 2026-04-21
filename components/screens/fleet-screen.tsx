"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Building2,
  Car,
  Truck,
  Users,
  Plus,
  X,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  ChevronRight,
} from "lucide-react"
import {
  getFleetAccount,
  createFleetAccount,
  addVehicle,
  removeVehicle,
  addDriver,
  removeDriver,
  getFleetStats,
  generateSampleFleetData,
  type FleetAccount,
  type Vehicle,
  type Driver,
  type FleetStats,
  getPlanLimits,
} from "@/lib/fleet"

interface FleetScreenProps {
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

type FleetView = "overview" | "vehicles" | "drivers" | "add-vehicle" | "add-driver" | "setup"

export function FleetScreen({ showToast }: FleetScreenProps) {
  const [account, setAccount] = useState<FleetAccount | null>(null)
  const [stats, setStats] = useState<FleetStats | null>(null)
  const [view, setView] = useState<FleetView>("overview")
  const [companyName, setCompanyName] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<FleetAccount["plan"]>("starter")

  // Add vehicle form
  const [vehicleName, setVehicleName] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [vehicleType, setVehicleType] = useState<Vehicle["type"]>("car")

  // Add driver form
  const [driverName, setDriverName] = useState("")
  const [driverEmail, setDriverEmail] = useState("")
  const [driverPhone, setDriverPhone] = useState("")

  useEffect(() => {
    const fleetAccount = getFleetAccount()
    setAccount(fleetAccount)
    if (fleetAccount) {
      setStats(getFleetStats())
      setView("overview")
    } else {
      setView("setup")
    }
  }, [])

  const refreshData = () => {
    const fleetAccount = getFleetAccount()
    setAccount(fleetAccount)
    if (fleetAccount) {
      setStats(getFleetStats())
    }
  }

  const handleCreateAccount = () => {
    if (!companyName.trim()) {
      showToast("error", "Company name required", "Please enter your company name")
      return
    }
    createFleetAccount(companyName.trim(), selectedPlan)
    refreshData()
    setView("overview")
    showToast("success", "Account created", "Your fleet account is ready")
  }

  const handleAddVehicle = () => {
    if (!vehicleName.trim() || !licensePlate.trim()) {
      showToast("error", "Missing information", "Please fill in all fields")
      return
    }
    const vehicle = addVehicle(licensePlate.trim(), vehicleName.trim(), vehicleType)
    if (vehicle) {
      refreshData()
      setView("vehicles")
      setVehicleName("")
      setLicensePlate("")
      showToast("success", "Vehicle added", `${vehicle.name} has been added to your fleet`)
    } else {
      showToast("error", "Limit reached", "Upgrade your plan to add more vehicles")
    }
  }

  const handleRemoveVehicle = (id: string, name: string) => {
    removeVehicle(id)
    refreshData()
    showToast("info", "Vehicle removed", `${name} has been removed`)
  }

  const handleAddDriver = () => {
    if (!driverName.trim() || !driverEmail.trim()) {
      showToast("error", "Missing information", "Please fill in name and email")
      return
    }
    const driver = addDriver(driverName.trim(), driverEmail.trim(), driverPhone.trim() || undefined)
    if (driver) {
      refreshData()
      setView("drivers")
      setDriverName("")
      setDriverEmail("")
      setDriverPhone("")
      showToast("success", "Driver added", `${driver.name} has been added`)
    } else {
      showToast("error", "Limit reached", "Upgrade your plan to add more drivers")
    }
  }

  const handleRemoveDriver = (id: string, name: string) => {
    removeDriver(id)
    refreshData()
    showToast("info", "Driver removed", `${name} has been removed`)
  }

  const handleLoadSampleData = () => {
    generateSampleFleetData()
    refreshData()
    setView("overview")
    showToast("success", "Demo loaded", "Sample fleet data has been added")
  }

  // Setup view
  if (view === "setup") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Fleet Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage parking for your entire fleet
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Plan
            </label>
            <div className="space-y-3">
              {(["starter", "professional", "enterprise"] as const).map((plan) => {
                const limits = getPlanLimits(plan)
                return (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${
                      selectedPlan === plan
                        ? "border-foreground bg-muted"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground capitalize">{plan}</p>
                        <p className="text-sm text-muted-foreground">
                          Up to {limits.vehicles} vehicles, {limits.drivers} drivers
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        ${limits.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <Button
            onClick={handleCreateAccount}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Create Fleet Account
          </Button>
          <Button
            onClick={handleLoadSampleData}
            variant="outline"
            className="w-full h-12 text-sm rounded-xl bg-transparent"
          >
            Load Demo Data
          </Button>
        </div>
      </div>
    )
  }

  // Add vehicle form
  if (view === "add-vehicle") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("vehicles")} className="p-2 -ml-2" aria-label="Cancel adding vehicle">
            <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Add Vehicle</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Vehicle Name
            </label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="Delivery Van #1"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              License Plate
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="ABC-1234"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground uppercase"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["car", "van", "truck", "motorcycle"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    vehicleType === type
                      ? "border-foreground bg-muted"
                      : "border-border bg-background"
                  }`}
                >
                  <Car className="h-5 w-5 mx-auto mb-1 text-foreground" />
                  <span className="text-xs text-foreground capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleAddVehicle}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Add Vehicle
          </Button>
        </div>
      </div>
    )
  }

  // Add driver form
  if (view === "add-driver") {
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("drivers")} className="p-2 -ml-2" aria-label="Cancel adding driver">
            <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Add Driver</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="John Smith"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              placeholder="john@company.com"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="555-0123"
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
            />
          </div>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handleAddDriver}
            className="w-full h-14 text-base font-medium rounded-2xl"
          >
            Add Driver
          </Button>
        </div>
      </div>
    )
  }

  // Vehicles list
  if (view === "vehicles") {
    const limits = account ? getPlanLimits(account.plan) : { vehicles: 0 }
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("overview")} className="p-2 -ml-2" aria-label="Back to overview">
              <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Vehicles</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {account?.vehicles.length || 0}/{limits.vehicles}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {account?.vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {vehicle.type === "truck" ? (
                      <Truck className="h-5 w-5 text-foreground" />
                    ) : (
                      <Car className="h-5 w-5 text-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                    {vehicle.parkingSession?.status === "active" && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-status-success-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Parked at {vehicle.parkingSession.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveVehicle(vehicle.id, vehicle.name)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}

          {(!account?.vehicles || account.vehicles.length === 0) && (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No vehicles yet</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => setView("add-vehicle")}
          className="w-full h-14 text-base font-medium rounded-2xl mt-4"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vehicle
        </Button>
      </div>
    )
  }

  // Drivers list
  if (view === "drivers") {
    const limits = account ? getPlanLimits(account.plan) : { drivers: 0 }
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("overview")} className="p-2 -ml-2" aria-label="Back to overview">
              <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Drivers</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {account?.drivers.length || 0}/{limits.drivers}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {account?.drivers.map((driver) => (
            <Card key={driver.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {driver.assignedVehicles.length} vehicles assigned
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDriver(driver.id, driver.name)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}

          {(!account?.drivers || account.drivers.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No drivers yet</p>
            </div>
          )}
        </div>

        <Button
          onClick={() => setView("add-driver")}
          className="w-full h-14 text-base font-medium rounded-2xl mt-4"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Driver
        </Button>
      </div>
    )
  }

  // Overview (default)
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-20">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Fleet Account</p>
        <h1 className="text-2xl font-semibold text-foreground">{account?.companyName}</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">
          {account?.plan} Plan
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Car className="h-4 w-4" />
            <span className="text-xs">Vehicles</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats?.totalVehicles || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Parked Now</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats?.activeParking || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-status-success-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Tickets Avoided</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats?.ticketsAvoided || 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-status-success-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Money Saved</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            ${(stats?.totalSaved || 0).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Alerts */}
      {stats && stats.expiringSoon > 0 && (
        <Card className="p-4 mb-4 border-status-warning bg-status-warning/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-status-warning-foreground" />
            <div>
              <p className="font-medium text-foreground">
                {stats.expiringSoon} vehicle{stats.expiringSoon > 1 ? "s" : ""} expiring soon
              </p>
              <p className="text-sm text-muted-foreground">
                Check the vehicles list for details
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="space-y-2">
        <button
          onClick={() => setView("vehicles")}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-foreground" />
            <span className="font-medium text-foreground">Manage Vehicles</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => setView("drivers")}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-foreground" />
            <span className="font-medium text-foreground">Manage Drivers</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-foreground" />
            <span className="font-medium text-foreground">Monthly Report</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
