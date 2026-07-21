import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// 🔥 Framer Motion import kiya sliding effect ke liye
import { motion } from 'framer-motion';
import { LogOut, X, UserCircle, Command, CalendarDays, Timer, BarChart2, Award, Settings2 } from 'lucide-react';

const SIDEBAR_ITEMS = [
    { name: 'Profile', icon: UserCircle },
    { name: 'Workspace', icon: Command },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Stopwatch', icon: Timer },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Leaderboard', icon: Award },
    { name: 'Settings', icon: Settings2 }
];

const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

const getRandomAvatar = (name) => {
    const avatarCount = 4;
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % avatarCount) + 1;
    return `/avatars/avatar${index}.png`;
};

let globalSidebarOpen = false;

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(globalSidebarOpen);
    const sidebarRef = useRef(null);
    const [profile, setProfile] = useState(null);
    
    // 🔥 SLIDING HOVER STATE: By default active page pe rahega
    const [hoveredItem, setHoveredItem] = useState(activePage);

    // Jab bhi page change ho, slider active page par reset ho jaye
    useEffect(() => {
        setHoveredItem(activePage);
    }, [activePage]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/auth/me", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                }
            } catch (err) {}
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        globalSidebarOpen = isOpen;
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        // 🔥 MouseClick (PC) aur TouchStart (Mobile) dono pe band hoga
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

    const hasRealImage = profile?.imageUrl && profile.imageUrl.trim() !== '' && !profile.imageUrl.includes('default.png') && !profile.imageUrl.includes('default_avatar');
    const imgUrl = hasRealImage ? profile.imageUrl : (profile ? getRandomAvatar(profile.name) : null);

    return (
        <>
            {/* 🔥 MAIN BUTTON: PC pe hover se khulega, Mobile pe touch (click) se khulega */}
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

            {/* OVERLAY: Baahar touch/click karne par band karne ke liye */}
            <div 
                onClick={() => setIsOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40, display: isOpen ? 'block' : 'none' }}
            ></div>

            {/* 🔥 SIDEBAR PANEL: PC pe mouse hatane se turant band hoga */}
            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setIsOpen(false)} 
                style={{ 
                    position: 'fixed', top: 0, left: 0, height: '100%', width: 280, 
                    backgroundColor: 'rgba(15, 15, 15, 0.45)', 
                    backdropFilter: 'blur(40px) saturate(150%)', 
                    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
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
                
                              {/* 🔥 MENUS WALA CONTAINER (End-to-End Full Bleed) */}
                <div 
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', margin: '0 -24px' }} 
                    onMouseLeave={() => setHoveredItem(activePage)} 
                >
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = item.name === activePage;
                        const isHovered = item.name === hoveredItem;
                        const Icon = item.icon;

                        return (
                            <button 
                                key={item.name} 
                                onClick={() => navigate(`/${item.name.toLowerCase()}`)} 
                                onMouseEnter={() => setHoveredItem(item.name)}
                                style={{ 
                                    position: 'relative', width: '100%', padding: '14px 40px', borderRadius: 0, fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s ease',
                                    border: 'none', outline: 'none',
                                    backgroundColor: 'transparent', 
                                    color: isActive || isHovered ? '#FFFFFF' : '#9CA3AF' 
                                }}
                                className="group"
                            >
                                {/* 🔥 MAGIC SLIDING BACKGROUND */}
                                {isHovered && (
                                    <motion.div
                                        layoutId="sidebar-hover-pill"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(255,255,255,0.04)', // Subtle highlight
                                            borderTop: '1px solid rgba(255,255,255,0.03)',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            borderRadius: 0, // 🔥 Sharp edges (No round)
                                            zIndex: 0
                                        }}
                                    />
                                )}

                                {/* 🔥 Blue Line Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#3B82F6', zIndex: 10 }}
                                    />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 10 }}>
                                    <Icon size={18} className={`transition-transform duration-300 ${isActive || isHovered ? 'scale-110' : ''}`} />
                                    <span>{item.name}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* PREMIUM BOTTOM WIDGET */}
                <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {imgUrl ? (
                                <img 
                                    src={imgUrl} 
                                    alt="User" 
                                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                                    onError={(e) => { 
                                        e.target.style.display = 'none'; 
                                        e.target.nextSibling.style.display = 'flex'; 
                                    }} 
                                />
                            ) : null}
                            <div style={{ display: imgUrl ? 'none' : 'flex', width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                                    {profile?.name ? profile.name.split(' ')[0] : 'Hustler'}
                                </span>
                                <span style={{ fontSize: 11, color: '#9CA3AF' }}>LockedIn</span>
                            </div>
                        </div>
                        {/* Premium Minimal Logout Button */}
                        <button 
                            onClick={handleLogout} 
                            title="Logout"
                            style={{ 
                                padding: 8, 
                                color: '#9CA3AF', 
                                backgroundColor: 'transparent', 
                                border: 'none', 
                                borderRadius: 8, 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                transition: 'all 0.2s ease' 
                            }} 
                            className="hover:bg-white/10 hover:text-white" 
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;