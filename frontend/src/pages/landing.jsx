import React from "react";
import Navbar from "../components/common/Navbar";
import Hero from "../components/hero/hero";
import InteractiveDropdownDashboard from "../components/dropwdown/dropdownCrad";
import PerformanceDashboard from "@/components/dropwdown/feature";
import StatSection from "../components/dropwdown/StatSection";
import { motion } from "framer-motion";

// ─── THEME-BASED AMBIENT AURORA BACKGROUND ───
const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0f1026]">
      {/* Base Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1026] via-[#17193b] to-[#2c3599] opacity-80" />
      
      {/* Orb 1: Deep Indigo Glow (Moves Top Left to Center) */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen"
        animate={{
          x: [0, 150, -50, 0],
          y: [0, 100, -20, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orb 2: Rich Purple Glow (Moves Top Right to Center) */}
      <motion.div
        className="absolute top-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/20 blur-[130px] mix-blend-screen"
        animate={{
          x: [0, -120, 40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Orb 3: Deep Cyan/Blue Glow (Moves Bottom to Up) */}
      <motion.div
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#2c3599]/30 blur-[150px] mix-blend-screen"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -120, 50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />
    </div>
  );
};

// ─── MAIN LANDING PAGE ───
function Landing() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden text-slate-200">
      
      {/* 🌟 THEMATIC AMBIENT BACKGROUND REPLACES EVERYTHING ELSE 🌟 */}
      <AmbientBackground />
      
      {/* HERO SECTION - TRANSPARENT */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
      </div>
      
      {/* DASHBOARD COMPONENTS SECTION */}
      <div className="relative z-10 w-full">
        <div className="relative z-20 w-full pt-8 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-10 sm:gap-24">
          <InteractiveDropdownDashboard /> 
          <StatSection />
          <PerformanceDashboard />
        </div>
      </div>
      
    </div>
  );
}

export default Landing;