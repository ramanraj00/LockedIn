import React from "react";

const CalendarCard = () => {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  // Generating a fake calendar grid for July 2026
  const grid = Array.from({ length: 35 }).map((_, i) => {
    let date = i - 2; // Offset to start July 1st on a Wednesday
    if (date < 1 || date > 31) return null;
    return date;
  });

  return (
    <div className="w-full h-full flex flex-col p-6 bg-[#0a0a0a]">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          July <span className="text-zinc-500 font-normal">2026</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 rounded-full flex items-center p-1 border border-white/5">
            <button className="px-3 py-1 text-xs text-white bg-zinc-800 rounded-full font-medium">Month</button>
            <button className="px-3 py-1 text-xs text-zinc-500 hover:text-white transition-colors">Year</button>
          </div>
          <button className="px-4 py-1 text-xs text-white bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full hover:bg-blue-600/30 transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 border border-white/10 rounded-xl overflow-hidden flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#111]">
          {days.map(d => (
            <div key={d} className="py-2 text-center text-[9px] font-bold text-zinc-500 tracking-widest border-r border-white/10 last:border-r-0">
              {d}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-[#0a0a0a]">
          {grid.map((date, i) => (
            <div 
              key={i} 
              className="border-r border-b border-white/5 last:border-r-0 relative p-1 transition-colors hover:bg-white/5 cursor-pointer flex flex-col items-end"
            >
              {date && (
                <span className={`text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full
                  ${date === 28 ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-zinc-400'}`}>
                  {date}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CalendarCard;
