import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, CheckCircle, ArrowRight } from "lucide-react";

function App() {
  const pathRef = useRef(null);
  const [activeCard, setActiveCard] = useState(1);

  useEffect(() => {
    let animationFrameId;
    let offset = 2000;

    const animate = () => {
      offset -= 4;
      if (offset <= 0) {
        offset = 2000;
      }
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = offset;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev === 1 ? 2 : 1));
    }, 3300);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(cardInterval);
    };
  }, []);

  // CARD 1: White Pills Variants
  const cardGroupVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      }
    },
    exit: { 
      opacity: 0, 
      x: -10,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  const pillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" } 
    }
  };

  // CARD 2: Black Card Dropdown Variants
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 80, damping: 18 }
    }
  };

  return (
    <div className="relative overflow-hidden w-full min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2c3599] via-[#17193b] to-[#0f1026] py-4 md:py-0">
      
      {/* MAIN RESPONSIVE WRAPPER */}
      <div id="hero-section" className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
        
        {/* Main Title */}
        <div className="text-center w-full mb-6 mt-2 md:mt-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-400  tracking-tight max-w-xs sm:max-w-xl md:max-w-3xl leading-[1.2] sm:leading-[1.15] mx-auto">
            LockedIn.<br />
            Your Comfort Space For Building Better Days
          </h1>
        </div>

        {/* LONG CTA BUTTON */}
        <div className="z-20 mb-2 w-full max-w-xs sm:max-w-sm md:max-w-md px-2">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 25px rgba(64, 78, 237, 0.45)" }}
            whileTap={{ scale: 0.98 }}
            className="group flex w-full items-center justify-center gap-3 bg-[#404eed] hover:bg-[#5865f2] text-white font-semibold py-3.5 sm:py-4 rounded-xl transition-all duration-200 shadow-xl cursor-pointer text-sm sm:text-base tracking-wide"
          >
            <span>Start your Journey</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* --- DYNAMIC INTERACTIVE CARDS CONTAINER --- */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-7xl flex flex-col md:flex-row items-center justify-center gap-4 mt-1 md:mt-2 pt-2 md:pt-10">
          
          <div className="w-full min-h-[13rem] flex items-start justify-center text-left z-20">
            <AnimatePresence mode="wait">
              
              {activeCard === 1 ? (
                /*  CARD 1: WHITE PILLS (Left aligned on Desktop) */
                <motion.div
                  key="white-pills-card"
                  variants={cardGroupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-3 w-full items-center md:items-start md:mr-auto md:w-80"
                >
                  <motion.div
                    variants={pillVariants}
                    className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-medium text-zinc-900 text-xs sm:text-sm tracking-wide"
                  >
                    Watch your progress
                  </motion.div>

                  <motion.div
                    variants={pillVariants}
                    className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-bold text-blue-600 text-xs sm:text-sm tracking-wide"
                  >
                    Grow one day
                  </motion.div>

                  <motion.div
                    variants={pillVariants}
                    className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-medium text-zinc-900 text-xs sm:text-sm tracking-wide"
                  >
                    at a time.
                  </motion.div>
                </motion.div>
              ) : (
                /* 📍 CARD 2: BLACK CARD (Right aligned on Desktop, ⚠️ FIXED: -mt-32 removed completely for standard flow alignment) */
                <motion.div
                  key="black-checklist-card"
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="w-[92%] sm:w-full md:w-80 bg-zinc-800/90 backdrop-blur-md border border-zinc-700 rounded-2xl p-4 shadow-2xl overflow-hidden mx-auto md:mx-0 md:ml-auto mt-1 md:mt-0"
                >
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-3 text-xs sm:text-sm font-medium text-zinc-200"
                  >
                    <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30">
                      <Flame size={16} className="text-orange-500 shrink-0" />
                      <span>Build your streak</span>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30">
                      <Calendar size={16} className="text-blue-400 shrink-0" />
                      <span>Plan your day</span>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30">
                      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                      <span>Track your focus session</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
      
      {/* RESPONSIVE SVG LAYER */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none origin-bottom scale-75 sm:scale-90 md:scale-100"
        width="900"
        height="500"
        viewBox="0 0 900 500"
        fill="none"
      >
        <defs>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4E5F9E" />
            <stop offset="55%" stopColor="#7F95E6" />
            <stop offset="78%" stopColor="#B9C8FF" />
            <stop offset="100%" stopColor="#DCE6FF" />
          </linearGradient>

          <linearGradient id="glowMaskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="65%" stopColor="#030617" />
            <stop offset="85%" stopColor="#14245A" />
            <stop offset="100%" stopColor="#4F66FF" />
          </linearGradient>

          <linearGradient id="premiumNeonLight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0052D4" stopOpacity="0" />
            <stop offset="25%" stopColor="#2F80ED" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#00D2FF" stopOpacity="1" />
            <stop offset="75%" stopColor="#2F80ED" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0052D4" stopOpacity="0" />
          </linearGradient>

          <mask id="bottomGlowMask">
            <rect width="900" height="500" fill="url(#glowMaskGrad)" />
          </mask>

          <filter id="upperGlow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          
          <filter id="heavyGlow">
            <feGaussianBlur stdDeviation="1" />
          </filter>

          <filter id="premiumPulseGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d="M 100 600 C 200 110, 700 110, 800 550" stroke="black" strokeWidth="8" strokeLinecap="round" opacity="1" filter="url(#upperGlow)" fill="none" />
        <path d="M 100 600 C 200 110, 700 110, 800 550" stroke="#5A70B3" strokeWidth="45" strokeLinecap="round" opacity="1" filter="url(#heavyGlow)" mask="url(#bottomGlowMask)" fill="none" />
        <path d="M 100 600 C 200 110, 700 110, 800 550" stroke="#5A70B3" strokeWidth="1" strokeLinecap="round" filter="url(#upperGlow)" fill="none" />
        <path d="M 100 600 C 200 110, 700 110, 800 550" stroke="#9BB1FF" strokeWidth="25" strokeLinecap="round" opacity="1" filter="url(#heavyGlow)" mask="url(#bottomGlowMask)" fill="none" />
        <path ref={pathRef} d="M 100 600 C 200 110, 700 110, 800 550" stroke="url(#premiumNeonLight)" strokeWidth="12" strokeLinecap="round" filter="url(#premiumPulseGlow)" fill="none" style={{ strokeDasharray: "500 1500" }} />
      </svg>

    </div>
  );
}

export default App;