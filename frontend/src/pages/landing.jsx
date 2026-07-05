import React from "react";
import Navbar from "../components/common/Navbar";
import Hero from "../components/hero/hero";
import InteractiveDropdownDashboard from "../components/dropwdown/dropdownCrad";
import PerformanceDashboard from "@/components/dropwdown/feature";
import StatSection from "../components/dropwdown/StatSection";
import Leaderboard from "@/components/dropwdown/leaderboardcard";
import { motion } from "framer-motion";

// ─── AMBIENT BACKGROUND (Liquid Blue Gradient Blobs) ───
const AmbientBackground = () => {
  return (
    <>
      {/* 1. Deep Blue Base Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#020617] via-[#0b1c57] to-[#06143c]" />

      {/* 2. Animated Liquid Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Blob 1: Large Center-Left Liquid Shape */}
        <motion.div
          className="absolute top-[10%] -left-[5%] w-[60vw] h-[60vw] md:w-[45vw] md:h-[45vw] opacity-80"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            boxShadow: "inset 20px 20px 60px #172554, inset -20px -20px 60px #3b82f6",
          }}
          animate={{
            rotate: [0, 90, 180, 270, 360],
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 50% 60% 40% 50%",
              "30% 70% 50% 50% / 60% 40% 70% 30%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ],
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob 2: Right Side Liquid Shape (Size, shape & position fixed to mirror Blob 1) */}
        <motion.div
          className="absolute top-[10%] -right-[5%] w-[60vw] h-[60vw] md:w-[45vw] md:h-[45vw] opacity-80"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            boxShadow: "inset 20px 20px 60px #172554, inset -20px -20px 60px #3b82f6",
          }}
          animate={{
            rotate: [360, 270, 180, 90, 0], // Reverse rotation for symmetry
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%", // Exactly same irregular shape as left
              "60% 40% 30% 70% / 50% 60% 40% 50%",
              "30% 70% 50% 50% / 60% 40% 70% 30%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ],
            x: [0, -40, 20, 0], // Mirrored horizontal movement to stretch towards center
            y: [0, -30, 20, 0], // Mirrored vertical movement
          }}
          transition={{
            duration: 20, // Duration matched with Blob 1
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob 3: Bottom Center Liquid Shape */}
        <motion.div
          className="absolute -bottom-[15%] left-[25%] w-[70vw] h-[70vw] md:w-[40vw] md:h-[40vw] opacity-70"
          style={{
            background: "linear-gradient(to right, #1e40af, #0284c7)",
            boxShadow: "inset 20px 20px 60px #1e3a8a, inset -20px -20px 60px #38bdf8",
          }}
          animate={{
            rotate: [0, 180, 360],
            borderRadius: [
              "60% 40% 50% 50% / 40% 60% 50% 40%",
              "40% 60% 30% 70% / 60% 40% 70% 30%",
              "60% 40% 50% 50% / 40% 60% 50% 40%"
            ],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Optional Overlay to blend them softly */}
        <div className="absolute inset-0 bg-[#0f172a]/10 backdrop-blur-[60px] pointer-events-none" />

        {/* 👇 YAHAN TERA WALA EXACT FLOATING ANIMATION LAGAYA HAI 👇 */}
        
        {/* Animated Small Image 1: Left side (Bottom) */}
        <motion.img
          src="/blob2.png"
          alt="Left Decoration"
          className="absolute top-[70%] left-[5%] w-24 md:w-32 lg:w-40 object-contain z-10 pointer-events-none blur-[6px]"
          animate={{
            x: [0, 12, 25, 12, 0, -12, -25, -12, 0],
            y: [0, -6, 0, 6, 0, -6, 0, 6, 0],
            rotate: [0, 2, 0, -2, 0],
            scale: [1, 1.02, 1, 0.99, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />

        {/* Animated Small Image 2: Right side (Top) - Mirrored floating effect */}
        <motion.img
          src="/blob.png"
          alt="Right Decoration"
          className="absolute top-[25%] right-[5%] w-24 md:w-32 lg:w-40 object-contain z-10 pointer-events-none blur-[6px]"
          animate={{
            x: [0, -12, -25, -12, 0, 12, 25, 12, 0], // Reversed X direction
            y: [0, 6, 0, -6, 0, 6, 0, -6, 0],        // Reversed Y direction
            rotate: [0, -2, 0, 2, 0],
            scale: [1, 1.02, 1, 0.99, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 1 // Slight delay so they aren't perfectly synced
          }}
        />
        {/* 👆 DONE 👆 */}

      </div>
    </>
  );
};

// ─── MAIN LANDING PAGE ───
function Landing() {
  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden text-slate-100">
      
      {/* BACKGROUND RENDERED HERE */}
      <AmbientBackground />
      
      {/* HERO SECTION */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
      </div>
      
      {/* DASHBOARD COMPONENTS SECTION */}
      <div className="relative z-10 w-full">
        <div className="relative z-20 w-full pt-8 pb-20 flex flex-col items-center justify-center gap-10 sm:gap-16">
          
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <InteractiveDropdownDashboard /> 
          </div>
          
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <StatSection />
          </div>

          {/* 👇 YAHAN HAI ASLI FIX 👇 */}
          <div className="w-full flex flex-col items-center">
            <PerformanceDashboard />
            
            {/* Ye wrapper Leaderboard ko exact PerformanceDashboard ke inner grid (Calendar) ki line me set karega */}
            {/* -mt-6 gap ko kam karne ke liye hai, isko badha/ghata sakte ho agar aur paas/door karna ho */}
            <div className="w-full max-w-6xl mx-auto flex justify-start px-4 md:px-8 -mt-6 sm:-mt-10 z-20 relative">
              <Leaderboard />
            </div>
          </div>
          {/* 👆 KHEL KHATAM 👆 */}

        </div>
      </div>
      
    </div>
  );
}

export default Landing;