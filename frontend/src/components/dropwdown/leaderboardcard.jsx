import React, { useState,} from 'react';

// ==========================================
// 1. LEADERBOARD COMPONENT
// ==========================================
const Leaderboard = () => {
  const users = [
    { id: 1, name: 'Snowy', streak: '21d streak', profilePic: '/killua.png', fireIcon: '/color-fire.png' },
    { id: 2, name: 'Pengui', streak: '18d streak', profilePic: '/luffy.png', fireIcon: '/color-fire.png' },
    { id: 3, name: 'Glancy', streak: '12d streak', profilePic: '/zoro.png', fireIcon: '/color-fire.png' },
  ];

  return (
    <div className="w-full max-w-[340px] h-[340px] font-sans relative z-10 shrink-0">
      <div
        className="w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "rgba(20, 24, 54, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: `8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2)`,
        }}
      >
        <div className="flex justify-start mb-4 shrink-0">
          <h2 className="text-xs font-bold text-white tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
            Leaderboard
          </h2>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.12] via-white/[0.05] to-transparent mb-3 shrink-0"></div>

        <div className="flex flex-col flex-1 justify-center gap-2">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="group flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
            >
              {/* Rank color made brighter */}
              <span className="text-xl font-extrabold text-slate-400 w-6 text-center">#{index + 1}</span>

              <img
                src={user.profilePic}
                alt={user.name}
                className="w-12 h-12 rounded-xl border border-white/20 object-cover"
              />

              <div className="flex-1 flex items-center justify-between">
                {/* Name made text-white and slightly larger */}
                <h3 className="text-[15px] font-bold text-white tracking-wide">{user.name}</h3>
                <div className="flex items-center gap-1.5">
                  <img
                    src={user.fireIcon}
                    alt="streak"
                    className="w-6 h-6 object-contain mix-blend-screen opacity-100"
                  />
                  {/* Streak text made brighter and bolder */}
                  <span className="text-[11px] font-bold text-slate-300 tracking-wider">{user.streak}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MOMENTUM (STREAK) COMPONENT
// ==========================================
const MomentumCard = () => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClaim = () => {
    setIsClaimed(true);
    setTimeout(() => {
      setIsPulsing(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-[340px] h-[340px] font-sans relative z-10 shrink-0">
      <style>{`
        @keyframes fire-pulse-custom {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        .animate-fire-dhak {
          animation: fire-pulse-custom 1.5s ease-in-out infinite;
        }
      `}</style>

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
            {/* SVG icon made white */}
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <h2 className="text-xs font-bold text-white tracking-[0.2em] uppercase">
              Momentum
            </h2>
          </div>
          {/* Pill text made brighter */}
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors duration-500 ${isClaimed ? 'text-blue-300 border-blue-400/40 bg-blue-500/20' : 'text-slate-200 border-white/20 bg-white/10'}`}>
            daily streak
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 my-auto relative">
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <div className={`absolute inset-0 bg-blue-500/40 rounded-full blur-xl transition-all duration-[800ms] ease-out ${
              isClaimed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            } ${isPulsing ? 'animate-fire-dhak' : ''}`}></div>

            <img
              src="/bw-fire.png"
              alt="BW Fire"
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-in-out ${
                isClaimed ? 'opacity-0 scale-95' : 'opacity-60 scale-100'
              }`}
            />

            <img
              src="/color-fire.png"
              alt="Colorful Fire"
              className={`absolute inset-0 w-full h-full object-contain origin-bottom transition-all duration-[800ms] ease-out ${
                isClaimed
                  ? 'opacity-100 translate-y-0 scale-y-100'
                  : 'opacity-0 translate-y-4 scale-y-75'
              } ${isPulsing ? 'animate-fire-dhak' : ''}`}
            />
          </div>

          <div className="flex items-baseline gap-2">
            {/* Added subtle text shadow to number for depth */}
            <span className="text-5xl font-extrabold text-white tracking-tighter transition-all duration-500 drop-shadow-md">
              {isClaimed ? '15' : '14'}
            </span>
            <span className="text-[15px] font-semibold text-slate-200 leading-snug">
              days<br />consistency
            </span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={isClaimed}
          className={`w-full py-3 mt-auto shrink-0 rounded-xl text-sm font-bold transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
            isClaimed
              ? 'bg-transparent text-blue-300 border border-blue-400/40 cursor-default'
              : 'text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-[1.02]'
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
    <div className="w-full max-w-[340px] h-[340px] font-sans relative z-10 shrink-0">
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
          <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
            Consistency
          </span>
        </div>

        <div className="mb-4 flex-1">
          <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
            Your year,
          </h2>
          {/* Subtitle made lighter slate */}
          <h3 className="text-[22px] italic font-serif text-slate-300 mb-2">
            one glance.
          </h3>
          {/* Description made larger (text-[13px]) and medium weight */}
          <p className="text-[13px] text-slate-200 font-medium leading-relaxed pr-2">
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

        {/* Footer text made brighter */}
        <div className="mt-auto pt-3 border-t border-white/20 flex justify-between items-center text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0">
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
    <div className="w-full flex justify-center items-start p-4 sm:p-6 md:p-10 mt-12 sm:mt-16">
      <div className="flex flex-col w-full max-w-[1100px]">

       <div className="mb-10 pl-2">
  <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
    Your Progress At a Glance
  </h2>
  <p className="text-sm text-slate-400 font-medium mt-1.5">
    Track your daily streaks and focus consistency.
  </p>
</div>
        <div className="flex flex-col lg:flex-row gap-6 justify-center lg:justify-start items-center lg:items-start w-full pb-4">
          <Leaderboard />
          <MomentumCard />
          <ConsistencyCard />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;