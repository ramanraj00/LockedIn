import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, CheckCircle } from "lucide-react";

// Safari Engine Check (GPU acceleration optimization ke liye)
const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const animatedHeadlineChars = [..."Comfort Space"];

/* ==========================================================================
   1. STATIC BACKGROUND EFFECTS COMPONENT (Isolated from Main App)
   ========================================================================== */
const BackgroundEffects = memo(() => {
  return (
    <>
      {/* Premium UI Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_95%)] pointer-events-none z-0" />
      
      {/* Ambient Light Orbs with Dynamic Safari Blur Optimization */}
      <div className={`absolute -top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 pointer-events-none z-0 hidden md:block ${isSafari ? 'blur-[60px]' : 'blur-[120px]'}`} />
      <div className={`absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 pointer-events-none z-0 hidden md:block ${isSafari ? 'blur-[70px]' : 'blur-[140px]'}`} />
    </>
  );
});

/* ==========================================================================
   2. INDEPENDENT HEADER TITLE COMPONENT (Renders only once on mount)
   ========================================================================== */
const HeaderTitle = memo(() => {
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const titleWordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 20 },
    },
  };

  return (
    <div className="text-center w-full mb-8 mt-2 md:mt-0 transform-gpu [transform:translateZ(0)]">
      <motion.h1 
        variants={titleContainerVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-xs sm:max-w-3xl md:max-w-4xl mx-auto leading-[1.2] md:leading-[1.15]"
      >
        {/* Brand Header */}
        <motion.span 
          variants={titleWordVariants}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }} 
          className="font-black inline-block mb-1 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-300 tracking-tighter"
        >
          LockedIn.
        </motion.span>

        <br />

        {/* Subtitle with GPU Font-Weight Wave */}
        <motion.span 
          variants={titleWordVariants}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }} 
          className="font-normal text-xl sm:text-3xl md:text-4xl inline-block text-zinc-400/90 tracking-normal my-2"
        >
          Your{" "}
          <span className="inline-block bg-white text-black px-4 py-0.5 rounded-2xl font-bold shadow-xl mx-1 align-middle transform-gpu [transform:translateZ(0)]">
            {animatedHeadlineChars.map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                inherit={false} 
                initial={{ fontWeight: 600 }}
                animate={{ fontWeight: [600, 900, 600] }}
                transition={{
                  duration: 1.8,
                  ease: "easeInOut",
                  delay: index * 0.05,
                  repeat: Infinity,
                  repeatDelay: 1.2
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          {" "}For
        </motion.span>

        <br />

        {/* Editorial Italic Line */}
        <motion.span 
          variants={titleWordVariants}
          style={{ fontFamily: "'Instrument Serif', serif" }} 
          className="italic font-normal text-4xl sm:text-6xl md:text-7xl inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-200 pt-1"
        >
          Building Better Days
        </motion.span>
      </motion.h1>
    </div>
  );
});

/* ==========================================================================
   3. INDEPENDENT CTA BUTTON COMPONENT (⚠️ FIXED: Native CSS Rendering Engine)
   ========================================================================== */
const CTAButton = memo(() => {
  return (
    <div className="z-20 mb-2 w-full max-w-xs sm:max-w-sm md:max-w-md px-3">
      <button
        style={{ 
          fontFamily: "'Instrument Sans', sans-serif",
          /* 1. Base Gradient Layer (Image 1 target match) */
          background: "linear-gradient(180deg, #5c7fa 0%, #314d1 45%, #141836 100%)",
          /* 2. SPECULAR HIGH-GLOSS SHADOW LAYER (Lining complete solution) */
          boxShadow: "inset 0px 2px 4px rgba(255, 255, 255, 0.45), 0px 12px 24px rgba(10, 11, 28, 0.8)"
        }}
        /* active:scale-95 aur transition classes add ki hain smooth click movement ke liye */
        className="w-full text-white font-light uppercase tracking-[0.23em] py-4 rounded-[20px] text-xs sm:text-sm text-center block select-none border border-white/10 outline-none overflow-hidden active:scale-95 transition-transform duration-100"
      >
       Start Building Better Days
      </button>
    </div>
  );
});

/* ==========================================================================
   4. ISOLATED INTERACTIVE CARDS COMPONENT (Handles its own toggle state)
   ========================================================================== */
const InteractiveCards = memo(() => {
  const [activeCard, setActiveCard] = useState(1);

  useEffect(() => {
    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev === 1 ? 2 : 1));
    }, 3300);
    return () => clearInterval(cardInterval);
  }, []);

  const cardGroupVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { transition: { staggerChildren: 0.06, staggerDirection: -1 } }
  };

  const pillVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 55, damping: 18 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.18, ease: "easeInOut" } }
  };

  const containerVariants = {
    visible: { transition: { staggerChildren: 0.12 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-7xl flex flex-col md:flex-row items-center justify-center gap-4 mt-1 md:mt-2 pt-2 md:pt-10">
      <div className="w-full min-h-[13rem] flex items-start justify-center text-left z-20">
        <AnimatePresence mode="wait">
          {activeCard === 1 ? (
            /* CARD 1: WHITE PILLS */
            <motion.div
              key="white-pills-card"
              variants={cardGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 w-full items-center md:items-start md:mr-auto md:w-80 transform-gpu [transform:translateZ(0)]"
            >
              <motion.div variants={pillVariants} className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-medium text-zinc-900 text-xs sm:text-sm tracking-wide backface-hidden">
                Watch your progress
              </motion.div>
              <motion.div variants={pillVariants} className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-bold text-blue-600 text-xs sm:text-sm tracking-wide backface-hidden">
                Grow one day
              </motion.div>
              <motion.div variants={pillVariants} className="w-fit bg-white rounded-full px-5 py-2.5 shadow-xl border border-white font-medium text-zinc-900 text-xs sm:text-sm tracking-wide backface-hidden">
                at a time.
              </motion.div>
            </motion.div>
          ) : (
            /* CARD 2: BLACK CARD */
            <motion.div
              key="black-checklist-card"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ type: "spring", stiffness: 70, damping: 20 }}
              className={`w-[92%] sm:w-full md:w-80 bg-zinc-800/90 border border-zinc-700 rounded-2xl p-4 shadow-2xl overflow-hidden mx-auto md:mx-0 md:ml-auto md:-mr-12 -mt-4 md:mt-0 transform-gpu [transform:translateZ(0)] ${
                isSafari ? "backdrop-blur-sm" : "backdrop-blur-md"
              }`}
            >
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3 text-xs sm:text-sm font-medium text-zinc-200">
                <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30 backface-hidden">
                  <Flame size={16} className="text-orange-500 shrink-0" />
                  <span>Build your streak</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30 backface-hidden">
                  <Calendar size={16} className="text-blue-400 shrink-0" />
                  <span>Plan your day</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30 backface-hidden">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>Track your focus session</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

/* ==========================================================================
   5. INDEPENDENT SVG LAYER COMPONENT (Static Background Asset)
   ========================================================================== */
const BackgroundSVGLayer = memo(() => {
  return (
    <svg
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none origin-bottom scale-75 sm:scale-90 md:scale-100 transform-gpu [transform:translateZ(0)]"
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

        <filter id="upperGlow"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="heavyGlow"><feGaussianBlur stdDeviation="1" /></filter>
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
      
      {/* Infinite High-Performance CSS Glow Wave */}
      <path 
        className="flow-path"
        d="M 100 600 C 200 110, 700 110, 800 550" 
        stroke="url(#premiumNeonLight)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        filter="url(#premiumPulseGlow)" 
        fill="none" 
        style={{ strokeDasharray: "500 1500" }} 
      />
    </svg>
  );
});

/* ==========================================================================
   MAIN HERO WRAPPER - NO BACKGROUND (Landing.jsx handle karega)
   ========================================================================== */
function Hero() {
  return (
    <div className="relative w-full mb-32 md:mb-48">
      {/* YAHAN mb-32 md:mb-48 ADD KIYA HAI TO PUSH THE NEXT COMPONENT DOWN */}
      
      {/* GPU Vector Matrix Keyframes Styles */}
      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        .flow-path {
          animation: flow 8s linear infinite;
          will-change: stroke-dashoffset;
          transform: translateZ(0);
        }
      `}</style>

      {/* 1. Background Blurs Layer */}
      <BackgroundEffects />

      {/* MAIN RESPONSIVE CONTAINER */}
      <div id="hero-section" className="relative z-10 w-full px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center justify-center min-h-screen py-4 md:py-20">
        
        {/* 2. Isolated Headline */}
        <HeaderTitle />

        {/* 3. Isolated CTA Button */}
        <CTAButton />

        {/* 4. Isolated Live Interactive Cards Loop */}
        <InteractiveCards />

      </div>
      
      {/* 5. Isolated Bottom Semicircle Wave */}
      <BackgroundSVGLayer />

    </div>
  );
}

export default Hero;