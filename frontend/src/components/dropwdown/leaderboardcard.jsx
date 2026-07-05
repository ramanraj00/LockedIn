import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Fake loading effect (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Updated users array with some rank colors for visual flair
  const users = [
    { id: 1, name: 'Killua Zoldyck', time: '09 hr 38 min', profilePic: '/killua.png', badgeIcon: '/killuabadge.png', rankColor: 'from-amber-300 to-orange-500' },
    { id: 2, name: 'Monkey D Luffy', time: '06 hr 02 min', profilePic: '/luffy.png', badgeIcon: '/luffybadge .png', rankColor: 'from-slate-300 to-slate-400' },
    { id: 3, name: 'Roronoa Zoro', time: '03 hr 42 min', profilePic: '/zoro.png', badgeIcon: '/zorobadge.png', rankColor: 'from-amber-700 to-orange-800' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto font-sans relative py-12 px-4">
      
      {/* --- AMBIENT GLOWS FOR GLASS EFFECT --- */}
      {/* This gives the backdrop-filter something colorful to blur */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* --- HEADER (Centered) --- */}
      <div className="text-center mb-10 relative">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight inline-block relative">
          Leaderboard
          {/* Subtle underline glow */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent"></div>
        </h2>
      </div>
      
      {/* --- MAIN GLASS CONTAINER --- */}
      <div className="relative p-6 sm:p-8 rounded-[2rem] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/10"
           style={{
             background: 'rgba(255, 255, 255, 0.03)',
             backdropFilter: 'blur(40px) saturate(180%)',
             WebkitBackdropFilter: 'blur(40px) saturate(180%)',
           }}>
        
        {/* Container Top Edge Highlight (Apple Light Refraction) */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

        <div className="flex flex-col gap-4">
          
          {isLoading ? (
            /* =========================================
               PREMIUM SKELETON LOADER
               ========================================= */
            [1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 sm:gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="w-1/2 h-6 bg-white/10 rounded-lg"></div>
                  <div className="w-1/3 h-4 bg-white/10 rounded-md"></div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full shrink-0"></div>
              </div>
            ))
          ) : (
            /* =========================================
               ACTUAL LEADERBOARD DATA ROWS
               ========================================= */
            users.map((user, index) => (
              <div 
                key={user.id} 
                className="group relative flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                {/* Row Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Rank Number */}
                <div className="shrink-0 w-8 sm:w-10 text-center">
                  <span className={`text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b ${user.rankColor || 'from-slate-400 to-slate-600'}`}>
                    #{index + 1}
                  </span>
                </div>
                
                {/* Profile Pic with Glowing Aura */}
                <div className="relative shrink-0">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-40 bg-gradient-to-tr ${user.rankColor || 'from-slate-400 to-slate-600'} group-hover:opacity-70 transition-opacity duration-300`}></div>
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={`${user.name} profile`}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[2px] border-white/20 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[2px] border-white/20 bg-white/10 flex items-center justify-center shadow-lg">
                      <span className="text-white/50 text-xl font-bold">{user.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Name & Time Section */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-indigo-200 transition-colors duration-300">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                    {/* Tiny pulsing dot to indicate "active" or "focused" status */}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-slate-300 font-mono text-sm sm:text-base tracking-wider opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      {user.time}
                    </span>
                  </div>
                </div>
                
                {/* Badge Icon with Hover Scaling */}
                <div className="shrink-0 flex flex-col items-center justify-center">
                  {user.badgeIcon ? (
                    <img 
                      src={user.badgeIcon} 
                      alt="badge" 
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-[9px] text-white/30 uppercase tracking-widest">Badge</span>
                    </div>
                  )}
                </div>
                
              </div>
            ))
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;