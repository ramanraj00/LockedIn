import React, { useState, useEffect } from "react";
import { Clock, Timer, Hourglass, BarChart2, User, Search, Bell, Edit2, Lock, Link as LinkIcon, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gift, AlertCircle, Calendar as CalendarIcon, Play, Pause, RotateCcw, Save, Target, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DitherButton } from "../dither-kit/button";
import { BarChart } from "../dither-kit/bar-chart";
import { Bar } from "../dither-kit/bar";
import { XAxis } from "../dither-kit/x-axis";
import { YAxis } from "../dither-kit/y-axis";
import { Tooltip } from "../dither-kit/tooltip";
import { DitherGradient } from "../dither-kit/gradient";
import { PieChart } from "../dither-kit/pie-chart";
import { Pie } from "../dither-kit/pie";
import { Legend } from "../dither-kit/legend";
import { useSyncExternalStore, memo, useCallback } from "react";

const COLORS = {
  bg: '#1e1e1e', // Matches sidebar
  card: '#0A0A0A', // From Workspace.jsx
  profileCard: '#22262B', // From Profile.jsx
  textPrimary: '#D1D5DB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',
};

const ALL_BADGES = [
  { id: 'feather',   name: 'Feather',   description: 'Beginner',          requirement: 'Complete 24 hours on the app',        requiredDays: 1,   imageUrl: '/badges/firstlevel.webp'  },
  { id: 'shard',     name: 'Shard',     description: 'Growing Stronger',  requirement: 'Complete 10 days on the app',         requiredDays: 10,  imageUrl: '/badges/secondlevel.webp' },
  { id: 'scout',     name: 'Scout',     description: 'Explorer',          requirement: 'Complete 1 month on the app',         requiredDays: 30,  imageUrl: '/badges/thirdlevel.webp'  },
  { id: 'hunter',    name: 'Hunter',    description: 'Focus Achiever',    requirement: 'Complete 2 months on the app',        requiredDays: 60,  imageUrl: '/badges/4thlevel.webp'    },
  { id: 'pacific',   name: 'Pacific',   description: 'Calm Consistency',  requirement: 'Stay consistent for 3 months',       requiredDays: 90,  imageUrl: '/badges/fifthlevel.webp'  },
  { id: 'nova',      name: 'Nova',      description: 'Big Breakthrough',  requirement: 'Stay consistent for 5 months',       requiredDays: 150, imageUrl: '/badges/sixthlevel.webp'  },
  { id: 'phantom',   name: 'Phantom',   description: 'Elite',             requirement: 'Stay consistent for 8 months',       requiredDays: 240, imageUrl: '/badges/seventhlevel.webp'},
  { id: 'monarch',   name: 'Monarch',   description: 'Legendary',         requirement: 'Stay consistent for 10 months',      requiredDays: 300, imageUrl: '/badges/eightlevel.webp'  },
  { id: 'celestial', name: 'Celestial', description: 'Highest Rank',      requirement: 'Stay consistent for 12 months',      requiredDays: 365, imageUrl: '/badges/ninelevel.webp'   },
  { id: 'crowned',   name: 'Crowned',   description: "Honorable", requirement: 'Stay consistent for 12 months and 1 day', requiredDays: 366, imageUrl: '/badges/lastlevel.webp' },
];

const MockCurrentTimeLine = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const h = now.getHours();
    const m = now.getMinutes();
    const top = (h * 60) + m;
    
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); 

    return (
        <div className="absolute left-0 right-0 z-50 flex items-center pointer-events-none" style={{ top: `${top}px` }}>
            <div className="bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ml-1 shadow-[0_2px_4px_rgba(255,59,48,0.4)]">
                {timeString}
            </div>
            <div className="flex-1 h-[2px] bg-[#FF3B30] shadow-[0_0_5px_rgba(255,59,48,0.5)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] -ml-1 shadow-[0_0_5px_rgba(255,59,48,0.5)]"></div>
        </div>
    )
}


// --- ANALYTICS MOCK COMPONENTS ---
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
            className={`w-full bg-[#1A1A1A] border border-white/5 rounded-xl relative overflow-hidden flex flex-col h-[130px] group transition-colors duration-500 hover:bg-[#222222] hover:border-transparent shadow-sm ${isWaving ? 'bg-[#222222] border-transparent' : ''}`}
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


const MockAnalytics = () => {
    
    
    const [profile] = useState({
        name: "Marcel",
        totalFocusTimeAllTime: 36000, 
        longestStreak: 5,
        currentStreak: 2,
        averageSessionLength: 2400 
    });
    const [weeklyData] = useState([
        { day: "Mon", hours: 2 },
        { day: "Tue", hours: 4 },
        { day: "Wed", hours: 1.5 },
        { day: "Thu", hours: 5 },
        { day: "Fri", hours: 3 },
        { day: "Sat", hours: 6 },
        { day: "Sun", hours: 2.5 }
    ]);
    const [chartAnimReady, setChartAnimReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setChartAnimReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const chartConfig = { hours: { label: "Focus Hours", color: "blue" } };
    const firstName = profile.name ? profile.name.split(' ')[0] : 'Hustler';

    return (
        <div className="h-full w-full text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden pb-0">
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

            


            {/* 🔥 FIX 1: pt-24 md:pt-8 (was pt-28 md:pt-16) */}
            <div className="w-full max-w-[1800px] mx-auto pl-2 md:pl-6 pr-2 md:pr-6 pt-4 flex flex-col gap-8 relative z-10">
                
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
                        className="w-full rounded-2xl border border-white/10 bg-[#1A1A1A] flex flex-col overflow-hidden shadow-sm relative group transition-colors duration-500 hover:bg-[#222222]"
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
                                        className="absolute top-0 right-0 bg-[#1A1A1A] pointer-events-none z-10"
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


                </motion.main>
            </div>

            


        </div>
    );
};



const AppDemoWindow = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // --- Profile State ---
  const activeDays = 25; 
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("I am a new user, excited to join LockedIn!");


function createStore(initialState) {
    const store = {
        state: initialState,
        listeners: new Set(),
        getState() { return this.state; },
        setState(newState) {
            let hasChanges = false;
            for (let key in newState) {
                if (this.state[key] !== newState[key]) hasChanges = true;
            }
            if (!hasChanges) return;
            this.state = { ...this.state, ...newState };
            this.listeners.forEach(l => l());
        },
        subscribe(listener) {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }
    };
    return store;
}

const timerStore = createStore({ isRunning: false, time: 0, taskName: "", strictMode: false, sessionId: null });
const statsStore = createStore({ totalDaytime: 0, totalSessions: 0 }); 
const toastStore = createStore({ toasts: [] }); 

const useTimer = (selector) => useSyncExternalStore((l) => timerStore.subscribe(l), () => selector(timerStore.getState()));
const useStats = (selector) => useSyncExternalStore((l) => statsStore.subscribe(l), () => selector(statsStore.getState()));
const useToast = (selector) => useSyncExternalStore((l) => toastStore.subscribe(l), () => selector(toastStore.getState()));

const showToast = (message) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const id = new Date().getTime();
    const currentToasts = toastStore.getState().toasts;
    toastStore.setState({ toasts: [...currentToasts, { id, message }] });
    setTimeout(() => {
        const remainingToasts = toastStore.getState().toasts.filter(t => t.id !== id);
        toastStore.setState({ toasts: remainingToasts });
    }, 3000);
};
const heavyCardStyle = {
    background: 'linear-gradient(180deg, #1A1A1A 0%, #121212 100%)', 
    border: `1px solid rgba(255, 255, 255, 0.04)`, 
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02), 0 8px 24px rgba(0,0,0,0.3)'
};

const heavyInputStyle = {
    background: '#0a0a0a', 
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
};

const secondaryButtonStyle = {
    background: 'linear-gradient(180deg, #1e1e1e 0%, #141414 100%)', 
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.3)'
};

const capsuleStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.5)',
    padding: '6px 14px',
    borderRadius: '999px',
    display: 'inline-block'
};
const ToastOverlay = memo(() => {
    const toasts = useToast(s => s.toasts);
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="bg-[#22262B] text-[#E0E0E0] px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10 font-medium text-[14px] flex items-center gap-3 backdrop-blur-xl"
                        style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                    >
                        {t.message.includes("Saved") ? <Target size={16} className="text-[#34D399]" /> : <Play size={16} className="text-[#60A5FA]" />}
                        {t.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

const Header = memo(() => (
    <div className="w-full mb-2 md:mb-3 mt-4 md:mt-0 flex-shrink-0">
        <h1 className="text-lg md:text-[24px] font-bold tracking-tight text-[#E0E0E0]">Focus Session</h1>
        <p className="hidden sm:block text-[13px] md:text-[14px] text-[#A3A3A3] mt-2 font-medium">Track and save your deep work intervals.</p>
    </div>
));

const QuickStats = memo(() => {
    const totalDaytime = useStats(s => s.totalDaytime);
    const totalSessions = useStats(s => s.totalSessions);

    // 🔥 FIX: Agar ek bhi session formally save nahi hua (0 sessions), toh timer ko completely ZERO (0) force kar do.
    const validDaytime = totalSessions === 0 ? 0 : totalDaytime;

    const hours = Math.floor(validDaytime / 3600);
    const minutes = Math.floor((validDaytime % 3600) / 60);

    return (
        <div className="w-full flex flex-row gap-3 md:gap-4 flex-shrink-0">
            <div className="w-full md:w-1/2 rounded-[20px] md:rounded-[28px] p-4 md:p-5 flex flex-col justify-between" style={heavyCardStyle}>
                <div className="flex items-center">
                    <h3 className="text-[10px] md:text-[12px] font-bold tracking-[0.15em] text-[#E0E0E0] uppercase" style={capsuleStyle}>
                        Today's Progress
                    </h3>
                </div>
                <div className="flex flex-row justify-between items-end w-full mt-2">
                    <div className="flex flex-col items-start">
                        <div className="text-lg md:text-[28px] font-bold text-[#E0E0E0] tracking-tight leading-none">{hours}h {minutes}m</div>
                        <div className="text-[11px] md:text-[13px] text-[#A3A3A3] mt-1 font-medium">Focus Time</div>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <div className="text-lg md:text-[28px] font-bold text-[#E0E0E0] tracking-tight leading-none">{totalSessions}</div>
                        <div className="text-[11px] md:text-[13px] text-[#A3A3A3] mt-1 font-medium">Sessions</div>
                    </div>
                </div>
            </div>
            
            <div className="hidden md:flex w-1/2 rounded-[28px] p-5 flex-col justify-between" style={heavyCardStyle}>
                <div className="flex items-center mb-2">
                    <h3 className="text-[10px] md:text-[12px] font-bold tracking-[0.15em] text-[#E0E0E0] uppercase" style={capsuleStyle}>
                        Quick Guide
                    </h3>
                </div>
                <div className="flex flex-row items-center gap-3 mt-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0" style={heavyInputStyle}>
                        <Target size={20} strokeWidth={1.5} className="text-[#A3A3A3]" />
                    </div>
                    <div>
                        <h4 className="text-[#E0E0E0] font-semibold mb-1 text-[15px]">Stay Locked In</h4>
                        <p className="text-[13px] text-[#A3A3A3] leading-relaxed font-medium">Enter your task, start the timer, and focus deeply.</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

const TaskInput = memo(() => {
    const taskName = useTimer(s => s.taskName);
    const isRunning = useTimer(s => s.isRunning);
    
    return (
        <div className="w-full mb-2 md:mb-4 flex-shrink-0">
            <label className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#A3A3A3] uppercase mb-1.5 block ml-2">Current Task</label>
            <div className="w-full flex items-center gap-3 md:gap-4 rounded-[12px] md:rounded-2xl px-3 py-2.5 md:px-5 md:py-3.5 transition-all" style={heavyInputStyle}>
                <Target size={18} className={`flex-shrink-0 md:w-5 md:h-5 ${isRunning ? 'text-[#E0E0E0]' : 'text-[#A3A3A3]'}`} />
                <input 
                    type="text" value={taskName} onChange={(e) => timerStore.setState({ taskName: e.target.value })}
                    placeholder="What are you focusing on?" 
                    className="bg-transparent border-none outline-none text-[#E0E0E0] placeholder:text-[#737373] w-full text-[14px] md:text-[16px] font-medium"
                />
            </div>
        </div>
    );
});

const StrictModeToggle = memo(() => {
    const strictMode = useTimer(s => s.strictMode);
    
    return (
        <div className="flex items-center justify-end w-full pr-2 mb-1 md:mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
                <span className={`text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase transition-colors ${strictMode ? 'text-[#E0E0E0]' : 'text-[#A3A3A3]'}`}>
                    Strict Mode
                </span>
                
                {/* 🔥 PURE CSS BRUTALIST SWITCH 🔥 */}
                <label className="switch sw-10">
                    <input 
                        type="checkbox" 
                        tabIndex="-1" 
                        checked={strictMode}
                        onChange={(e) => timerStore.setState({ strictMode: e.target.checked })} 
                    />
                    <span className="track"><span className="thumb"></span></span>
                </label>
            </div>
        </div>
    );
});

const AnimatedDigit = memo(({ digit }) => (
    <div className="relative inline-block overflow-hidden" style={{ width: '1ch', height: '1.2em' }}>
        <AnimatePresence>
            <motion.span 
                key={digit} 
                initial={{ y: "100%", opacity: 0 }} 
                animate={{ y: "0%", opacity: 1 }} 
                exit={{ y: "-100%", opacity: 0 }} 
                transition={{ type: "spring", stiffness: 350, damping: 30 }} 
                className="absolute inset-0 flex items-center justify-center"
            >
                {digit}
            </motion.span>
        </AnimatePresence>
    </div>
));

const DigitSubscriber = memo(({ selector }) => {
    const digit = useTimer(selector);
    return <AnimatedDigit digit={digit} />;
});

const TimerDigits = memo(() => (
    <div className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[86px] font-black tabular-nums leading-none flex items-center justify-center select-none text-[#888888] w-full"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif", letterSpacing: '-0.04em' }}>
        <DigitSubscriber selector={s => Math.floor(s.time / 600)} />
        <DigitSubscriber selector={s => Math.floor((s.time / 60) % 10)} />
        <span className="text-[#555555] font-bold mx-1 sm:mx-2 md:mx-4" style={{ transform: 'translateY(-6%)' }}>:</span>
        <DigitSubscriber selector={s => Math.floor((s.time % 60) / 10)} />
        <DigitSubscriber selector={s => s.time % 10} />
    </div>
));


const fetchTodayStats = async () => {
    statsStore.setState({ totalDaytime: 3600, totalSessions: 4 });
};



const handleStartBackend = async () => {
    timerStore.setState({ sessionId: 'mock-session-id' });
};



const handleStopBackend = async (sessionId, isFinalSave = false) => {
    if (isFinalSave) {
        const state = statsStore.getState();
        statsStore.setState({ totalSessions: state.totalSessions + 1, totalDaytime: state.totalDaytime + timerStore.getState().time });
    }
};


const StartPauseButton = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    const handleStartPause = useCallback(() => {
        const state = timerStore.getState();
        const newState = !state.isRunning;
        timerStore.setState({ isRunning: newState });
        if (newState) {
            showToast("Timer Started");
            handleStartBackend(state.taskName);
        } else {
            showToast("Timer Paused");
            handleStopBackend(state.sessionId, false);
        }
    }, []);

    return (
        <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:w-56">
            <DitherButton 
                color="blue" 
                variant="hatched" 
                bloom="aura" 
                onClick={handleStartPause}
                className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 font-semibold text-[14px] md:text-[15px] text-white"
            >
                <AnimatePresence mode="wait">
                    <motion.div key={isRunning ? 'pause' : 'play'} initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.15 }}>
                        {isRunning ? <Pause size={20} fill="currentColor" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> : <Play size={20} fill="currentColor" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />}
                    </motion.div>
                </AnimatePresence>
                {isRunning ? 'Pause' : 'Start'}
            </DitherButton>
        </motion.div>
    );
});

const SaveButton = memo(() => {
    const hasTime = useTimer(s => s.time > 0);
    const handleSave = useCallback(() => {
        const state = timerStore.getState();
        if (state.time > 0) {
            handleStopBackend(state.sessionId, true); 
            showToast("Session Saved Successfully!");
            timerStore.setState({ isRunning: false, time: 0, taskName: "", sessionId: null }); 
        }
    }, []);

    return (
        <motion.button onClick={handleSave} disabled={!hasTime} whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 sm:px-0 sm:w-36 py-2.5 md:py-3 rounded-[14px] md:rounded-2xl font-medium text-[14px] md:text-[15px] text-[#A3A3A3] hover:text-[#E0E0E0] transition-colors duration-200" style={secondaryButtonStyle}
        >
            <Save size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Save</span>
        </motion.button>
    );
});

const ResetButton = memo(() => {
    const hasTime = useTimer(s => s.time > 0);
    const handleReset = useCallback(() => {
        const state = timerStore.getState();
        
        // 🔥 Send isReset: true explicitly to backend
        
        
        timerStore.setState({ isRunning: false, time: 0, sessionId: null });
    }, []);

    return (
        <motion.button onClick={handleReset} disabled={!hasTime} whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-[46px] h-[46px] sm:w-[64px] sm:h-auto py-0 sm:py-3 rounded-[14px] md:rounded-2xl text-[#A3A3A3] hover:text-[#E0E0E0] transition-colors duration-200" style={secondaryButtonStyle}
        >
            <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" />
        </motion.button>
    );
});
const ControlsBar = memo(() => (
    <div className="flex flex-row items-center gap-2 md:gap-4 w-full justify-center mt-auto flex-shrink-0">
        <StartPauseButton />
        <SaveButton />
        <ResetButton />
    </div>
));

// 🔥 ULTIMATE BACKGROUND WORKER ENGINE (Zero Lag, Zero Jump) 🔥
const TimerEngine = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    
    useEffect(() => {
        if (!isRunning) return;

        const startTimestamp = Date.now();
        const startAccumulatedTime = timerStore.getState().time;
        
        const tick = () => {
            const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
            timerStore.setState({ time: startAccumulatedTime + elapsedSeconds });
        };

        const workerCode = `
            let interval;
            self.onmessage = function(e) {
                if (e.data === 'start') {
                    interval = setInterval(() => {
                        self.postMessage('tick');
                    }, 250);
                } else if (e.data === 'stop') {
                    clearInterval(interval);
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);

        worker.onmessage = () => {
            tick();
        };

        worker.postMessage('start'); 

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') tick();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            worker.postMessage('stop');
            worker.terminate(); 
            URL.revokeObjectURL(blobUrl);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isRunning]);
    
    return null; 
});

const SystemEffects = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    const time = useTimer(s => s.time);

    useEffect(() => {
        if (isRunning || time > 0) {
            const m = Math.floor(time / 60);
            const s = time % 60;
            document.title = `(${Math.floor(m/10)}${m%10}:${Math.floor(s/10)}${s%10}) LockedIn Focus`;
        } else {
            document.title = 'LockedIn | Focus';
        }
    }, [isRunning, time]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            const state = timerStore.getState();
            if (state.strictMode && document.visibilityState === 'hidden' && state.isRunning) {
                timerStore.setState({ isRunning: false });
                handleStopBackend(state.sessionId, false);
                showToast("Timer Paused (Strict Mode)");
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            const state = timerStore.getState();
            
            if (e.code === 'Space') { 
                e.preventDefault(); 
                const newState = !state.isRunning;
                timerStore.setState({ isRunning: newState }); 
                if (newState) {
                    showToast("Timer Started");
                    handleStartBackend(state.taskName);
                } else {
                    showToast("Timer Paused");
                    handleStopBackend(state.sessionId, false);
                }
            } 
            else if (e.code === 'Escape') { 
                e.preventDefault(); 
                if (state.isRunning) {
                    handleStopBackend(state.sessionId, false);
                }
                const sessionId = state.sessionId;
                timerStore.setState({ isRunning: false, time: 0, sessionId: null }); 
            } 
            else if (e.code === 'Enter') {
                e.preventDefault();
                if (state.time > 0) {
                    handleStopBackend(state.sessionId, true);
                    showToast("Session Saved Successfully!");
                    timerStore.setState({ isRunning: false, time: 0, taskName: "", sessionId: null }); 
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return null;
});

const FocusCard = memo(() => {
    return (
        <div className="w-full rounded-[24px] md:rounded-[32px] p-4 md:p-6 flex flex-col relative" style={heavyCardStyle}>
            <TaskInput />
            <StrictModeToggle />
            
            <div className="flex-1 flex flex-col justify-center items-center py-2 md:py-8 w-full">
                <TimerDigits />
            </div>
            
            <ControlsBar />
            <TimerEngine />
            <SystemEffects />
        </div>
    );
});

const MainContainer = memo(({ children }) => {
    return (
        <main className="w-full h-full flex flex-col justify-start items-center px-4 sm:px-6 md:px-8 py-3 md:py-4 transition-all duration-300 relative z-10">
            {children}
        </main>
    );
});

  const renderStopwatch = () => {
    return (
        <>
            <style>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                /* =========================================
                   🔥 PURE CSS BRUTALIST SWITCH 🔥
                   ========================================= */
                .switch {
                  /* Theme tokens — override these to recolour the switch */
                  --primary: #F4FF2B;
                  --secondary: #0F191E;
                  --surface: #E2F1F2;
                  --on: var(--secondary);                                       
                  --off: color-mix(in srgb, var(--secondary) 22%, var(--surface)); 
                  --thumb: var(--surface);
                  position: relative;
                  display: inline-flex;
                  cursor: pointer;
                  -webkit-tap-highlight-color: transparent;
                }
                .switch input { position: absolute; opacity: 0; width: 0; height: 0; }
                .switch .track {
                  position: relative;
                  width: 52px; height: 28px;
                  border-radius: 9999px;
                  background: var(--off);
                  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .switch .thumb {
                  position: absolute;
                  top: 3px; left: 3px;
                  width: 22px; height: 22px;
                  border-radius: 50%;
                  background: var(--thumb);
                  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, box-shadow 0.3s ease;
                }
                .switch input:checked + .track { background: var(--on); }
                .switch input:checked + .track .thumb { transform: translateX(24px); }
                .switch input:focus-visible + .track { outline: 2px solid var(--primary); outline-offset: 2px; }

                /* .sw-10 Variation */
                .sw-10 .track { background: var(--surface); border: 2px solid var(--secondary); box-shadow: 3px 3px 0 var(--secondary); }
                .sw-10 .thumb { top: 1px; left: 1px; background: var(--secondary); }
                .sw-10 input:checked + .track { background: var(--primary); }

                /* Respect prefers-reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                  .switch .track, .switch .thumb { transition: none !important; }
                }
            `}</style>

            <div className="h-full w-full relative font-sans text-white selection:bg-white/20 flex" style={{ backgroundColor: "transparent" }}>
                <ToastOverlay /> 
                
                                            {activeTab === 'analytics' && (
                                                <div className="w-full h-full p-4 md:p-6 overflow-y-auto hide-scrollbar relative">
                                                    <MockAnalytics />
                                                </div>
                                            )}

{/* ... baaki sab same rahega ... */}
                
                {/* 🔥 NAYA SIDEBAR COMPONENT YAHAN AAGAYA 🔥 */}
                
                
                <MainContainer>
                    <div className="w-full max-w-5xl mx-auto flex flex-col justify-start w-full">
                        <Header />
                        <div className="w-full flex flex-col gap-3 md:gap-4 pb-2 md:pb-0">
                            <FocusCard />
                            <QuickStats />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </>
    );
  };

  // --- Calendar State ---
  const [calView, setCalView] = useState('month');
  const [calDate, setCalDate] = useState(new Date());
  const [calSelectedDate, setCalSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [calExpandedDays, setCalExpandedDays] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', color: '#10B981', type: 'normal' }); 
  const allEvents = [
    { _id: '1', title: 'Team Sync', color: '#0A84FF', type: 'normal', date: new Date().toLocaleDateString('en-CA'), createdAt: new Date(new Date().setHours(10, 0)).toISOString() },
    { _id: '2', title: 'Design Review', color: '#FF3B30', type: 'important', date: new Date().toLocaleDateString('en-CA'), createdAt: new Date(new Date().setHours(14, 30)).toISOString() },
  ];

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeCalMonth = (offset) => {
        setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + offset, 1));
        setCalExpandedDays({}); 
    };

    const handleDayClick = (dayStr) => {
        setCalSelectedDate(dayStr);
        if (window.innerWidth >= 768) {
            setEventForm({ title: '', color: '#10B981', type: 'normal' });
            setShowModal(true);
        }
    };

    const formatDateHeader = (dateStr) => {
        if (!dateStr) return 'Select a date';
        const d = new Date(dateStr);
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        const day = d.getDate();
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        return `${weekday} — ${day} ${month} ${year}`;
    }

    const getEventTime = (evt) => {
        if (evt.createdAt) {
            const d = new Date(evt.createdAt);
            if (!isNaN(d.getTime())) return { h: d.getHours(), m: d.getMinutes() };
        }
        return { h: 10, m: 0 }; 
    }

    const formatAppleTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        if (m === 0) return `${hour12} ${ampm}`;
        const min = m < 10 ? `0${m}` : m;
        return `${hour12}:${min} ${ampm}`;
    }

    const displayTimeRange = (h, m) => {
        const start = formatAppleTime(h, m);
        const endH = (h + 1) % 24;
        const end = formatAppleTime(endH, m);
        return `${start.replace(' ', '')} - ${end.replace(' ', '')}`;
    }

    const getEventLayout = (dateEvents) => {
        let eventsLayout = dateEvents.map(evt => {
            const t = getEventTime(evt);
            const top = (t.h * 60) + t.m;
            return { evt, top, bottom: top + 60 };
        });

        eventsLayout.sort((a, b) => a.top - b.top);

        const clusters = [];
        let currentCluster = [];
        let clusterEnd = -1;

        eventsLayout.forEach(item => {
            if (currentCluster.length === 0) {
                currentCluster.push(item);
                clusterEnd = item.bottom;
            } else if (item.top < clusterEnd) {
                currentCluster.push(item);
                clusterEnd = Math.max(clusterEnd, item.bottom);
            } else {
                clusters.push(currentCluster);
                currentCluster = [item];
                clusterEnd = item.bottom;
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        const layout = [];
        clusters.forEach(cluster => {
            const columns = [];
            cluster.forEach(item => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const column = columns[i];
                    const lastItem = column[column.length - 1];
                    if (item.top >= lastItem.bottom - 1) { 
                        column.push(item);
                        placed = true;
                        break;
                    }
                }
                if (!placed) columns.push([item]);
            });

            const numColumns = columns.length;
            const widthPercent = 100 / numColumns;

            columns.forEach((col, colIndex) => {
                col.forEach(item => {
                    layout.push({
                        evt: item.evt,
                        top: item.top,
                        widthPercent: widthPercent,
                        leftPercent: colIndex * widthPercent
                    });
                });
            });
        });

        return layout;
    }

    
const renderMonthGrid = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const totalCells = firstDay + daysInMonth;
        const totalWeeks = Math.ceil(totalCells / 7); 
        const prevMonthDays = new Date(year, month, 0).getDate(); 

        const grid = [];
        let cellIndex = 0; 
        
        const todayStr = new Date().toLocaleDateString('en-CA'); 

        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            grid.push(
                <div key={`prev-${i}`} className="relative md:border-r md:border-b border-[#38383A] max-md:h-[48px] max-md:bg-transparent max-md:opacity-40 md:bg-[#141415] md:opacity-40">
                  <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                      <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 w-full h-full md:h-auto relative">
                          <span className="text-[17px] md:text-[13px] font-semibold text-[#666666] z-10">{dayNum}</span>
                      </div>
                  </div>
                </div>
            );
            cellIndex++;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const m = String(month + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dayStr = `${year}-${m}-${d}`;
            
            const dayEvents = allEvents.filter(e => e.date === dayStr);
            const hasEvents = dayEvents.length > 0;
            const firstEventColor = hasEvents ? (dayEvents[0].type === 'important' ? '#FF3B30' : dayEvents[0].type === 'birthday' ? '#FFD60A' : dayEvents[0].color) : null;
            
            const isToday = dayStr === todayStr;
            const isPast = dayStr < todayStr;
            const isFirstDay = day === 1;

            const isSelected = calSelectedDate === dayStr;

            const cellClasses = isPast 
                ? 'max-md:bg-transparent max-md:opacity-60 md:bg-[#151516] md:opacity-60 md:hover:opacity-100 md:hover:bg-[#222224]' 
                : 'max-md:bg-transparent md:bg-[#1E1E1E] md:hover:bg-[#252528]';

            const isExpanded = calExpandedDays[dayStr];
            const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 2);

            grid.push(
                <div key={day} 
                    onClick={() => setCalSelectedDate(dayStr)}
                    className={`relative group md:border-r md:border-b border-[#38383A] max-md:h-[48px] cursor-pointer transition-all duration-300 md:overflow-hidden ${cellClasses}`}>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                        
                        <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 pointer-events-none w-full h-full md:h-auto relative">
                            
                            {hasEvents && !isToday && !isSelected && (
                                <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full opacity-[0.22]" style={{ backgroundColor: firstEventColor }}></div>
                            )}
                            
                            {isSelected && !isToday && (
                                <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-[#3A3A3C]"></div>
                            )}

                            <div className={`w-[36px] h-[36px] md:w-7 md:h-7 flex items-center justify-center rounded-full transition-all z-10`}>
                                <span className={`flex items-center justify-center transition-all ${isToday ? 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white font-extrabold text-[16px] md:text-[14px] w-full h-full rounded-full shadow-[0_0_15px_rgba(255,59,48,0.5)]' : 'text-[#EBEBF5] font-semibold text-[17px] md:text-[13px] group-hover:text-white'}`}>
                                    {isFirstDay && !isToday ? <><span className="md:hidden">{day}</span><span className="hidden md:inline">1 {monthNames[month].substring(0, 3)}</span></> : day}
                                </span>
                            </div>
                        </div>

                        <div className={`hidden md:flex flex-1 flex-col gap-1 w-full px-1.5 pb-1.5 hide-scrollbar ${isExpanded ? 'overflow-y-auto pointer-events-auto' : 'overflow-hidden'}`}>
                            {visibleEvents.map((evt, idx) => {
                                const isImportant = evt.type === 'important';
                                const isBirthday = evt.type === 'birthday';
                                return (
                                    <div key={idx} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-white/[0.04] border border-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.08] hover:shadow-md transition-all duration-200 cursor-pointer shrink-0">
                                        {isImportant ? <AlertCircle size={12} fill="#FF3B30" color="white" className="shrink-0" /> : isBirthday ? <Gift size={12} color="#FFD60A" strokeWidth={2.5} className="shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: evt.color }}></div>}
                                        <span className={`truncate tracking-wide text-[11.5px] ${isImportant ? 'font-bold text-white' : 'font-medium text-white/90'}`}>{evt.title}</span>
                                    </div>
                                )
                            })}
                            {dayEvents.length > 2 && (
                                <div onClick={(e) => { e.stopPropagation(); setCalExpandedDays(prev => ({ ...prev, [dayStr]: !prev[dayStr] })); }} className="px-2 py-0.5 mt-0.5 text-[11px] font-bold text-[#8E8E93] hover:text-white transition-colors cursor-pointer w-fit rounded-md shrink-0 pointer-events-auto">
                                    {isExpanded ? 'Show less' : `+${dayEvents.length - 2} more`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
            cellIndex++;
        }

        const remainingCells = (totalWeeks * 7) - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const isFirstNextMonth = i === 1;
            const nextMonthShort = monthNames[(month + 1) % 12].substring(0, 3);
            grid.push(
                <div key={`next-${i}`} className="relative md:border-r md:border-b border-[#38383A] max-md:h-[48px] max-md:bg-transparent max-md:opacity-40 md:bg-[#141415] md:opacity-40">
                    <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                        <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 w-full h-full md:h-auto relative">
                            <span className="text-[17px] md:text-[13px] font-semibold text-[#666666] z-10">
                                {isFirstNextMonth ? <><span className="md:hidden">{i}</span><span className="hidden md:inline">1 {nextMonthShort}</span></> : i}
                            </span>
                        </div>
                    </div>
                </div>
            );
            cellIndex++;
        }

        return { grid, totalWeeks };
    };
const renderMiniMonth = (year, monthIndex) => {
        const daysInMonth = getDaysInMonth(year, monthIndex);
        const firstDay = getFirstDayOfMonth(year, monthIndex);
        const prevMonthDays = new Date(year, monthIndex, 0).getDate(); 
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
        const currentDayNum = today.getDate();

        const cells = [];
        
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push(
                <div key={`prev-${i}`} className="flex justify-center items-center pointer-events-none">
                    <span className="text-[10px] md:text-[13px] font-semibold text-[#48484A]">
                        {prevMonthDays - i}
                    </span>
                </div>
            );
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === currentDayNum;
            
            const m = String(monthIndex + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const dayStr = `${year}-${m}-${dStr}`;
            
            const dayEvents = allEvents.filter(e => e.date === dayStr);
            const hasEvents = dayEvents.length > 0;
            
            cells.push(
                <div key={`curr-${day}`} 
                     className="flex justify-center items-center cursor-pointer relative z-10 group/cell"
                     onClick={(e) => {
                         e.stopPropagation(); 
                         setCalSelectedDate(dayStr); 
                         setCalDate(new Date(year, monthIndex, 1));
                         setCalView('month');
                     }}
                >
                    <div className="relative flex justify-center items-center w-5 h-5 md:w-7 md:h-7 rounded-full transition-all">
                        {/* Event indicator (No dot) */}
                        {hasEvents && !isToday && (
                            <div className="absolute inset-0 rounded-full bg-white/[0.08] group-hover/cell:bg-white/[0.15] transition-colors shadow-sm"></div>
                        )}
                        
                        <span className={`relative z-10 w-full h-full flex items-center justify-center rounded-full text-[10px] md:text-[13px] font-semibold transition-all ${isToday ? 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white shadow-[0_0_12px_rgba(255,59,48,0.5)]' : hasEvents ? 'text-white' : 'text-[#EBEBF5] group-hover/cell:bg-white/[0.05]'}`}>
                            {day}
                        </span>
                    </div>
                </div>
            );
        }
        
        const remainingCells = 42 - cells.length; 
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(
                <div key={`next-${i}`} className="flex justify-center items-center pointer-events-none">
                    <span className="text-[10px] md:text-[13px] font-semibold text-[#48484A]">
                        {i}
                    </span>
                </div>
            );
        }
        
        return cells;
    }

  const renderCalendar = () => {
    return (
        <div className="h-screen w-full bg-[#1E1E1E] text-white flex flex-col font-sans overflow-hidden selection:bg-[#FF3B30]/30 relative">
            
            {/* 🔥 NAYA SIDEBAR COMPONENT YAHAN AAGAYA */}
            

           <div className="flex flex-col md:flex-row items-center justify-between pl-[92px] md:pl-[100px] pr-4 md:pr-8 pt-[30px] pb-4 md:pb-5 shrink-0 bg-[#1E1E1E] gap-4 md:gap-0 z-10 relative min-h-[96px]">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-white drop-shadow-sm leading-none flex items-center gap-1">
                        <ChevronLeft className="md:hidden text-[#FF3B30] -ml-2 cursor-pointer shrink-0" size={32} strokeWidth={2.5} onClick={() => changeCalMonth(-1)} />
                        {calView === 'month' ? monthNames[calDate.getMonth()] : ''} <span className="hidden md:inline text-[#EBEBF5]/50 font-medium ml-1">{calDate.getFullYear()}</span>
                    </h1>
                    <button onClick={() => {
                        if (!calSelectedDate) setCalSelectedDate(new Date().toLocaleDateString('en-CA'));
                        setEventForm({ title: '', color: '#10B981', type: 'normal' });
                        setShowModal(true);
                    }} className="md:hidden flex items-center justify-center p-1 text-[#FF3B30] hover:bg-white/10 rounded-full transition-colors shrink-0">
                        <Plus size={30} strokeWidth={2.5}/>
                    </button>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto mt-1 md:mt-0">
                    <div className="flex bg-[#121212] rounded-full p-1 border border-white/[0.05] shadow-inner mr-2 md:mr-0">
                        <button onClick={() => setCalView('month')} className={`px-4 md:px-7 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-300 ${calView === 'month' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Month</button>
                        <button onClick={() => setCalView('year')} className={`px-4 md:px-7 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-300 ${calView === 'year' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Year</button>
                    </div>

                    <div className="flex items-center gap-1 md:gap-3">
                        <button onClick={() => changeCalMonth(calView === 'month' ? -1 : -12)} className="hidden md:block p-1.5 md:p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronLeft size={20} strokeWidth={2.5} /></button>
                        <button onClick={() => setCalDate(new Date())} className="px-3 md:px-5 py-1.5 rounded-full bg-[#121212] border border-white/[0.05] text-[12px] md:text-[13px] font-bold text-[#EBEBF5] hover:text-white transition-all shadow-sm">Today</button>
                        <button onClick={() => changeCalMonth(calView === 'month' ? 1 : 12)} className="p-1.5 md:p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronRight size={20} strokeWidth={2.5} /></button>
                        <button onClick={() => {
                            if (!calSelectedDate) setCalSelectedDate(new Date().toLocaleDateString('en-CA'));
                            setEventForm({ title: '', color: '#10B981', type: 'normal' });
                            setShowModal(true);
                        }} className="hidden md:flex items-center ml-2 gap-1.5 px-4 py-1.5 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] text-[13px] font-bold hover:bg-[#0A84FF]/20 transition-colors">
                            Add Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1E1E1E] min-h-0 relative z-10">
                {calView === 'month' && (() => {
                    const { grid, totalWeeks } = renderMonthGrid(calDate.getFullYear(), calDate.getMonth());
                    const calSelectedDateEvents = allEvents.filter(e => e.date === calSelectedDate);

                    return (
                        <>
                            <div className="hidden md:grid grid-cols-7 shrink-0 border-b border-[#38383A] bg-[#1E1E1E]">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="py-2.5 text-right pr-3 text-[13px] font-bold tracking-wider text-[#EBEBF5]/60 uppercase">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="hidden md:grid flex-1 grid-cols-7 min-h-0 shrink-0" style={{ gridTemplateRows: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
                                {grid}
                            </div>

                            <div className="md:hidden bg-[#1E1E1E] shrink-0 mt-1">
                                <div className="grid grid-cols-7 mb-1.5 px-1">
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="text-center text-[10px] font-extrabold text-[#8E8E93] uppercase">
                                            {day.substring(0, 1)}
                                        </div>
                                    ))}
                                </div>
                                
                                <div 
                                    className="flex overflow-x-auto snap-x snap-mandatory w-full hide-scrollbar border-b border-[#38383A] pb-3" 
                                >
                                    {Array.from({ length: totalWeeks }).map((_, i) => (
                                        <div key={i} className="w-full shrink-0 snap-center grid grid-cols-7 px-1">
                                            {grid.slice(i * 7, (i + 1) * 7)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:hidden flex-1 flex flex-col min-h-0 bg-[#121212]">
                                <div className="px-5 py-3 shrink-0 bg-[#1A1A1C] border-b border-[#38383A] flex items-center justify-between shadow-sm z-20">
                                    <h3 className="text-white font-bold text-[15px]">
                                        {formatDateHeader(calSelectedDate)}
                                    </h3>
                                    <span className="text-[#8E8E93] text-[12px] font-semibold bg-[#2C2C2E] px-2 py-0.5 rounded-full">
                                        {calSelectedDateEvents.length} Tasks
                                    </span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto relative bg-[#1E1E1E] scroll-smooth">
                                    
                                    {calSelectedDate === new Date().toLocaleDateString('en-CA') && (
                                        <MockCurrentTimeLine />
                                    )}

                                    <div className="flex flex-col relative w-full h-[1440px]">
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} className="h-[60px] flex items-start border-t border-[#38383A]/50 relative w-full">
                                                <span className="text-[#8E8E93] text-[11px] font-medium w-[50px] text-right pr-2 -mt-[7.5px] bg-[#1E1E1E]">
                                                    {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="absolute top-0 bottom-0 left-[55px] right-[12px]">
                                            {getEventLayout(calSelectedDateEvents).map((item) => {
                                                const { evt, top, widthPercent, leftPercent } = item;
                                                const { h, m } = getEventTime(evt);
                                                
                                                return (
                                                    <div key={evt._id || evt.tempId} 
                                                         className="absolute p-2 flex flex-col justify-start rounded-r-lg rounded-l-[3px] border-l-[3.5px] shadow-sm overflow-hidden"
                                                         style={{ 
                                                             top: `${top}px`, 
                                                             height: '58px', 
                                                             left: `calc(${leftPercent}% + 1px)`,
                                                             width: `calc(${widthPercent}% - 2px)`,
                                                             backgroundColor: `${evt.color}25`, 
                                                             borderColor: evt.color,
                                                             backdropFilter: 'blur(5px)'
                                                         }}>
                                                         <span className="text-[14px] font-bold text-white/95 leading-tight truncate">{evt.title}</span>
                                                         <span className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1 font-semibold truncate">
                                                             <Clock size={10} className="shrink-0" />
                                                             {displayTimeRange(h, m)}
                                                         </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                })()}

                {/* 🚀 APPLE STYLE "LOCKEDIN" TOUCH YEAR VIEW */}
                {calView === 'year' && (
                    <div className="flex-1 overflow-y-auto p-2 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4 md:gap-8 min-h-0 pb-12">
                        {monthNames.map((month, idx) => (
                            <div key={month} 
                                 className="flex flex-col group bg-[#1A1A1C]/30 hover:bg-[#1A1A1C]/70 border border-transparent hover:border-white/[0.04] p-2 md:p-4 rounded-[12px] md:rounded-[20px] transition-all duration-300 shadow-sm" 
                                 onClick={() => { setCalDate(new Date(calDate.getFullYear(), idx, 1)); setCalView('month'); }}>
                                
                                <h3 className="text-[#FF3B30] font-extrabold text-[15px] md:text-[22px] mb-2 md:mb-3 transition-colors group-hover:text-[#FF453A] pl-1 drop-shadow-sm flex items-center justify-between cursor-pointer">
                                    {month}
                                    <ChevronRight size={18} strokeWidth={3} className="text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
                                </h3>
                                
                                <div className="grid grid-cols-7 gap-y-1 gap-x-0 md:gap-x-1">
                                    {['S','M','T','W','T','F','S'].map((d, i) => (
                                        <div key={`header-${i}`} className="text-center text-[9px] md:text-[11px] font-bold text-[#8E8E93] mb-1">
                                            {d}
                                        </div>
                                    ))}
                                    {renderMiniMonth(calDate.getFullYear(), idx)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 transition-all"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.12] w-full max-w-[340px] rounded-[24px] p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] animate-fade-in relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
                            
                            <div className="bg-[#323234]/80 rounded-[18px] flex items-center justify-between px-4 py-3.5 mb-2 shadow-inner border border-white/[0.03]">
                                <input 
                                    required 
                                    autoFocus
                                    type="text" 
                                    value={eventForm.title} 
                                    onChange={e => setEventForm({...eventForm, title: e.target.value})} 
                                    placeholder="New Event" 
                                    className="bg-transparent text-white text-[22px] font-semibold w-full outline-none placeholder-[#8E8E93] caret-[#0A84FF]" 
                                />
                                
                                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1.5 cursor-pointer ml-3 shrink-0 hover:bg-white/20 transition-all shadow-sm border border-white/5">
                                    <input 
                                        type="color" 
                                        value={eventForm.color} 
                                        onChange={e => setEventForm({...eventForm, color: e.target.value})} 
                                        className="apple-color-picker cursor-pointer"
                                    />
                                    <div className="flex flex-col pointer-events-none opacity-60">
                                        <ChevronLeft size={10} strokeWidth={3} className="rotate-90 -mb-[2px] text-white" />
                                        <ChevronLeft size={10} strokeWidth={3} className="-rotate-90 -mt-[2px] text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#323234]/80 rounded-[16px] px-4 py-3.5 mb-2 shadow-inner border border-white/[0.03]">
                                <span className="text-white text-[15px] font-medium">{calSelectedDate}</span>
                            </div>

                            <div className="bg-[#323234]/80 rounded-[16px] px-4 py-3 shadow-inner border border-white/[0.03] flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-white/80 text-[15px] font-medium pointer-events-none">Event Type</span>
                                <div className="relative flex items-center">
                                    <select 
                                        value={eventForm.type} 
                                        onChange={e => setEventForm({...eventForm, type: e.target.value})} 
                                        className="bg-white/10 hover:bg-white/20 transition-all text-white text-[14px] font-semibold outline-none appearance-none cursor-pointer rounded-lg pl-3 pr-8 py-1.5 shadow-sm border border-white/5"
                                    >
                                        <option value="normal" className="bg-[#28282B] text-white">Normal</option>
                                        <option value="important" className="bg-[#28282B] text-white">Important</option>
                                        <option value="birthday" className="bg-[#28282B] text-white">Birthday</option>
                                    </select>
                                    <ChevronRight size={14} strokeWidth={3} className="text-white/50 absolute right-2.5 pointer-events-none group-hover:text-white/80 transition-colors" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2 mt-3 mb-1">
                                <button type="button" onClick={() => setShowModal(false)} className="text-[#8E8E93] text-[15px] font-medium hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={false} className="text-[#0A84FF] text-[15px] font-bold hover:text-blue-400 transition-colors bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 px-4 py-1.5 rounded-full">Add</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .apple-color-picker {
                    -webkit-appearance: none;
                    padding: 0;
                    border: none;
                    border-radius: 50%;
                    width: 14px;
                    height: 14px;
                    background: transparent;
                }
                .apple-color-picker::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                .apple-color-picker::-webkit-color-swatch {
                    border: none;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
  };

  // --- Workspace State ---
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(1852); // Starts at 00:30:52 for the screenshot match
  const [box1Expanded, setBox1Expanded] = useState(true);
  const [box2Expanded, setBox2Expanded] = useState(false);
  const [box3Expanded, setBox3Expanded] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Design Landing Page Demo", completed: true },
    { id: 2, text: "Integrate Profile UI", completed: true },
    { id: 3, text: "Add Workspace interactive mock", completed: true },
    { id: 4, text: "Fix UI padding and alignment", completed: false },
    { id: 5, text: "Update Pause button styling", completed: false },
    { id: 6, text: "Review final responsive design", completed: false },
  ]);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const renderProfile = () => (
    <div style={{ padding: '40px 60px', width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', flexShrink: 0, width: 220 }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', border: `2px solid ${COLORS.borderHover}`, backgroundColor: COLORS.profileCard, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <img src="/avatars/buttercup.webp" alt="Marcel" style={{ width: 180, height: 180, objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 0', borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, width: '100%', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>1</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>Followers</span>
              </div>
              <div style={{ width: 1, height: 24, backgroundColor: COLORS.borderHover }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>1</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>Following</span>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', border: `1px dashed ${COLORS.border}`, fontSize: 14, fontWeight: 500, color: COLORS.textMuted, cursor: 'pointer' }}>
              <Plus size={16} /> Add Link
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, flex: 1, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: '#E5E7EB', lineHeight: 1.1 }}>Marcel</h1>
              <span style={{ color: COLORS.textMuted, fontSize: 16, fontWeight: 500, marginTop: 6 }}>@marcel69</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <div className="notif-bell"><Bell size={20} /></div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, pointerEvents: 'none' }}><Search size={16} /></div>
                <input type="text" className="search-input" placeholder="Search users..." />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
              <h3 style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>About</h3>
              {!isEditingAbout && (
                <button onClick={() => setIsEditingAbout(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
            {isEditingAbout ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, padding: 16, color: COLORS.textSecondary, fontSize: 15, outline: 'none', minHeight: 120 }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', height: 35 }}>
                  <button onClick={() => setIsEditingAbout(false)} style={{ padding: '0 16px', color: COLORS.textMuted, cursor: 'pointer', background:'none', border:'none' }}>Cancel</button>
                  <button onClick={() => setIsEditingAbout(false)} style={{ padding: '0 20px', borderRadius: 8, backgroundColor: '#D1D5DB', color: '#111', cursor: 'pointer', border:'none', fontWeight: 600 }}>Save Bio</button>
                </div>
              </div>
            ) : (
              <p style={{ color: COLORS.textSecondary, fontSize: 16, lineHeight: 1.7, fontWeight: 400, backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, minHeight: 167 }}>
                {aboutText}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 1, width: '100%', background: `linear-gradient(to right, ${COLORS.border}, transparent)`, marginTop: 40, marginBottom: 40 }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700 }}>Achievement Badges</h3>
          <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>2 active days</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 20 }}>
          {ALL_BADGES.map((badge) => {
            const isUnlocked = activeDays >= badge.requiredDays;
            return (
              <div key={badge.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-shine"><div className="badge-shine-inner"></div></div>
                <div style={{ position: 'relative', width: 88, height: 88, zIndex: 2 }}>
                  <img src={badge.imageUrl} alt={badge.name} className="badge-img" style={{ dropShadow: isUnlocked ? 'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' : 'none' }} />
                  {!isUnlocked && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(20, 24, 54, 0.9)', border: '2px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={11} color="#9CA3AF" />
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: isUnlocked ? '#FFFFFF' : '#C9CDDB', zIndex: 2 }}>{badge.name}</div>
                <div style={{ fontSize: 12, color: isUnlocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)', zIndex: 2, textAlign: 'center' }}>{badge.description}</div>
                
                {!isUnlocked && (
                  <div className="badge-locked-overlay">
                    <Lock size={32} color="rgba(255,255,255,0.5)" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#E5E7EB', letterSpacing: '0.2em' }}>LOCKED</span>
                  </div>
                )}
                {isUnlocked && (
                  <div className="badge-unlocked-tooltip">
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{badge.name}</span>
                    <span style={{ fontSize: 12, color: '#34D399', fontWeight: 700 }}>✓ Unlocked!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWorkspace = () => (
    <div style={{ padding: '40px 60px', width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 24, color: '#E5E7EB', margin: 0, fontWeight: 400 }}>workspace</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ padding: '8px 16px', border: `1px solid ${COLORS.border}`, backgroundColor: 'transparent', color: COLORS.textMuted, borderRadius: 6, fontSize: 13, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
             History
          </button>
          <button style={{ padding: '8px 16px', border: `1px solid ${COLORS.border}`, backgroundColor: 'transparent', color: COLORS.textMuted, borderRadius: 6, fontSize: 13, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
             + new box
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Box 1 (Today) */}
        <div style={{ border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, backgroundColor: 'transparent', padding: '24px 32px' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: box1Expanded ? 24 : 0, borderBottom: box1Expanded ? `1px solid ${COLORS.border}` : 'none', gap: 24 }}>
            
            {/* Left: Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 20, color: '#E5E7EB', whiteSpace: 'nowrap' }}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff', backgroundColor: '#000', border: '1px solid #000', padding: '2px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>pending</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>3 tasks</span>
            </div>
            
            {/* Center: Timer */}
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: 250 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', borderRadius: 8, border: `1px solid ${COLORS.borderHover}`, whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
                  {formatTime(time)}
                </span>
                <div style={{ height: 20, width: 1, backgroundColor: COLORS.borderHover }}></div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {!timerRunning ? (
                    <button onClick={() => setTimerRunning(true)} className="timer-text-btn start-btn" style={{ fontFamily: 'monospace', padding: '4px 12px' }}>START</button>
                  ) : (
                    <>
                      <button onClick={() => setTimerRunning(false)} className="timer-text-btn pause-btn" style={{ fontFamily: 'monospace', padding: '4px 12px', marginRight: 8 }}>PAUSE</button>
                      <button onClick={() => { setTimerRunning(false); setTime(0); }} className="timer-text-btn reset-btn" style={{ fontFamily: 'monospace', padding: '4px 12px' }}>RESET</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setBox1Expanded(!box1Expanded)} className="header-btn" title="Toggle" style={{ padding: '6px' }}>
                {box1Expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Tasks Body */}
          {box1Expanded && (
            <div style={{ paddingTop: 16 }}>
              {tasks.slice(0, 3).map((task, idx) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < 2 ? `1px solid ${COLORS.border}` : 'none', opacity: task.completed ? 0.3 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <span style={{ fontFamily: 'monospace', color: COLORS.textMuted, fontSize: 14, width: 24 }}>{idx + 1}.</span>
                    <span style={{ fontFamily: 'monospace', color: COLORS.textPrimary, fontSize: 14, textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button onClick={() => toggleTask(task.id)} className="action-btn" style={{ fontFamily: 'monospace' }}>{task.completed ? 'undo' : 'done'}</button>
                    <button className="action-btn" style={{ fontFamily: 'monospace' }}>delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box 2 (Yesterday) */}
        <div style={{ border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, backgroundColor: 'transparent', padding: '24px 32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: box2Expanded ? 24 : 0, borderBottom: box2Expanded ? `1px solid ${COLORS.border}` : 'none', gap: 24 }}>
            {/* Left: Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 20, color: '#E5E7EB', whiteSpace: 'nowrap' }}>
                25 July 2026
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff', backgroundColor: '#000', border: '1px solid #000', padding: '2px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>active</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>1 task</span>
            </div>
            
            {/* Center: Timer */}
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: 250 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', borderRadius: 8, border: `1px solid ${COLORS.borderHover}`, whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
                  00:00:45
                </span>
                <div style={{ height: 20, width: 1, backgroundColor: COLORS.borderHover }}></div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="timer-text-btn start-btn" style={{ fontFamily: 'monospace', padding: '4px 12px' }}>START</button>
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setBox2Expanded(!box2Expanded)} className="header-btn" title="Toggle" style={{ padding: '6px' }}>
                {box2Expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {/* Tasks Body */}
          {box2Expanded && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', opacity: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textMuted, fontSize: 14, width: 24 }}>1.</span>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textPrimary, fontSize: 14 }}>
                    Start working out
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="action-btn" style={{ fontFamily: 'monospace' }}>done</button>
                  <button className="action-btn" style={{ fontFamily: 'monospace' }}>delete</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Box 3 (Two days ago) */}
        <div style={{ border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, backgroundColor: 'transparent', padding: '24px 32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: box3Expanded ? 24 : 0, borderBottom: box3Expanded ? `1px solid ${COLORS.border}` : 'none', gap: 24 }}>
            {/* Left: Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 20, color: '#E5E7EB', whiteSpace: 'nowrap' }}>
                24 July 2026
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff', backgroundColor: '#000', border: '1px solid #000', padding: '2px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>completed</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>2 tasks</span>
            </div>
            
            {/* Center: Timer */}
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minWidth: 250 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', borderRadius: 8, border: `1px solid ${COLORS.borderHover}`, whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#A1A1AA', letterSpacing: '0.1em' }}>
                  04:12:30
                </span>
                <div style={{ height: 20, width: 1, backgroundColor: COLORS.borderHover }}></div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="timer-text-btn reset-btn" style={{ fontFamily: 'monospace', padding: '4px 12px' }}>DONE</button>
                </div>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setBox3Expanded(!box3Expanded)} className="header-btn" title="Toggle" style={{ padding: '6px' }}>
                {box3Expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {/* Tasks Body */}
          {box3Expanded && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`, opacity: 0.3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textMuted, fontSize: 14, width: 24 }}>1.</span>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textPrimary, fontSize: 14, textDecoration: 'line-through' }}>
                    Finish dashboard design
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="action-btn" style={{ fontFamily: 'monospace' }}>undo</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', opacity: 0.3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textMuted, fontSize: 14, width: 24 }}>2.</span>
                  <span style={{ fontFamily: 'monospace', color: COLORS.textPrimary, fontSize: 14, textDecoration: 'line-through' }}>
                    Setup MongoDB
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="action-btn" style={{ fontFamily: 'monospace' }}>undo</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes diagonalShine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(25deg); }
            100% { transform: translateX(200%) translateY(200%) rotate(25deg); }
        }
        .search-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 16px 10px 42px; color: #fff; width: 260px; font-size: 14px; outline: none; transition: all 0.2s; }
        .search-input:focus { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); width: 280px; }
        .notif-bell { position: relative; padding: 10px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #D1D5DB; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .notif-bell:hover { background: rgba(255,255,255,0.08); }
        
        /* Badge CSS */
        .badge-card { position: relative; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.15); }
        .badge-card.unlocked { background: rgba(20, 24, 54, 0.5); box-shadow: 8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
        .badge-card.locked { background: rgba(20, 24, 54, 0.2); box-shadow: 8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
        .badge-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 8px 16px 40px rgba(0, 0, 0, 0.4), inset 1px 1px 2px rgba(255, 255, 255, 0.15), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
        .badge-shine { position: absolute; inset: 0; z-index: 1; overflow: hidden; border-radius: 20px; pointer-events: none; opacity: 0; transition: opacity 0.3s; }
        .badge-card:hover .badge-shine { opacity: 1; }
        .badge-shine-inner { position: absolute; top: 0; left: 0; width: 60%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent); transform: translateX(-100%) translateY(-100%) rotate(25deg); }
        .badge-card:hover .badge-shine-inner { animation: diagonalShine 1.5s ease-out forwards; }
        .badge-img { width: 88px; height: 88px; object-fit: contain; transition: transform 0.3s ease; filter: none; }
        .badge-card.unlocked:hover .badge-img { transform: scale(1.15); }
        .badge-locked-overlay { position: absolute; inset: 0; border-radius: 20px; background-color: rgba(10, 12, 30, 0.75); backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border: 1px solid rgba(255,255,255,0.08); opacity: 0; pointer-events: none; transition: opacity 0.25s ease-out; }
        .badge-card.locked:hover .badge-locked-overlay { opacity: 1; }
        .badge-unlocked-tooltip { position: absolute; bottom: calc(100% + 12px); left: 50%; transform: translateX(-50%) translateY(10px); width: 230px; padding: 14px 16px; border-radius: 16px; background: rgba(20, 24, 54, 0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 30; display: flex; flex-direction: column; gap: 8px; opacity: 0; pointer-events: none; transition: all 0.2s ease-out; }
        .badge-card.unlocked:hover .badge-unlocked-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
        
        /* Workspace CSS */
        .header-btn { background: none; border: none; color: ${COLORS.textPrimary}; font-size: 14px; font-weight: 400; cursor: pointer; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; outline: none; }
        .header-btn:hover { opacity: 0.6; }
        .timer-text-btn { font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 6px; border: 1px solid transparent; outline: none; }
        .start-btn { background: #E5E7EB; color: #000; }
        .start-btn:hover { background: #FFFFFF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,255,255,0.1); }
        .pause-btn { background: #000000; color: #FFFFFF; border-color: rgba(255,255,255,0.15); }
        .pause-btn:hover { background: #111111; }
        .reset-btn { background: transparent; color: #A1A1AA; border-color: rgba(255,255,255,0.15); }
        .reset-btn:hover { background: rgba(255,255,255,0.05); color: #FFFFFF; }
        .action-btn { background: none; border: none; color: ${COLORS.textMuted}; font-size: 13px; font-weight: 400; cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center; outline: none; }
        .action-btn:hover { color: ${COLORS.textPrimary} !important; }
      `}</style>

      <div className="w-full max-w-6xl mx-auto px-4 z-20 relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Outer "Picture Frame" Border */}
        <div className="w-full p-4 md:p-5 bg-[#FAF9F6] rounded-[32px] md:rounded-[40px] shadow-2xl border border-white/50">
          
          {/* Main Window Container */}
          <div className="w-full h-[600px] md:h-[700px] bg-[#1e1e1e] rounded-[20px] md:rounded-[24px] border border-black/50 flex flex-col md:flex-row overflow-hidden shadow-inner relative">
            
            {/* Sidebar (Mocked for Demo) */}
            <div className="w-full md:w-64 h-auto md:h-full bg-[#1e1e1e] border-b md:border-b-0 md:border-r border-white/5 flex flex-col pt-4 md:pt-8 pb-2 md:pb-6 px-3 md:px-4 shrink-0 z-20">
              <div className="px-4 mb-4 md:mb-10 hidden md:block">
                <h2 className="text-xl font-bold text-white tracking-tight">LockedIn</h2>
              </div>
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0 w-full items-center md:items-stretch">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-medium text-[13px] md:text-sm transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <User size={16} /> Profile
                </button>
                <button 
                  onClick={() => setActiveTab('workspace')}
                  className={`hidden md:flex flex-shrink-0 whitespace-nowrap items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-medium text-[13px] md:text-sm transition-colors ${activeTab === 'workspace' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <Clock size={16} /> Workspace
                </button>
                
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-medium text-[13px] md:text-sm transition-colors ${activeTab === 'calendar' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <CalendarIcon size={16} /> Calendar
                </button>
                
                <button onClick={() => setActiveTab('stopwatch')}
 className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-medium text-[13px] md:text-sm transition-colors ${activeTab === 'stopwatch' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <Timer size={16} /> Stopwatch
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-medium text-[13px] md:text-sm transition-colors ${activeTab === 'analytics' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <BarChart2 size={16} /> Analytics
                </button>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 h-full overflow-y-auto relative z-10" style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', system-ui, sans-serif" }}>
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'workspace' && renderWorkspace()}
              {activeTab === 'calendar' && renderCalendar()}
              {activeTab === 'stopwatch' && renderStopwatch()}
              {activeTab === 'analytics' && (
                <div className="w-full h-full p-4 md:p-6 overflow-y-auto hide-scrollbar relative">
                    <MockAnalytics />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AppDemoWindow;
