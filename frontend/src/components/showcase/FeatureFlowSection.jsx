import React, { useRef, useState, useEffect } from 'react';
import { useLottie } from 'lottie-react';
import lottieData from '../../assets/3rd.json';
import { motion, useScroll, useTransform } from 'framer-motion';
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
];

const LottieWrapper = ({ animationData }) => {
  const { View } = useLottie({
    animationData: animationData,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });
  return View;
};

const FeatureCard = ({ feature, index, isEven, scrollDir, onBranchActive }) => {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["center center", "end center"] 
  });

  const leftPos = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const rightPos = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      const isActive = latest > 0.05 && latest < 0.95;
      onBranchActive(index, isActive);
    });
  }, [scrollYProgress, index, onBranchActive]);

  return (
    <div ref={ref} className={`relative flex w-full ${isEven ? 'md:justify-start' : 'md:justify-end'} ${index > 0 ? 'md:-mt-12 lg:-mt-14' : ''} z-10`}>
      
      {/* Horizontal Connector Line (Desktop Only) */}
      <div 
        className="hidden md:block absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#5C9EAD]"
        style={{
          left: isEven ? '45%' : '49.5%',
          right: isEven ? '49.5%' : '45%',
          zIndex: -1
        }}
      >
         {/* Branching Animated Scroll Arrow */}
         <motion.div
           style={{
             position: 'absolute',
             top: '50%',
             translateY: '-50%',
             left: isEven ? leftPos : 'auto',
             right: !isEven ? rightPos : 'auto',
             opacity: opacity,
           }}
           className="z-20 flex items-center justify-center bg-[#FAF9F6] px-1"
         >
           <motion.div
             animate={{ 
               opacity: scrollDir === 'up' ? 0 : 1,
               rotate: isEven 
                 ? (scrollDir === 'down' ? 90 : -90)
                 : (scrollDir === 'down' ? -90 : 90)
             }}
             transition={{ duration: 0.2 }}
           >
             <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-[#5C9EAD]"></div>
           </motion.div>
         </motion.div>
      </div>
      
      <div className="w-full md:w-[45%] bg-white border border-[#E5E3DB] rounded-[24px] p-4 lg:p-5 shadow-sm flex flex-col justify-between gap-2 group hover:shadow-md hover:border-[#5C9EAD]/30 transition-all">
        
        <h4 className="font-bold text-black text-[20px] lg:text-[22px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {feature.title}
        </h4>
        
        <div className="flex justify-between items-center gap-4 mt-1">
          <p className="text-zinc-500 text-[13px] lg:text-[14px] font-medium leading-relaxed w-[45%]">
            {feature.desc}
          </p>
          
          <div className="w-[50%] max-w-[240px] h-[90px] sm:h-[110px] bg-gradient-to-br from-[#E8F3F5] to-[#CBE4E9] rounded-2xl flex items-center justify-center shadow-inner group-hover:-translate-y-1 transition-all duration-300 overflow-hidden shrink-0">
            {index === 0 ? (
              <video autoPlay muted loop playsInline webkit-playsinline="true" className="w-full h-full object-cover">
                <source src="/1st.webm" type="video/webm" />
              </video>
            ) : index === 1 ? (
              <LottieWrapper animationData={lottieData} />
            ) : index === 2 ? (
              <video autoPlay muted loop playsInline webkit-playsinline="true" className="w-full h-full object-cover">
                <source src="/2nd.webm" type="video/webm" />
              </video>
            ) : index === 3 ? (
              <video autoPlay muted loop playsInline webkit-playsinline="true" className="w-full h-full object-cover">
                <source src="/4.webm" type="video/webm" />
              </video>
            ) : (
              <feature.icon size={36} className="text-[#5C9EAD]" strokeWidth={1.5} />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

const FeatureFlowSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const [scrollDir, setScrollDir] = useState('down');
  const [activeBranches, setActiveBranches] = useState({});
  
  const handleBranchActive = React.useCallback((index, isActive) => {
    setActiveBranches(prev => {
      if (prev[index] === isActive) return prev;
      return { ...prev, [index]: isActive };
    });
  }, []);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      const prev = scrollY.getPrevious();
      if (latest > prev) setScrollDir('down');
      else if (latest < prev) setScrollDir('up');
    });
  }, [scrollY]);

  const arrowTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="w-screen min-h-screen bg-[#FAF9F6] flex flex-col justify-start pt-20 md:pt-[10vh] lg:pt-[12vh] pb-8 relative overflow-hidden shrink-0" id="feature-flow-section">
      {/* Applying scale to fit screen and ensure it clears the top nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center origin-top scale-95 md:scale-[0.75] lg:scale-[0.80]">
        
        {/* Top Icons Row */}
        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between gap-2 md:gap-0 w-full max-w-3xl mb-4 relative z-10">
          
          {/* Master SVG overlay for all connecting lines */}
          <div className="absolute top-[64px] left-0 w-full h-[60px] pointer-events-none -z-10 hidden md:block">
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
            <div key={index} className="w-[64px] h-[64px] border-[1.5px] border-gray-400/80 bg-transparent flex flex-col items-center justify-center gap-1 group hover:border-[#5C9EAD] transition-colors relative z-20 cursor-default">
              <item.icon size={22} strokeWidth={1.5} className="text-gray-500 group-hover:text-[#5C9EAD] transition-colors" />
              <span className="text-[10px] font-medium text-gray-700 capitalize group-hover:text-[#5C9EAD] transition-colors">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Central CTA Button */}
        <div className="relative z-20 mb-6">
          <Link to="/signup" className="group block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#4A8594] to-[#5C9EAD] px-8 py-3 rounded-2xl shadow-[0_8px_30px_rgba(92,158,173,0.3)] flex flex-col items-center border border-white/20"
            >
              <h3 className="text-white text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                LOCKEDIN
              </h3>
              <p className="text-white/80 text-sm font-medium tracking-wide">Your Productivity Engine</p>
            </motion.div>
          </Link>
          {/* SVG line down from CTA */}
          <div className="absolute left-1/2 top-full w-px h-8 bg-transparent -translate-x-1/2">
             <svg width="2" height="32" className="absolute top-0 left-0">
               <line x1="1" y1="0" x2="1" y2="32" stroke="#5C9EAD" strokeWidth="2" strokeDasharray="4 4" />
             </svg>
          </div>
        </div>

        {/* Alternating Timeline Feature Flow */}
        <div ref={containerRef} className="flex flex-col gap-6 md:gap-0 w-full relative z-10 pb-4 mt-4">
          
          {/* Center Vertical Dashed Line (Desktop Only) */}
          <div className="hidden md:block absolute left-1/2 top-0 -bottom-32 w-px border-l-2 border-dashed border-[#5C9EAD] -translate-x-1/2 z-0">
            {/* Upward Scroll Arrow Only */}
            <motion.div 
              style={{ top: arrowTop }}
              animate={{ opacity: scrollDir === 'up' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 -ml-[1px] z-20 flex items-center justify-center bg-[#FAF9F6] py-1.5"
            >
               <motion.div
                 animate={{ rotate: scrollDir === 'down' ? 0 : 180 }}
                 transition={{ duration: 0.3 }}
               >
                 <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-[#5C9EAD]"></div>
               </motion.div>
            </motion.div>
          </div>

          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index} 
                isEven={isEven} 
                scrollDir={scrollDir} 
                onBranchActive={handleBranchActive}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FeatureFlowSection;
