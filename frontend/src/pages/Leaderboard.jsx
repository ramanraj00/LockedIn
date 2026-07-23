import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, EffectCoverflow } from 'swiper/modules'; 
import { Trophy, Flame, Crown, Lock } from 'lucide-react';
import { ThinkingOrb } from 'thinking-orbs';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

// 🔥 Premium, soft metallic accents
const COLORS = {
    bg: '#0F0F0F',
    card: '#171717',
    cardHover: '#1E1E1E',
    textPrimary: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#505050',
    border: '#262626',
    gold: '#E4C573',   
    silver: '#B4B4B8', 
    bronze: '#C98B66', 
    green: '#34D399',
    blue: '#60A5FA',
    orange: '#FB923C',
};

const ALL_BADGES = [
    { id: 'feather',   name: 'Feather',   description: 'Beginner',          imageUrl: '/badges/firstlevel.png'  },
    { id: 'shard',     name: 'Shard',     description: 'Growing Stronger',  imageUrl: '/badges/secondlevel.png' },
    { id: 'scout',     name: 'Scout',     description: 'Explorer',          imageUrl: '/badges/thirdlevel.png'  },
    { id: 'hunter',    name: 'Hunter',    description: 'Focus Achiever',    imageUrl: '/badges/4thlevel.png'    },
    { id: 'pacific',   name: 'Pacific',   description: 'Calm Consistency',  imageUrl: '/badges/fifthlevel.png'  },
    { id: 'nova',      name: 'Nova',      description: 'Big Breakthrough',  imageUrl: '/badges/sixthlevel.png'  },
    { id: 'phantom',   name: 'Phantom',   description: 'Elite',             imageUrl: '/badges/seventhlevel.png'},
    { id: 'monarch',   name: 'Monarch',   description: 'Legendary',         imageUrl: '/badges/eightlevel.png'  },
    { id: 'celestial', name: 'Celestial', description: 'Highest Rank',      imageUrl: '/badges/ninelevel.png'   },
    { id: 'crowned',   name: 'Crowned',   description: "Honorable",         imageUrl: '/badges/lastlevel.png'   },
];

const formatXP = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; 
};

// 🔥 FIX: Dicebear Removed! Replaced with your App's exact Native Avatar Hash Logic
const getAvatarUrl = (avatar, name) => {
    if (avatar && avatar.startsWith('http://localhost:5173')) {
        return avatar.replace('http://localhost:5173', '');
    }
    if (avatar) return avatar;
    
    // Exactly matches how Sidebar/Profile generates avatars (e.g. /avatars/avatar3.png)
    const avatarCount = 4;
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % avatarCount) + 1;
    return `/avatars/avatar${index}.png`;
};

const Leaderboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const [currentUserStats, setCurrentUserStats] = useState({
        name: '', avatar: null, rank: '-', streak: 0, focusTime: 0, percentile: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Leaderboard Data
                const res = await fetch('http://localhost:3000/api/leaderboard', { credentials: 'include' });
                const leaderboardData = res.ok ? await res.json() : [];
                setUsers(leaderboardData);
                
                // 2. 🔥 FIX: Fetch actual logged-in user from your API (Same as Sidebar/Profile)
                let loggedInName = '';
                let loggedInAvatar = null;
                let loggedInId = null;
                let loggedInStreak = 0;
                let loggedInXp = 0;
                
                try {
                    const authRes = await fetch("http://localhost:3000/api/auth/me", { credentials: "include" });
                    if (authRes.ok) {
                        const authData = await authRes.json();
                        if (authData && authData.user) {
                            const u = authData.user;
                            loggedInName = u.name || u.username || '';
                            loggedInAvatar = u.avatar || u.imageUrl || u.picture || null;
                            loggedInId = u._id || u.id || null;
                            loggedInStreak = Number(u.streak || 0);
                            loggedInXp = Number(u.xp || u.focusTime || 0);
                        }
                    }
                } catch (authErr) {
                    console.error("Error fetching current user from auth API:", authErr);
                }

                // 3. Match user in Leaderboard
                let myIndex = -1;
                if (loggedInId) {
                    myIndex = leaderboardData.findIndex(u => u.id === loggedInId || u._id === loggedInId);
                }
                if (myIndex === -1 && loggedInName) {
                    myIndex = leaderboardData.findIndex(u => u.name?.toLowerCase() === loggedInName.toLowerCase());
                }

                if (myIndex !== -1) {
                    const me = leaderboardData[myIndex];
                    const totalUsers = leaderboardData.length;
                    const beatCount = totalUsers - (myIndex + 1);
                    const percentile = totalUsers > 1 ? Math.floor((beatCount / totalUsers) * 100) : 99;
                    
                    setCurrentUserStats({
                        name: me.name || loggedInName, 
                        avatar: me.avatar || loggedInAvatar,
                        rank: myIndex + 1, 
                        streak: me.streak || loggedInStreak,
                        focusTime: me.xp || loggedInXp, 
                        percentile: Math.max(1, percentile)
                    });
                } else {
                    // Not in top leaderboard, but we have their real stats from /auth/me!
                    setCurrentUserStats({ 
                        name: loggedInName, 
                        avatar: loggedInAvatar, 
                        rank: '-', 
                        streak: loggedInStreak, 
                        focusTime: loggedInXp, 
                        percentile: 0 
                    });
                }
            } catch (error) { 
                console.error("Error fetching data:", error); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchData();
    }, []);

    // ========== STACKED CARDS ANIMATION UI ==========
    const renderTop3Cards = () => {
        if (users.length < 3) return null;
        
        const top3 = [
            { ...users[0], rank: 1, accent: '#FBBF24', title: 'Champion' },   
            { ...users[1], rank: 2, accent: '#94A3B8', title: 'Challenger' }, 
            { ...users[2], rank: 3, accent: '#F97316', title: 'Contender' },  
        ];

        return (
            <div className="top3-stack-container">
                
                {/* 🔥 LED SMOKE FLOATING PATTERN 🔥 */}
                <div className="smoke-fade-wrapper">
                    <div className="led-smoke-pattern" />
                    <div className="led-smoke-dots" />
                </div>

                {top3.map((user) => (
                    <div 
                        key={user.id || user._id} 
                        className="top3-wrapper" 
                        data-rank={user.rank}
                        onClick={() => navigate(`/profile/${user.id || user._id}`)}
                    >
                        <div className="top3-card" style={{ padding: 0 }}>
                            
                            {/* 🔥 BANNER AREA */}
                            <div style={{ 
                                width: '100%', height: '100px', 
                                position: 'relative', overflow: 'hidden',
                                borderTopLeftRadius: '15px', borderTopRightRadius: '15px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {/* Blurred Background */}
                                <div style={{ 
                                    position: 'absolute', inset: -20, 
                                    backgroundImage: `url(${getAvatarUrl(user.avatar, user.name)})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    filter: 'blur(15px) brightness(0.7)',
                                    zIndex: 0
                                }} />
                                {/* Bottom fade gradient */}
                                <div style={{ 
                                    position: 'absolute', inset: 0, 
                                    background: 'linear-gradient(to bottom, rgba(24,24,27,0) 20%, #18181B)', 
                                    zIndex: 0 
                                }} />

                                {/* 🔥 CLEAN AVATAR */}
                                <div style={{ position: 'relative', zIndex: 2, marginTop: '8px' }}>
                                    <img 
                                        src={getAvatarUrl(user.avatar, user.name)} 
                                        alt={user.name}
                                        referrerPolicy="no-referrer"
                                        style={{ 
                                            width: 64, height: 64, 
                                            borderRadius: '12px',
                                            objectFit: 'cover'
                                        }} 
                                    />
                                    {/* Rank Pill */}
                                    <div style={{ 
                                        position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                                        background: '#18181B', borderRadius: '8px', padding: '2px 10px',
                                        border: `1px solid ${user.accent}50`, display: 'flex', alignItems: 'center', gap: '4px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'
                                    }}>
                                        {user.rank === 1 ? <Crown color={user.accent} size={11} strokeWidth={2.5} /> : <Trophy color={user.accent} size={11} strokeWidth={2.5} />}
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: user.accent }}>#{user.rank}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 🔥 NAME & TITLE */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, zIndex: 2, padding: '16px 12px 10px 12px' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#FFF' }}>{user.name}</h3>
                                <span style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{user.title}</span>
                            </div>

                            {/* 🔥 CLEAN BOLD STATS */}
                            <div style={{ 
                                display: 'flex', justifyContent: 'center', gap: '18px', 
                                marginTop: 'auto', paddingBottom: '20px', zIndex: 2 
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#8A8A8A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '2px' }}>FOCUS</span>
                                    <span style={{ fontSize: '14px', color: '#FFF', fontWeight: 800 }}>{formatXP(user.xp)}</span>
                                </div>
                                
                                <div style={{ width: '1px', height: '28px', backgroundColor: '#2A2A2D', alignSelf: 'center' }} />
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#8A8A8A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '2px' }}>STREAK</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Flame size={13} color="#F97316" strokeWidth={3} />
                                        <span style={{ fontSize: '14px', color: '#FFF', fontWeight: 800 }}>{user.streak || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background-color: ${COLORS.bg}; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 10px; }
                
                .list-row { transition: background 0.15s ease; cursor: pointer; }
                .list-row:hover { background: ${COLORS.cardHover} !important; }

                .badge-slide-wrapper {
                    display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px 0; height: 100%; cursor: pointer;
                }
                .badge-img { 
                    width: 85px; height: 85px; object-fit: contain; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .swiper-slide:not(.swiper-slide-active) .badge-img { opacity: 0.5; filter: grayscale(50%) brightness(0.7); transform: scale(0.9); }
                .swiper-slide-active .badge-img { opacity: 1; transform: scale(1.2) translateY(-10px); }
                
                .badge-shine-overlay {
                    position: absolute; top: 0; left: 0; width: 85px; height: 85px; pointer-events: none;
                    mask-size: contain; -webkit-mask-size: contain;
                    mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;
                    mask-position: center; -webkit-mask-position: center;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 5;
                }
                .swiper-slide:not(.swiper-slide-active) .badge-shine-overlay { transform: scale(0.9); opacity: 0; }
                .swiper-slide-active .badge-shine-overlay { transform: scale(1.2) translateY(-10px); opacity: 1; }

                .shine-sweeper {
                    position: absolute; top: 0; left: -150%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: skewX(-25deg);
                }
                .swiper-slide-active .shine-sweeper { animation: badge-shine-sweep 4s ease-in-out infinite; }
                @keyframes badge-shine-sweep { 0% { left: -100%; } 35% { left: 200%; } 100% { left: 200%; } }
                
                .badge-name-tag {
                    margin-top: 12px; font-size: 13px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.04em;
                    opacity: 0; transform: translateY(8px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .swiper-slide-active .badge-name-tag { opacity: 1; transform: translateY(0); }

                .lock-overlay {
                    position: absolute; bottom: -2px; right: -2px;
                    background-color: ${COLORS.bg}; border-radius: 50%; padding: 6px;
                    border: 2px solid ${COLORS.border};
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.8);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .swiper-slide:not(.swiper-slide-active) .lock-overlay { transform: scale(0.85); opacity: 0.6; }
                .swiper-slide-active .lock-overlay { transform: scale(1.15); border-color: ${COLORS.blue}50; }

                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-up { animation: fadeUp 0.35s ease forwards; }

                .table-container::-webkit-scrollbar { width: 5px; }
                .table-container::-webkit-scrollbar-track { background: transparent; }
                .table-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.04); border-radius: 10px; }
                .table-container:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }

                @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
                .skeleton {
                    background: #1A1A1A;
                    background-image: linear-gradient(90deg, #1A1A1A 0px, #242424 50%, #1A1A1A 100%);
                    background-size: 1000px 100%; animation: shimmer 2s infinite linear; border-radius: 6px;
                }

                /* 🔥 ENVELOPE FOLD ANIMATION 🔥 */
                .env-card-wrapper {
                    position: relative;
                    flex: 1;
                    display: flex;
                    perspective: 1200px;
                    cursor: pointer;
                }
                .env-card {
                    background: ${COLORS.card};
                    border: 1px solid ${COLORS.border};
                    border-radius: 10px;
                    padding: 36px 28px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    clip-path: polygon(0 0, calc(100% - 55px) 0, 100% 55px, 100% 100%, 0 100%);
                    transition: background 0.4s ease;
                }
                .env-flap-shadow {
                    position: absolute;
                    top: -1px;
                    right: -1px;
                    width: 55px;
                    height: 55px;
                    filter: drop-shadow(-5px 5px 6px rgba(0,0,0,0.6));
                    z-index: 20;
                    transition: filter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .env-flap {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #333333 0%, #1A1A1A 100%);
                    clip-path: polygon(0 0, 0 100%, 100% 100%);
                    transform-origin: 50% 50%;
                    transform: rotate3d(1, 1, 0, 0deg);
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
                }
                .env-card-wrapper:hover .env-flap {
                    transform: rotate3d(1, 1, 0, -180deg);
                    background: ${COLORS.cardHover};
                }
                .env-card-wrapper:hover .env-flap-shadow {
                    filter: drop-shadow(0 0 0 rgba(0,0,0,0));
                }
                .env-card-wrapper:hover .env-card {
                    background: ${COLORS.cardHover};
                }

                /* =========================================================
                   🔥 FLOATING LED DOT MATRIX PATTERN 🔥 
                   ========================================================= */

                .smoke-fade-wrapper {
                    position: absolute;
                    width: 550px; 
                    height: 220px;
                    z-index: 0;
                    pointer-events: none;
                    -webkit-mask-image: radial-gradient(ellipse at center, black 15%, transparent 68%);
                    mask-image: radial-gradient(ellipse at center, black 15%, transparent 68%);
                    animation: floatSmoke 4s ease-in-out infinite alternate;
                }

                @keyframes floatSmoke {
                    0% { transform: translateY(6px); }
                    100% { transform: translateY(-6px); }
                }

                .led-smoke-pattern {
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 15% 50%, #FF0055 0%, transparent 60%),
                        radial-gradient(circle at 85% 50%, #00F0FF 0%, transparent 60%),
                        radial-gradient(circle at 50% 15%, #FFB800 0%, transparent 60%),
                        radial-gradient(circle at 50% 85%, #6E00FF 0%, transparent 60%);
                    background-size: 150% 150%;
                    animation: colorShift 8s ease-in-out infinite alternate;
                }

                @keyframes colorShift {
                    0% { background-position: 0% 50%; opacity: 0.7; }
                    50% { background-position: 100% 50%; opacity: 1; }
                    100% { background-position: 50% 100%; opacity: 0.7; }
                }

                .led-smoke-dots {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(circle, transparent 35%, #0F0F0F 45%);
                    background-size: 8px 8px; 
                    z-index: 1;
                }
                
                .top3-stack-container {
                    position: relative;
                    width: 100%;
                    height: 240px; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 24px;
                    perspective: 1200px; 
                }
                .top3-wrapper {
                    position: absolute;
                    width: 170px;  
                    height: 220px; 
                    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    will-change: transform;
                }
                .top3-card {
                    width: 100%;
                    height: 100%;
                    background: #18181B; 
                    border: 1px solid #27272A;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    padding: 16px 14px; 
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    cursor: pointer;
                    overflow: hidden; 
                    position: relative;
                }
                
                .top3-wrapper[data-rank="1"] { z-index: 3; transform: translateX(0) translateY(0) rotate(0deg); }
                .top3-wrapper[data-rank="2"] { z-index: 2; transform: translateX(-40px) translateY(8px) rotate(-8deg) scale(0.95); }
                .top3-wrapper[data-rank="3"] { z-index: 1; transform: translateX(40px) translateY(16px) rotate(8deg) scale(0.9); }

                .top3-stack-container:hover .top3-wrapper[data-rank="1"] { transform: translateX(0) translateY(-10px) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translateX(-135%) translateY(0) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translateX(135%) translateY(0) rotate(0deg); }

                .top3-wrapper:hover { z-index: 20 !important; }
                .top3-wrapper:hover .top3-card {
                    transform: translateY(-12px) scale(1.05);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.8);
                    border-color: #27272A !important; 
                }
            `}</style>

            <Sidebar activePage="Leaderboard" />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', width: '100%', overflowY: 'hidden' }}>
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    {/* ===== HEADER ===== */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginLeft: '64px' }}>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.03em', margin: 0 }}>
                            Leaderboard
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '3px' }}>
                                <button style={{ background: '#252525', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Today</button>
                                <button style={{ background: 'transparent', color: COLORS.textSecondary, border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>7D</button>
                                <button style={{ background: 'transparent', color: COLORS.textSecondary, border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>30D</button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '7px 14px', fontSize: '11px', color: COLORS.textSecondary, fontWeight: 500 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: COLORS.green }} />
                                Updates every 5 minutes
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', flex: 1, minHeight: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '10px' }} />)}
                                </div>
                                <div className="skeleton" style={{ height: '90px', borderRadius: '10px' }} />
                                <div className="skeleton" style={{ flex: 1, borderRadius: '10px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="skeleton" style={{ height: '170px', borderRadius: '10px' }} />
                                <div className="skeleton" style={{ height: '130px', borderRadius: '10px' }} />
                                <div className="skeleton" style={{ flex: 1, borderRadius: '10px' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', flex: 1, minHeight: 0 }}>
                            
                            {/* ⬅️ LEFT COLUMN */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, height: '100%' }}>
                                
                                {renderTop3Cards()}

                                {/* Badge Showcase */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', padding: '0 8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badge Showcase</h4>
                                        <span style={{ fontSize: '11px', color: COLORS.green, fontWeight: 700 }}>3/10 Unlocked</span>
                                    </div>
                                    <div style={{ width: '100%', minWidth: 0 }}>
                                        <Swiper
                                            effect={'coverflow'} grabCursor={true} centeredSlides={true}
                                            slidesPerView={3} loop={true} speed={400} slideToClickedSlide={true}
                                            mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 10, thresholdTime: 50 }}
                                            keyboard={{ enabled: true }}
                                            coverflowEffect={{ rotate: 0, stretch: 10, depth: 100, modifier: 1, slideShadows: false }}
                                            modules={[EffectCoverflow, Mousewheel, Keyboard]}
                                            breakpoints={{ 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }}
                                            style={{ padding: '8px 0 4px 0' }}
                                        >
                                            {ALL_BADGES.map((badge) => (
                                                <SwiperSlide key={badge.id}>
                                                    <div className="badge-slide-wrapper" style={{ padding: '4px 0' }}>
                                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                                            <img src={badge.imageUrl} alt={badge.name} className="badge-img" />
                                                            <div className="badge-shine-overlay" style={{ maskImage: `url(${badge.imageUrl})`, WebkitMaskImage: `url(${badge.imageUrl})` }}>
                                                                <div className="shine-sweeper"></div>
                                                            </div>
                                                            <div className="lock-overlay">
                                                                <Lock size={12} strokeWidth={3} color="#A1A1AA" />
                                                            </div>
                                                        </div>
                                                        <span className="badge-name-tag">{badge.name}</span>
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>

                                {/* Table for Rank 4+ */}
                                {users.length > 3 && (
                                    <div className="table-container" style={{ width: '100%', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}`, fontSize: '11px', color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: COLORS.card, flexShrink: 0 }}>
                                            <div style={{ width: '55px' }}>Rank</div>
                                            <div style={{ flex: 1 }}>Name</div>
                                            <div style={{ width: '130px' }}>Today's time</div>
                                            <div style={{ width: '80px', textAlign: 'center' }}>Streak</div>
                                        </div>
                                        
                                        {users.slice(3, 9).map((user, idx) => (
                                            <div key={user.id || user._id} className="list-row" onClick={() => navigate(`/profile/${user.id || user._id}`)} style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: idx !== Math.min(users.length - 4, 5) ? `1px solid ${COLORS.border}` : 'none', flex: 1, cursor: 'pointer' }}>
                                                <div style={{ width: '55px', fontSize: '13px', fontWeight: 600, color: COLORS.textSecondary }}>{idx + 4}</div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} referrerPolicy="no-referrer"
                                                        style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#222', objectFit: 'cover' }} />
                                                    <span style={{ fontSize: '13px', fontWeight: 500, color: COLORS.textPrimary }}>{user.name}</span>
                                                </div>
                                                <div style={{ width: '130px', fontSize: '13px', color: COLORS.textPrimary, fontWeight: 500 }}>{formatXP(user.xp)}</div>
                                                <div style={{ width: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: COLORS.textPrimary }}>
                                                    <Flame size={13} color={`${COLORS.orange}80`} strokeWidth={2.5} /> {user.streak || 0}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ➡️ RIGHT COLUMN (Minimalist & Clean) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                
                                {/* Profile Card - Minimalist */}
                                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={getAvatarUrl(currentUserStats.avatar, currentUserStats.name)} alt={currentUserStats.name} referrerPolicy="no-referrer"
                                        style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#222', objectFit: 'cover', marginBottom: '16px', border: `1px solid ${COLORS.border}` }} />
                                    
                                    {currentUserStats.name && (
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: '#FFF', letterSpacing: '-0.01em' }}>
                                            {currentUserStats.name}
                                        </h3>
                                    )}
                                    
                                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${COLORS.border}`, borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: 500, color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Trophy size={14} strokeWidth={2} color={COLORS.textSecondary} />
                                        Top {currentUserStats.percentile}% in Timmo users
                                    </div>
                                </div>

                                {/* Today's Summary - Minimalist */}
                                <div>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: COLORS.textPrimary }}>Today's summary</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        
                                        {/* Rank */}
                                        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px' }}>
                                            <div style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 500, marginBottom: '8px' }}>Rank</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Crown size={14} color={COLORS.gold} strokeWidth={2.5} />
                                                <span style={{ fontSize: '20px', fontWeight: 600, color: '#FFF', letterSpacing: '-0.02em' }}>
                                                    {currentUserStats.rank !== '-' ? `#${currentUserStats.rank}` : '-'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '6px', fontWeight: 400 }}>Today</div>
                                        </div>

                                        {/* Streak */}
                                        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px' }}>
                                            <div style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 500, marginBottom: '8px' }}>Streak</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Flame size={14} color={COLORS.orange} strokeWidth={2.5} />
                                                <span style={{ fontSize: '20px', fontWeight: 600, color: '#FFF', letterSpacing: '-0.02em' }}>
                                                    {currentUserStats.streak || 0}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '6px', fontWeight: 400 }}>Current</div>
                                        </div>

                                        {/* Focus Time */}
                                        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px' }}>
                                            <div style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 500, marginBottom: '8px' }}>Focus Time</div>
                                            <div style={{ fontSize: '20px', fontWeight: 600, color: '#FFF', letterSpacing: '-0.02em' }}>
                                                {formatXP(currentUserStats.focusTime)}
                                            </div>
                                            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '6px', fontWeight: 400 }}>Today</div>
                                        </div>

                                        {/* Percentile */}
                                        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px' }}>
                                            <div style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 500, marginBottom: '8px' }}>Percentile</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Trophy size={14} color={COLORS.green} strokeWidth={2.5} />
                                                <span style={{ fontSize: '20px', fontWeight: 600, color: '#FFF', letterSpacing: '-0.02em' }}>
                                                    {currentUserStats.percentile}%
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: COLORS.textMuted, marginTop: '6px', fontWeight: 400 }}>Today</div>
                                        </div>

                                    </div>
                                </div>

                                {/* 🔥 ENVELOPE FOLD CARD: YOU VS YOU (Clean) 🔥 */}
                                <div className="env-card-wrapper">
                                    <div className="env-flap-shadow">
                                        <div className="env-flap"></div>
                                    </div>
                                    
                                    <div className="env-card">
                                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            
                                            <h2 style={{ 
                                                fontSize: '22px', 
                                                fontWeight: 700, 
                                                color: '#FFFFFF', 
                                                lineHeight: 1.2, 
                                                letterSpacing: '-0.02em',
                                                margin: '0 0 16px 0'
                                            }}>
                                                It's always<br/>
                                                <span style={{ color: COLORS.textSecondary }}>You vs You</span>
                                            </h2>
                                            
                                            <div style={{ width: '32px', height: '2px', backgroundColor: COLORS.border, borderRadius: '2px', marginBottom: '16px' }} />
                                            
                                            <p style={{ 
                                                fontSize: '13px', 
                                                color: COLORS.textSecondary, 
                                                lineHeight: 1.6, 
                                                margin: 0, 
                                                fontWeight: 400
                                            }}>
                                                The only person you need to be better than is the person you were yesterday. Keep pushing.
                                            </p>
                                        </div>
                                        
                                        {/* Thinking Orb in Background */}
                                        <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', transform: 'scale(1.8)', transformOrigin: 'bottom right', pointerEvents: 'none', zIndex: 1, opacity: 0.15 }}>
                                            <ThinkingOrb state="searching" size={64} speed={0.65} />
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(Leaderboard);