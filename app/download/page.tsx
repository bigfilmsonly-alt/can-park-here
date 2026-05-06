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
  ShieldCheck,
  Scan,
  Zap,
  Lock,
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    step: "01",
    icon: MapPin,
    title: "Open Park",
    description: "We detect your location and read every sign, meter, and restriction within range.",
  },
  {
    step: "02",
    icon: Scan,
    title: "Get Your Answer",
    description: "A clear yes or no with exact time limits, restrictions, and what to watch for.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Park Protected",
    description: "Set a timer, snap your sign. If we're wrong, we pay the ticket. Up to $100.",
  },
]

const features = [
  {
    icon: Shield,
    title: "Ticket Guarantee",
    description: "We cover up to $100 if you follow our guidance and still get a ticket.",
  },
  {
    icon: Camera,
    title: "AI Sign Scanner",
    description: "Point your camera at any sign. Instant, plain-English explanation.",
  },
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Ask 'Can I park here?' hands-free while you're behind the wheel.",
  },
  {
    icon: Clock,
    title: "Smart Timer",
    description: "Push alerts before your meter expires or street cleaning begins.",
  },
  {
    icon: Zap,
    title: "Offline Mode",
    description: "Cached data means answers even without cell service.",
  },
  {
    icon: Lock,
    title: "Photo Vault",
    description: "Timestamped evidence of your parking spot, just in case.",
  },
]

const reviews = [
  {
    name: "Sarah M.",
    location: "Mission District",
    text: "Saved me from a $95 street cleaning ticket on my first week. The sign scanner alone is worth it.",
    avatar: "SM",
  },
  {
    name: "David K.",
    location: "Hayes Valley",
    text: "I've tried every parking app. Park is the only one that actually understands SF's insane rules.",
    avatar: "DK",
  },
  {
    name: "Maria L.",
    location: "Noe Valley",
    text: "The timer saved me hundreds in tickets. I don't park without checking Park first anymore.",
    avatar: "ML",
  },
]

export default function DownloadPage() {
  return (
    <div className="marketing-page min-h-screen" style={{ background: "var(--background)" }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-40"
        style={{
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          background: "rgba(12, 20, 33, 0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ParkLogo size={32} />
            <Wordmark size={20} className="text-white" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50 font-medium">
            <a href="#how" className="hover:text-white/80 transition-colors">How it works</a>
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
            <Link href="/fleet" className="hover:text-white/80 transition-colors">Business</Link>
          </div>
          <Button
            size="sm"
            className="bg-white text-[#0c1421] hover:bg-white/90 rounded-full px-5 text-[13px] font-semibold h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Install
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(175deg, #0c1421 0%, #0f1a2e 40%, #0a1020 70%, #0c1421 100%)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 800,
            height: 600,
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 65%)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#4ade80" }} />
            <span className="text-[12px] text-white/60 font-medium">Now live in San Francisco</span>
          </div>

          <h1
            className="font-bold text-white"
            style={{
              fontSize: "clamp(44px, 10vw, 88px)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
            }}
          >
            Can I park here?
          </h1>
          <h2
            className="font-bold mt-2"
            style={{
              fontSize: "clamp(44px, 10vw, 88px)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: "#3b82f6",
            }}
          >
            Yes.
          </h2>

          <p
            className="text-white/45 mt-8 max-w-[480px] mx-auto leading-relaxed"
            style={{ fontSize: "clamp(16px, 2.5vw, 20px)" }}
          >
            The parking app that reads every sign so you don&rsquo;t have to.
            We pay your ticket if we&rsquo;re wrong.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Button
              size="lg"
              className="bg-white text-[#0c1421] hover:bg-white/90 h-14 rounded-2xl px-8 text-[15px] font-semibold press-effect shadow-lg shadow-white/10"
            >
              <Download className="h-5 w-5 mr-2" />
              Install Free
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl px-8 text-[15px] font-medium border-white/10 text-white/70 bg-white/[0.04] hover:bg-white/[0.08]"
              >
                <Smartphone className="h-5 w-5 mr-2 opacity-60" />
                Open in Browser
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <div className="flex -space-x-2.5">
              {["SM", "DK", "ML", "JT", "AW"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0c1421] flex items-center justify-center text-[10px] font-semibold text-white/80"
                  style={{ background: `hsl(${215 + i * 30}, 45%, ${30 + i * 6}%)` }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[13px] text-white/50 font-medium ml-1.5">4.9</span>
              </div>
              <p className="text-[11px] text-white/30 mt-0.5">
                Trusted by 50,000+ drivers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.12em] font-semibold mb-4">
            As featured in
          </p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {["The Verge", "TechCrunch", "Wired", "Fast Company"].map((name) => (
              <span
                key={name}
                className="text-muted-foreground/30 font-semibold text-sm md:text-base"
                style={{ letterSpacing: "-0.02em" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="px-6 py-20 md:py-28" style={{ background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">How it works</p>
            <h2 className="section-heading">
              Three steps.
              <br />
              Zero tickets.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative p-7 rounded-[22px] hover-lift"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <span
                  className="text-[11px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Step {step.step}
                </span>
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center mt-5 mb-5"
                  style={{ background: "var(--accent-pale)", color: "var(--park-accent)" }}
                >
                  <step.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                >
                  {step.title}
                </h3>
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticket Guarantee highlight ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(175deg, #0c1421 0%, #0f1a2e 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Badge */}
            <div className="shrink-0 flex flex-col items-center md:items-start">
              <div
                className="w-20 h-20 rounded-[22px] flex items-center justify-center mb-6"
                style={{ background: "rgba(59,130,246,0.12)" }}
              >
                <ShieldCheck className="w-10 h-10 text-[#3b82f6]" strokeWidth={1.5} />
              </div>
              <div
                className="font-bold text-white text-center md:text-left"
                style={{ fontSize: "clamp(36px, 6vw, 56px)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
              >
                Up to $100.
                <br />
                <span className="text-[#3b82f6]">Guaranteed.</span>
              </div>
              <p className="text-white/40 mt-4 text-[15px] leading-relaxed max-w-sm text-center md:text-left">
                If you follow Park&rsquo;s guidance and still get a ticket, we reimburse up to $100.
                Three claims per year. No fine print.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#0c1421] hover:bg-white/90 h-13 rounded-2xl px-7 text-[14px] font-semibold mt-8 press-effect"
              >
                Learn more
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

            {/* Proof card */}
            <div
              className="rounded-[22px] p-7 w-full max-w-sm"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-4">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[15px] text-white/80 leading-relaxed">
                &ldquo;Got a $95 street cleaning ticket my first week in SF. Park would&rsquo;ve caught it.
                Signed up for Pro immediately and it&rsquo;s already paid for itself twice.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/80"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  JM
                </div>
                <div>
                  <p className="text-[13px] text-white/70 font-medium">Jamie M.</p>
                  <p className="text-[11px] text-white/30">San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section id="features" className="px-6 py-20 md:py-28" style={{ background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Features</p>
            <h2 className="section-heading">
              Everything you need.
              <br />
              Nothing you don&rsquo;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-[20px] hover-lift"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-[13px] flex items-center justify-center mb-4"
                  style={{ background: "var(--accent-pale)", color: "var(--park-accent)" }}
                >
                  <feature.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                >
                  {feature.title}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="px-6 py-20 md:py-28" style={{ background: "var(--muted)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Reviews</p>
            <h2 className="section-heading">
              Loved by drivers
            </h2>
            <p className="text-muted-foreground mt-3 text-[15px]">
              From people who stopped getting tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="p-6 rounded-[20px] hover-lift"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--foreground)" }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      background: "var(--accent-pale)",
                      color: "var(--park-accent)",
                    }}
                  >
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                      {review.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-20 md:py-28" style={{ background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Pricing</p>
            <h2 className="section-heading">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground mt-3 text-[15px]">
              Start free. Upgrade when you need protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Free */}
            <div
              className="p-7 rounded-[22px] flex flex-col"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>Free</h3>
              <p className="mt-4">
                <span className="text-[40px] font-bold" style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}>$0</span>
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">Forever free</p>
              <ul className="mt-7 space-y-3 flex-1">
                {["10 checks per month", "Basic timer alerts", "Sign scanner"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[var(--park-accent)] shrink-0" strokeWidth={1.75} />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-7 h-12 rounded-xl text-[13px] font-semibold"
              >
                Get Started
              </Button>
            </div>

            {/* Pro — highlighted */}
            <div
              className="relative p-7 rounded-[22px] flex flex-col"
              style={{
                background: "var(--card)",
                border: "2px solid var(--park-accent)",
                boxShadow: "0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(37,99,235,0.08)",
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-[0.08em]"
                style={{ background: "var(--park-accent)", color: "#fff" }}
              >
                Most Popular
              </div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>Pro</h3>
              <p className="mt-4">
                <span className="text-[40px] font-bold" style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}>$4.99</span>
                <span className="text-[14px] text-muted-foreground font-normal">/mo</span>
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">Cancel anytime</p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "Unlimited checks",
                  "$100 ticket guarantee",
                  "Voice commands",
                  "Offline mode",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px]" style={{ color: "var(--foreground)" }}>
                    <CheckCircle2 className="h-4 w-4 text-[var(--park-accent)] shrink-0" strokeWidth={1.75} />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-7 h-12 rounded-xl text-[13px] font-semibold text-white press-effect"
                style={{ background: "var(--park-accent)" }}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

            {/* Fleet */}
            <div
              className="p-7 rounded-[22px] flex flex-col"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>Fleet</h3>
              <p className="mt-4">
                <span className="text-[40px] font-bold" style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}>$99</span>
                <span className="text-[14px] text-muted-foreground font-normal">+/mo</span>
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">Custom pricing</p>
              <ul className="mt-7 space-y-3 flex-1">
                {[
                  "Everything in Pro",
                  "Unlimited drivers",
                  "Fleet dashboard",
                  "Analytics & reports",
                  "Dedicated support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[var(--park-accent)] shrink-0" strokeWidth={1.75} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/fleet">
                <Button
                  variant="outline"
                  className="w-full mt-7 h-12 rounded-xl text-[13px] font-semibold"
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
        style={{
          background: "linear-gradient(175deg, #0c1421 0%, #0f1a2e 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 400,
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 65%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <h2
            className="font-bold text-white"
            style={{ fontSize: "clamp(28px, 5vw, 44px)", letterSpacing: "-0.035em", lineHeight: 1.1 }}
          >
            Never get a parking
            <br />
            ticket again.
          </h2>
          <p className="text-white/40 mt-4 text-[16px] leading-relaxed max-w-md mx-auto">
            Join 50,000+ drivers who park with confidence every day.
          </p>

          <Button
            size="lg"
            className="bg-white text-[#0c1421] hover:bg-white/90 h-14 px-8 rounded-2xl text-[15px] font-semibold mt-10 press-effect shadow-lg shadow-white/10"
          >
            <Download className="h-5 w-5 mr-2" />
            Get Park Free
          </Button>

          <p className="text-[12px] text-white/25 mt-5">
            No app store required &middot; Works on any device &middot; Set up in 30 seconds
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10" style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ParkLogo size={24} />
            <Wordmark size={16} />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[13px] text-muted-foreground">
            <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
            <Link href="/fleet" className="hover:text-foreground transition-colors">Business</Link>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 Park Inc.
          </p>
        </div>
      </footer>
    </div>
  )
}
