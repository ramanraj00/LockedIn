import React from 'react';
import Lottie from 'lottie-react';
import lottieData from '../../assets/3rd.json';
import { motion } from 'framer-motion';
import { 
  Flame, Clock, Grid, User, Users, Trophy, BarChart2, Settings,
  Calendar, Activity, Target, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const topIcons = [
  { name: 'Streaks', icon: Flame },
  { name: 'Focus Time', icon: Clock },
  { name: 'Heatmap', icon: Grid },
  { name: 'Profile', icon: User },
  { name: 'Follow', icon: Users },
  { name: 'Leaderboard', icon: Trophy },
  { name: 'Analytics', icon: BarChart2 },
  { name: 'Settings', icon: Settings },
];

const features = [
  {
    title: 'Track Everything',
    desc: 'Every focus session, task, and minute is automatically tracked.',
    icon: Calendar
  },
  {
    title: 'Understand Patterns',
    desc: 'Heatmaps and analytics reveal your habits and productivity trends.',
    icon: Activity
  },
  {
    title: 'Compete & Connect',
    desc: 'Follow others, compare stats, and climb the global leaderboard.',
    icon: Users
  },
  {
    title: 'Build Consistency',
    desc: 'Grow streaks, earn achievements, and improve a little every day.',
    icon: Target
  }
const FeatureFlowSection = () => {
  return (
    <div className="w-screen min-h-screen md:h-screen bg-[#FAF9F6] flex flex-col justify-start pt-20 md:pt-[14vh] pb-0 md:pb-16 relative overflow-visible shrink-0" id="feature-flow-section">
      {/* Applying scale to fit screen and ensure it clears the top nav */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center scale-90 md:scale-[0.85] origin-top">
        
        {/* Top Icons Row */}
        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between gap-3 md:gap-0 w-full max-w-3xl mb-8 relative z-10">
          
          {/* Master SVG overlay for all connecting lines */}
          <div className="absolute top-[80px] left-0 w-full h-[80px] pointer-events-none -z-10 hidden md:block">
            <style>
              {`
                @keyframes dashFlow {
                  from { stroke-dashoffset: 100; }
                  to { stroke-dashoffset: 0; }
                }
                .animate-flow {
                  animation: dashFlow 1.2s linear infinite;
                }
              `}
            </style>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {topIcons.map((_, index) => {
                const startX = 3.125 + index * 13.39;
                
                // Calculate number of dashes based on path length (distance from center)
                const distFromCenter = Math.abs(index - 3.5);
                const numDashes = distFromCenter > 1.5 ? 5 : 3; 
                
                // pathLength="100" normalizes the total length to 100
                const patternLength = 100 / numDashes;
                const dashLength = 4; // Length of the blue dash
                const gapLength = patternLength - dashLength;
                
                return (
                  <React.Fragment key={index}>
                    {/* Background track line */}
                    <path 
                      d={`M ${startX} 0 C ${startX} 50, 50 60, 50 100`} 
                      stroke="#E5E3DB" strokeWidth="1.5" fill="none"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Animated flowing dashed line */}
                    <path 
                      d={`M ${startX} 0 C ${startX} 50, 50 60, 50 100`} 
                      stroke="#5C9EAD" strokeWidth="3" strokeDasharray={`${dashLength} ${gapLength}`} fill="none"
                      vectorEffect="non-scaling-stroke"
                      pathLength="100"
                      className="animate-flow"
                    />
                  </React.Fragment>
                );
              })}
            </svg>
          </div>

          {topIcons.map((item, index) => (
            <div key={index} className="w-[84px] h-[84px] border-[1.5px] border-gray-400/80 bg-transparent flex flex-col items-center justify-center gap-2 group hover:border-[#5C9EAD] transition-colors relative z-20 cursor-default">
              <item.icon size={28} strokeWidth={1.5} className="text-gray-500 group-hover:text-[#5C9EAD] transition-colors" />
              <span className="text-[12px] font-medium text-gray-700 capitalize group-hover:text-[#5C9EAD] transition-colors">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Central CTA Button */}
        <div className="relative z-20 mb-8">
          <Link to="/signup" className="group block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#4A8594] to-[#5C9EAD] px-10 py-4 rounded-2xl shadow-[0_8px_30px_rgba(92,158,173,0.3)] flex flex-col items-center border border-white/20"
            >
              <h3 className="text-white text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                LOCKEDIN
              </h3>
              <p className="text-white/80 text-sm font-medium tracking-wide">Your Productivity Engine</p>
            </motion.div>
          </Link>
          {/* SVG line down from CTA */}
          <div className="absolute left-1/2 top-full w-px h-12 bg-transparent -translate-x-1/2">
             <svg width="2" height="48" className="absolute top-0 left-0">
               <line x1="1" y1="0" x2="1" y2="48" stroke="#5C9EAD" strokeWidth="2" strokeDasharray="4 4" />
             </svg>
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#5C9EAD]"></div>
          </div>
        </div>

        {/* Vertical Feature Flow */}
        <div className="flex flex-col gap-6 w-full max-w-2xl relative z-10">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              {/* Connector from previous box */}
              {index > 0 && (
                <div className="absolute left-1/2 -top-6 w-px h-6 bg-transparent -translate-x-1/2">
                  <svg width="2" height="24" className="absolute top-0 left-0">
                    <line x1="1" y1="0" x2="1" y2="24" stroke="#5C9EAD" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#5C9EAD]"></div>
                </div>
              )}
              
              <div className="bg-white border border-[#E5E3DB] rounded-[24px] p-6 shadow-sm flex flex-col gap-3 group hover:shadow-md hover:border-[#5C9EAD]/30 transition-all">
                
                <h4 className="font-bold text-black text-[22px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {feature.title}
                </h4>
                
                <div className="flex justify-between items-start gap-4">
                  <p className="text-zinc-500 text-[14px] font-medium leading-relaxed line-clamp-3 w-[60%]">
                    {feature.desc}
                  </p>
                  
                  <div className="w-[35%] max-w-[100px] aspect-video bg-gradient-to-br from-[#E8F3F5] to-[#CBE4E9] rounded-2xl flex items-center justify-center shadow-inner group-hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    {index === 0 ? (
                      <video autoPlay muted loop playsInline webkit-playsinline="true" className="w-full h-full object-cover">
                        <source src="/1st.webm" type="video/webm" />
                      </video>
                    ) : index === 1 ? (
                      <video autoPlay muted loop playsInline webkit-playsinline="true" className="w-full h-full object-cover">
                        <source src="/2nd.webm" type="video/webm" />
                      </video>
                    ) : index === 2 ? (
                      <Lottie animationData={lottieData} loop={true} className="w-full h-full object-cover" />
                    ) : (
                      <feature.icon size={36} className="text-[#5C9EAD]" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FeatureFlowSection;
