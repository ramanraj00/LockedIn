import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [hoveredFamily, setHoveredFamily] = useState(null);

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center pt-10 overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 w-full h-full z-0 grid grid-cols-2 grid-rows-2 contrast-[1.10]">
        
        {/* Top Left Square */}
        <div className="w-full h-full relative overflow-hidden">
          <div 
            onMouseEnter={() => setHoveredFamily('brown')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'brown' ? 'bg-[#8F8273]' : 'bg-[#AAA094]'}`}
          ></div>
          {/* Light Blue Wedge */}
          <div 
            onMouseEnter={() => setHoveredFamily('blue')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'blue' ? 'bg-[#7BB4D6]' : 'bg-[#ADCDE3]'}`} 
            style={{ clipPath: 'polygon(33% 0, 0 0, 0 50%, 100% 100%)' }}
          ></div>
        </div>

        {/* Top Right Square */}
        <div className="w-full h-full relative overflow-hidden">
          <div 
            onMouseEnter={() => setHoveredFamily('cream')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'cream' ? 'bg-[#C2AA7D]' : 'bg-[#D4C3A9]'}`}
          ></div>
          {/* Darker Blue Wedge */}
          <div 
            onMouseEnter={() => setHoveredFamily('blue')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'blue' ? 'bg-[#6893C0]' : 'bg-[#92B2D2]'}`} 
            style={{ clipPath: 'polygon(66% 0, 100% 0, 100% 50%, 0 100%)' }}
          ></div>
        </div>

        {/* Bottom Left Square */}
        <div className="w-full h-full relative overflow-hidden">
          <div 
            onMouseEnter={() => setHoveredFamily('cream')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'cream' ? 'bg-[#C2AA7D]' : 'bg-[#D4C3A9]'}`}
          ></div>
          {/* Warm White Wedge */}
          <div 
            onMouseEnter={() => setHoveredFamily('cream')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'cream' ? 'bg-[#D4C4B2]' : 'bg-[#EBE3D7]'}`} 
            style={{ clipPath: 'polygon(100% 0, 0 0, 0 50%)' }}
          ></div>
          {/* Light Blue Wedge */}
          <div 
            onMouseEnter={() => setHoveredFamily('blue')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'blue' ? 'bg-[#7BB4D6]' : 'bg-[#ADCDE3]'}`} 
            style={{ clipPath: 'polygon(100% 0, 0 50%, 0 100%, 50% 100%)' }}
          ></div>
        </div> 
        
        {/* Bottom Right Square */}
        <div className="w-full h-full relative overflow-hidden">
          <div 
            onMouseEnter={() => setHoveredFamily('cream')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'cream' ? 'bg-[#D4C4B2]' : 'bg-[#EBE3D7]'}`}
          ></div>
          {/* Warm Beige Wedge */}
          <div 
            onMouseEnter={() => setHoveredFamily('brown')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'brown' ? 'bg-[#8F8273]' : 'bg-[#AAA094]'}`} 
            style={{ clipPath: 'polygon(0 0, 50% 100%, 0 100%)' }}
          ></div>
           {/* Light Blue Wedge */}
           <div 
            onMouseEnter={() => setHoveredFamily('blue')}
            onMouseLeave={() => setHoveredFamily(null)}
            className={`absolute inset-0 transition-colors duration-300 ${hoveredFamily === 'blue' ? 'bg-[#7BB4D6]' : 'bg-[#ADCDE3]'}`} 
            style={{ clipPath: 'polygon(0 0, 100% 50%, 100% 100%, 50% 100%)' }}
          ></div>
        </div> 
      </div>
      
      {/* Soft Center Glow for Text Legibility */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ 
        background: 'radial-gradient(ellipse at center, rgba(250,249,246,0.85) 0%, rgba(250,249,246,0.55) 45%, rgba(250,249,246,0) 90%)' 
      }}></div>
      
      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto -mt-20">
        
        {/* Main Headline Group */}
        <div className="flex flex-col items-center gap-1 md:gap-2 mb-6 md:mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-none"
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
          >
            Your Comfort Space
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="text-3xl md:text-4xl lg:text-5xl italic leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#4A7B7A" }}
          >
            for building better days.
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="text-sm md:text-base text-slate-600 font-medium max-w-lg leading-relaxed mb-10"
        >
          Track your daily focus, identify productivity patterns, and build better work habits with intelligent insights.
        </motion.p>

        {/* Call to Action Button */}
        <motion.button 
          onClick={() => navigate('/signup')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="px-8 py-3.5 md:px-10 md:py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm md:text-base transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)] whitespace-nowrap"
        >
          Start Focusing
        </motion.button>
        
      </div>

    </div>
  );
};

export default Hero;