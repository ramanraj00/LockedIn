import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image in JS as well for faster detection
  useEffect(() => {
    const img = new Image();
    img.src = "/herobg.webp";
    if (img.complete) {
      setImageLoaded(true);
    } else {
      img.onload = () => setImageLoaded(true);
    }
  }, []);

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center pt-10">
      
      {/* Background Image with Light Overlay for contrast & consistency */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/herobg.webp" 
          alt="Hero Background" 
          loading="eager"
          fetchpriority="high"
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        />
        {/* Soft light overlay to make dark text pop and match the site's light theme */}
        <div className="absolute inset-0 bg-white/50 md:bg-white/40 backdrop-blur-[2px]"></div>
        {/* Gradient to blend smoothly into the next section */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FAFAFA]"></div>
      </div>
      
      {/* Hero Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto -mt-20">
        
        {/* Top Header: "Your Comfort Space For" */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="text-3xl md:text-5xl lg:text-5xl font-medium text-[#1F2937] flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 md:mb-6 drop-shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span>Your</span>
          <span className="bg-[#1F2937] text-white px-6 py-0.5 md:py-1 rounded-full font-bold shadow-md" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
            Comfort Space
          </span>
          <span>For</span>
        </motion.div>
        
        {/* Main Headline: "Building Better Days" */}
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.4, ease: "easeInOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#1F2937] tracking-tight mb-12 md:mb-16 drop-shadow-sm"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
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
          className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#1F2937] hover:bg-[#374151] text-white font-bold tracking-wider md:tracking-widest text-[11px] sm:text-xs md:text-sm transition-colors duration-300 shadow-xl whitespace-nowrap"
        >
          START BUILDING BETTER DAYS
        </motion.button>
        
      </div>

    </div>
  );
};

export default Hero;