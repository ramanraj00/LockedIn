import React from "react";
import { motion } from "framer-motion";

const AnalyticsCard = () => {
  return (
    <div className="w-full h-full flex flex-col p-6 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background Dither Effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H1V1H0V0ZM2 2H3V3H2V2Z' fill='%233b82f6'/%3E%3C/svg%3E")`,
          backgroundSize: "4px 4px"
        }}
      />
      
      {/* Header */}
      <div className="relative z-10 flex items-center mb-6">
        <h3 
          className="text-2xl font-bold text-blue-400 tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          style={{ fontFamily: "'Pixeloid', monospace" }}
        >
          hello raman
        </h3>
      </div>

      {/* Stats Row */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0D0D0D] border border-white/5 rounded-xl p-4 shadow-lg group hover:border-blue-500/30 transition-colors">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Total Time</p>
          <p className="text-2xl font-bold text-white">1h 4m</p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/5 rounded-xl p-4 shadow-lg group hover:border-blue-500/30 transition-colors">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2">
            2 days
            <span className="text-blue-500 text-sm">🔥</span>
          </p>
        </div>
      </div>
      
      {/* Mini Bar Chart */}
      <div className="relative z-10 flex-1 flex items-end justify-between px-2 pb-2 gap-2 mt-auto">
        {[20, 10, 5, 25, 40, 90, 30].map((height, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
            className={`w-full rounded-t-sm ${i === 5 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-zinc-800'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnalyticsCard;
