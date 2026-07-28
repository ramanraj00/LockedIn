import React from "react";
import { Clock } from "lucide-react";

const WorkspaceCard = () => {
  return (
    <div className="w-full h-full flex flex-col p-6 bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-white tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>
          workspace
        </h3>
        <button className="px-3 py-1 text-[10px] text-zinc-400 border border-white/10 rounded hover:bg-white/5 transition-colors uppercase tracking-widest">
          + new box
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Task 1 */}
        <div className="w-full bg-[#111] border border-white/5 rounded-lg p-4 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300" style={{ fontFamily: "'Space Mono', monospace" }}>26 July 2026</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-yellow-500/30 text-yellow-500 bg-yellow-500/10">pending</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
              <Clock size={12} />
              00:30:52
            </span>
            <button className="bg-white text-black px-3 py-1 rounded text-[10px] font-bold hover:bg-zinc-200 transition-colors">
              START
            </button>
          </div>
        </div>

        {/* Task 2 */}
        <div className="w-full bg-[#111] border border-white/5 rounded-lg p-4 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300" style={{ fontFamily: "'Space Mono', monospace" }}>25 July 2026</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-green-500/30 text-green-500 bg-green-500/10">active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
              <Clock size={12} />
              00:00:45
            </span>
            <button className="bg-white text-black px-3 py-1 rounded text-[10px] font-bold hover:bg-zinc-200 transition-colors">
              START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
