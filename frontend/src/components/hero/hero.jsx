import React, { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, CheckCircle } from "lucide-react";

// Safari Engine Check
const isSafari =
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const animatedHeadlineChars = [..."Comfort Space"];

/* ==========================================================================
HOISTED ANIMATION VARIANTS (never re-created per render)
========================================================================== */
const titleContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const titleWordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardGroupVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  // FIX: Added opacity: 0 to parent exit, matched timing with children
  exit: { 
    opacity: 0, 
    transition: { staggerChildren: 0.08, staggerDirection: -1, duration: 0.4 } 
  },
};

const pillVariants = {
  hidden: { opacity: 0, x: -25 },
  visible: {
    opacity: 1,
    x: 0,
    // FIX: Premium smooth spring curve for entry
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, 
  },
  exit: {
    opacity: 0,
    x: -15,
    // FIX: Increased duration from 0.18 to 0.40 and used smooth fade-out ease
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, 
  },
};

const containerVariants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const card2Enter = {
  initial: { opacity: 0, scale: 0.97, y: -8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: -8,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
  },
};

/* ==========================================================================
1. STATIC BACKGROUND EFFECTS COMPONENT
========================================================================== */
const BackgroundEffects = memo(() => {
  return (
    <>
      {/* Premium UI Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_95%)] pointer-events-none z-0" />

      {/* Ambient Light Orbs — Safari gets CSS radial-gradient instead of blur */}
      {isSafari ? (
        <>
          <div
            className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none z-0 hidden md:block"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 hidden md:block"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none z-0 hidden md:block" />
          <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[140px] pointer-events-none z-0 hidden md:block" />
        </>
      )}
    </>
  );
});

/* ==========================================================================
2. HEADER TITLE COMPONENT
========================================================================== */
const HeaderTitle = memo(() => {
  return (
    <div className="text-center w-full mb-8 mt-2 md:mt-0">
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
        ></motion.span>
        <br />
        {/* Subtitle with GPU-safe opacity+scale wave (NOT fontWeight) */}
        <motion.span
          variants={titleWordVariants}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          className="font-normal text-xl sm:text-3xl md:text-4xl inline-block text-zinc-400/90 tracking-normal my-2"
        >
          Your{" "}
          <span className="inline-block bg-white text-black px-4 py-0.5 rounded-2xl font-bold shadow-xl mx-1 align-middle">
            {animatedHeadlineChars.map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                inherit={false}
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
                transition={{
                  duration: 1.8,
                  ease: "easeInOut",
                  delay: index * 0.05,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                }}
                className="inline-block font-extrabold"
                // OPTIMIZATION: WebkitBackfaceVisibility to fix Safari text flickering
                style={{ willChange: "opacity, transform", WebkitBackfaceVisibility: "hidden" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>{" "}
          For
        </motion.span>
        <br />
        {/* 🌟 YAHAN CHANGE KIYA HAI: The "Premium SaaS" Look */}
        <motion.span
          variants={titleWordVariants}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          className="font-black tracking-tighter text-5xl sm:text-6xl md:text-7xl inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-[#1e3a8a] pt-1 pb-2 drop-shadow-sm"
        >
          Building Better Days
        </motion.span>
      </motion.h1>
    </div>
  );
});

/* ==========================================================================
3. CTA BUTTON COMPONENT
========================================================================== */
const CTAButton = memo(() => {
  return (
    <div className="z-20 mb-2 w-full max-w-xs sm:max-w-sm md:max-w-md px-3">
      <button
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          background:
            "linear-gradient(180deg, #5c7fa 0%, #314d1 45%, #141836 100%)",
          boxShadow:
            "inset 0px 2px 4px rgba(255, 255, 255, 0.45), 0px 12px 24px rgba(10, 11, 28, 0.8)",
        }}
        className="w-full text-white font-medium uppercase tracking-[0.23em] py-4 rounded-[20px] text-xs sm:text-sm text-center block select-none border border-white/10 outline-none overflow-hidden active:scale-95 transition-transform duration-100"
      >
        Start Building Better Days
      </button>
    </div>
  );
});

/* ==========================================================================
4. INTERACTIVE CARDS COMPONENT
========================================================================== */
const DARK_CARD_BG = "rgba(39, 39, 42, 0.75)";

const InteractiveCards = memo(() => {
  const [activeCard, setActiveCard] = useState(1);
  const [isStaticPhase, setIsStaticPhase] = useState(true);

  useEffect(() => {
    const staticTimer = setTimeout(() => {
      setIsStaticPhase(false);
    }, 2000);
    return () => clearTimeout(staticTimer);
  }, []);

  useEffect(() => {
    if (isStaticPhase) return;
    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev === 1 ? 2 : 1));
    }, 3300);
    return () => clearInterval(cardInterval);
  }, [isStaticPhase]);

  // 🌟 FIX 1: White Cards (Capsules) ka Text aur Size clean kiya hai (no extra styling, just fixed font size)
  const card1Content = (
    <>
      <motion.div
        variants={pillVariants}
        className="w-fit bg-white rounded-full px-6 py-2.5 shadow-xl border border-gray-100 font-medium text-slate-800 text-sm tracking-wide"
      >
        Watch your progress
      </motion.div>
      <motion.div
        variants={pillVariants}
        className="w-fit bg-white rounded-full px-6 py-2.5 shadow-xl border border-gray-100 font-bold text-blue-600 text-sm tracking-wide"
      >
        Grow one day
      </motion.div>
      <motion.div
        variants={pillVariants}
        className="w-fit bg-white rounded-full px-6 py-2.5 shadow-xl border border-gray-100 font-medium text-slate-800 text-sm tracking-wide"
      >
        at a time.
      </motion.div>
    </>
  );

  const renderCard2Content = (isStatic) => (
    <motion.div
      variants={containerVariants}
      initial={isStatic ? false : "hidden"}
      animate="visible"
      className="flex flex-col gap-3 text-xs sm:text-sm font-medium text-zinc-200"
    >
      {/* 🌟 GLASS FIX 2: Andar ke items ka color soft kiya taaki glass ke sath blend ho */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-lg border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <Flame size={16} className="text-orange-500 shrink-0" />
        <span>Build your streak</span>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-lg border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <Calendar size={16} className="text-blue-400 shrink-0" />
        <span>Plan your day</span>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-lg border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        <span>Track your focus session</span>
      </motion.div>
    </motion.div>
  );

  // Tera original layout class wapas (Left-Right positioning)
  const darkCardClass =
    "w-[92%] sm:w-full md:w-80 border border-white/10 rounded-2xl p-4 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden mx-auto md:mx-0 md:ml-auto md:-mr-12 -mt-4 md:mt-0";

  return (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-7xl flex flex-col md:flex-row items-center justify-center gap-4 mt-1 md:mt-2 pt-2 md:pt-10"
      style={{ contain: "layout style" }}
    >
      {/* 🌟 FIX 3: min-h-[260px] taaki page stretch/shrink na ho transition ke time */}
      <div className="w-full min-h-[260px] flex items-start justify-center text-left z-20">
        <AnimatePresence mode="wait">
          {isStaticPhase ? (
            <motion.div
              key="both-cards-static"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              // Tera original flex layout
              className="w-full flex flex-col md:flex-row items-center md:items-start"
            >
              {/* Card 1 */}
              <motion.div
                variants={cardGroupVariants}
                initial={false}
                animate="visible"
                className="flex flex-col gap-3 w-full items-center md:items-start md:mr-auto md:w-80"
              >
                {card1Content}
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={darkCardClass}
                // OPTIMIZATION: Fix Safari glassmorphism flicker
                style={{ background: DARK_CARD_BG, WebkitBackfaceVisibility: "hidden" }}
              >
                {renderCard2Content(true)}
              </motion.div>
            </motion.div>
          ) : activeCard === 1 ? (
            <motion.div
              key="white-pills-card"
              variants={cardGroupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 w-full items-center md:items-start md:mr-auto md:w-80"
            >
              {card1Content}
            </motion.div>
          ) : (
            <motion.div
              key="black-checklist-card"
              {...card2Enter}
              className={darkCardClass}
              // OPTIMIZATION: Fix Safari glassmorphism flicker
              style={{ background: DARK_CARD_BG, WebkitBackfaceVisibility: "hidden" }}
            >
              {renderCard2Content(false)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

/* ==========================================================================
5. BACKGROUND SVG LAYER
========================================================================== */
const BackgroundSVGLayer = memo(() => {
  return (
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

        {/* OPTIMIZATION: x, y, width, height prevent Safari from rendering filter on the entire page */}
        <filter id="upperGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        <filter id="heavyGlow" x="-20%" y="-20%" width="140%" height="140%">
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

      <path
        d="M 100 600 C 200 110, 700 110, 800 550"
        stroke="black"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="1"
        filter="url(#upperGlow)"
        fill="none"
      />
      <path
        d="M 100 600 C 200 110, 700 110, 800 550"
        stroke="#5A70B3"
        strokeWidth="45"
        strokeLinecap="round"
        opacity="1"
        filter="url(#heavyGlow)"
        mask="url(#bottomGlowMask)"
        fill="none"
      />
      <path
        d="M 100 600 C 200 110, 700 110, 800 550"
        stroke="#5A70B3"
        strokeWidth="1"
        strokeLinecap="round"
        filter="url(#upperGlow)"
        fill="none"
      />
      <path
        d="M 100 600 C 200 110, 700 110, 800 550"
        stroke="#9BB1FF"
        strokeWidth="25"
        strokeLinecap="round"
        opacity="1"
        filter="url(#heavyGlow)"
        mask="url(#bottomGlowMask)"
        fill="none"
      />

      {/* ⚡ Animated flow path */}
      <path
        className="flow-path"
        d="M 100 600 C 200 110, 700 110, 800 550"
        stroke="url(#premiumNeonLight)"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
        style={{ strokeDasharray: "500 1500" }}
      />
    </svg>
  );
});

/* ==========================================================================
MAIN HERO WRAPPER
========================================================================== */
function Hero() {
  return (
    <div className="relative w-full mb-32 md:mb-48">
      {/* CSS-only flow animation — GPU-accelerated */}
      <style>{`
@keyframes flow {
from { stroke-dashoffset: 2000; }
to { stroke-dashoffset: 0; }
}
.flow-path {
animation: flow 8s linear infinite;
will-change: stroke-dashoffset;
/* OPTIMIZATION: Safari GPU Path Acceleration without breaking layout */
transform: translateZ(0);
}
`}</style>

      {/* 1. Background Blurs Layer */}
      <BackgroundEffects />

      {/* MAIN RESPONSIVE CONTAINER */}
      <div
        id="hero-section"
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center justify-center min-h-screen py-4 md:py-20"
      >
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