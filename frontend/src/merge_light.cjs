const fs = require('fs');

const code = fs.readFileSync('/Users/ramanraj/Documents/LockedIn/frontend/src/pages/Leaderboard.jsx', 'utf8');

let header_part = code.split('const Leaderboard = () => {')[0];

if (header_part.includes('// 🔥 SWIPER.JS IMPORTS')) {
    header_part = header_part.split('// 🔥 SWIPER.JS IMPORTS')[1];
}
    
header_part = header_part.replace("import { useNavigate } from 'react-router-dom';", "");
header_part = header_part.replace("import Sidebar from '@/components/Sidebar/Sidebar';", "");
header_part = header_part.replace("import Sidebar from '../components/Sidebar/Sidebar';", "");

// Light Theme COLORS override
header_part = header_part.replace("bg: '#0F0F0F'", "bg: 'transparent'");
header_part = header_part.replace("card: '#171717'", "card: '#FFFFFF'");
header_part = header_part.replace("cardHover: '#1E1E1E'", "cardHover: '#F9FAFB'");
header_part = header_part.replace("textPrimary: '#F0F0F0'", "textPrimary: '#1F2937'");
header_part = header_part.replace("textSecondary: '#A1A1AA'", "textSecondary: '#6B7280'");
header_part = header_part.replace("border: '#2A2A2D'", "border: '#E5E3DB'");

let ui_part = code.split('const tableUsers = useMemo(() => users.slice(3, 8), [users]);')[1];
ui_part = ui_part.split('return (')[1];
ui_part = ui_part.substring(0, ui_part.lastIndexOf(');'));

ui_part = ui_part.replace('<Sidebar activePage="Leaderboard" />', '');
ui_part = ui_part.replace("* { box-sizing: border-box; margin: 0; padding: 0; }", "");
ui_part = ui_part.replace(/body\s*\{\s*background-color:[^}]+\}\s*/g, "");
ui_part = ui_part.replace("height: '100vh'", "height: '100%'");

// Light Theme Inline Replacements
ui_part = ui_part.replace(/#FFF/g, '#1F2937'); // White text to Dark text
ui_part = ui_part.replace(/rgba\(255,255,255,0\.2\)/g, 'rgba(0,0,0,0.1)'); 
ui_part = ui_part.replace(/rgba\(255,255,255,0\.12\)/g, 'rgba(0,0,0,0.1)');
ui_part = ui_part.replace(/rgba\(255,255,255,0\.08\)/g, 'rgba(0,0,0,0.06)');
ui_part = ui_part.replace(/rgba\(255,255,255,0\.06\)/g, 'rgba(0,0,0,0.04)');
ui_part = ui_part.replace(/#121212/g, '#FFFFFF'); // Dark background panels to White
ui_part = ui_part.replace(/#18181B/g, '#FFFFFF'); // Top3 cards background to White
ui_part = ui_part.replace(/#27272A/g, '#E5E3DB'); // Dark borders to Light borders
ui_part = ui_part.replace(/#2A2A2D/g, '#E5E3DB'); // Dark lines to Light lines
ui_part = ui_part.replace(/#1A1A1A/g, '#F9FAFB'); // Skeletons and Table Headers to Light Gray
ui_part = ui_part.replace(/#242424/g, '#E5E7EB'); // Skeleton shimmer highlight
ui_part = ui_part.replace(/#8A8A8A/g, '#6B7280'); // Muted text

// Revert Avatar text color back to white (since it has a colored background)
// Wait, the Avatar in header_part has color: '#FFF'. 
// We replaced #FFF in ui_part, but Avatar is in header_part! 
// Let's replace #FFF in header_part too EXCEPT for Avatar. 
// Actually, it's easier to just replace #FFF to #1F2937 in header_part as well, and manually fix Avatar if needed.
header_part = header_part.replace(/color: '#FFF'/g, "color: '#1F2937'");
header_part = header_part.replace(/color: '#FFF'/g, "color: '#1F2937'");
// Fix avatar to use white text
header_part = header_part.replace("color: '#1F2937', fontWeight: 800, fontSize: size * 0.45", "color: '#FFFFFF', fontWeight: 800, fontSize: size * 0.45");

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

      {/* The Leaderboard Container with Light Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full flex-1 bg-transparent relative overflow-hidden"
      >
          <div className="w-full h-full overflow-hidden relative flex items-start justify-center">
            
            <div className="w-[1440px] h-[900px] origin-top scale-[0.35] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] shrink-0">
        <div style={{ display: 'flex', height: '100%', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', sans-serif" }}>
            
            <style>{\`
                @font-face {
                    font-family: 'Poppins';
                    src: url('/poppin.ttf') format('truetype');
                }

                .list-row { transition: background 0.15s ease; cursor: pointer; }
                .list-row:hover { background: \${COLORS.cardHover} !important; }

                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-up { animation: fadeUp 0.35s ease forwards; }

                /* 🔥 Hidden scrollbars for clean look */
                .main-content-wrapper::-webkit-scrollbar { display: none; }
                .main-content-wrapper { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
                .skeleton {
                    background: #F3F4F6;
                    background-image: linear-gradient(90deg, #F3F4F6 0px, #E5E7EB 50%, #F3F4F6 100%);
                    background-size: 1000px 100%; animation: shimmer 2s infinite linear; border-radius: 6px;
                }
                
                .badge-shimmer-overlay::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0) 100%);
                    transform: skewX(-20deg);
                    animation: badge-shine 3s infinite;
                }

                @keyframes badge-shine { 0% { left: -150%; } 20% { left: 200%; } 100% { left: 200%; } }

                .top3-stack-container { position: relative; width: 100%; height: 320px; display: flex; justify-content: center; align-items: flex-end; margin-bottom: 24px; perspective: 1200px; }
                .top3-wrapper { position: absolute; bottom: 0; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
                
                /* Center (#1) */
                .top3-wrapper[data-rank="1"] { z-index: 3; transform: translate3d(0, 0, 0) scale(1.05); }
                .top3-wrapper[data-rank="1"]:hover { transform: translate3d(0, -15px, 0) scale(1.08); z-index: 10; }

                /* Left (#2) */
                .top3-wrapper[data-rank="2"] { z-index: 2; transform: translate3d(-60%, 20px, -50px) rotate(-8deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-95%, 10px, -20px) rotate(-4deg); }
                .top3-wrapper[data-rank="2"]:hover { transform: translate3d(-95%, -5px, 0) rotate(0deg) scale(1.05) !important; z-index: 10; }

                /* Right (#3) */
                .top3-wrapper[data-rank="3"] { z-index: 1; transform: translate3d(60%, 40px, -100px) rotate(8deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(95%, 20px, -40px) rotate(4deg); }
                .top3-wrapper[data-rank="3"]:hover { transform: translate3d(95%, -5px, 0) rotate(0deg) scale(1.05) !important; z-index: 10; }

                /* Fake cards for depth */
                .fake-card-wrapper { position: absolute; bottom: 0; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .fake-card { width: 170px; height: 220px; border-radius: 16px; background: linear-gradient(135deg, #F3F4F6, #E5E7EB); opacity: 0.8; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #E5E3DB; }
                
                .fake-l1 { z-index: 0; transform: translate3d(-100%, 60px, -150px) rotate(-12deg); }
                .fake-l2 { z-index: 0; transform: translate3d(-130%, 80px, -200px) rotate(-16deg); }
                .fake-r1 { z-index: 0; transform: translate3d(100%, 60px, -150px) rotate(12deg); }
                .fake-r2 { z-index: 0; transform: translate3d(130%, 80px, -200px) rotate(16deg); }

                .top3-stack-container:hover .fake-l1 { transform: translate3d(-170%, 40px, -100px) rotate(-8deg); }
                .top3-stack-container:hover .fake-l2 { transform: translate3d(-230%, 60px, -150px) rotate(-12deg); }
                .top3-stack-container:hover .fake-r1 { transform: translate3d(170%, 40px, -100px) rotate(8deg); }
                .top3-stack-container:hover .fake-r2 { transform: translate3d(230%, 60px, -150px) rotate(12deg); }

                .decorative-corner { position: absolute; top: -10px; left: -10px; width: 40px; height: 40px; border-top: 2px solid \${COLORS.green}; border-left: 2px solid \${COLORS.green}; opacity: 0.5; border-top-left-radius: 12px; }

                @media (max-width: 1400px) {
                    .main-grid { gap: 24px !important; }
                    .left-col { padding-right: 0 !important; border-right: none !important; }
                    .stats-header h2 { fontSize: 24px !important; }
                    .stats-val { fontSize: 24px !important; }
                }

                @media (max-width: 1024px) {
                    .main-grid { grid-template-columns: 1fr !important; }
                    .right-col { display: none !important; }
                    .leaderboard-title { font-size: 36px !important; }
                }

                @media (max-width: 768px) {
                    .leaderboard-header { flex-direction: column; align-items: flex-start !important; gap: 16px; margin-left: 0 !important; }
                    .leaderboard-title { font-size: 32px !important; }
                    .top3-stack-container { transform: scale(0.6) !important; margin-bottom: 0px !important; height: 260px !important; margin-top: 10px !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-105%, 0, 0) rotate(0deg) !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(105%, 0, 0) rotate(0deg) !important; }
                    .badge-carousel-wrapper { transform: scale(0.7); margin-bottom: 10px !important; }
                }
            \`}</style>

            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 36px', width: '100%', overflowY: 'hidden' }}>
                 ${ui_part.split('<div className="main-content-wrapper"')[1]}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LiveFocusSection;
`;

fs.writeFileSync('/Users/ramanraj/Documents/LockedIn/frontend/src/components/showcase/LiveFocusSection.jsx', new_file);
