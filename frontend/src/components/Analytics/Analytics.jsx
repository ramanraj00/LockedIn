import React, { useEffect, useState } from 'react';

// DITHER-KIT IMPORTS
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { DitherAvatar } from "../dither-kit/avatar"; 
import { DitherButton } from "../dither-kit/button"; 
// 👇 Naya Gradient Import
import { DitherGradient } from "../dither-kit/gradient";

// LUCIDE ICONS
import { Clock, Target, Timer, Flame, Trophy, CalendarDays, Activity } from 'lucide-react';

const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

// ----------------------------------------------------------------------
// STAT CARD COMPONENT (WITH DITHER GRADIENT BACKGROUND)
// ----------------------------------------------------------------------
const StatCard = ({ title, value, trendStr, isPositive = true }) => {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col h-[180px] group transition-colors hover:bg-[#151515] hover:border-white/10">
            
            {/* The Magic: DitherGradient filling the background of the card */}
            {/* Note: I'm using direction="top" so the blue dither comes from the bottom up! */}
            <DitherGradient from="blue" direction="top" className="opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content Section (z-10 keeps it above the gradient) */}
            <div className="p-6 relative z-10 flex flex-col justify-end h-full">
                <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
                <div className="flex items-baseline gap-3 mt-2">
                    <div className="text-4xl font-bold tracking-tight text-white">{value}</div>
                    {trendStr && (
                        <div className={`text-sm font-semibold flex items-center ${isPositive ? 'text-[#34d399]' : 'text-red-400'}`}>
                            {isPositive ? '▲' : '▼'} {trendStr}
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN ANALYTICS COMPONENT
// ----------------------------------------------------------------------
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
            <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b]">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            </div>
        );
    }

    const chartConfig = {
        hours: { label: "Focus Hours", color: "blue" }
    };

    return (
        <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-32">
            
            {/* 🚀 HEADER */}
            <header className="w-full pt-16 pb-12 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Analytics</h1>
                    <p className="text-zinc-400 mt-2 text-lg">Your productivity and focus data, visualized.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-medium text-white">{profile.name || "User"}</div>
                        <div className="text-xs text-[#34d399] mt-0.5">Online</div>
                    </div>
                    <div className="rounded-full bg-black/50 border border-white/10 p-1">
                        <DitherAvatar name={profile.name || "user"} size={48} /> 
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 md:px-12 mt-4 flex flex-col gap-16">
                
                {/* 🚀 THE DITHER GRADIENT CARDS GRID */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Focus" 
                            value={formatTime(profile.totalFocusTimeAllTime)} 
                            trendStr="14%" 
                            isPositive={true} 
                        />
                        <StatCard 
                            title="Avg Session" 
                            value={formatTime(profile.averageSessionLength)} 
                            trendStr="5%" 
                            isPositive={true} 
                        />
                        <StatCard 
                            title="Total Sessions" 
                            value={profile.totalSessionsAllTime || 0} 
                            trendStr="2" 
                            isPositive={false} 
                        />
                        <StatCard 
                            title="30-Day Consistency" 
                            value={`${profile.consistency30Days || 0}%`} 
                            trendStr="8%" 
                            isPositive={true} 
                        />
                    </div>
                </section>

                {/* 🚀 MAIN DITHER CHART */}
                <section className="w-full bg-[#111111] border border-white/5 rounded-2xl p-8 md:p-10 relative overflow-hidden">
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-semibold text-white tracking-tight">Weekly Throughput</h2>
                            <p className="text-zinc-400 mt-1">Hours logged in the trailing 7 days.</p>
                        </div>
                    </div>
                    
                    <div className="w-full h-[450px]">
                        <BarChart data={weeklyData} config={chartConfig} bloom="aura">
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip labelKey="day" />
                            <Bar dataKey="hours" variant="dotted" />
                        </BarChart>
                    </div>
                </section>

                {/* 🚀 STREAKS & HEATMAP SECTION */}
                <section className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Streaks (Left Side) */}
                    <div className="lg:col-span-1 flex flex-row lg:flex-col gap-6">
                        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex-1 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                <Flame size={18} className="text-orange-500" />
                                <span className="text-sm font-medium">Current Streak</span>
                            </div>
                            <div className="text-4xl font-bold text-white">{profile.currentStreak || 0} <span className="text-lg text-zinc-500 font-normal">days</span></div>
                        </div>

                        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex-1 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                <Trophy size={18} className="text-yellow-500" />
                                <span className="text-sm font-medium">Longest Streak</span>
                            </div>
                            <div className="text-4xl font-bold text-white">{profile.longestStreak || 0} <span className="text-lg text-zinc-500 font-normal">days</span></div>
                        </div>
                        
                        <div className="hidden lg:block w-full">
                            <DitherButton color="blue" bloom="low" onClick={() => window.location.reload()} className="w-full py-4 text-sm font-medium tracking-wide">
                                Sync Database
                            </DitherButton>
                        </div>
                    </div>

                    {/* Heatmap (Right Side) */}
                    <div className="lg:col-span-3 bg-[#111111] border border-white/5 rounded-2xl p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8 text-zinc-400">
                            <CalendarDays size={18} />
                            <span className="text-sm font-medium">1-Year Activity Matrix</span>
                        </div>
                        
                        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                            <div className="flex gap-[6px] min-w-max">
                                {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex flex-col gap-[6px]">
                                        {heatmapData.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => {
                                            const intensityColors = {
                                                0: '#18181b', // visible dark grey
                                                1: '#064e3b', 
                                                2: '#047857', 
                                                3: '#10b981', 
                                                4: '#34d399'  
                                            };
                                            const bgColor = intensityColors[day.intensity] || intensityColors[0];
                                            
                                            return (
                                                <div 
                                                    key={`${colIndex}-${rowIndex}`} 
                                                    className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] rounded-[3px] relative group cursor-pointer border border-white/5 transition-transform hover:scale-110"
                                                    style={{ backgroundColor: bgColor }}
                                                >
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#111] border border-white/10 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl transition-opacity">
                                                        <span className="text-zinc-400 mr-2">{day.date}</span>
                                                        <span className="font-medium">{day.hours}h</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default Analytics;