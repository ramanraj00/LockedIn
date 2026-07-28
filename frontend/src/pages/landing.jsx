import React from "react";
import Hero from "../components/hero/hero";
import Navbar from "../components/common/Navbar";
import AppDemoWindow from "../components/showcase/AppDemoWindow";

function Landing() {
  return (
    <div className="w-full relative bg-white">
      <Navbar />
      
      {/* Dark Hero Section */}
      <div className="bg-[#020617] w-full">
        <Hero />
      </div>

      {/* White section below hero (overlapping the box) */}
      <div className="w-full bg-white min-h-[600px] flex justify-center">
        {/* Negative margin to pull the box UP over the hero section */}
        <div className="-mt-20 md:-mt-32 w-full relative z-30 pb-20">
          <AppDemoWindow />
        </div>
      </div>
    </div>
  );
}

export default Landing;