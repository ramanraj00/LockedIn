import React, { useEffect, useState } from 'react';

// DITHER-KIT IMPORTS (Exact Names!)
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { Legend } from "../dither-kit/legend";
import { DitherAvatar } from "../dither-kit/avatar"; 
import { DitherButton } from "../dither-kit/button"; 

// LUCIDE ICONS
import { Activity, Clock, Target, Timer, Flame, Trophy, CalendarDays, Star } from 'lucide-react';

const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const Analytics = () => {
    const [profile, setProfile] = useState({});
    const [weeklyData, setWeeklyData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [profileRes, weeklyRes, heatmapRes] = await Promise.all([
                    fetch("http://localhost:3000/api/dashboard/dashboard/profile", { credentials: "include" }),
                    fetch("http://localhost:3000/api/dashboard/dashboard/weekly-chart", { credentials: "include" }),
                    fetch("http://localhost:3000/api/dashboard/dashboard/heatmap", { credentials: "include" })
                ]);

                const profileData = await profileRes.json();
                const weeklyData = await weeklyRes.json();
                const heatmapData = await heatmapRes.json();

                setProfile(profileData);
                setWeeklyData(weeklyData.weeklyData || []);
                setHeatmapData(heatmapData.heatmapData || []);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load analytics", err);
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
                <div className="w-12 h-12 rounded-full border-4 border-[#3B82F6] border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const chartConfig = {
        hours: { label: "Focus Hours", color: "blue" }
    };

    return (
        <div className="min-h-screen w-full pb-32 pt-20 px-6 md:px-12 font-sans text-white bg-[#050505] overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-12">
                
                {/* 🚀 MASSIVE HEADER WITH DITHER AVATAR */}
                <div className="w-full flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white font-mono">
                            /ANALYTICS.EXE
                        </h1>
                        <p className="text-lg text-zinc-500 mt-4 font-mono max-w-xl leading-relaxed">
                            Complete breakdown of your focus habits, productivity streaks, and historical data.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="font-mono text-xl font-black text-blue-500">{profile.name || "HACKER_01"}</div>
                            <div className="font-mono text-sm tracking-widest text-zinc-500 uppercase mt-1">Status: LOCKED IN</div>
                        </div>
                        <div className="rounded-xl border-2 border-white/10 p-2 bg-black shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                            {/* Huge Avatar */}
                            <DitherAvatar name={profile.name || "user"} size={80} /> 
                        </div>
                    </div>
                </div>

                {/* 🚀 MASSIVE TOP STATS - 2x2 GRID FOR HUGE BREATHING SPACE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[
                        { title: "Total Focus Time", val: formatTime(profile.totalFocusTimeAllTime), icon: Clock, color: "text-blue-500", glow: "shadow-[0_0_50px_rgba(59,130,246,0.15)]" },
                        { title: "Avg Session Length", val: formatTime(profile.averageSessionLength), icon: Timer, color: "text-orange-500", glow: "shadow-[0_0_50px_rgba(249,115,22,0.15)]" },
                        { title: "Total Sessions", val: profile.totalSessionsAllTime || 0, icon: Target, color: "text-green-500", glow: "shadow-[0_0_50px_rgba(34,197,94,0.15)]" },
                        { title: "30-Day Consistency", val: `${profile.consistency30Days || 0}%`, icon: Activity, color: "text-purple-500", glow: "shadow-[0_0_50px_rgba(168,85,247,0.15)]" }
                    ].map((s, i) => (
                        <div key={i} className={`bg-[#0A0A0A] border border-white/5 p-10 md:p-14 flex flex-col justify-between relative overflow-hidden group ${s.glow}`}>
                            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-12">
                                <h3 className="text-sm md:text-base font-mono tracking-[0.2em] text-zinc-500 uppercase">{s.title}</h3>
                                <s.icon size={32} className={s.color} />
                            </div>
                            <div className="text-5xl md:text-7xl font-black tracking-tighter text-white">{s.val}</div>
                        </div>
                    ))}
                </div>

                {/* 🚀 FULL WIDTH MASSIVE DITHER BAR CHART 📊 */}
                <div className="w-full bg-[#0A0A0A] border border-white/5 p-10 md:p-14 shadow-2xl relative overflow-hidden">
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-black font-mono tracking-wide text-blue-500 uppercase">Weekly Focus Trends</h2>
                        <p className="text-zinc-500 font-mono mt-2 text-sm md:text-base">Daily hours spent in deep work over the last 7 days.</p>
                    </div>
                    
                    {/* H-600px gives the chart massive vertical breathing space */}
                    <div className="w-full h-[500px] md:h-[600px] relative z-10">
                        <BarChart data={weeklyData} config={chartConfig} bloom="aura">
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip labelKey="day" />
                            {/* Dotted variant with aura looks insane on huge scale */}
                            <Bar dataKey="hours" variant="dotted" />
                        </BarChart>
                    </div>
                </div>

                {/* 🚀 STREAKS & MOST PRODUCTIVE DAY (3 COLUMNS) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-[#0A0A0A] border border-white/5 p-10 flex flex-col items-center text-center gap-6 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                        <div className="w-20 h-20 bg-black border border-white/10 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            <Flame size={40} className="text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-mono tracking-widest text-zinc-500 uppercase mb-3">Current Streak</h3>
                            <div className="text-5xl font-black font-mono">{profile.currentStreak || 0} <span className="text-xl text-zinc-600">DAYS</span></div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 p-10 flex flex-col items-center text-center gap-6 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                        <div className="w-20 h-20 bg-black border border-white/10 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                            <Trophy size={40} className="text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-mono tracking-widest text-zinc-500 uppercase mb-3">Longest Streak</h3>
                            <div className="text-5xl font-black font-mono">{profile.longestStreak || 0} <span className="text-xl text-zinc-600">DAYS</span></div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-white/5 p-10 flex flex-col items-center justify-between text-center gap-6 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-black border border-white/10 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                <Star size={40} className="text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-mono tracking-widest text-zinc-500 uppercase mb-3">Most Productive Day</h3>
                                <div className="text-4xl md:text-5xl font-black text-white">{profile.mostProductiveDay || "N/A"}</div>
                            </div>
                        </div>
                        {/* Huge Button for Sync */}
                        <div className="w-full mt-6">
                            <DitherButton color="blue" bloom="aura" onClick={() => window.location.reload()} className="w-full py-6 text-lg font-mono tracking-widest uppercase">
                                Sync Database
                            </DitherButton>
                        </div>
                    </div>
                </div>

                {/* 🚀 EXPANDED HEATMAP (HORIZONTAL SCROLL) */}
                <div className="w-full bg-[#0A0A0A] border border-white/5 p-10 md:p-14 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <CalendarDays className="text-zinc-500" size={32} />
                            <h2 className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter">1-YEAR FOCUS HISTORY</h2>
                        </div>
                        <p className="text-zinc-500 font-mono text-sm">(Scroll horizontally to view past months)</p>
                    </div>
                    
                    {/* custom-scrollbar for a sleek horizontal scroll experience */}
                    <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
                        <div className="flex gap-[8px] min-w-max">
                            {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-[8px]">
                                    {heatmapData.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => {
                                        const intensityColors = {
                                            0: '#111111', // Very dark for empty days
                                            1: '#003300', 
                                            2: '#006600', 
                                            3: '#00AA00', 
                                            4: '#00FF00'  // Bright neon green for max focus
                                        };
                                        const bgColor = intensityColors[day.intensity] || intensityColors[0];
                                        
                                        return (
                                            <div 
                                                key={`${colIndex}-${rowIndex}`} 
                                                // MASSIVE BOXES: 30x30px
                                                className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] relative group cursor-pointer border border-black/50 transition-transform hover:scale-110"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                {/* Massive Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#111] border border-white/20 text-white text-sm md:text-base py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 font-mono shadow-2xl">
                                                    <span className="text-zinc-400 mr-2">{day.date}:</span>
                                                    <span className="font-bold text-green-400">{day.hours} hrs</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;