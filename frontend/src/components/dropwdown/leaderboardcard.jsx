import React, { useState, useEffect } from 'react';

// ==========================================
// 1. LEADERBOARD COMPONENT
// ==========================================
const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const users = [
    { id: 1, name: 'Killua Zoldyck', time: '09 hr 38 min', profilePic: '/killua.png', badgeIcon: '/killuabadge.png' },
    { id: 2, name: 'Monkey D Luffy', time: '06 hr 02 min', profilePic: '/luffy.png', badgeIcon: '/luffybadge.png' },
    { id: 3, name: 'Roronoa Zoro', time: '03 hr 42 min', profilePic: '/zoro.png', badgeIcon: '/zorobadge.png' },
  ];

  return (
    <div className="w-[340px] h-[340px] font-sans relative z-10 shrink-0">
      <div 
        className="w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "rgba(20, 24, 54, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `
            8px 12px 32px rgba(0, 0, 0, 0.3), 
            inset 1px 1px 2px rgba(255, 255, 255, 0.1),
            inset -1px -1px 4px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        <div className="flex justify-start mb-4 shrink-0">
          <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
            Leaderboard
          </h2>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.12] via-white/[0.05] to-transparent mb-3 shrink-0"></div>

        <div className="flex flex-col flex-1 justify-center">
          {isLoading ? (
            [1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 border-b border-white/[0.04] last:border-0 animate-pulse">
                <div className="w-5 h-5 rounded bg-slate-600/20 shrink-0"></div>
                <div className="w-10 h-10 rounded-xl bg-slate-600/20 shrink-0"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-24 h-3 bg-slate-600/20 rounded"></div>
                  <div className="w-16 h-2 bg-slate-600/20 rounded"></div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-600/20 shrink-0"></div>
              </div>
            ))
          ) : (
            users.map((user, index) => (
              <div 
                key={user.id} 
                className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-b border-transparent hover:bg-white/[0.03] hover:border-white/[0.02] transition-all duration-300"
              >
                <div className="shrink-0 w-5 text-center">
                  <span className="text-base font-bold text-slate-500 group-hover:text-slate-200 transition-colors duration-300">
                    #{index + 1}
                  </span>
                </div>
                <div className="shrink-0 relative">
                  <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-xl border border-white/10 object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="text-sm font-semibold text-slate-200 tracking-wide group-hover:text-white transition-colors duration-300 truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors duration-300 shrink-0"></span>
                    <span className="text-slate-400 font-mono text-[10px] tracking-wider truncate">
                      {user.time}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <img src={user.badgeIcon} alt="badge" className="w-7 h-7 object-contain grayscale-[0.6] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOMENTUM (STREAK) COMPONENT (UPDATED WITH BLUE FIRE LOGIC)
// ==========================================
const MomentumCard = () => {
  // Yahan state add ki hai track karne ke liye ki button click hua ya nahi
  const [isClaimed, setIsClaimed] = useState(false);

  return (
    <div className="w-[340px] h-[340px] font-sans relative z-10 shrink-0">
      <div 
        className="w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "rgba(20, 24, 54, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `
            8px 12px 32px rgba(0, 0, 0, 0.3), 
            inset 1px 1px 2px rgba(255, 255, 255, 0.1),
            inset -1px -1px 4px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase">
              Momentum
            </h2>
          </div>
          {/* Badge color dynamically changes on claim */}
          <span className={`text-[10px] font-medium px-3 py-1 rounded-full border transition-colors duration-500 ${isClaimed ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>
            daily streak
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 my-auto relative">
          
          {/* IMAGE CROSS-FADE CONTAINER */}
          <div className="relative w-16 h-16 mb-2">
            
            {/* 1. Black & White Image */}
            <img 
              src="/bw-fire.png" 
              alt="BW Fire" 
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${
                isClaimed ? 'opacity-0 scale-90' : 'opacity-60 scale-100'
              }`}
            />
            
            {/* 2. Colorful Image (Fades in with a glow) */}
            <img 
              src="/color-fire.png" 
              alt="Colorful Fire" 
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${
                isClaimed 
                  ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse' 
                  : 'opacity-0 scale-90'
              }`}
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-white tracking-tighter transition-all duration-500">
              {/* Conditional Rendering for Count */}
              {isClaimed ? '15' : '14'}
            </span>
            <span className="text-sm font-bold text-slate-300 leading-tight">
              days<br />consistency
            </span>
          </div>
        </div>

        {/* Dynamic Button */}
        <button 
          onClick={() => setIsClaimed(true)}
          disabled={isClaimed}
          className={`w-full py-3 mt-auto shrink-0 rounded-xl text-sm font-bold transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
            isClaimed 
              ? 'bg-transparent text-blue-400 border border-blue-500/30 cursor-default'
              : 'text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02]'
          }`}
        >
          {isClaimed ? 'Claimed for today!' : 'Claim Streak Badge'}
        </button>
      </div>
    </div>
  );
};
// ==========================================
// 3. CONSISTENCY (GRID) COMPONENT
// ==========================================
const ConsistencyCard = () => {
  const gridBoxes = Array.from({ length: 24 }).map((_, i) => {
    const intensities = ['bg-white/[0.05]', 'bg-white/[0.15]', 'bg-white/[0.3]', 'bg-white/[0.5]'];
    return intensities[Math.floor(Math.random() * intensities.length)];
  });

  return (
    <div className="w-[340px] h-[340px] font-sans relative z-10 shrink-0">
      <div 
        className="w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "rgba(20, 24, 54, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `
            8px 12px 32px rgba(0, 0, 0, 0.3), 
            inset 1px 1px 2px rgba(255, 255, 255, 0.1),
            inset -1px -1px 4px rgba(0, 0, 0, 0.2)
          `,
        }}
      >
        <div className="flex justify-start mb-4 shrink-0">
          <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10 bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
            Consistency
          </span>
        </div>

        <div className="mb-4 flex-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            Your year,
          </h2>
          <h3 className="text-2xl italic font-serif text-slate-400 mb-2">
            one glance.
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed pr-2">
            Make your daily focus streak visible. Every box represents a day you showed up.
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-4 shrink-0">
          {gridBoxes.map((bgClass, idx) => (
            <div 
              key={idx} 
              className={`aspect-square rounded-md border border-white/5 ${bgClass} hover:scale-110 hover:border-white/20 transition-all duration-200 cursor-pointer`}
            ></div>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          <span>Less study</span>
          <span>More focus</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT (WRAPPER)
// ==========================================
const Dashboard = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-start p-4 sm:p-6 md:p-10 overflow-x-auto">
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-start w-full max-w-7xl">
        <Leaderboard />
        <MomentumCard />
        <ConsistencyCard />
      </div>
    </div>
  );
};

export default Dashboard;