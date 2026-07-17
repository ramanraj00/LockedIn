import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import AnimatedDigit from './AnimatedDigit';
import OilShader from './OilShader';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

// 🔥 EXACT OLD CUSTOM ICON
const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A0A5B0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

const Stopwatch = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(0); 
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

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

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

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
        // NAYA PAGE BACKGROUND - Darker #070707 for insane contrast
        <div className="min-h-screen w-full relative overflow-x-hidden font-sans bg-[#070707]">
            
            {/* 🔥 1. SUBTLE DOT GRID ENVIRONMENT 🔥 */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.15]" 
                style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* 🔥 2. AMBIENT BACKLIGHT GLOW 🔥 (Puts the visor in 3D space) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-white rounded-full opacity-[0.03] blur-[80px] pointer-events-none"></div>


            {/* 🍔 MENU BUTTON */}
            <button 
                onMouseEnter={() => setSidebarOpen(true)} 
                onClick={() => setSidebarOpen(true)} 
                className="sidebar-trigger"
                style={{ position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
            >
                <CustomSidebarIcon />
            </button>

            {/* 🪟 OVERLAY BLUR */}
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40, transition: 'opacity 0.4s ease', opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}></div>

            {/* 📋 SLIDING SIDEBAR */}
            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setSidebarOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: '#15181C', borderRight: `1px solid rgba(255,255,255,0.06)`, zIndex: 50, padding: 24, display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                    <span style={{ color: '#D1D5DB', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                    <button onClick={() => setSidebarOpen(false)} style={{ padding: 8, color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }}>
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {SIDEBAR_ITEMS.map((item) => (
                        <button 
                            key={item} 
                            onClick={() => navigate(`/${item.toLowerCase()}`)}
                            style={{ width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, border: item === 'Stopwatch' ? `1px solid rgba(255,255,255,0.12)` : '1px solid transparent', backgroundColor: item === 'Stopwatch' ? 'rgba(255,255,255,0.04)' : 'transparent', color: item === 'Stopwatch' ? '#D1D5DB' : '#6B7280', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div style={{ paddingTop: 24, borderTop: `1px solid rgba(255,255,255,0.06)`, marginTop: 'auto' }}>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* ⏱️ MAIN STOPWATCH SECTION */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
                
                {/* 🏆 THE VR VISOR CONTAINER */}
                <div className="relative w-full max-w-[650px] h-[260px] flex items-center justify-center pointer-events-auto">
                    
                    {/* BACKGROUND W/ SHADER */}
                    <div className="absolute inset-0 rounded-[9999px] bg-black overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                        <OilShader className="opacity-90 scale-105" />
                    </div>

                    {/* VR LENS CURVED GLASS GLARE */}
                    <div className="absolute inset-0 rounded-[9999px] pointer-events-none vr-visor-glass z-10"></div>
                                      {/* THE TIME DISPLAY */}
                    {/* Color changed to #C4C8D0 (Soft Silver/Pearl) to reduce eye strain */}
                    <div className="relative z-10 flex items-center justify-center text-[90px] sm:text-[100px] font-bold tracking-tight text-[#C4C8D0] drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] select-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        <AnimatedDigit digit={digits.m1} />
                        <AnimatedDigit digit={digits.m2} />
                        
                        {/* Colon ki opacity aur kam ki taaki wo bhi na chubhe */}
                        <span className="mx-2 animate-pulse text-white/50 relative" style={{ top: '-0.08em' }}>:</span>
                        
                        <AnimatedDigit digit={digits.s1} />
                        <AnimatedDigit digit={digits.s2} />
                    </div>
                    
                    {/* 🔥 4. CONTROLS (Buttons colors fixed, ab poore saaf dikhenge) 🔥 */}
                    <div className="absolute -bottom-7 flex gap-4 z-20">
                        <button 
                            onClick={handleStartPause}
                            className="relative overflow-hidden group px-10 py-[14px] rounded-full bg-[#1A1C20] border border-[rgba(255,255,255,0.15)] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:bg-[#22252A] hover:border-[rgba(255,255,255,0.25)] active:scale-95"
                        >
                            <span className="relative z-10 text-[15px] font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-400" style={{ backgroundSize: '200% 200%', animation: 'flow 3s ease infinite' }}>
                                {!isRunning && time === 0 ? 'Start' : isRunning ? 'Pause' : 'Resume'}
                            </span>
                        </button>

                        {/* SAVE BUTTON */}
                        <button 
                            onClick={handleSave}
                            className={`relative overflow-hidden group px-10 py-[14px] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-95 
                            ${time === 0 ? 'bg-[#121316] border border-white/5 text-gray-500 cursor-not-allowed' : 'bg-[#1A1C20] border border-white/10 hover:bg-[#22252A] hover:border-white/20 text-gray-300'}`}
                            disabled={time === 0}
                        >
                            <span className="relative z-10 text-[15px] font-medium transition-colors">
                                Save
                            </span>
                        </button>
                        
                        {/* RESET BUTTON */}
                        <button 
                            onClick={handleReset}
                            className={`relative overflow-hidden group px-10 py-[14px] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-95 
                            ${time === 0 ? 'bg-[#121316] border border-white/5 text-gray-500 cursor-not-allowed' : 'bg-[#15161A] border border-white/10 hover:bg-[#1C1E23] hover:border-white/15 text-gray-400'}`}
                            disabled={time === 0}
                        >
                            <span className="relative z-10 text-[15px] font-medium transition-colors">
                                Reset
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* CSS ANIMATIONS & VR VISOR STYLES */}
            <style>{`
                @keyframes flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .sidebar-trigger:hover { transform: scale(1.05); }
                .sidebar-trigger:hover svg { stroke: #FFFFFF; }

                .vr-visor-glass {
                    box-shadow: 
                        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                        inset 0 12px 30px rgba(255, 255, 255, 0.12),
                        inset 0 -10px 40px rgba(0, 0, 0, 0.9);
                        
                    background: linear-gradient(
                        160deg, 
                        rgba(255, 255, 255, 0.15) 0%, 
                        rgba(255, 255, 255, 0.03) 25%, 
                        transparent 50%, 
                        rgba(0, 0, 0, 0.8) 100%
                    );
                }
            `}</style>
        </div>
    );
};

export default Stopwatch;