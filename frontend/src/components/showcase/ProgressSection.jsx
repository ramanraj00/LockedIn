import React from 'react';
import { motion } from 'framer-motion';

const ProgressSection = () => {
  return (
    <div className="w-screen h-screen bg-[#FAF9F6] flex flex-col justify-center relative overflow-hidden shrink-0" id="progress-section">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative">
          
          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-300 -translate-x-1/2"></div>
          
          {/* Left Column: Text */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-4xl md:text-5xl font-semibold text-[#1F2937] tracking-tight">
                Understand
              </h2>
              <h2 className="font-serif-elegant text-4xl md:text-5xl italic text-[#5C9EAD]">
                Your Progress
              </h2>
            </div>
            
            <p className="text-[#4B5563] leading-relaxed text-[15px] md:text-[16px] max-w-md">
              Track your daily focus, identify productivity patterns, and build better work habits with intelligent insights.
            </p>
            
            <div className="w-full h-px bg-zinc-300 my-10 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-[#5C9EAD]"></div>
            </div>

            <p className="text-[#6B7280] text-sm tracking-wide uppercase font-semibold">
              What you get
            </p>
            <p className="mt-2 text-[#4B5563] text-sm md:text-base font-medium max-w-sm">
              Visual reports, weekly trends, and actionable insights that help you improve every day.
            </p>
          </div>

          {/* Right Column: Chart */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center p-8">
            
            <div className="relative w-full h-full max-h-[300px] flex flex-col justify-end">
              
              {/* Threshold Line */}
              <div className="absolute left-0 right-0 bottom-[60%] border-t border-dashed border-zinc-400 z-0">
              </div>
              
              {/* Baseline */}
              <div className="absolute left-0 right-0 bottom-0 border-t border-zinc-300 z-0"></div>

              {/* Data Lines (Bars) */}
              <div className="relative w-full h-full flex items-end justify-between px-2 z-10 pb-[1px]">
                
                {/* Regular lines */}
                <div className="w-[1.5px] h-[30%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[45%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[25%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[50%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[35%] bg-zinc-400"></div>
                
                {/* Anomaly Line 1 */}
                <div className="relative w-[2px] h-[85%] bg-gradient-to-t from-[#5C9EAD]/10 to-[#5C9EAD]">
                  {/* Floating Time Text */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#5C9EAD] text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">8h 15m on Wed</span>
                  
                  <motion.div 
                    className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#5C9EAD] rounded-full shadow-[0_0_12px_#5C9EAD]"
                    animate={{ top: ["-12px", "100%", "60%", "100%", "80%", "100%"] }}
                    transition={{ 
                      duration: 1.8, 
                      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeIn"],
                      repeat: Infinity,
                      repeatDelay: 1.5
                    }}
                  />
                </div>
                
                {/* More regular lines */}
                <div className="w-[1.5px] h-[30%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[40%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[20%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[55%] bg-zinc-400"></div>
                
                {/* Anomaly Line 2 */}
                <div className="relative w-[2px] h-[75%] bg-[#8CA8B1] opacity-70">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-transparent border-2 border-[#8CA8B1] rounded-full ring-4 ring-[#FAF9F6]"></div>
                </div>

                {/* Final regular lines */}
                <div className="w-[1.5px] h-[40%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[25%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[35%] bg-zinc-400"></div>
                <div className="w-[1.5px] h-[20%] bg-zinc-400"></div>
              </div>
              
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
