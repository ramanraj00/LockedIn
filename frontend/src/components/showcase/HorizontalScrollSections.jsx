import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import ArchitectureSection from './ArchitectureSection';
import ProgressSection from './ProgressSection';
import FeatureFlowSection from './FeatureFlowSection';

const HorizontalScrollSections = () => {
  const targetRef = useRef(null);
  
  // Track scroll within the 300vh section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Move horizontally by -200vw (which means sliding 2 screen widths left)
  // Using vw instead of % gives the browser GPU more precise pixels to work with
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);
  
  // Progress bar animation for the 3 steps
  const indicatorX = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "100%", "200%"]);
  
  const [activeStep, setActiveStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.33) setActiveStep(0);
    else if (latest < 0.66) setActiveStep(1);
    else setActiveStep(2);
  });

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#FAF9F6]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        
        {/* Top Progress Navigation */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 flex flex-col items-center pointer-events-none px-4">
          <div className="flex w-full text-center mb-3 text-[12px] md:text-[13px] font-bold uppercase tracking-widest">
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 0 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Account</div>
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 1 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Progress</div>
            <div className={`flex-1 transition-colors duration-500 ${activeStep === 2 ? "text-[#5C9EAD]" : "text-gray-300"}`}>Features</div>
          </div>
          <div className="w-full h-[3px] bg-gray-200/60 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#5C9EAD] rounded-full w-1/3 shadow-[0_0_10px_rgba(92,158,173,0.8)] will-change-transform transform-gpu"
              style={{ x: indicatorX }}
            />
          </div>
        </div>

        {/* The horizontal sliding canvas */}
        {/* Added will-change-transform and transform-gpu to force hardware acceleration and eliminate jitter */}
        <motion.div style={{ x }} className="flex h-full w-[300vw] will-change-transform transform-gpu">
          <div className="w-screen h-full shrink-0 flex items-center justify-center relative">
            <ArchitectureSection />
          </div>
          <div className="w-screen h-full shrink-0 flex items-center justify-center relative">
            <ProgressSection />
          </div>
          <div className="w-screen h-full shrink-0 flex items-start justify-center relative">
            <FeatureFlowSection />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HorizontalScrollSections;
