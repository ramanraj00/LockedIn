import React, { useEffect, useRef } from "react";

function App() {
  const pathRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let offset = 2000;

    const animate = () => {
      offset -= 4; // Animation speed
      if (offset <= 0) {
        offset = 2000; // Reset loop
      }
      
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = offset;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    /* ⚠️ FIXED HERE: Purana gradient hata kar, direct custom Tailwind classes se Discord exact radial gradient background set kar diya hai */
    <div className="relative overflow-hidden w-full h-screen flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2c3599] via-[#17193b] to-[#0f1026]">
      
      {/* HERO SECTION CONTENT */}
      <div id="hero-section" className="z-10 text-center px-6 max-w-4xl select-none mb-24">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.15] mb-6 mx-auto">
          LockedIn. <br />
          Your Comfort Space For Building Better Days
        </h1>

        {/* Sub-headline / Paragraph */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto">
          Plan your day, track your focus sessions, build streaks, and watch your progress grow—one day at a time.
        </p>

        
      </div>

      
      
      {/* Multi-Layered Elliptical Path Structure */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
        width="900"
        height="500"
        viewBox="0 0 900 500"
        fill="none"
      >
        <defs>
          {/* Base stroke gradient */}
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4E5F9E" />
            <stop offset="55%" stopColor="#7F95E6" />
            <stop offset="78%" stopColor="#B9C8FF" />
            <stop offset="100%" stopColor="#DCE6FF" />
          </linearGradient>

          {/* Glowing Mask Gradients */}
          <linearGradient id="glowMaskGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="65%" stopColor="#030617" />
            <stop offset="85%" stopColor="#14245A" />
            <stop offset="100%" stopColor="#4F66FF" />
          </linearGradient>

          {/* Premium Neon Cyan/Blue Gradient */}
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

          {/* Blur Filters */}
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

        {/* 1. Base Dark Path */}
        <path
          d="M 100 600 C 200 110, 700 110, 800 550"
          stroke="black"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="1"
          filter="url(#upperGlow)"
          fill="none"
        />

        {/* 2. Main Thick Layered Blue Path */}
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

        {/* 3. Outer Thin Glow Frame */}
        <path
          d="M 100 600 C 200 110, 700 110, 800 550"
          stroke="#5A70B3"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#upperGlow)"
          fill="none"
        />

        {/* 4. Core Bright Inner Support Path */}
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

        {/* 5. ANIMATED LIGHT WAVE */}
        <path
          ref={pathRef}
          d="M 100 600 C 200 110, 700 110, 800 550"
          stroke="url(#premiumNeonLight)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#premiumPulseGlow)"
          fill="none"
          style={{
            strokeDasharray: "500 1500",
          }}
        />
      </svg>

    </div>
  );
}

export default App;