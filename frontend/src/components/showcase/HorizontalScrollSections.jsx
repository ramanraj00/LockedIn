import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import ArchitectureSection from './ArchitectureSection';
import ProgressSection from './ProgressSection';
import FeatureFlowSection from './FeatureFlowSection';

const HorizontalScrollSections = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress to eliminate "jhatka" (jerky scrolling)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001
  });

  // Diagonal staircase animation: 
  // 0 -> 0.5: move camera right (content slides left)
  // 0.5 -> 1: move camera right again (content slides left)
  const x = useTransform(smoothProgress, [0, 0.5, 1], ["0vw", "-100vw", "-200vw"]);
  
  // y moves down continuously to create massive vertical gaps between sections
  const y = useTransform(smoothProgress, [0, 0.5, 1], ["0vh", "-50vh", "-150vh"]);

  // Progress bar animation
  const indicatorX = useTransform(smoothProgress, [0, 0.5, 1], ["0%", "100%", "200%"]);
  
  const [activeStep, setActiveStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.3) setActiveStep(0);
    else if (latest < 0.7) setActiveStep(1);
    else setActiveStep(2);
  });

  return (
    <section ref={targetRef} className="relative h-[350vh] bg-[#FAF9F6]">
      <div className="sticky top-0 h-screen overflow-hidden">
        
        {/* Top Progress Navigation */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 flex flex-col items-center pointer-events-none">
          <div className="flex w-full text-center mb-3 text-[13px] font-bold uppercase tracking-widest">
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 0 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Account</div>
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 1 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Progress</div>
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 2 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Features</div>
          </div>
          <div className="w-full h-[3px] bg-gray-200/60 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#5C9EAD] rounded-full w-1/3 shadow-[0_0_10px_rgba(92,158,173,0.8)]"
              style={{ x: indicatorX }}
            />
          </div>
        </div>

        {/* The moving diagonal canvas */}
        <motion.div style={{ x, y }} className="absolute top-0 left-0 w-[300vw] h-[250vh]">
          
          {/* Step 1: Architecture */}
          <div className="absolute top-0 left-0 w-screen h-screen flex flex-col justify-center z-10">
            <ArchitectureSection />
          </div>

          {/* Connecting Line 1 (Step 1 -> Step 2) */}
          <svg className="absolute left-[50vw] top-[50vh] w-[100vw] h-[50vh] pointer-events-none z-0" preserveAspectRatio="none">
             <line x1="0" y1="0" x2="100%" y2="100%" stroke="#d4d4d8" strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>

          {/* Step 2: Progress */}
          <div className="absolute top-[50vh] left-[100vw] w-screen h-screen flex flex-col justify-center z-20">
            <ProgressSection />
          </div>

          {/* Connecting Line 2 (Step 2 -> Step 3) */}
          {/* S2 center: 150vw, 100vh. S3 center: 250vw, 200vh. */}
          <svg className="absolute left-[150vw] top-[100vh] w-[100vw] h-[100vh] pointer-events-none z-0" preserveAspectRatio="none">
             <line x1="0" y1="0" x2="100%" y2="100%" stroke="#d4d4d8" strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>

          {/* Step 3: Feature Flow */}
          <div className="absolute top-[150vh] left-[200vw] w-screen h-screen flex flex-col justify-center z-30">
            <FeatureFlowSection />
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default HorizontalScrollSections;
