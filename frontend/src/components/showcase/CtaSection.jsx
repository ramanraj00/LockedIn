import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  const [displayValues, setDisplayValues] = useState([0, 0, 365]);
  const [realTargets, setRealTargets] = useState([0, 0, 365]);
  const hasAnimated = useRef(false);

  // Count-up animation function
  const animateCountUp = useCallback((targets) => {
    const duration = 1500;
    const intervalTime = 20;
    const totalSteps = duration / intervalTime;
    const increments = targets.map(t => t / totalSteps);
    let current = [0, 0, 0];
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = current.map((val, i) => {
        const next = val + increments[i];
        return next >= targets[i] ? targets[i] : next;
      });
      setDisplayValues(current.map(Math.floor));

      if (step >= totalSteps) {
        clearInterval(interval);
        setDisplayValues([...targets]);
      }
    }, intervalTime);

    return interval;
  }, []);

  // Fetch real stats from backend + poll every 30s
  useEffect(() => {
    let animInterval;

    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/public-stats', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        if (json.success && json.data) {
          const targets = [
            json.data.totalUsers || 0,
            json.data.totalSessions || 0,
            365
          ];
          setRealTargets(targets);

          // First time: animate count-up. After that: just update directly
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            animInterval = animateCountUp(targets);
          } else {
            setDisplayValues(targets);
          }
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Fallback: at least show heatmap
        if (!hasAnimated.current) {
          hasAnimated.current = true;
          animInterval = animateCountUp([0, 0, 365]);
        }
      }
    };

    fetchStats();

    // Poll every 30 seconds for live updates
    const pollInterval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(pollInterval);
      if (animInterval) clearInterval(animInterval);
    };
  }, [animateCountUp]);

  const stats = [
    { label: 'Registered Users', value: displayValues[0], suffix: '+' },
    { label: 'Sessions Logged', value: displayValues[1], suffix: '+' },
    { label: 'Consistency Heatmap', value: displayValues[2], suffix: ' Days' }
  ];

  return (
    <section className="w-full bg-[#FAF9F6] py-16 md:py-20 flex flex-col items-center justify-center border-t border-[#D4D4D8]">
      <div className="max-w-4xl w-full px-6 flex flex-col items-center text-center">
        
        {/* Stars and Reviews */}
        <div className="mb-4 flex flex-col items-center gap-1.5">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} fill="#FACC15" className="text-yellow-400" />
            ))}
          </div>
          <p className="text-slate-500 font-bold italic text-base tracking-wide mt-1">
            Loved by {realTargets[0] || displayValues[0]}+ builders worldwide
          </p>
        </div>

        {/* Headlines */}
        <h2 className="text-4xl md:text-6xl leading-tight text-[#1F2937] mb-6 font-serif-elegant">
          Are you ready to unlock<br />
          <span className="italic text-[#5C9EAD]">your full potential?</span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 font-medium leading-relaxed">
          Join thousands of developers, and students building<br />daily tracking streaks, and conquering the<br />leaderboard.
        </p>

        {/* Dynamic Stats Row */}
        <div className="w-full max-w-3xl border-t border-b border-gray-200 py-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <span className="text-4xl md:text-5xl font-semibold text-[#0F172A] mb-2 font-mono">
                {stat.value.toLocaleString()}{stat.suffix}
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-500 tracking-wide uppercase">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/signup">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0F172A] text-white px-8 py-3 rounded-[16px] font-bold text-lg w-full sm:w-auto hover:bg-[#1E293B] transition-colors shadow-lg"
            >
              Get started free
            </motion.button>
          </Link>
          <Link to="/leaderboard">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-[#0F172A] border border-gray-200 shadow-sm px-8 py-3 rounded-[16px] font-bold text-lg w-full sm:w-auto hover:bg-gray-50 transition-colors"
            >
              View leaderboard
            </motion.button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CtaSection;
