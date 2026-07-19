import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 🌟 THE LIBRARY (DITHER-KIT)
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { DitherGradient } from "../dither-kit/gradient";

// --- UTILITIES ---
const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; 
};

// --- ANIMATIONS ---
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- COMPONENTS ---
const StatusBadge = ({ active = true, text }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-white/10 bg-white/[0.02] text-[11px] font-bold tracking-wide uppercase text-zinc-400 shadow-sm">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#3b82f6]' : 'bg-zinc-500'}`} style={{ boxShadow: active ? '0 0 8px rgba(59, 130, 246, 0.8)' : 'none' }} />
        {text}
    </div>
);

const StatCard = ({ title, value }) => {
    return (
        <motion.div 
            variants={itemVariants}
            style={{ transformPerspective: 1200, transformOrigin: "center center" }}
            initial={{ boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }} 
            animate={{ boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
            whileHover={{ 
                rotateX: 18,         
                scale: 1.05,         
                y: -8,               
                boxShadow: "0 30px 50px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(59,130,246,0.35)" 
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl relative overflow-hidden flex flex-col h-[150px] group transition-colors duration-500 hover:bg-[#0D0D0D] hover:border-transparent shadow-sm"
        >
            <DitherGradient from="blue" direction="top" className="opacity-80 group-hover:opacity-100 transition-opacity duration-500 ease-out" />

            <div className="p-5 relative z-10 flex flex-col justify-end h-full gap-2">
                <h3 className="text-[12px] font-bold tracking-[0.1em] text-zinc-400 group-hover:text-white transition-colors duration-500 uppercase [text-shadow:_0_1px_4px_rgb(0_0_0_/_90%)]">
                    {title}
                </h3>
                <div className="flex items-baseline gap-3">
                    <div className="text-[32px] font-bold tracking-tight text-[#E4E4E7] group-hover:text-white transition-colors duration-500 leading-none [text-shadow:_0_2px_12px_rgb(0_0_0_/_100%)]">
                        {value}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE ---
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
                setProfile(await profileRes.json());
                setWeeklyData((await weeklyRes.json()).weeklyData || []);
                setHeatmapData((await heatmapRes.json()).heatmapData || []);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
                <div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
            </div>
        );
    }

    const chartConfig = { hours: { label: "Focus Hours", color: "blue" } };
    const firstName = profile.name ? profile.name.split(' ')[0] : 'Hustler';
    
    // Calculate total active days dynamically
    const totalFocusDays = heatmapData.filter(d => d.intensity > 0).length;

    return (
        <div className="min-h-screen w-full bg-[#000000] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-32">
            
            <style>{`
                @font-face {
                    font-family: 'Pixeloid';
                    src: url('/fonts/pixeloid/PixeloidSans-Bold.otf') format('opentype');
                }
                .pixel-gradient-text {
                    font-family: 'Pixeloid', sans-serif;
                    background: linear-gradient(to right, #93c5fd, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0px 0px 8px rgba(59, 130, 246, 0.4));
                    padding-right: 12px; 
                    padding-bottom: 8px; 
                    letter-spacing: 2px; 
                }
            `}</style>

            <div className="w-full max-w-[1050px] mx-auto px-6 md:px-8 mt-8 flex flex-col gap-6">
                
                {/* 🚀 CLEAN HEADER + HACKER TITLE */}
                <header className="w-full pt-8 pb-4 flex flex-row items-end justify-between">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-medium text-zinc-500 tracking-wide uppercase">Analytics</span>
                        <h1 className="text-4xl md:text-[52px] font-bold tracking-tight m-0 p-0">
                            <motion.span
                                initial={{ clipPath: "inset(0 100% 0 0)" }} 
                                animate={{ clipPath: "inset(0 0 0 0)" }}    
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }} 
                                style={{ display: "inline-block", whiteSpace: "nowrap" }}
                                className="pixel-gradient-text leading-none mt-2"
                            >
                                hello {firstName.toLowerCase()}
                            </motion.span>
                        </h1>
                    </div>
                    <div className="hidden sm:block">
                        <StatusBadge text="LIVE SYNC" />
                    </div>
                </header>

                <motion.main 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="w-full flex flex-col gap-6"
                >
                    {/* 🚀 4 DITHER CARDS IN A CLEAN ROW */}
                    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total time" value={formatTime(profile.totalFocusTimeAllTime)} />
                        <StatCard title="Total sessions" value={profile.totalSessionsAllTime || 0} />
                        <StatCard title="Current streak" value={`${profile.currentStreak || 0} days`} />
                        <StatCard title="Average time" value={formatTime(profile.averageSessionLength)} />
                    </section>

                    {/* 🚀 CLEAN CHART BOX + DITHERED NEON BARS */}
                    <motion.section 
                        variants={itemVariants}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col overflow-hidden shadow-sm relative group transition-colors duration-500 hover:bg-[#0D0D0D]"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[15px] font-bold text-zinc-100 tracking-tight">Time tracked</h2>
                                <p className="text-[13px] font-medium text-zinc-500">Weekly focus time</p>
                            </div>
                        </div>
                        
                        <div className="w-full h-[360px] p-6 pb-2">
                            <BarChart data={weeklyData} config={chartConfig} bloom="aura" margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <XAxis 
                                    dataKey="day" 
                                    tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'Pixeloid, sans-serif', letterSpacing: '1px' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    type="number" 
                                    tickFormatter={(value) => {
                                        if (value === 0) return '0s';
                                        if (value < 1) return `${Math.round(value * 60)}m`;
                                        if (Number.isInteger(value)) return `${value}h`;
                                        return `${value.toFixed(1)}h`;
                                    }} 
                                    tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'Pixeloid, sans-serif', letterSpacing: '1px' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                />
                                <Tooltip 
                                    labelKey="day" 
                                    valueFormatter={(value) => {
                                        if (!value) return "0s";
                                        const h = Math.floor(value);
                                        const m = Math.round((value - h) * 60);
                                        let str = "";
                                        if (h > 0) str += `${h}h `;
                                        if (m > 0 || h === 0) str += `${m}m`;
                                        return str.trim();
                                    }}
                                />
                                <Bar 
                                    dataKey="hours" 
                                    variant="dotted" 
                                    barSize={48} 
                                    radius={[6, 6, 0, 0]} 
                                />
                            </BarChart>
                        </div>
                    </motion.section>

                    {/* 🚀 GITHUB-STYLE CLEAN HEATMAP BOX */}
                    <motion.section 
                        variants={itemVariants}
                        className="w-full rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col overflow-hidden shadow-sm transition-colors duration-500 hover:bg-[#0D0D0D]"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[15px] font-bold text-zinc-100 tracking-tight">{totalFocusDays} days of focus in the last year</h2>
                                <p className="text-[13px] font-medium text-zinc-500">Daily focus intensity matrix</p>
                            </div>
                        </div>
                        
                        <div className="w-full overflow-x-auto p-6 custom-scrollbar">
                            <div className="min-w-max flex flex-col">
                                {/* Months Row Label */}
                                <div className="flex relative h-5 text-[10px] font-medium text-zinc-500 mb-1 ml-[30px]">
                                    {(() => {
                                        const monthLabels = [];
                                        let currentMonth = "";
                                        const numCols = Math.ceil(heatmapData.length / 7);
                                        for (let i = 0; i < numCols; i++) {
                                            const colDays = heatmapData.slice(i * 7, (i + 1) * 7);
                                            const validDay = colDays.find(d => d && d.date);
                                            if (validDay) {
                                                const dateObj = new Date(validDay.date);
                                                if (!isNaN(dateObj.getTime())) {
                                                    const month = dateObj.toLocaleString('en-US', { month: 'short' });
                                                    if (month !== currentMonth) {
                                                        monthLabels.push({ text: month, colIndex: i });
                                                        currentMonth = month;
                                                    }
                                                }
                                            }
                                        }
                                        return monthLabels.map(label => (
                                            <div 
                                                key={label.text + label.colIndex} 
                                                className="absolute top-0" 
                                                // 16px is exactly one column width (12px box + 4px gap)
                                                style={{ left: `${label.colIndex * 16}px` }}
                                            >
                                                {label.text}
                                            </div>
                                        ));
                                    })()}
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Days Left Column */}
                                    <div className="flex flex-col gap-[4px] text-[10px] text-zinc-500 font-medium w-[22px] mt-[1px]">
                                        <span className="h-[12px] flex items-center justify-start text-transparent">Sun</span>
                                        <span className="h-[12px] flex items-center justify-start">Mon</span>
                                        <span className="h-[12px] flex items-center justify-start text-transparent">Tue</span>
                                        <span className="h-[12px] flex items-center justify-start">Wed</span>
                                        <span className="h-[12px] flex items-center justify-start text-transparent">Thu</span>
                                        <span className="h-[12px] flex items-center justify-start">Fri</span>
                                        <span className="h-[12px] flex items-center justify-start text-transparent">Sat</span>
                                    </div>

                                    {/* Heatmap Grid */}
                                    <div className="flex gap-[4px]">
                                        {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, colIndex) => (
                                            <div key={colIndex} className="flex flex-col gap-[4px]">
                                                {heatmapData.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => {
                                                    const intensityColors = {
                                                        0: '#18181B', 
                                                        1: '#064e3b', 
                                                        2: '#047857', 
                                                        3: '#10b981', 
                                                        4: '#34d399'  
                                                    };
                                                    const bgColor = intensityColors[day.intensity] || intensityColors[0];
                                                    
                                                    return (
                                                        <div 
                                                            key={`${colIndex}-${rowIndex}`} 
                                                            className="w-[12px] h-[12px] rounded-[3px] border border-white/5 transition-all hover:border-white/20 hover:scale-110 cursor-pointer relative group"
                                                            style={{ backgroundColor: bgColor }}
                                                        >
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#27272A] border border-white/10 text-white text-[11px] py-1.5 px-2.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all">
                                                                <span className="text-zinc-400 mr-2">{day.date}</span>
                                                                <span className="font-bold text-[#34d399]">{day.hours}h</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Legend */}
                                <div className="mt-5 flex items-center justify-between text-[11px] text-zinc-500 font-medium pl-[30px]">
                                    <div className="flex items-center gap-2 hover:text-zinc-300 cursor-pointer transition-colors">
                                        <span>Learn how we measure focus</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Less</span>
                                        <div className="flex gap-[4px]">
                                            <div className="w-[12px] h-[12px] rounded-[3px] bg-[#18181B] border border-white/5" />
                                            <div className="w-[12px] h-[12px] rounded-[3px] bg-[#064e3b] border border-white/5" />
                                            <div className="w-[12px] h-[12px] rounded-[3px] bg-[#047857] border border-white/5" />
                                            <div className="w-[12px] h-[12px] rounded-[3px] bg-[#10b981] border border-white/5" />
                                            <div className="w-[12px] h-[12px] rounded-[3px] bg-[#34d399] border border-white/5" />
                                        </div>
                                        <span>More</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.main>
            </div>
        </div>
    );
};

export default Analytics;