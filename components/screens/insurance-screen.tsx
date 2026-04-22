"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Shield,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Car,
  MapPin,
} from "lucide-react"

interface InsuranceScreenProps {
  showToast: (type: "success" | "error" | "info", title: string, message: string) => void
}

interface ComplianceRecord {
  id: string
  date: Date
  location: string
  duration: number
  status: "compliant" | "violation"
  details: string
}

interface InsuranceReport {
  id: string
  month: string
  year: number
  totalParkingSessions: number
  complianceRate: number
  violations: number
  generatedAt: Date
}

export function InsuranceScreen({ showToast }: InsuranceScreenProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [complianceScore, setComplianceScore] = useState(98)
  const [recentRecords, setRecentRecords] = useState<ComplianceRecord[]>([])
  const [reports, setReports] = useState<InsuranceReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Load mock data
    const connected = localStorage.getItem("park_insurance_connected") === "true"
    setIsConnected(connected)

    if (connected) {
      // Generate sample compliance records
      const now = new Date()
      const sampleRecords: ComplianceRecord[] = [
        {
          id: "r1",
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          location: "123 Main St",
          duration: 45,
          status: "compliant",
          details: "Parked within legal time limit",
        },
        {
          id: "r2",
          date: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          location: "456 Oak Ave",
          duration: 120,
          status: "compliant",
          details: "Metered parking - paid in full",
        },
        {
          id: "r3",
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          location: "789 Pine Rd",
          duration: 30,
          status: "compliant",
          details: "Free parking zone",
        },
      ]
      setRecentRecords(sampleRecords)

      // Generate sample reports
      const sampleReports: InsuranceReport[] = [
        {
          id: "rep1",
          month: "February",
          year: 2026,
          totalParkingSessions: 47,
          complianceRate: 100,
          violations: 0,
          generatedAt: new Date(2026, 1, 28),
        },
        {
          id: "rep2",
          month: "January",
          year: 2026,
          totalParkingSessions: 52,
          complianceRate: 98,
          violations: 1,
          generatedAt: new Date(2026, 0, 31),
        },
      ]
      setReports(sampleReports)
    }
  }, [])

  const handleConnect = () => {
    localStorage.setItem("park_insurance_connected", "true")
    setIsConnected(true)
    showToast("success", "Insurance connected", "Your parking data will be shared with your insurer")

    // Reload data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    showToast("success", "Report generated", "Your compliance report is ready to download")
  }

  const handleDownloadReport = (report: InsuranceReport) => {
    showToast("info", "Downloading", `${report.month} ${report.year} report`)
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-28">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Insurance Integration</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Share your parking compliance data with your auto insurer for potential discounts
          </p>
        </div>

        <Card className="p-5 mb-6 rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
          <h3 className="font-medium text-foreground mb-3">How it works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium text-foreground">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your insurance provider to Park
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium text-foreground">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                Your parking compliance data is automatically tracked
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium text-foreground">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                Good parking habits may qualify you for up to 5% discount
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 mb-6 rounded-[22px]" style={{ borderColor: "var(--status-success)", backgroundColor: "color-mix(in srgb, var(--status-success) 10%, transparent)" }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-status-success-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground">Safe Driver Bonus</p>
              <p className="text-sm text-muted-foreground mt-1">
                Users with 95%+ compliance scores save an average of $180/year on auto insurance
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-auto space-y-3">
          <Button
            onClick={handleConnect}
            className="w-full h-14 text-base font-medium rounded-full press-effect"
          >
            Connect Insurance
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We partner with major insurers including State Farm, Geico, Progressive, and Allstate
          </p>
        </div>
      </div>
    )
  }

  // Connected state
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] px-6 py-8 pb-28">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm mb-1" style={{ color: "var(--status-success)" }}>
          <span className="w-2 h-2 rounded-full bg-current" />
          <span className="font-medium">Connected to Insurance</span>
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Compliance Dashboard</h1>
      </div>

      {/* Compliance score */}
      <Card className="p-6 mb-6 rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Compliance Score</p>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(complianceScore / 100) * 352} 352`}
                className="text-status-success-foreground"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[32px] font-bold tracking-tight text-foreground">{complianceScore}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Excellent! You qualify for insurance discounts
          </p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-3 text-center rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
          <p className="text-[28px] font-bold tracking-tight text-foreground">47</p>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Sessions</p>
        </Card>
        <Card className="p-3 text-center rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
          <p className="text-[28px] font-bold tracking-tight" style={{ color: "var(--status-success)" }}>0</p>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Violations</p>
        </Card>
        <Card className="p-3 text-center rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
          <p className="text-[28px] font-bold tracking-tight text-foreground">$45</p>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Est. Savings</p>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="mb-6">
        <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {recentRecords.map((record) => (
            <Card key={record.id} className="p-4 rounded-[22px] border border-border" style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {record.status === "compliant" ? (
                    <CheckCircle className="h-5 w-5 text-status-success-foreground shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-status-error-foreground shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-foreground text-sm">{record.location}</p>
                    <p className="text-xs text-muted-foreground">{record.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {record.date.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{record.duration} min</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Monthly Reports</h2>
          <Button
            onClick={handleGenerateReport}
            variant="outline"
            size="sm"
            disabled={isGenerating}
            className="bg-transparent rounded-full"
          >
            {isGenerating ? "Generating..." : "Generate New"}
          </Button>
        </div>
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleDownloadReport(report)}
              className="w-full flex items-center justify-between p-4 rounded-[22px] bg-card border border-border active:scale-[0.98] transition-transform"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.03), 0 1px 8px rgba(0,0,0,.02)" }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-foreground" />
                <div className="text-left">
                  <p className="font-medium text-foreground">
                    {report.month} {report.year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.totalParkingSessions} sessions | {report.complianceRate}% compliance
                  </p>
                </div>
              </div>
              <Download className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
