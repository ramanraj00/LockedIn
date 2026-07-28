import React, { useState } from "react";
import { motion } from "framer-motion";

const LeaderboardCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Fake cards to create the spread effect
  const fakeCards = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div 
      className="w-full h-full flex flex-col p-6 items-center justify-center bg-[#0a0a0a] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-6 left-6">
        <h3 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h3>
        <p className="text-xs text-zinc-500 mt-1">Hover to expand cards</p>
      </div>

      <div className="relative w-32 h-48 mt-12 flex justify-center items-center">
        {fakeCards.map((offset, i) => {
          const isCenter = offset === 0;
          return (
            <motion.div
              key={i}
              initial={{ x: 0, rotate: offset * 5, y: Math.abs(offset) * 10, scale: 1 - Math.abs(offset) * 0.05 }}
              animate={isHovered ? {
                x: offset * 45,
                rotate: offset * 2,
                y: Math.abs(offset) * 5,
                scale: 1,
                opacity: 1
              } : {
                x: 0,
                rotate: offset * 5,
                y: Math.abs(offset) * 10,
                scale: 1 - Math.abs(offset) * 0.05,
                opacity: isCenter ? 1 : 0.4
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute w-32 h-44 rounded-xl border border-white/10 shadow-2xl flex flex-col items-center p-3
                ${isCenter ? 'bg-gradient-to-b from-blue-900/40 to-black z-10 border-blue-500/50' : 'bg-[#111] z-0'}`}
              style={{
                boxShadow: isCenter && isHovered ? '0 0 30px rgba(59,130,246,0.3)' : '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {isCenter && (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-yellow-500 mb-2 overflow-hidden bg-blue-500/20">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Raman" alt="Avatar" className="w-full h-full" />
                  </div>
                  <div className="bg-yellow-500 text-black text-[8px] font-bold px-2 py-0.5 rounded-full -mt-4 mb-2">#1</div>
                  <h4 className="text-xs font-bold text-white text-center">Raman</h4>
                  <p className="text-[9px] text-yellow-500 tracking-widest mt-1">CHAMPION</p>
                  
                  <div className="w-full flex justify-between mt-auto px-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-zinc-500">FOCUS</span>
                      <span className="text-xs font-bold text-white">4h</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-zinc-500">STREAK</span>
                      <span className="text-xs font-bold text-blue-400">🔥 2</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardCard;
