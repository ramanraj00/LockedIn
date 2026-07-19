import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// DITHER-KIT IMPORTS
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { DitherAvatar } from "../dither-kit/avatar"; 
import { DitherButton } from "../dither-kit/button"; 
import { DitherGradient } from "../dither-kit/gradient";

// LUCIDE ICONS
import { Flame, Trophy, CalendarDays } from 'lucide-react';

const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

// ----------------------------------------------------------------------
// ANIMATION VARIANTS (FOR LIFE & BOUNCE)
// ----------------------------------------------------------------------
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
};

// ----------------------------------------------------------------------
// STAT CARD COMPONENT (FIXED TRANSFORM ORIGIN GLITCH)
// ----------------------------------------------------------------------
const StatCard = ({ title, value, trendStr, isPositive = true }) => {
    return (
        <motion.div 
            variants={itemVariants}
            // 🛑 FIX: Explicitly forcing transform origin to center for ALL grid items
            style={{ 
                transformPerspective: 1200, 
                transformOrigin: "center center" 
            }} 
            whileHover={{ 
                rotateX: 12,
                scale: 1.02,         
                y: -2,               
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8), 0 10px 20px -5px rgba(59,130,246,0.25), 0 0 0 1px rgba(59,130,246,0.2)" 
            }}
            transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.5 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col h-[180px] group transition-colors duration-500 hover:bg-[#0D0D0D] hover:border-transparent"
        >
            
            <DitherGradient from="blue" direction="top" className="opacity-50 group-hover:opacity-90 transition-opacity duration-700 ease-out" />

            <div className="p-6 relative z-10 flex flex-col justify-end h-full">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500 uppercase drop-shadow-md">
                    {title}
                </h3>
                <div className="flex items-baseline gap-3 mt-2">
                    <div className="text-[38px] font-bold tracking-tight text-[#E4E4E7] group-hover:text-white transition-colors duration-500 leading-none drop-shadow-lg">
                        {value}
                    </div>
                    {trendStr && (
                        <div className={`text-sm font-bold flex items-center ${isPositive ? 'text-[#34d399]' : 'text-[#ef4444]'} drop-shadow-md`}>
                            {isPositive ? '▲' : '▼'} {trendStr}
                        </div>
                    )}
                </div>
            </div>
            
        </motion.div>
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
            <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 rounded-full border-2 border-white/10 border-t-blue-500"
                />
            </div>
        );
    }

    const chartConfig = {
        hours: { label: "Focus Hours", color: "blue" }
    };

    // Extract first name for the greeting
    const firstName = profile.name ? profile.name.split(' ')[0] : 'Hustler';

    return (
        <div className="min-h-screen w-full bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-32">
            
            {/* 🚀 HEADER WITH ANIMATED GREETING */}
            <header className="w-full pt-16 pb-12 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-[46px] font-bold tracking-tight text-white flex items-center">
                        Hello, {firstName} 
                        <motion.span 
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                            className="inline-block ml-3 origin-bottom-right"
                        >
                            👋
                        </motion.span>
                    </h1>
                    <p className="text-zinc-500 mt-2 text-[17px] font-medium">Here's your productivity data and focus breakdown.</p>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center gap-4"
                >
                    <div className="text-right">
                        <div className="text-[15px] font-semibold text-white">{profile.name || "User"}</div>
                        <div className="text-xs font-bold text-[#34d399] tracking-wider uppercase mt-0.5 flex items-center justify-end gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                        </div>
                    </div>
                    <div className="rounded-full bg-black/50 border border-white/10 p-1 shadow-lg">
                        <DitherAvatar name={profile.name || "user"} size={52} /> 
                    </div>
                </motion.div>
            </header>

            <motion.main 
                variants={containerVariants} 
                initial="hidden" 
                animate="show" 
                className="max-w-[1200px] mx-auto px-6 md:px-12 mt-2 flex flex-col gap-12"
            >
                
                {/* 🚀 THE DITHER GRADIENT CARDS GRID */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

                {/* 🚀 MAIN DITHER CHART (VERTICAL MODE) */}
                <motion.section variants={itemVariants} className="w-full bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 md:p-10 relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div className="mb-12 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-[#E4E4E7] tracking-tight">Weekly Throughput</h2>
                            <p className="text-zinc-500 mt-1 font-medium">Hours logged in the trailing 7 days.</p>
                        </div>
                    </div>
                    
                    <div className="w-full h-[380px] md:h-[450px]">
                        <BarChart data={weeklyData} config={chartConfig} bloom="aura" margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <XAxis 
                                dataKey="day" 
                                tick={{ fill: '#FAFAFA', fontSize: 13, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                type="number" 
                                tickFormatter={(value) => `${value}h`} 
                                tick={{ fill: '#A1A1AA', fontSize: 12, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip 
                                labelKey="day" 
                                formatter={(value) => [`${value} hours`, 'Focus Time']}
                            />
                            {/* Wapas Vertical Radius [6, 6, 0, 0] */}
                            <Bar 
                                dataKey="hours" 
                                variant="dotted" 
                                barSize={42} 
                                radius={[6, 6, 0, 0]} 
                            />
                        </BarChart>
                    </div>
                </motion.section>

                {/* 🚀 STREAKS & HEATMAP SECTION */}
                <section className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Streaks (Left Side) */}
                    <div className="lg:col-span-1 flex flex-row lg:flex-col gap-6">
                        <motion.div variants={itemVariants} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex-1 flex flex-col gap-3 shadow-xl hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Flame size={18} className="text-[#f97316]" />
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Current Streak</span>
                            </div>
                            <div className="text-[42px] font-black text-[#E4E4E7] leading-none">{profile.currentStreak || 0} <span className="text-lg text-zinc-600 font-medium tracking-normal">days</span></div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex-1 flex flex-col gap-3 shadow-xl hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                <Trophy size={18} className="text-[#eab308]" />
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Longest Streak</span>
                            </div>
                            <div className="text-[42px] font-black text-[#E4E4E7] leading-none">{profile.longestStreak || 0} <span className="text-lg text-zinc-600 font-medium tracking-normal">days</span></div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="hidden lg:block w-full">
                            <DitherButton color="blue" bloom="low" onClick={() => window.location.reload()} className="w-full py-4 text-sm font-semibold tracking-wide rounded-2xl">
                                Sync Database
                            </DitherButton>
                        </motion.div>
                    </div>

                    {/* Heatmap (Right Side) */}
                    <motion.div variants={itemVariants} className="lg:col-span-3 bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-xl">
                        <div className="flex items-center gap-3 mb-8 text-zinc-500">
                            <CalendarDays size={18} />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase">1-Year Activity Matrix</span>
                        </div>
                        
                        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                            <div className="flex gap-[6px] min-w-max">
                                {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, colIndex) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: colIndex * 0.02, duration: 0.3 }}
                                        key={colIndex} 
                                        className="flex flex-col gap-[6px]"
                                    >
                                        {heatmapData.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => {
                                            const intensityColors = {
                                                0: '#151515', 
                                                1: '#064e3b', 
                                                2: '#047857', 
                                                3: '#10b981', 
                                                4: '#34d399'  
                                            };
                                            const bgColor = intensityColors[day.intensity] || intensityColors[0];
                                            
                                            return (
                                                <div 
                                                    key={`${colIndex}-${rowIndex}`} 
                                                    className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] rounded-[4px] relative group cursor-pointer border border-white/5 transition-all hover:scale-125 hover:z-10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                                                    style={{ backgroundColor: bgColor }}
                                                >
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#111] border border-white/10 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-2xl transition-all translate-y-2 group-hover:translate-y-0">
                                                        <span className="text-zinc-400 mr-2">{day.date}</span>
                                                        <span className="font-bold text-[#34d399]">{day.hours}h</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>

            </motion.main>
        </div>
    );
};

export default Analytics;