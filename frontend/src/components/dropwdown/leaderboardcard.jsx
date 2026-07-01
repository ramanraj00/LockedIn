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

  // Yahan badges add kar diye hain
  const users = [
    { id: 1, name: 'Killua zoldyic', time: '09 hr 38min', profilePic: '/killua.png', badgeIcon: '/killuabadge.png' },
    { id: 2, name: 'Monkey D Luffy', time: '6hr 02min', profilePic: '/luffy.png', badgeIcon: '/luffybadge .png' },
    { id: 3, name: 'Roronoa Zoro', time: '3h 42 min', profilePic: '/zoro.png', badgeIcon: '/zorobadge.png' },
  ];

  return (
    <div className="w-max font-sans">
      
      {/* Box ke bahar LeaderBoard text */}
      <h2 className="text-gray-100 text-3xl font-bold mb-6 ml-2 tracking-wide">
        LeaderBoard
      </h2>
      
      {/* Main Leaderboard Box */}
      <div className="flex flex-col gap-8 p-10 rounded-2xl bg-transparent border border-white/20 shadow-lg">
        
        {isLoading ? (
          /* =========================================
             SKELETON LOADER
             ========================================= */
          [1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-8 animate-pulse">
              <div className="w-20 h-20 bg-white/10 rounded-md shrink-0"></div>
              <div className="w-[250px] h-[60px] bg-white/10 rounded-lg"></div>
              <div className="w-[150px] h-7 bg-white/10 rounded"></div>
              <div className="w-14 h-14 bg-white/10 rounded-md shrink-0 ml-4"></div>
            </div>
          ))
        ) : (
          /* =========================================
             ACTUAL DATA
             ========================================= */
          users.map((user) => (
            <div key={user.id} className="flex items-center gap-8">
              
              {/* Profile Pic - Bada (w-20 h-20) */}
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  alt={`${user.name} profile`}
                  className="w-20 h-20 rounded-md border border-white/20 object-cover shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-md border border-white/20 bg-white/5 shrink-0"></div>
              )}
              
              {/* Name Badge */}
              <div className="px-8 py-4 bg-[#26214a]/80 border border-white/10 rounded-lg min-w-[250px] text-center text-gray-100 font-semibold tracking-wide text-lg shadow-inner">
                {user.name}
              </div>
              
              {/* Time text */}
              <div className="text-gray-300 font-mono text-lg tracking-wider min-w-[150px]">
                {user.time}
              </div>
              
              {/* Rank Badge Area - Square background/border removed, direct display */}
              {user.badgeIcon ? (
                <img 
                  src={user.badgeIcon} 
                  alt="badge" 
                  className="w-14 h-14 object-contain shrink-0 ml-4"
                />
              ) : (
                <div className="w-14 h-14 shrink-0 ml-4"></div>
              )}
              
            </div>
          ))
        )}
        
      </div>
    </div>
  );
};

export default Leaderboard;