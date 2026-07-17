import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import AnimatedDigit from './AnimatedDigit';
import OilShader from './OilShader';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const CustomSidebarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

// ============================================
// 🔥 1. MEMOIZED STATIC COMPONENTS (Never Re-render!)
// ============================================

// Ultra-fast gradient glow instead of heavy GPU Blur
const AmbientBackground = memo(() => (
    <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)' }}
    ></div>
));

const VisorBackground = memo(() => (
    <>
        <div className="absolute inset-0 rounded-[9999px] bg-black overflow-hidden" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.06)' }}>
            <OilShader className="opacity-90 scale-105" />
        </div>
        <div className="absolute inset-0 rounded-[9999px] pointer-events-none z-10 vr-visor-glass"></div>
        <div className="absolute top-[8%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full z-10 pointer-events-none"></div>
    </>
));

const GlobalStyles = memo(() => (
    <style>{`
        /* --- VR VISOR GLASS --- */
        .vr-visor-glass {
            box-shadow: 
                inset 0 0 0 1px rgba(255, 255, 255, 0.06),
                inset 0 16px 40px rgba(255, 255, 255, 0.14),
                inset 0 -14px 50px rgba(0, 0, 0, 0.9),
                0 0 40px rgba(255, 255, 255, 0.02);
            background: linear-gradient(
                170deg, 
                rgba(255, 255, 255, 0.18) 0%, 
                rgba(255, 255, 255, 0.04) 22%, 
                transparent 48%, 
                rgba(0, 0, 0, 0.7) 100%
            );
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    `}</style>
));

// ============================================
// 🔥 2. ISOLATED TIMER CORE (Only this updates every second)
// ============================================

const TimerCore = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const handleStartPause = () => setIsRunning(!isRunning);
    const handleReset = () => { setIsRunning(false); setTime(0); };
    const handleSave = () => { alert("Time Saved!"); };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return {
            m1: Math.floor(minutes / 10),
            m2: minutes % 10,
            s1: Math.floor(seconds / 10),
            s2: seconds % 10
        };
    };

    const digits = formatTime(time);

    return (
        <>
            <div 
                className="relative z-10 flex items-center justify-center text-[110px] sm:text-[130px] font-bold tracking-[-0.04em] text-white select-none"
                style={{ 
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                    textShadow: '0 2px 30px rgba(0,0,0,0.9), 0 0 100px rgba(255,255,255,0.04)'
                }}
            >
                <AnimatedDigit digit={digits.m1} />
                <AnimatedDigit digit={digits.m2} />
                <span className="mx-2 sm:mx-3 animate-pulse text-white/40 relative" style={{ top: '-0.05em', animationDuration: '2s' }}>:</span>
                <AnimatedDigit digit={digits.s1} />
                <AnimatedDigit digit={digits.s2} />
            </div>
            
            <div className="absolute -bottom-10 flex gap-3 z-20">
                <button 
                    onClick={handleStartPause}
                    className="relative overflow-hidden px-9 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 hover:bg-white/[0.14] hover:border-white/[0.25] hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] active:scale-[0.95] cursor-pointer group backdrop-blur-sm"
                >
                    <span className="relative z-10 text-[13px] font-semibold tracking-wide text-white">
                        {!isRunning && time === 0 ? 'Start' : isRunning ? 'Pause' : 'Resume'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>

                <button 
                    onClick={handleSave}
                    className={`relative overflow-hidden px-9 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-[0.95] cursor-pointer backdrop-blur-sm
                    ${time === 0 
                        ? 'bg-white/[0.03] border border-white/[0.06] text-white/30 cursor-not-allowed' 
                        : 'bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.12] hover:border-white/[0.2] text-white/70 hover:text-white'
                    }`}
                    disabled={time === 0}
                >
                    <span className="relative z-10 text-[13px] font-medium">Save</span>
                </button>
                
                <button 
                    onClick={handleReset}
                    className={`relative overflow-hidden px-9 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-[0.95] cursor-pointer backdrop-blur-sm
                    ${time === 0 
                        ? 'bg-white/[0.03] border border-white/[0.06] text-white/30 cursor-not-allowed' 
                        : 'bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.09] hover:border-white/[0.16] text-white/50 hover:text-white/80'
                    }`}
                    disabled={time === 0}
                >
                    <span className="relative z-10 text-[13px] font-medium">Reset</span>
                </button>
            </div>
        </>
    );
};

// ============================================
// 🔥 3. MAIN COMPONENT (No unnecessary renders)
// ============================================

const Stopwatch = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setSidebarOpen(false);
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans bg-[#000000] text-white">
            
            <AmbientBackground />

            {/* 🍔 MENU BUTTON */}
            <button 
                onMouseEnter={() => setSidebarOpen(true)} 
                onClick={() => setSidebarOpen(true)} 
                className="sidebar-trigger group"
                style={{ 
                    position: 'fixed', top: 28, left: 28, zIndex: 40, width: 44, height: 44, 
                    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
            >
                <div className="text-[#7A7F8A] group-hover:text-white transition-colors duration-300">
                    <CustomSidebarIcon />
                </div>
            </button>

            {/* 🪟 OVERLAY BLUR */}
            <div style={{ 
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', 
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 40, 
                transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
                opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' 
            }}></div>

            {/* 📋 SLIDING SIDEBAR */}
            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setSidebarOpen(false)}
                style={{ 
                    position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: '#0A0A0A', 
                    borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 50, padding: '28px 20px', 
                    display: 'flex', flexDirection: 'column', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', 
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '12px 0 50px rgba(0,0,0,0.6)' 
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 40 }}>
                    <span style={{ 
                        color: '#E8EAED', fontSize: 20, fontWeight: 700, letterSpacing: '0.1em',
                        fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" 
                    }}>
                        LockedIn
                    </span>
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="p-2 text-[#5C5F66] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    {SIDEBAR_ITEMS.map((item) => (
                        <button 
                            key={item} 
                            onClick={() => navigate(`/${item.toLowerCase()}`)}
                            className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 cursor-pointer"
                            style={{ 
                                border: item === 'Stopwatch' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent', 
                                backgroundColor: item === 'Stopwatch' ? 'rgba(255,255,255,0.04)' : 'transparent', 
                                color: item === 'Stopwatch' ? '#E8EAED' : '#6B7280',
                            }}
                            onMouseEnter={(e) => {
                                if (item !== 'Stopwatch') {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.color = '#9CA3AF';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (item !== 'Stopwatch') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6B7280';
                                }
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 cursor-pointer hover:bg-[rgba(239,68,68,0.15)]"
                        style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                    >
                        <LogOut size={16} strokeWidth={2.5} /> Logout
                    </button>
                </div>
            </div>

            {/* ⏱️ MAIN STOPWATCH SECTION */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
                <div className="relative w-full max-w-[720px] h-[300px] flex items-center justify-center pointer-events-auto">
                    <VisorBackground />
                    <TimerCore />
                </div>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/[0.06] text-[10px] tracking-[0.4em] uppercase font-semibold pointer-events-none select-none" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
                LockedIn
            </div>

            <GlobalStyles />
        </div>
    );
};

export default Stopwatch;