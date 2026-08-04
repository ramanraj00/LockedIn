import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, X, UserCircle, Command, CalendarDays, Timer, BarChart2, Award, Settings2, ChevronsUpDown } from 'lucide-react';
import { apiFetch } from '../../apiClient';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const SIDEBAR_ITEMS = [
    { name: 'Profile', icon: UserCircle },
    { name: 'Workspace', icon: Command },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Stopwatch', icon: Timer },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Leaderboard', icon: Award },
    { name: 'Settings', icon: Settings2 }
];

const SidebarItem = React.memo(({ item, isActive, isHovered, setHoveredItem, navigate, isMobile }) => {
    const Icon = item.icon;
    return (
        <div style={{ padding: isMobile ? '8px 12px' : '0', display: 'flex', justifyContent: 'center' }}>
            <button 
                onClick={() => navigate(`/${item.name.toLowerCase()}`)} 
                onMouseEnter={() => setHoveredItem(item.name)}
                style={{ 
                    position: 'relative', 
                    width: isMobile ? '48px' : '100%', 
                    height: isMobile ? '48px' : 'auto',
                    padding: isMobile ? '0' : '14px 40px', 
                    borderRadius: isMobile ? 16 : 0, 
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    alignItems: 'center',
                    fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s ease',
                    border: 'none', outline: 'none',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent', 
                    color: isActive || isHovered ? '#FFFFFF' : '#9CA3AF' 
                }}
                className="group"
            >
                {/* Hover Pill Removed - Replaced with CSS background */}

                {isActive && (
                    <motion.div
                        layoutId={isMobile ? "mobile-active-indicator" : "active-indicator"}
                        style={{ 
                            position: 'absolute', 
                            left: isMobile ? '50%' : 0, 
                            bottom: isMobile ? -6 : 0, 
                            top: isMobile ? 'auto' : 0,
                            transform: isMobile ? 'translateX(-50%)' : 'none',
                            width: isMobile ? 4 : 3, 
                            height: isMobile ? 4 : '100%',
                            borderRadius: isMobile ? '50%' : 0,
                            backgroundColor: '#3B82F6', 
                            boxShadow: isMobile ? '0 0 8px #3B82F6' : 'none',
                            zIndex: 10 
                        }}
                    />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 10 }}>
                    <Icon size={isMobile ? 22 : 18} className={`transition-transform duration-300 ${isActive || isHovered ? 'scale-110' : ''}`} />
                    {!isMobile && <span>{item.name}</span>}
                </div>
            </button>
        </div>
    );
});


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

const SidebarMenu = React.memo(({ activePage, navigate, isMobile }) => {
    const [hoveredItem, setHoveredItem] = useState(activePage);

    useEffect(() => {
        setHoveredItem(activePage);
    }, [activePage]);

    return (
        <div 
            style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', margin: isMobile ? '0' : '0 -24px', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? 8 : 0 }} 
            onMouseLeave={() => setHoveredItem(activePage)} 
        >
            {SIDEBAR_ITEMS.map((item) => {
                const isActive = item.name === activePage;
                const isHovered = item.name === hoveredItem;
                return (
                    <React.Fragment key={item.name}>
                        <SidebarItem 
                            item={item} 
                            isActive={isActive} 
                            isHovered={isHovered} 
                            setHoveredItem={setHoveredItem} 
                            navigate={navigate} 
                            isMobile={isMobile}
                        />
                        {item.name === 'Stopwatch' && (
                            <div style={{ padding: isMobile ? '0' : '0 24px', margin: '8px 0', width: isMobile ? '32px' : 'auto' }}>
                                <hr style={{ 
                                    border: 'none', 
                                    borderTop: '2px solid rgba(255,255,255,0.08)', 
                                    borderRadius: '4px' 
                                }} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
});

const Sidebar = ({ activePage }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(globalSidebarOpen);
    const sidebarRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiFetch("/api/auth/me", { credentials: "include" });
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
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, isMobile]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
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
            const res = await apiFetch("/api/auth/logout", { method: "POST", credentials: "include" });
            if (res.ok) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("/login");
            }
        } catch (error) { 
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/login"); 
        }
    };

    const hasRealImage = profile?.imageUrl && profile.imageUrl.trim() !== '' && !profile.imageUrl.includes('default.png') && !profile.imageUrl.includes('default_avatar');
    const imgUrl = hasRealImage ? profile.imageUrl : (profile ? getRandomAvatar(profile.name) : null);

    const sidebarWidth = isMobile ? 80 : 280;

    return (
        <>
            <button 
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                style={{ 
                    position: 'fixed', top: isMobile ? 12 : 24, left: isMobile ? 12 : 24, zIndex: 40, width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 12, 
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', 
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? 'none' : 'auto'
                }}
                className="hover:scale-105 hover:bg-white/10"
            >
                <CustomSidebarIcon />
            </button>

            <div 
                onClick={() => setIsOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40, display: isOpen ? 'block' : 'none' }}
            ></div>

            <div 
                ref={sidebarRef} 
                onMouseLeave={() => setIsOpen(false)} 
                style={{ 
                    position: 'fixed', top: 0, left: 0, height: '100vh', width: sidebarWidth, 
                    background: 'linear-gradient(180deg, #0B0D14 0%, #08090C 100%)', 
                    borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 50, 
                    padding: isMobile ? '24px 0' : 24, 
                    display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'stretch',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', 
                    boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginTop: 8, marginBottom: 32, width: '100%', padding: isMobile ? '0 12px' : 0 }}>
                    {!isMobile && <span style={{ color: '#D1D5DB', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>}
                    {isMobile ? (
                        <button onClick={() => setIsOpen(false)} style={{ padding: 8, color: '#6B7280', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%' }} className="hover:text-white hover:bg-white/10 transition-all">
                            <X size={18} />
                        </button>
                    ) : (
                        <button onClick={() => setIsOpen(false)} style={{ padding: 8, color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }} className="hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>
                
                <SidebarMenu activePage={activePage} navigate={navigate} isMobile={isMobile} />

                <div style={{ marginTop: 'auto', paddingTop: 24, width: '100%', padding: isMobile ? '0 12px' : 0 }}>
                    <button 
                        onClick={handleLogout}
                        title="Click to logout"
                        style={{ 
                            width: '100%',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: isMobile ? 'center' : 'space-between', 
                            padding: isMobile ? '10px 0' : '10px 14px', 
                            borderRadius: isMobile ? 24 : 16, 
                            backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                        }}
                        className="hover:bg-white/10 group"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', justifyContent: 'center' }}>
                            {imgUrl ? (
                                <img 
                                    src={imgUrl} 
                                    alt="User" 
                                    style={{ width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                    onError={(e) => { 
                                        e.target.style.display = 'none'; 
                                        e.target.nextSibling.style.display = 'flex'; 
                                    }} 
                                />
                            ) : null}
                            <div style={{ display: imgUrl ? 'none' : 'flex', width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontWeight: 600, fontSize: 15, flexShrink: 0 }}>
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {!isMobile && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#F3F4F6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130, fontFamily: "'Inter', sans-serif" }}>
                                        {profile?.name || 'User Name'}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130, fontFamily: "'Inter', sans-serif" }}>
                                        {profile?.email || 'user@example.com'}
                                    </span>
                                </div>
                            )}
                        </div>
                        {!isMobile && (
                            <div style={{ color: '#6B7280', flexShrink: 0, paddingRight: 2 }} className="group-hover:text-white transition-colors">
                                <ChevronsUpDown size={18} strokeWidth={2.5} />
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default React.memo(Sidebar);
