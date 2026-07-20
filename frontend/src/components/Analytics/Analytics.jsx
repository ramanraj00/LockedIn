import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';

// 🌟 THE LIBRARY (DITHER-KIT)
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { DitherGradient } from "../dither-kit/gradient";
import { PieChart } from "../dither-kit/pie-chart";
import { Pie } from "../dither-kit/pie";
import { Legend } from "../dither-kit/legend";

// --- SIDEBAR CONSTANTS ---
const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const COLORS = {
    sidebar: '#15181C',
    textPrimary: '#D1D5DB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
};

const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

const PanelIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M15 3v18" />
        <path d="M10 15l-3-3 3-3" />
    </svg>
);

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

const StatCard = ({ title, value, index }) => {
    const [isWaving, setIsWaving] = useState(false);

    useEffect(() => {
        const waveDelay = 1700 + (index * 150); 
        const timer1 = setTimeout(() => setIsWaving(true), waveDelay);
        const timer2 = setTimeout(() => setIsWaving(false), waveDelay + 600);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [index]);

    return (
        <motion.div 
            initial={{ opacity: 1, y: 0, scale: 1, rotateX: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
            animate={isWaving ? {
                rotateX: [0, 15, 0],
                scale: [1, 1.03, 1],
                y: [0, -6, 0],
                boxShadow: [
                    "0 4px 20px rgba(0,0,0,0.4)",
                    "0 25px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.3)",
                    "0 4px 20px rgba(0,0,0,0.4)"
                ]
            } : {
                y: 0, scale: 1, rotateX: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
            }}
            transition={isWaving ? { duration: 0.6, ease: "easeInOut", times: [0, 0.5, 1] } : { type: "spring", stiffness: 300, damping: 24 }}
            style={{ transformPerspective: 1200, transformOrigin: "center center" }}
            whileHover={{ 
                rotateX: 15,         
                scale: 1.03,         
                y: -6,               
                boxShadow: "0 25px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.3)",
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className={`w-full bg-[#0A0A0A] border border-white/5 rounded-xl relative overflow-hidden flex flex-col h-[130px] group transition-colors duration-500 hover:bg-[#0D0D0D] hover:border-transparent shadow-sm ${isWaving ? 'bg-[#0D0D0D] border-transparent' : ''}`}
        >
            <DitherGradient from="blue" direction="top" className={`opacity-80 transition-opacity duration-500 ease-out ${isWaving ? 'opacity-100' : 'group-hover:opacity-100'}`} />

            <div className="p-5 relative z-10 flex flex-col justify-end h-full gap-2">
                <h3 className={`text-[12px] font-bold tracking-[0.1em] transition-colors duration-500 uppercase [text-shadow:_0_1px_4px_rgb(0_0_0_/_90%)] ${isWaving ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                    {title}
                </h3>
                <div className="flex items-baseline gap-3">
                    <div className={`text-[32px] md:text-[36px] font-bold tracking-tight transition-colors duration-500 leading-none [text-shadow:_0_2px_12px_rgb(0_0_0_/_100%)] ${isWaving ? 'text-white' : 'text-[#E4E4E7] group-hover:text-white'}`}>
                        {value}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const BarChartSkeleton = () => {
    const heights = ['40%', '65%', '35%', '85%', '55%', '95%', '60%'];
    return (
        <div className="w-full h-full flex flex-row">
            <div className="w-[45px] h-full flex flex-col justify-between pb-8 pt-6 pr-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full flex justify-end">
                        <div className="w-4 h-1.5 bg-zinc-800/40 rounded-sm" />
                    </div>
                ))}
            </div>
            
            <div className="flex-1 h-full flex items-end justify-between px-2 md:px-6 pb-1 pt-10">
                {heights.map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-[48px]">
                        <div className="w-full bg-[#18181B] border border-white/5 rounded-t-[6px] animate-pulse relative overflow-hidden" style={{ height: h, animationDelay: `${i * 150}ms` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-30" />
                        </div>
                        <div className="w-8 h-2 bg-[#27272A] rounded-sm animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="relative w-full mt-24 pt-12 overflow-hidden flex flex-col items-center border-t border-white/10">
            <DitherGradient from="blue" direction="down" />
            <div className="relative z-10 w-full px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
                <p className="text-white text-sm font-bold tracking-wide text-center sm:text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    © {new Date().getFullYear()} LockedIn. All rights reserved.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <a href="https://x.com/r1zzdev?s=20" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-xl">
                        <svg className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href="https://github.com/ramanraj00/LockedIn" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-xl">
                        <svg className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>
            <div className="relative z-10 w-full flex justify-center items-end select-none pointer-events-none mt-auto overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0) 100%)", maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0) 100%)" }}>
                <h1 className="font-eurostile text-transparent bg-clip-text w-full text-center uppercase" style={{ backgroundImage: "linear-gradient(180deg, #94A3B8 0%, #475569 55%, #0F172A 95%)", fontSize: "clamp(60px, 18.5vw, 400px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: "0.75", marginBottom: "-3.5%", WebkitFontSmoothing: "antialiased", filter: "drop-shadow(0px -4px 20px rgba(0,0,0,0.3))" }}>LOCKEDIN</h1>
            </div>
        </footer>
    );
};

// --- MAIN PAGE ---
const Analytics = () => {
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState({});
    const [weeklyData, setWeeklyData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [chartAnimReady, setChartAnimReady] = useState(false);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [boxStats, setBoxStats] = useState({ total: 0, completed: 0, pending: 0 });

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setSidebarOpen(false);
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [profileRes, weeklyRes, heatmapRes, daysRes] = await Promise.all([
                    fetch("http://localhost:3000/api/dashboard/dashboard/profile", { credentials: "include" }),
                    fetch("http://localhost:3000/api/dashboard/dashboard/weekly-chart", { credentials: "include" }),
                    fetch("http://localhost:3000/api/dashboard/dashboard/heatmap", { credentials: "include" }),
                    fetch("http://localhost:3000/api/session/day/all", { credentials: "include" })
                ]);
                
                setProfile(await profileRes.json());
                setWeeklyData((await weeklyRes.json()).weeklyData || []);
                setHeatmapData((await heatmapRes.json()).heatmapData || []);
                
                const dayData = await daysRes.json();
                const days = dayData.daySessions || [];
                
                let tTotal = 0, tComp = 0, tPend = 0;
                let bTotal = 0, bComp = 0, bPend = 0;

                await Promise.all(days.map(async (day) => {
                    try {
                        const taskRes = await fetch(`http://localhost:3000/api/task/gettask/${day._id}`, { credentials: "include" });
                        if (taskRes.ok) {
                            const tasks = await taskRes.json();
                            if (tasks.length > 0) {
                                bTotal++;
                                let dayCompletedTasks = 0;
                                tasks.forEach(t => { 
                                    if (t.status) { tComp++; dayCompletedTasks++; } 
                                    else tPend++; 
                                });
                                tTotal += tasks.length;
                                if (dayCompletedTasks === tasks.length) bComp++;
                                else bPend++;
                            }
                        }
                    } catch(e) {}
                }));
                
                setTaskStats({ total: tTotal, completed: tComp, pending: tPend });
                setBoxStats({ total: bTotal, completed: bComp, pending: bPend });
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setChartAnimReady(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
                <div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
            </div>
        );
    }

    const chartConfig = { hours: { label: "Focus Hours", color: "blue" } };
    const firstName = profile.name ? profile.name.split(' ')[0] : 'Hustler';
    const totalFocusDays = heatmapData.filter(d => (d.intensity > 0 || d.hours > 0)).length;

    return (
        <div className="min-h-screen w-full bg-[#000000] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-0">
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
                .sidebar-trigger:hover { transform: scale(1.05); }
            `}</style>

            {/* LEFT SIDEBAR TRIGGER */}
            <button 
                onMouseEnter={() => setSidebarOpen(true)}
                onClick={() => setSidebarOpen(true)}
                className="sidebar-trigger"
                style={{ position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
            >
                <CustomSidebarIcon />
            </button>

            {/* RIGHT WIDGET TRIGGER */}
            <button 
                onClick={() => setDrawerOpen(!drawerOpen)}
                style={{ position: 'fixed', top: 24, right: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
                className={`group shadow-sm border ${drawerOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20'}`}
            >
                <div className="group-hover:scale-105 transition-transform duration-300">
                    <PanelIcon />
                </div>
            </button>

            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 40, transition: 'opacity 0.4s ease', opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}></div>

            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setSidebarOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, zIndex: 50, padding: 24, display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                    <span style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                    <button onClick={() => setSidebarOpen(false)} style={{ padding: 8, color: COLORS.textMuted, cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }}>
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {SIDEBAR_ITEMS.map((item) => (
                        <button 
                            key={item} 
                            onClick={() => navigate(`/${item.toLowerCase()}`)} 
                            style={{ 
                                width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer',
                                border: item === 'Analytics' ? `1px solid ${COLORS.borderHover}` : '1px solid transparent', 
                                backgroundColor: item === 'Analytics' ? 'rgba(255,255,255,0.04)' : 'transparent', 
                                color: item === 'Analytics' ? COLORS.textPrimary : COLORS.textMuted 
                            }}>
                            {item}
                        </button>
                    ))}
                </div>

                <div style={{ paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, marginTop: 'auto' }}>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* 🔥 FIX 1: pt-24 md:pt-8 (was pt-28 md:pt-16) */}
            <div className="w-full max-w-[1800px] mx-auto pl-6 md:pl-[100px] pr-6 md:pr-10 pt-24 md:pt-8 flex flex-col gap-8 relative z-10">
                
                {/* 🔥 FIX 4: gap-2 pb-0 (was gap-4 pb-2) */}
                <header className="w-full flex flex-col gap-2 pb-0 relative z-10">
                    <div className="w-full flex flex-row items-end justify-between">
                        <div className="flex flex-col">
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
                    </div>

                    <div 
                        className="w-full h-[8px] opacity-80"
                        style={{
                            backgroundImage: "conic-gradient(rgba(255,255,255,0.15) 90deg, transparent 90deg 180deg, rgba(255,255,255,0.15) 180deg 270deg, transparent 270deg)",
                            backgroundSize: "8px 8px",
                            backgroundRepeat: "repeat-x",
                            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                            maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)"
                        }}
                    />
                </header>

                {/* 🔥 FIX 2: gap-6 md:gap-6 (was gap-8 md:gap-12) */}
                <motion.main 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show" 
                    className="w-full flex flex-col gap-6 md:gap-6"
                >
                    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard index={0} title="Total time" value={formatTime(profile.totalFocusTimeAllTime)} />
                      <StatCard index={1} title="Longest streak" value={`${profile.longestStreak || 0} days`} />
                        <StatCard index={2} title="Current streak" value={`${profile.currentStreak || 0} days`} />
                        <StatCard index={3} title="Average time" value={formatTime(profile.averageSessionLength)} />
                    </section>

                    <motion.section 
                        variants={itemVariants}
                        className="w-full rounded-2xl border border-white/10 bg-[#0A0A0A] flex flex-col overflow-hidden shadow-sm relative group transition-colors duration-500 hover:bg-[#0D0D0D]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[16px] font-bold text-zinc-100 tracking-tight">Time tracked</h2>
                                <p className="text-[13px] font-medium text-zinc-500">Weekly focus time</p>
                            </div>
                            <div className="hidden sm:block">
                                <StatusBadge text="WEEKLY DATA" active={false} />
                            </div>
                        </div>
                        
                        {/* 🔥 FIX 3: h-[280px] md:h-[360px] p-4 pb-2 (was h-[360px] md:h-[460px] p-6 pb-4) */}
                        <div className="w-full h-[280px] md:h-[360px] p-4 pb-2">
                            {!chartAnimReady ? (
                                <BarChartSkeleton />
                            ) : (
                                <div className="w-full h-full relative">
                                    <BarChart data={weeklyData} config={chartConfig} bloom="aura" margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
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
                                            isAnimationActive={false} 
                                        />
                                    </BarChart>

                                    <motion.div 
                                        className="absolute top-0 right-0 bg-[#0A0A0A] pointer-events-none z-10"
                                        style={{ 
                                            left: "40px", 
                                            bottom: "24px", 
                                            transformOrigin: "top" 
                                        }}
                                        initial={{ scaleY: 1 }} 
                                        animate={{ scaleY: 0 }} 
                                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }} 
                                    />
                                </div>
                            )}
                        </div>
                    </motion.section>

                    <motion.section 
                        variants={itemVariants}
                        className="w-full rounded-2xl border border-white/10 bg-[#0A0A0A] flex flex-col overflow-hidden shadow-sm transition-colors duration-500 hover:bg-[#0D0D0D] mt-2 md:mt-4"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[16px] font-bold text-zinc-100 tracking-tight">{totalFocusDays} days of focus in the last year</h2>
                                <p className="text-[13px] font-medium text-zinc-500">
                                    {isMobile ? "Recent focus activity" : "Daily focus intensity matrix"}
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-full overflow-hidden pb-4">
                            <div className="w-full px-6 pt-8 pb-4">
                                {(() => {
                                    const totalPadding = isMobile ? 48 : 140; 
                                    const sectionInnerWidth = Math.min(windowWidth, 1800) - totalPadding;
                                    const contentWidth = sectionInnerWidth - 48; 
                                    
                                    let targetYear = new Date().getFullYear();
                                    if (heatmapData && heatmapData.length > 0) {
                                        const lastDay = heatmapData[heatmapData.length - 1];
                                        if (lastDay && lastDay.date) {
                                            const d = new Date(lastDay.date);
                                            if (!isNaN(d.getTime())) targetYear = d.getFullYear();
                                        }
                                    }

                                    const startDate = new Date(targetYear, 0, 1);
                                    const endDate = new Date(targetYear, 11, 31);
                                    const fullYearGrid = [];
                                    
                                    const startDay = startDate.getDay();
                                    for (let i = 0; i < startDay; i++) fullYearGrid.push({ date: null, hours: 0, isPad: true });

                                    const dataMap = {};
                                    if (heatmapData && Array.isArray(heatmapData)) {
                                        heatmapData.forEach(d => {
                                            if (d && d.date) dataMap[d.date] = d;
                                        });
                                    }

                                    let current = new Date(startDate);
                                    while (current <= endDate) {
                                        const yyyy = current.getFullYear();
                                        const mm = String(current.getMonth() + 1).padStart(2, '0');
                                        const dd = String(current.getDate()).padStart(2, '0');
                                        const dateStr = `${yyyy}-${mm}-${dd}`;
                                        
                                        if (dataMap[dateStr]) fullYearGrid.push({ ...dataMap[dateStr], isPad: false });
                                        else fullYearGrid.push({ date: dateStr, hours: 0, intensity: 0, isPad: false });
                                        
                                        current.setDate(current.getDate() + 1);
                                    }

                                    const remainder = fullYearGrid.length % 7;
                                    if (remainder > 0) {
                                        for (let i = 0; i < 7 - remainder; i++) fullYearGrid.push({ date: null, hours: 0, isPad: true });
                                    }

                                    const totalCols = fullYearGrid.length / 7;
                                    
                                    const minColSpace = isMobile ? 16 : 20; 
                                    const maxColsAllowed = Math.max(1, Math.floor((contentWidth - 36) / minColSpace));
                                    const displayCols = Math.min(maxColsAllowed, totalCols);
                                    
                                    const now = new Date();
                                    const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
                                    let todayIndex = fullYearGrid.findIndex(d => d.date === todayLocalStr);
                                    if (todayIndex === -1) todayIndex = fullYearGrid.length - 1; 

                                    const todayCol = Math.floor(todayIndex / 7);

                                    let endCol = Math.min(totalCols, todayCol + 5);
                                    let startCol = Math.max(0, endCol - displayCols);

                                    if (startCol === 0) endCol = Math.min(totalCols, displayCols);
                                    if (endCol === totalCols) startCol = Math.max(0, totalCols - displayCols);

                                    const targetData = fullYearGrid.slice(startCol * 7, endCol * 7);
                                    
                                    const exactStretchSpace = (contentWidth - 36) / (displayCols + 0.25); 
                                    const colSpace = Math.min(exactStretchSpace, 42); 
                                    
                                    const boxSize = Math.floor(colSpace * 0.8); 
                                    const gapSize = colSpace - boxSize;          

                                    const maxHours = Math.max(...targetData.map(d => d?.hours || 0), 1);
                                    const numCols = displayCols;
                                    
                                    const monthLabels = [];
                                    let currentMonth = "";
                                    let lastPushedCol = -5;
                                    
                                    for (let i = 0; i < numCols; i++) {
                                        const colDays = targetData.slice(i * 7, (i + 1) * 7);
                                        const validDay = colDays.find(d => d && d.date && !d.isPad); 
                                        if (validDay) {
                                            const month = new Date(validDay.date).toLocaleString('en-US', { month: 'short' });
                                            if (month !== currentMonth) {
                                                if (i - lastPushedCol >= 3 || lastPushedCol === -5) {
                                                    monthLabels.push({ text: month, colIndex: i });
                                                    lastPushedCol = i;
                                                    currentMonth = month;
                                                }
                                            }
                                        }
                                    }

                                    return (
                                        <div className="w-full flex justify-start">
                                            <div className="flex flex-col w-full max-w-full">
                                                
                                                <div className="flex w-full mb-2" style={{ gap: `${gapSize}px` }}>
                                                    <div className="shrink-0" style={{ width: '36px' }} />
                                                    <div className="flex-1 relative h-4 text-[10px] md:text-[11px] font-medium text-zinc-500">
                                                        {monthLabels.map(label => (
                                                            <div 
                                                                key={label.text + label.colIndex} 
                                                                className="absolute top-0 whitespace-nowrap" 
                                                                style={{ left: `${label.colIndex * colSpace}px` }}
                                                            >
                                                                {label.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex" style={{ gap: `${gapSize}px` }}>
                                                    <div className="flex flex-col shrink-0 text-[10px] md:text-[11px] text-zinc-500 font-medium" style={{ gap: `${gapSize}px`, width: '36px', marginTop: '1px' }}>
                                                        <span className="flex items-center justify-start text-transparent" style={{ height: `${boxSize}px` }}>Sun</span>
                                                        <span className="flex items-center justify-start" style={{ height: `${boxSize}px` }}>Mon</span>
                                                        <span className="flex items-center justify-start text-transparent" style={{ height: `${boxSize}px` }}>Tue</span>
                                                        <span className="flex items-center justify-start" style={{ height: `${boxSize}px` }}>Wed</span>
                                                        <span className="flex items-center justify-start text-transparent" style={{ height: `${boxSize}px` }}>Thu</span>
                                                        <span className="flex items-center justify-start" style={{ height: `${boxSize}px` }}>Fri</span>
                                                        <span className="flex items-center justify-start text-transparent" style={{ height: `${boxSize}px` }}>Sat</span>
                                                    </div>

                                                    <div className="flex" style={{ gap: `${gapSize}px` }}>
                                                        {Array.from({ length: numCols }).map((_, colIndex) => (
                                                            <div key={colIndex} className="flex flex-col relative hover:z-50" style={{ gap: `${gapSize}px` }}>
                                                                {targetData.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => {
                                                                    
                                                                    const isPad = !day || day.isPad;
                                                                    
                                                                    let dynamicIntensity = 0;
                                                                    if (!isPad && day.hours > 0) {
                                                                        const ratio = day.hours / maxHours;
                                                                        if (ratio <= 0.25) dynamicIntensity = 1;
                                                                        else if (ratio <= 0.5) dynamicIntensity = 2;
                                                                        else if (ratio <= 0.75) dynamicIntensity = 3;
                                                                        else dynamicIntensity = 4;
                                                                    }

                                                                    const intensityColors = {
                                                                        0: '#18181B', 
                                                                        1: '#1D4ED8', 
                                                                        2: '#3B82F6', 
                                                                        3: '#0EA5E9', 
                                                                        4: '#22D3EE'  
                                                                    };
                                                                    const bgColor = intensityColors[dynamicIntensity];

                                                                    let formattedTime = "0m";
                                                                    if (!isPad && day.hours > 0) {
                                                                        const h = Math.floor(day.hours);
                                                                        const m = Math.round((day.hours - h) * 60);
                                                                        if (h > 0 && m > 0) formattedTime = `${h}h ${m}m`;
                                                                        else if (h > 0) formattedTime = `${h}h`;
                                                                        else formattedTime = `${m}m`;
                                                                    }
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={`${colIndex}-${rowIndex}`} 
                                                                            className="shrink-0 rounded-[3px] transition-all hover:scale-110 cursor-pointer relative group hover:z-50"
                                                                            style={{ 
                                                                                width: `${boxSize}px`, 
                                                                                height: `${boxSize}px`, 
                                                                                backgroundColor: isPad ? 'transparent' : bgColor,
                                                                                border: isPad ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                                                                opacity: isPad ? 0 : 1
                                                                            }}
                                                                        >
                                                                            {!isPad && (
                                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#27272A] border border-white/10 text-white text-[11px] py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] shadow-xl transition-all">
                                                                                    <span className="text-zinc-400 mr-2">{day.date}</span>
                                                                                    <span className="font-bold text-[#22D3EE]">{formattedTime}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-6 flex items-center justify-end text-[11px] text-zinc-500 font-medium pr-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>Less</span>
                                                        <div className="flex" style={{ gap: `${gapSize}px` }}>
                                                            <div className="rounded-[3px] bg-[#18181B] border border-white/5" style={{ width: `${boxSize}px`, height: `${boxSize}px` }} />
                                                            <div className="rounded-[3px] bg-[#1D4ED8] border border-white/5" style={{ width: `${boxSize}px`, height: `${boxSize}px` }} />
                                                            <div className="rounded-[3px] bg-[#3B82F6] border border-white/5" style={{ width: `${boxSize}px`, height: `${boxSize}px` }} />
                                                            <div className="rounded-[3px] bg-[#0EA5E9] border border-white/5" style={{ width: `${boxSize}px`, height: `${boxSize}px` }} />
                                                            <div className="rounded-[3px] bg-[#22D3EE] border border-white/5" style={{ width: `${boxSize}px`, height: `${boxSize}px` }} />
                                                        </div>
                                                        <span>More</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.section>
                </motion.main>
            </div>

            <Footer />

            {/* FLOATING WIDGET CARD */}
            <AnimatePresence>
                {drawerOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed top-20 sm:top-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] md:w-[420px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl z-[110] shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#000000]/50 rounded-t-2xl">
                            <div className="flex flex-col">
                                <h2 className="text-[16px] font-bold text-white tracking-tight">Task Performance</h2>
                                <p className="text-[12px] text-zinc-500 font-medium mt-0.5">Workspace task completion breakdown</p>
                            </div>
                            <button 
                                onClick={() => setDrawerOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-5 sm:p-6 flex flex-col gap-5 sm:gap-6">
                            <div className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

                                {taskStats.total === 0 ? (
                                    <div className="text-zinc-500 text-sm py-10 z-10 relative font-medium">No workspace tasks found.</div>
                                ) : (
                                    <div className="w-full h-[320px] relative z-10 flex flex-col justify-center mt-2">
                                        <PieChart 
                                            data={[
                                                { browser: "completed", visitors: taskStats.completed, fill: "blue" },
                                                { browser: "pending", visitors: taskStats.pending, fill: "purple" }
                                            ]} 
                                            config={{
                                                visitors: { label: "Tasks" },
                                                completed: { label: "Completed", color: "blue", fill: "blue" },
                                                pending: { label: "Pending", color: "purple", fill: "purple" }
                                            }}
                                            dataKey="visitors" 
                                            nameKey="browser" 
                                            innerRadius={0.6} 
                                            bloom="aura"
                                        >
                                            <Legend isClickable align="center" />
                                            <Tooltip />
                                            <Pie variant="gradient" />
                                        </PieChart>
                                        
                                        <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[44px] sm:text-[48px] font-bold text-white tracking-tighter leading-none">{taskStats.total}</span>
                                            <span className="text-[11px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">Tasks</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-[#050505] border border-white/5 rounded-xl p-5 flex flex-col relative overflow-hidden group hover:border-white/15 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Total Days</span>
                                    <span className="text-[28px] font-bold text-white tracking-tight leading-none">{boxStats.total}</span>
                                </div>
                                <div className="bg-[#050505] border border-white/5 rounded-xl p-5 flex flex-col relative overflow-hidden group hover:border-white/15 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Completed</span>
                                    <div className="flex items-baseline gap-2 mt-0.5">
                                        <span className="text-[28px] font-bold text-[#3B82F6] leading-none">{boxStats.completed}</span>
                                        <span className="text-[13px] font-medium text-zinc-500">/ {boxStats.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Analytics;