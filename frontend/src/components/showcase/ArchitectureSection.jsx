import React from 'react';
import { motion } from 'framer-motion';

const ArchitectureSection = () => {
  return (
    <div className="w-screen min-h-screen md:h-screen bg-[#FAF9F6] flex flex-col justify-center relative overflow-hidden shrink-0 py-20 md:py-0" id="architecture-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap');
        
        .font-serif-elegant {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative">
          
          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-300 -translate-x-1/2"></div>
          
          {/* Left Column: Text */}
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1F2937] mb-6 tracking-tight">
              Create Account
            </h2>
            <p className="text-[#4B5563] leading-relaxed text-[15px] md:text-[16px] max-w-md">
              Secure authentication with industry-standard password hashing and true end-to-end encryption. Your encrypted data stays private—even we can't read it.
            </p>
            
            <div className="w-full h-px bg-zinc-300 my-10 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-[#5C9EAD]"></div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-serif-elegant text-4xl md:text-5xl text-[#2C3E50]">
                Zero knowledge
              </h3>
              <h3 className="font-serif-elegant text-4xl md:text-5xl italic text-[#5C9EAD]">
                Architecture
              </h3>
            </div>
            
            <p className="mt-6 text-[#6B7280] text-sm tracking-wide uppercase font-semibold">
              Outcome
            </p>
            <p className="mt-2 text-[#4B5563] text-sm md:text-base font-medium max-w-sm">
              Walk into your workspace knowing your data is mathematically locked and structurally invisible to anyone but you.
            </p>
          </div>

          {/* Right Column: Diagram */}
          <div className="relative w-full aspect-square md:aspect-[4/3] bg-white/40 border border-[#E5E3DB] rounded-3xl p-8 flex items-center justify-center shadow-sm">

            {/* Custom Diagram Node Container */}
            <div className="relative w-full max-w-[600px] h-[350px] flex items-center justify-between z-10 px-4 md:px-12 mt-12">
              
              {/* Horizontal Connecting Line */}
              <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-0 border-t-[2px] border-dashed border-[#8CA8B1] -z-10"></div>
              
              {/* Traveling Dot */}
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#5C9EAD] rounded-full shadow-[0_0_12px_rgba(92,158,173,0.8)] z-20"
                animate={{ left: ["5%", "5%", "50%", "95%", "95%"], scale: [0, 1, 1, 1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.05, 0.4, 0.75, 1] }}
              />

              {/* Vertical Connecting Line to Account */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[50%] top-[10%] w-0 border-l-[2px] border-dashed border-[#8CA8B1] -z-10"></div>

              {/* Top Node (Account) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[0%] flex flex-col items-center bg-[#FAF9F6] z-10 px-2">
                <span className="font-serif-elegant italic text-[#5C9EAD] text-2xl font-medium tracking-wide mb-3">Account</span>
                <div className="w-2.5 h-2.5 bg-[#8CA8B1] rounded-full"></div>
              </div>

              {/* Node 1: Signup */}
              <div className="flex flex-col items-center relative group">
                <span className="absolute -top-10 font-medium text-[#2C3E50] text-[10px] sm:text-xs md:text-base tracking-wide whitespace-nowrap">Signup</span>
                <div className="relative w-6 h-6 flex items-center justify-center bg-[#FAF9F6] rounded-full z-10">
                  <div className="absolute inset-0 border-[1.5px] border-[#5C9EAD] rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#5C9EAD] absolute z-20" animate={{ scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.05, 0.1, 0.95, 1] }}>
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                </div>
              </div>

              {/* Node 2: Secure Your Vault */}
              <div className="flex flex-col items-center relative group">
                <span className="absolute -bottom-10 md:-bottom-12 font-medium text-[#2C3E50] text-[10px] sm:text-xs md:text-base text-center w-20 md:w-auto whitespace-normal md:whitespace-nowrap leading-tight tracking-wide">Secure Your Vault</span>
                <div className="relative w-6 h-6 bg-[#FAF9F6] border-[2.5px] border-[#5C9EAD] rounded-full flex items-center justify-center z-10 group-hover:bg-[#5C9EAD]/10 transition-colors duration-300">
                  <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#5C9EAD] absolute z-20" animate={{ scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.35, 0.45, 0.95, 1] }}>
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                </div>
              </div>

              {/* Node 3: Start Using LockedIn */}
              <div className="flex flex-col items-center relative group">
                <span className="absolute -top-10 md:-top-12 font-medium text-[#2C3E50] text-[10px] sm:text-xs md:text-base text-center w-24 md:w-auto whitespace-normal md:whitespace-nowrap leading-tight tracking-wide">Start Using LockedIn</span>
                <div className="relative w-12 h-12 flex items-center justify-center bg-[#FAF9F6] rounded-full z-10">
                  <div className="absolute inset-0 border-[1.5px] border-[#8CA8B1]/40 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute w-7 h-7 border-[1.5px] border-[#8CA8B1] rounded-full flex items-center justify-center">
                    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#5C9EAD] absolute z-20" animate={{ scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.7, 0.8, 0.95, 1] }}>
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ArchitectureSection;
