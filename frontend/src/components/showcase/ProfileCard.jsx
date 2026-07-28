import React from "react";

const ProfileCard = () => {
  return (
    <div className="w-full h-full flex flex-col p-6 items-center justify-center bg-[#0a0a0a]">
      {/* Avatar Avatar */}
      <div className="w-24 h-24 rounded-full border-[3px] border-blue-500/50 mb-4 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)] relative">
        <div className="absolute inset-0 bg-blue-500/20" />
        <img 
          src="https://api.dicebear.com/7.x/bottts/svg?seed=Raman" 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Name and Handle */}
      <h3 className="text-xl font-bold text-white mb-1">Raman</h3>
      <p className="text-xs text-zinc-500 mb-6">@r02519625</p>

      {/* Badges */}
      <div className="flex items-center gap-3 w-full justify-center">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          ✨
        </div>
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          🛡️
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          ⚡
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
