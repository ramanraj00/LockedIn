const fs = require('fs');

const code = fs.readFileSync('/Users/ramanraj/Documents/LockedIn/frontend/src/pages/Leaderboard.jsx', 'utf8');

// Extract from start up to 'const Leaderboard = () => {'
let header_part = code.split('const Leaderboard = () => {')[0];

if (header_part.includes('// 🔥 SWIPER.JS IMPORTS')) {
    header_part = header_part.split('// 🔥 SWIPER.JS IMPORTS')[1];
}
    
// Remove imports of react router and sidebar
header_part = header_part.replace("import { useNavigate } from 'react-router-dom';", "");
header_part = header_part.replace("import Sidebar from '@/components/Sidebar/Sidebar';", "");
header_part = header_part.replace("import Sidebar from '../components/Sidebar/Sidebar';", "");

let ui_part = code.split('const tableUsers = useMemo(() => users.slice(3, 8), [users]);')[1];
ui_part = ui_part.split('return (')[1];
ui_part = ui_part.substring(0, ui_part.lastIndexOf(');'));

// Remove Sidebar
ui_part = ui_part.replace('<Sidebar activePage="Leaderboard" />', '');

// Strip the global css from the `<style>` block
ui_part = ui_part.replace("* { box-sizing: border-box; margin: 0; padding: 0; }", "");
ui_part = ui_part.replace(/body\s*\{\s*background-color:[^}]+\}\s*/g, "");

// Make height 100% instead of 100vh
ui_part = ui_part.replace("height: '100vh'", "height: '100%'");

const new_file = `import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Lock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

${header_part}

const LiveFocusSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
  }, []);

  const handleNavigate = useCallback(() => {}, []);

  const top3Users = [
        { id: '1', name: 'Alex', xp: 14200, streak: 45 },
        { id: '2', name: 'Sarah', xp: 12100, streak: 30 },
        { id: '3', name: 'David', xp: 11000, streak: 20 },
  ];
  const tableUsers = [
        { id: '4', name: 'Emma', xp: 9500, streak: 15 },
        { id: '5', name: 'Michael', xp: 8200, streak: 12 },
        { id: '6', name: 'Sophia', xp: 7100, streak: 8 },
        { id: '7', name: 'James', xp: 6000, streak: 5 },
        { id: '8', name: 'Isabella', xp: 5400, streak: 3 },
  ];
  const currentUserStats = {
        name: 'You', avatar: null, rank: 42, streak: 7, focusTime: 3600, percentile: 85
  };

  return (
    <section className="relative w-full h-[100vh] bg-[#FAF9F6] border-t border-[#E5E3DB] z-10 flex flex-col pt-16">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-12 flex flex-col items-center shrink-0">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <p className="text-[#5C9EAD] text-sm font-bold tracking-widest uppercase">Live Global Network</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif-elegant font-semibold text-[#1F2937] mb-2 tracking-tight">
              Focus Sessions & Charts
            </h2>
            <p className="text-[#6B7280] text-base md:text-lg">
              Real-time updates of deep work, consistency streaks, and task completions from users around the globe.
            </p>
          </motion.div>
        </div>

      </div>

        {/* The Window Wrapper */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl h-[70vh] min-h-[550px] bg-[#0F0F0F] rounded-3xl overflow-hidden shadow-2xl border-[8px] border-white/50 relative"
        >
          {/* Fake Mac Window Controls */}
          <div className="absolute top-0 left-0 w-full h-12 bg-[#1A1A1A] border-b border-white/5 flex items-center px-5 gap-2 z-50">
             <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black/10"></div>
             <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black/10"></div>
             <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black/10"></div>
             <div className="ml-auto text-[11px] font-bold text-gray-400 tracking-widest">LOCKEDIN - LEADERBOARD</div>
          </div>
          
          <div className="w-full h-full pt-12 overflow-hidden relative flex items-start justify-center">
            <div className="w-[1440px] h-[900px] origin-top scale-[0.35] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] shrink-0">
                ${ui_part}
            </div>
          </div>
        </motion.div>
        
    </section>
  );
};

export default LiveFocusSection;
`;
fs.writeFileSync('/Users/ramanraj/Documents/LockedIn/frontend/src/components/showcase/LiveFocusSection.jsx', new_file);
