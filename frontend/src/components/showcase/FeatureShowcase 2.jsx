import React from "react";
import ProfileCard from "./ProfileCard";
import WorkspaceCard from "./WorkspaceCard";
import CalendarCard from "./CalendarCard";
import StopwatchCard from "./StopwatchCard";
import AnalyticsCard from "./AnalyticsCard";
import LeaderboardCard from "./LeaderboardCard";
import SettingsCard from "./SettingsCard";

const FeatureShowcase = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24 z-20">
      
      {/* Showcase Header */}
      <div className="flex flex-col items-center justify-center text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
          Everything you need to stay <span className="text-blue-500">LockedIn.</span>
        </h2>
        <p className="text-slate-400 max-w-2xl text-lg">
          Experience a sleek, deeply integrated suite of tools designed to optimize your focus and track your progress flawlessly.
        </p>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
        
        {/* Row 1 */}
        <div className="md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
          <AnalyticsCard />
        </div>
        
        <div className="md:col-span-1 lg:col-span-1 row-span-2 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group flex flex-col">
          <StopwatchCard />
        </div>

        <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
          <ProfileCard />
        </div>

        {/* Row 2 */}
        <div className="md:col-span-1 lg:col-span-2 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
          <WorkspaceCard />
        </div>

        <div className="md:col-span-1 lg:col-span-1 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
          <SettingsCard />
        </div>

        {/* Row 3 */}
        <div className="md:col-span-2 lg:col-span-2 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group relative">
          <LeaderboardCard />
        </div>

        <div className="md:col-span-1 lg:col-span-2 row-span-1 rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group">
          <CalendarCard />
        </div>

      </div>
    </section>
  );
};

export default FeatureShowcase;
