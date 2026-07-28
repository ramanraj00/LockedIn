import React from "react";
import Hero from "../components/hero/hero";
import Navbar from "../components/common/Navbar";
import AppDemoWindow from "../components/showcase/AppDemoWindow";
import HorizontalScrollSections from "../components/showcase/HorizontalScrollSections";
import LiveFocusSection from "../components/showcase/LiveFocusSection";
import CtaSection from "../components/showcase/CtaSection";

function Landing() {
  return (
    <div className="w-full relative bg-white">
      <Navbar />
      
      {/* Dark Hero Section */}
      <div className="bg-[#020617] w-full">
        <Hero />
      </div>

      {/* Off-white section below hero (overlapping the box) */}
      <div className="w-full bg-[#FAF9F6] min-h-[600px] flex flex-col items-center">
        {/* Negative margin to pull the box UP over the hero section */}
        <div className="-mt-20 md:-mt-32 w-full relative z-30 pb-0 md:pb-10">
          <AppDemoWindow />
        </div>
      </div>

      <HorizontalScrollSections />
      
      <LiveFocusSection />
      
      <CtaSection />
    </div>
  );
}

export default Landing;