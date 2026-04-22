"use client"

import { Button } from "@/components/ui/button"
import { ParkLogo, Wordmark } from "@/components/park-logo"
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
  CheckCircle2,
  ArrowRight,
  Users,
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    step: 1,
    icon: MapPin,
    title: "Open Park",
    description: "We detect your location and read every sign within range.",
  },
  {
    step: 2,
    icon: Camera,
    title: "Get Your Answer",
    description: "A clear yes or no with time limits, restrictions, and tips.",
  },
  {
    step: 3,
    icon: Bell,
    title: "Park with Confidence",
    description: "Set a timer, snap your sign, and never worry about a ticket.",
  },
]

const features = [
  {
    icon: Shield,
    title: "Ticket Protection",
    description: "We'll cover your ticket if our info is wrong",
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

const trustLogos = [
  { name: "The Verge", width: "w-20" },
  { name: "TechCrunch", width: "w-24" },
  { name: "Wired", width: "w-16" },
  { name: "Fast Company", width: "w-24" },
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
    <div className="marketing-page min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--navy)]/95 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ParkLogo size={32} />
            <Wordmark size={20} className="text-white" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/fleet" className="hover:text-white transition-colors">Business</Link>
          </div>
          <Button
            size="sm"
            className="bg-accent hover:bg-accent-deep text-white rounded-full px-5 text-sm font-medium"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Install
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(170deg, var(--navy) 0%, #0d1f3c 60%, var(--navy-light) 100%)" }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(59,130,246,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          <h1
            className="font-bold text-white tracking-tight leading-[1.05]"
            style={{ fontSize: "clamp(48px, 10vw, 92px)", letterSpacing: "-0.03em" }}
          >
            Can I park here?
            <br />
            <span className="text-accent">Yes.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mt-6 max-w-lg mx-auto leading-relaxed">
            Clear answers. No tickets. No confusion. The parking app that reads every sign so you don't have to.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent-deep text-white h-14 rounded-2xl px-8 text-base font-medium press-effect"
            >
              <Download className="h-5 w-5 mr-2" />
              Install Free
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl px-8 text-base font-medium border-white/20 text-white bg-white/5 hover:bg-white/10"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Open in Browser
              </Button>
            </Link>
          </div>

          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[var(--navy)] flex items-center justify-center text-xs font-medium text-white"
                  style={{ background: `hsl(${210 + i * 25}, 60%, ${40 + i * 5}%)` }}
                >
                  <Users className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Loved by 50,000+ drivers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-xs text-muted-foreground text-center uppercase tracking-widest mb-4">
            As featured in
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
            {trustLogos.map((logo) => (
              <span
                key={logo.name}
                className={`text-muted-foreground/40 font-semibold text-sm md:text-base tracking-tight ${logo.width}`}
                style={{ textAlign: "center" }}
              >
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works — 3-Column Step Cards ── */}
      <section id="features" className="px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground text-center mt-3 max-w-md mx-auto">
            Three steps. Zero tickets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative p-6 bg-card border border-border rounded-2xl hover-lift"
              >
                {/* Step number badge */}
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold mb-4">
                  {step.step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <step.icon className="h-5.5 w-5.5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Extra Features ── */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center tracking-tight">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-center mt-3 max-w-md mx-auto">
            Built for the way you actually park.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center tracking-tight">
            Loved by drivers
          </h2>
          <p className="text-muted-foreground text-center mt-3">
            Hear from people who stopped getting tickets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="p-5 bg-card border border-border rounded-2xl hover-lift"
              >
                <div className="flex items-center gap-1 mb-3">
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
                <p className="text-sm text-foreground leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-3 font-medium">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center tracking-tight">
            Simple pricing
          </h2>
          <p className="text-center text-muted-foreground mt-3">
            Start free, upgrade when you need more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            {/* Free tier */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col">
              <h3 className="font-semibold text-foreground text-lg">Free</h3>
              <p className="text-4xl font-bold text-foreground mt-3">
                $0
              </p>
              <p className="text-sm text-muted-foreground mt-1">Forever free</p>
              <ul className="mt-6 space-y-3 flex-1">
                {["10 checks per month", "Basic reminders", "Sign scanner"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 h-12 rounded-xl text-sm font-medium"
              >
                Get Started
              </Button>
            </div>

            {/* Pro tier */}
            <div className="relative p-6 rounded-2xl flex flex-col border-2 border-accent bg-card shadow-lg shadow-accent/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="font-semibold text-foreground text-lg">Pro</h3>
              <p className="text-4xl font-bold text-foreground mt-3">
                $4.99<span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
              <ul className="mt-6 space-y-3 flex-1">
                {[
                  "Unlimited checks",
                  "$100 ticket protection",
                  "Voice commands",
                  "Offline mode",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-accent hover:bg-accent-deep text-white h-12 rounded-xl text-sm font-medium">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

            {/* Fleet tier */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col">
              <h3 className="font-semibold text-foreground text-lg">Fleet</h3>
              <p className="text-4xl font-bold text-foreground mt-3">
                $99<span className="text-base font-normal text-muted-foreground">+/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Per fleet, custom pricing</p>
              <ul className="mt-6 space-y-3 flex-1">
                {[
                  "Everything in Pro",
                  "Unlimited drivers",
                  "Fleet dashboard",
                  "Analytics & reports",
                  "Dedicated support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/fleet">
                <Button
                  variant="outline"
                  className="w-full mt-6 h-12 rounded-xl text-sm font-medium"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(170deg, var(--navy) 0%, #0d1f3c 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Never get a parking ticket again
          </h2>
          <p className="text-white/50 mt-3 text-lg">
            Join 50,000+ drivers who park with confidence.
          </p>

          <Button
            size="lg"
            className="bg-accent hover:bg-accent-deep text-white h-14 px-8 rounded-2xl text-base font-medium mt-8 press-effect"
          >
            <Download className="h-5 w-5 mr-2" />
            Get Park Free
          </Button>

          <p className="text-xs text-white/30 mt-4">
            No app store required. Works on any device.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ParkLogo size={24} />
            <Wordmark size={16} />
          </div>
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
          <p className="text-xs text-muted-foreground">
            Park Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
