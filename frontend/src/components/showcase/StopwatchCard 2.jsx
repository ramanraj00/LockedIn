import React, { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";

const StopwatchCard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="w-full h-full flex flex-col p-6 items-center justify-center relative bg-[#0a0a0a]">
      
      <div className="flex items-center justify-between w-full mb-6">
        <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Strict Mode</span>
        <div className="w-8 h-4 bg-zinc-800 rounded-full relative shadow-inner">
          <div className="w-3 h-3 bg-zinc-500 rounded-full absolute left-0.5 top-0.5" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-6xl md:text-7xl font-black text-slate-300 tracking-tighter tabular-nums drop-shadow-lg">
          {formatTime(time)}
        </h2>
      </div>

      <button
        onClick={() => setIsRunning(!isRunning)}
        className="w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold tracking-widest uppercase text-sm relative overflow-hidden group shadow-lg transition-transform active:scale-95"
      >
        <div 
          className={`absolute inset-0 transition-opacity ${isRunning ? 'bg-red-500' : 'bg-blue-600'}`} 
        />
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H1V1H0V0ZM2 2H3V3H2V2Z' fill='%23000000'/%3E%3C/svg%3E")`,
            backgroundSize: "4px 4px"
          }}
        />
        <div className="relative z-10 flex items-center gap-2 drop-shadow-md">
          {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isRunning ? "Stop" : "Start"}
        </div>
      </button>

    </div>
  );
};

export default StopwatchCard;
