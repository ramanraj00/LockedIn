import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center pt-10">
      
      {/* Background Image (Full Page) */}
      <img 
        src="/herobg.png" 
        alt="Hero Background" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto -mt-20">
        
        {/* Top Header: "Your Comfort Space For" */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="text-3xl md:text-5xl lg:text-5xl font-medium text-white flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 md:mb-6 drop-shadow-md"
        >
          <span>Your</span>
          <span className="bg-white text-black px-6 py-1 md:py-2 rounded-full font-bold shadow-lg">
            Comfort Space
          </span>
          <span>For</span>
        </motion.div>
        
        {/* Main Headline: "Building Better Days" */}
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.4, ease: "easeInOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-12 md:mb-16"
        >
          Building Better Days
        </motion.h1>

        {/* Call to Action Button */}
        <motion.button 
          onClick={() => navigate('/signup')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 1.8, delay: 0.8, ease: "easeInOut" }}
          className="px-8 py-4 rounded-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/40 text-slate-200 font-bold tracking-widest text-sm backdrop-blur-md transition-colors duration-300 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
        >
          START BUILDING BETTER DAYS
        </motion.button>
        
      </div>

    </div>
  );
};

export default Hero;