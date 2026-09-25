import { useState } from "react"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ProblemSection from "@/components/problem-section"
import FeaturesSection from "@/components/features-section"
import SimplicityBanner from "@/components/simplicity-banner"
import CtaSection from "@/components/cta-section"
import Footer from "@/components/footer"
import ThemeToggle from "@/components/theme-toggle"
import ProcessingDashboard from "@/components/processing-dashboard"

function LandingPage({ onAuthSuccess }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] antialiased transition-colors duration-300 selection:bg-[#2563EB]/20 dark:bg-[#0B0F17] dark:text-[#F8FAFC] dark:selection:bg-[#F97316]/30">
      <Navbar onAuthSuccess={onAuthSuccess} />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <SimplicityBanner />
        <CtaSection />
      </main>
      <Footer />
      <ThemeToggle />
    </div>
  )
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LandingPage onAuthSuccess={() => setIsAuthenticated(true)} />
  }

  return <ProcessingDashboard />
}
