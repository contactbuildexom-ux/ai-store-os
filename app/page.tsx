import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureStrip from "@/components/landing/FeatureStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import StatsBar from "@/components/landing/StatsBar";
import WhyChooseBuildexom from "@/components/landing/WhyChooseBuildexom";
import Templates from "@/components/landing/Templates";
import WhatsappOrdering from "@/components/landing/WhatsappOrdering";
import QrCodeSection from "@/components/landing/QrCodeSection";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import FloatingChat from "@/components/landing/FloatingChat";
import { buildMetadata, PAGE_SEO } from "@/lib/seo";

// Homepage ka SEO title, meta description aur canonical (primary keyword ke saath)
export const metadata: Metadata = buildMetadata(PAGE_SEO.home);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Section with AI Store Builder */}
      <div id="hero">
        <Hero />
      </div>

      {/* 3. Feature Strip */}
      <FeatureStrip />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Stats Bar */}
      <StatsBar />

      {/* 6. Why Choose Buildexom */}
      <WhyChooseBuildexom />

      {/* 7. Templates Showcase */}
      <Templates />

      {/* 8. WhatsApp Ordering Showcase */}
      <WhatsappOrdering />

      {/* 9. QR Code (Scan & Shop) Section */}
      <QrCodeSection />

      {/* 10. Pricing Plans */}
      <Pricing />

      {/* 11. FAQ Section */}
      <Faq />

      {/* 12. Final CTA Banner */}
      <FinalCta />

      {/* 13. Footer */}
      <Footer />

      {/* Floating chat widget */}
      <FloatingChat />
    </main>
  );
}