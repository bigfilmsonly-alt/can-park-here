"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Building,
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Globe,
  Zap,
  FileText,
} from "lucide-react"

export default function PartnersPage() {
  const [selectedPlan, setSelectedPlan] = useState<"city" | "enterprise" | null>(null)

  const cityStats = {
    users: "50,000+",
    checksPer: "2.1M",
    ticketsAvoided: "125,000",
    complianceRate: "94%",
  }

  const features = [
    {
      icon: Globe,
      title: "Official Data Integration",
      description: "Direct access to your city's parking regulations, permits, and real-time enforcement data",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Detailed insights into parking patterns, compliance rates, and revenue optimization",
    },
    {
      icon: Users,
      title: "Citizen Engagement",
      description: "Improve parking compliance through better communication and user-friendly tools",
    },
    {
      icon: Shield,
      title: "Enforcement Support",
      description: "Real-time alerts and data sharing to improve enforcement efficiency",
    },
  ]

  const plans = [
    {
      id: "city" as const,
      name: "City Partnership",
      price: "Custom",
      description: "For municipal governments and parking authorities",
      features: [
        "Official parking data integration",
        "Custom city branding",
        "Analytics dashboard",
        "API access",
        "Dedicated support",
        "Revenue sharing options",
      ],
    },
    {
      id: "enterprise" as const,
      name: "Enterprise API",
      price: "$2,500",
      period: "/month",
      description: "For parking operators and property managers",
      features: [
        "Full API access",
        "Real-time parking data",
        "Custom integrations",
        "White-label options",
        "SLA guarantee",
        "Priority support",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Park for Partners</h1>
          <Button variant="outline" size="sm" className="bg-transparent">
            Contact Sales
          </Button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground mb-4">
            <Building className="h-4 w-4" />
            City & Enterprise Solutions
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Partner with Park
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Help your citizens or customers avoid parking tickets while gaining valuable insights into parking behavior
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{cityStats.users}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{cityStats.checksPer}</p>
            <p className="text-sm text-muted-foreground">Checks/Year</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-status-success-foreground">{cityStats.ticketsAvoided}</p>
            <p className="text-sm text-muted-foreground">Tickets Avoided</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{cityStats.complianceRate}</p>
            <p className="text-sm text-muted-foreground">Compliance Rate</p>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground text-center mb-6">
            Why Cities Partner with Us
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Case Study */}
        <Card className="p-6 mb-12 bg-muted/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-status-success-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Case Study</p>
              <h4 className="font-semibold text-foreground mb-2">
                City of Portland Reduces Parking Violations by 23%
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                After integrating Park with their official parking data, Portland saw a significant 
                decrease in parking violations and a 15% increase in meter revenue as drivers 
                became more compliant with parking rules.
              </p>
              <button className="text-sm font-medium text-foreground flex items-center gap-1">
                Read full case study <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground text-center mb-6">
            Partnership Options
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedPlan === plan.id ? "border-foreground" : ""
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-status-success-foreground shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                >
                  {plan.id === "city" ? "Request Demo" : "Get Started"}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* API Preview */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground text-center mb-6">
            Simple API Integration
          </h3>
          <Card className="p-6 bg-foreground text-background overflow-x-auto">
            <pre className="text-sm font-mono">
{`// Check parking availability
const response = await fetch('https://api.park.app/v1/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lat: 37.7749,
    lng: -122.4194,
    timestamp: new Date().toISOString()
  })
});

const result = await response.json();
// { canPark: true, timeLimit: 120, restrictions: [...] }`}
            </pre>
          </Card>
        </div>

        {/* CTA */}
        <Card className="p-8 text-center">
          <Zap className="h-10 w-10 mx-auto text-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to get started?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Schedule a demo to see how Park can help your city or organization improve parking compliance
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="h-12 px-8">
              Schedule Demo
            </Button>
            <Button variant="outline" className="h-12 px-8 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Download Info Pack
            </Button>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Park Partners Program</p>
          <p className="mt-1">Contact: partners@park.app</p>
        </div>
      </footer>
    </div>
  )
}
