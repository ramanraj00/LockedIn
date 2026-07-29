import React from "react";
import Hero from "../components/hero/hero";
import Navbar from "../components/common/Navbar";
import AppDemoWindow from "../components/showcase/AppDemoWindow";
import HorizontalScrollSections from "../components/showcase/HorizontalScrollSections";
import ArchitectureSection from "../components/showcase/ArchitectureSection";
import ProgressSection from "../components/showcase/ProgressSection";
import FeatureFlowSection from "../components/showcase/FeatureFlowSection";
import LiveFocusSection from "../components/showcase/LiveFocusSection";
import CtaSection from "../components/showcase/CtaSection";
import SponsorSection from "../components/showcase/SponsorSection";
import Footer from "../components/showcase/Footer";

function Landing() {
  return (
    <div className="w-full relative bg-white">
      <Navbar />
      
      {/* Dark Hero Section */}
      <div id="hero-section" className="bg-[#020617] w-full">
        <Hero />
      </div>

      {/* Off-white section below hero (overlapping the box) */}
      <div className="w-full bg-[#FAF9F6] min-h-[600px] flex flex-col items-center">
        {/* Negative margin to pull the box UP over the hero section */}
        <div className="-mt-20 md:-mt-32 w-full relative z-30 pb-0 md:pb-10">
          <AppDemoWindow />
        </div>
      </div>

      {/* Desktop Horizontal Scroll */}
      <div id="dashboard-section" className="hidden md:block relative">
        <HorizontalScrollSections />
        {/* Anchor to scroll exactly to the Features step (end of the 350vh scroll) */}
        <div id="features-desktop-anchor" className="absolute bottom-0 h-screen w-full pointer-events-none" />
      </div>

      {/* Mobile Vertical Stack */}
      <div id="dashboard-section-mobile" className="md:hidden flex flex-col w-full overflow-hidden bg-[#FAF9F6]">
        <ArchitectureSection />
        <ProgressSection />
        <div id="features-mobile-anchor">
          <FeatureFlowSection />
        </div>
      </div>
      
      <div id="leaderboard-section">
        <LiveFocusSection />
      </div>
      
      <CtaSection />

      <SponsorSection />

      <Footer />
    </div>
  );
}

export default Landing;