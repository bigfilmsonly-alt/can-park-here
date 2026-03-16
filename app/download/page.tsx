"use client"

import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Bell, 
  Shield, 
  Camera, 
  Mic, 
  Clock,
  Star,
  Download,
  Smartphone,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: MapPin,
    title: "Location-Aware",
    description: "Instantly know if you can park at your exact location",
  },
  {
    icon: Shield,
    title: "Ticket Protection",
    description: "We'll cover your ticket if our info is wrong",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get alerts before your time runs out",
  },
  {
    icon: Camera,
    title: "Sign Scanner",
    description: "Point your camera at any parking sign to understand it",
  },
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Ask 'Can I park here?' completely hands-free",
  },
  {
    icon: Clock,
    title: "Offline Mode",
    description: "Works without internet using cached data",
  },
]

const reviews = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "Saved me from so many tickets. The sign scanner is a game changer.",
  },
  {
    name: "David K.",
    rating: 5,
    text: "Finally, an app that actually understands SF parking rules.",
  },
  {
    name: "Maria L.",
    rating: 5,
    text: "The timer reminders have saved me hundreds in tickets.",
  },
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-[22px] bg-foreground flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-background">P</span>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Park
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Can I park here?
        </p>
        
        <p className="text-base text-muted-foreground mt-6 max-w-sm mx-auto leading-relaxed">
          Clear answers. No tickets. No confusion.
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            4.9 (2,847 reviews)
          </span>
        </div>

        {/* Download buttons */}
        <div className="flex flex-col gap-3 mt-8 max-w-xs mx-auto">
          <Button className="h-14 rounded-2xl text-base font-medium">
            <Download className="h-5 w-5 mr-2" />
            Install App
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-medium bg-transparent">
              <Smartphone className="h-5 w-5 mr-2" />
              Open in Browser
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          No app store required. Works on any device.
        </p>
      </section>

      {/* Phone mockup */}
      <section className="px-6 py-8">
        <div className="max-w-xs mx-auto">
          <div className="bg-card border border-border rounded-[32px] p-4 shadow-xl">
            <div className="bg-muted rounded-[24px] aspect-[9/16] flex items-center justify-center">
              <div className="text-center px-8">
                <h2 className="text-2xl font-semibold text-foreground">
                  Can I park here?
                </h2>
                <div className="mt-6 w-full h-12 bg-foreground rounded-xl flex items-center justify-center">
                  <span className="text-background font-medium">Check Parking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-12">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Everything you need
        </h2>
        
        <div className="space-y-4 max-w-md mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 py-12 bg-muted/50">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">
          Loved by drivers
        </h2>
        
        <div className="space-y-4 max-w-md mx-auto">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="p-4 bg-card border border-border rounded-2xl"
            >
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-foreground">{review.text}</p>
              <p className="text-xs text-muted-foreground mt-2">{review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-12">
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Simple pricing
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Start free, upgrade when you need more
        </p>
        
        <div className="space-y-4 max-w-md mx-auto">
          {/* Free tier */}
          <div className="p-6 bg-card border border-border rounded-2xl">
            <h3 className="font-semibold text-foreground">Free</h3>
            <p className="text-3xl font-bold text-foreground mt-2">$0</p>
            <ul className="mt-4 space-y-2">
              {["10 checks per month", "Basic reminders", "Sign scanner"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-foreground" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Pro tier */}
          <div className="p-6 bg-foreground text-background rounded-2xl">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Pro</h3>
              <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full">
                Popular
              </span>
            </div>
            <p className="text-3xl font-bold mt-2">
              $4.99<span className="text-base font-normal opacity-70">/mo</span>
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Unlimited checks",
                "$100 ticket protection",
                "Voice commands",
                "Offline mode",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm opacity-90">
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="w-full mt-6 bg-background text-foreground hover:bg-background/90 h-12 rounded-xl">
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Never get a parking ticket again
        </h2>
        <p className="text-muted-foreground mt-2">
          Join 50,000+ drivers who park with confidence
        </p>
        
        <Button className="h-14 px-8 rounded-2xl text-base font-medium mt-8">
          <Download className="h-5 w-5 mr-2" />
          Get Park Free
        </Button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/partners" className="hover:text-foreground transition-colors">
            Partners
          </Link>
          <Link href="/fleet" className="hover:text-foreground transition-colors">
            Business
          </Link>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Park Inc. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
