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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
};

const pillVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, x: -10, transition: { duration: 0.18, ease: "easeInOut" } },
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
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
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
   FIX: fontWeight animation → opacity+scale wave (no layout thrashing)
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
        >
          
        </motion.span>

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
                style={{ willChange: "opacity, transform" }}
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
   FIX: Removed backdrop-blur, solid bg instead. Simplified transitions.
   ========================================================================== */
const DARK_CARD_BG = "rgba(39, 39, 42, 0.92)";

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

  const card1Content = (
  <>
    {/* Pill 1 */}
    <motion.div
      variants={pillVariants}
      className="w-fit bg-[#fdfdfd] rounded-full px-6 py-3 font-medium text-slate-800 text-sm sm:text-base tracking-wide"
      style={{
        // 🌟 Premium Ceramic Shadow: A mix of tight inner shadow and diffused drop shadow
        boxShadow: "0 10px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06), inset 0 -2px 5px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,1)"
      }}
    >
      Watch your progress
    </motion.div>

    {/* Pill 2 (The Focus Point) */}
    <motion.div
      variants={pillVariants}
      className="w-fit bg-white rounded-full px-6 py-3 font-bold text-[#1e3a8a] text-sm sm:text-base tracking-wide"
      style={{
        boxShadow: "0 14px 28px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.08), inset 0 -2px 5px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,1)",
        // Halka sa scale up aur border significance badhane ke liye
        border: "1px solid rgba(226, 232, 240, 0.8)",
        transform: "scale(1.02)"
      }}
    >
      Grow one day
    </motion.div>

    {/* Pill 3 */}
    <motion.div
      variants={pillVariants}
      className="w-fit bg-[#fdfdfd] rounded-full px-6 py-3 font-medium text-slate-800 text-sm sm:text-base tracking-wide"
      style={{
        boxShadow: "0 10px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06), inset 0 -2px 5px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,1)"
      }}
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
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30"
      >
        <Flame size={16} className="text-orange-500 shrink-0" />
        <span>Build your streak</span>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30"
      >
        <Calendar size={16} className="text-blue-400 shrink-0" />
        <span>Plan your day</span>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-700/30"
      >
        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        <span>Track your focus session</span>
      </motion.div>
    </motion.div>
  );

  // Shared dark card classes — NO backdrop-blur, solid background
  const darkCardClass =
    "w-[92%] sm:w-full md:w-80 border border-zinc-700 rounded-2xl p-4 shadow-2xl overflow-hidden mx-auto md:mx-0 md:ml-auto md:-mr-12 -mt-4 md:mt-0";

  return (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-7xl flex flex-col md:flex-row items-center justify-center gap-4 mt-1 md:mt-2 pt-2 md:pt-10"
      style={{ contain: "layout style" }}
    >
      <div className="w-full min-h-[13rem] flex items-start justify-center text-left z-20">
        <AnimatePresence mode="wait">
          {isStaticPhase ? (
            <motion.div
              key="both-cards-static"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
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

              {/* Card 2 — solid bg, no blur */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={darkCardClass}
                style={{ background: DARK_CARD_BG }}
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
              style={{ background: DARK_CARD_BG }}
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
   FIX: Removed filter from animated flow-path (no per-frame filter recalc)
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

        <filter id="upperGlow">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="heavyGlow">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        {/* Static-only glow filter (NOT applied to the animated path) */}
        <filter id="premiumPulseGlow">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Static glow layers — these don't animate, filters are fine */}
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

      {/* ⚡ Animated flow path — NO SVG filter applied!
          The premiumPulseGlow filter was being re-computed every single frame
          during the stroke-dashoffset animation. Removed it completely.
          The neon gradient + opacity is enough for the glow effect. */}
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
      {/* CSS-only flow animation — GPU-accelerated, no JS involvement */}
      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        .flow-path {
          animation: flow 8s linear infinite;
          will-change: stroke-dashoffset;
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