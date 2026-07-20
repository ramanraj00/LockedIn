import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

// 🔥 GLOBAL VARIABLE (Smooth navigation ke liye)
let globalSidebarOpen = false;

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(globalSidebarOpen);
    const sidebarRef = useRef(null);

    useEffect(() => {
        globalSidebarOpen = isOpen;
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

    return (
        <>
            {/* INVISIBLE LEFT EDGE TRIGGER */}
            {!isOpen && (
                <div 
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setIsOpen(true)}
                    style={{ position: 'fixed', top: 0, left: 0, width: 80, height: '100vh', zIndex: 39, cursor: 'pointer' }} 
                />
            )}

            {/* MAIN BUTTON TRIGGER (No Blur) */}
            <button 
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                style={{ 
                    position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, 
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', 
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? 'none' : 'auto'
                }}
                className="hover:scale-105 hover:bg-white/10"
            >
                <CustomSidebarIcon />
            </button>

            {/* OVERLAY: No Blur, No Black background. Sirf ek invisible click layer */}
            <div 
                onClick={() => setIsOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40, display: isOpen ? 'block' : 'none' }}
            ></div>

            {/* SIDEBAR PANEL: Solid Original Color (#15181C), NO BLUR */}
            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setIsOpen(false)}
                style={{ 
                    position: 'fixed', top: 0, left: 0, height: '100%', width: 280, 
                    backgroundColor: '#15181C', // 🔥 SOLID DARK COLOR
                    borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 50, padding: 24, 
                    display: 'flex', flexDirection: 'column', 
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', 
                    boxShadow: '4px 0 24px rgba(0,0,0,0.5)' 
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                    <span style={{ color: '#D1D5DB', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                    <button onClick={() => setIsOpen(false)} style={{ padding: 8, color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }} className="hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = item === activePage;
                        return (
                            <button 
                                key={item} 
                                onClick={() => {
                                    navigate(`/${item.toLowerCase()}`);
                                }} 
                                style={{ 
                                    width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease',
                                    border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent', 
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', 
                                    color: isActive ? '#FFFFFF' : '#9CA3AF' 
                                }}
                                className="hover:bg-white/10 hover:text-white"
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-500/20 hover:scale-[1.02]">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;