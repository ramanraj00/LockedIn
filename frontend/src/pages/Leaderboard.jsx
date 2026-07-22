import React, { memo, useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, EffectCoverflow, Autoplay } from 'swiper/modules'; 
import { Trophy, Medal, Flame, Crown, Lock } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

// Matches the exact solid, non-glassmorphic theme of your app (from the screenshots)
const COLORS = {
    bg: '#0A0A0A',         // Deep solid black background
    card: '#121212',       // Solid flat card background
    cardHover: '#18181B',  // Slightly lighter flat background for hover
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#52525B',
    border: 'rgba(255,255,255,0.05)', // Very subtle, non-glassy border
    primary: '#3B82F6',    // The blue used in your app
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
    { id: 'crowned',   name: 'Crowned',   description: "Honorable",         imageUrl: '/badges/lastlevel.png' },
];

const formatXP = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; 
};

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentUserStats, setCurrentUserStats] = useState({
        name: 'User',
        avatar: null,
        rank: '-', 
        streak: 0,
        focusTime: 0,
        percentile: 0
    });

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:3000/api/leaderboard', {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                    
                    // Attempt to find the currently logged in user
                    let loggedInName = 'Sinchan'; // Default fallback based on screenshot
                    let loggedInAvatar = null;
                    
                    try {
                        const localUser = localStorage.getItem('user') || localStorage.getItem('profile');
                        if (localUser) {
                            const parsed = JSON.parse(localUser);
                            if (parsed.name) loggedInName = parsed.name;
                            if (parsed.imageUrl || parsed.avatar) loggedInAvatar = parsed.imageUrl || parsed.avatar;
                        }
                    } catch (e) {
                        console.error("Could not parse local user:", e);
                    }

                    // Find user in the sorted leaderboard
                    const myIndex = data.findIndex(u => u.name.toLowerCase() === loggedInName.toLowerCase());
                    
                    if (myIndex !== -1) {
                        const me = data[myIndex];
                        const totalUsers = data.length;
                        // Calculate real percentile (e.g. if rank 7 out of 10, beat 30% of users)
                        const beatCount = totalUsers - (myIndex + 1);
                        const percentile = totalUsers > 1 ? Math.floor((beatCount / totalUsers) * 100) : 99;
                        
                        setCurrentUserStats({
                            name: me.name,
                            avatar: me.avatar || loggedInAvatar,
                            rank: myIndex + 1,
                            streak: me.streak || 0,
                            focusTime: me.xp || 0,
                            percentile: Math.max(1, percentile) // ensure at least 1%
                        });
                    } else {
                        // User not found in leaderboard yet
                        setCurrentUserStats({
                            name: loggedInName,
                            avatar: loggedInAvatar,
                            rank: '-',
                            streak: 0,
                            focusTime: 0,
                            percentile: 0
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);


    // TOP 3 CARDS (Solid, Flat Theme)
    const renderTop3Cards = () => {
        if (users.length < 3) return null; 

        const top3 = [
            { ...users[0], rank: 1, color: '#FBBF24', title: 'Champion' }, 
            { ...users[1], rank: 2, color: '#9CA3AF', title: 'Challenger' }, 
            { ...users[2], rank: 3, color: '#D97706', title: 'Contender' },  
        ];

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%', marginBottom: '24px' }}>
                {top3.map((user) => (
                    <div key={user.id} className="flat-card" style={{ 
                        backgroundColor: COLORS.card, 
                        border: `1px solid ${COLORS.border}`, 
                        borderRadius: '16px', 
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s ease',
                    }}>
                        
                        {/* Top Area: Avatar + Name */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <img 
                                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} 
                                        alt={user.name}
                                        style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${user.color}`, objectFit: 'cover' }} 
                                    />
                                    <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', background: user.color, color: '#0A0A0A', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px' }}>
                                        {user.rank}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{user.name}</h3>
                                    <span style={{ fontSize: '11px', color: user.color, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user.title}</span>
                                </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                                {user.rank === 1 ? <Crown color={user.color} size={28} /> : <Trophy color={user.color} size={24} />}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '100%', height: '1px', backgroundColor: COLORS.border, marginBottom: '16px' }}></div>

                        {/* Bottom Stats Area */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Focus</span>
                                <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 700 }}>{formatXP(user.xp)}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Streak</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 700 }}>{user.streak || 0}</span>
                                    <Flame size={14} color="#F97316" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background-color: ${COLORS.bg}; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                .flat-card:hover { border-color: rgba(255,255,255,0.1) !important; background-color: ${COLORS.cardHover} !important; }
                .list-row { transition: background-color 0.2s ease; }
                .list-row:hover { background-color: ${COLORS.cardHover}; }

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
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 5;
                }
                .swiper-slide:not(.swiper-slide-active) .badge-shine-overlay { transform: scale(0.9); opacity: 0; }
                .swiper-slide-active .badge-shine-overlay { transform: scale(1.2) translateY(-10px); opacity: 1; }

                .shine-sweeper {
                    position: absolute; top: 0; left: -150%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: skewX(-25deg);
                }
                .swiper-slide-active .shine-sweeper {
                    animation: badge-shine-sweep 4s ease-in-out infinite;
                }
                @keyframes badge-shine-sweep {
                    0% { left: -100%; }
                    35% { left: 200%; }
                    100% { left: 200%; }
                }
                
                .badge-name-tag {
                    margin-top: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #FFFFFF;
                    letter-spacing: 0.05em;
                    opacity: 0;
                    transform: translateY(8px);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .swiper-slide-active .badge-name-tag { opacity: 1; transform: translateY(0); }

                .lock-overlay {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background-color: #0A0A0A;
                    border-radius: 50%;
                    padding: 6px;
                    border: 2px solid rgba(255,255,255,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.8);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .swiper-slide:not(.swiper-slide-active) .lock-overlay { transform: scale(0.85); opacity: 0.6; }
                .swiper-slide-active .lock-overlay { transform: scale(1.15); border-color: rgba(59, 130, 246, 0.4); }
                
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fadeUp 0.4s ease forwards; }

                .table-container::-webkit-scrollbar { width: 6px; }
                .table-container::-webkit-scrollbar-track { background: transparent; }
                .table-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .table-container:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                .skeleton {
                    background: #18181B;
                    background-image: linear-gradient(90deg, #18181B 0px, #27272A 50%, #18181B 100%);
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite linear;
                    border-radius: 8px;
                }
            `}</style>

            <div style={{ height: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', overflow: 'hidden' }}>
                
                <Sidebar activePage="Leaderboard" />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px clamp(24px, 4vw, 48px)', width: '100%', overflowY: 'hidden' }}>
                    
                    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        
                        {/* Header Banner - Fixed Overlap */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginLeft: '64px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>
                                Leaderboard
                            </h1>

                            <div style={{ display: 'flex', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '4px' }}>
                                <button style={{ background: '#27272A', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Today</button>
                                <button style={{ background: 'transparent', color: COLORS.textSecondary, border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>7D</button>
                                <button style={{ background: 'transparent', color: COLORS.textSecondary, border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>30D</button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
                                {/* ⬅️ Skeleton LEFT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, height: '100%' }}>
                                    {/* Top 3 Cards Skeleton */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%', marginBottom: '24px' }}>
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '20px', height: '154px', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                                                            <div className="skeleton" style={{ width: '80px', height: '14px' }}></div>
                                                            <div className="skeleton" style={{ width: '50px', height: '10px' }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                                                </div>
                                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                                                    <div className="skeleton" style={{ width: '40px', height: '14px' }}></div>
                                                    <div className="skeleton" style={{ width: '30px', height: '14px' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Badges Skeleton */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', padding: '0 12px' }}>
                                        <div className="skeleton" style={{ width: '100px', height: '12px' }}></div>
                                        <div className="skeleton" style={{ width: '60px', height: '10px' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '8px 0 4px 0', overflow: 'hidden' }}>
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="skeleton" style={{ width: i === 3 ? '100px' : '80px', height: i === 3 ? '100px' : '80px', borderRadius: '50%', flexShrink: 0, opacity: i === 3 ? 1 : 0.4 }}></div>
                                        ))}
                                    </div>
                                    
                                    {/* Table Skeleton */}
                                    <div style={{ width: '100%', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', padding: '24px 24px 16px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
                                            <div className="skeleton" style={{ width: '40px', height: '12px' }}></div>
                                            <div className="skeleton" style={{ width: '80px', height: '12px', marginLeft: '20px' }}></div>
                                        </div>
                                        {[1,2,3,4].map(i => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: i !== 4 ? `1px solid ${COLORS.border}` : 'none' }}>
                                                <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div>
                                                <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', marginLeft: '40px' }}></div>
                                                <div className="skeleton" style={{ width: '120px', height: '14px', marginLeft: '16px' }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* ➡️ Skeleton RIGHT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                                    {/* You Card Skeleton */}
                                    <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: '16px' }}></div>
                                        <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '12px' }}></div>
                                        <div className="skeleton" style={{ width: '160px', height: '24px', borderRadius: '20px' }}></div>
                                    </div>
                                    
                                    {/* Summary Grid Skeleton */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div className="skeleton" style={{ width: '100px', height: '14px' }}></div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div className="skeleton" style={{ width: '40px', height: '12px' }}></div>
                                                    <div className="skeleton" style={{ width: '60px', height: '20px' }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* You vs World Skeleton */}
                                    <div style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                                        <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
                                        <div className="skeleton" style={{ width: '80px', height: '42px' }}></div>
                                        <div className="skeleton" style={{ width: '160px', height: '12px' }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: COLORS.textMuted }}>No users found in leaderboard.</div>
                        ) : (
                            <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
                                
                                {/* ⬅️ LEFT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, height: '100%' }}>
                                    
                                    {renderTop3Cards()}

                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', margin: '4px 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', padding: '0 12px' }}>
                                            <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badge Showcase</h4>
                                            <p style={{ margin: 0, fontSize: '11px', color: COLORS.primary, fontWeight: 700 }}>3/10 Unlocked</p>
                                        </div>
                                        <div style={{ width: '100%', minWidth: 0 }}>
                                            <Swiper
                                                effect={'coverflow'}
                                                grabCursor={true}
                                                centeredSlides={true}
                                                slidesPerView={3}
                                                loop={true} 
                                                speed={400}
                                                slideToClickedSlide={true}
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

                                    {users.length > 3 && (
                                        <div className="table-container" style={{ width: '100%', backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', overflowY: 'auto', flex: 1 }}>
                                            <div style={{ display: 'flex', padding: '24px 24px 16px 24px', borderBottom: `1px solid ${COLORS.border}`, fontSize: '11px', color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: 0, background: COLORS.card, zIndex: 10 }}>
                                                <div style={{ width: '60px' }}>Rank</div>
                                                <div style={{ flex: 1 }}>Player</div>
                                                <div style={{ width: '100px', textAlign: 'center' }}>Streak</div>
                                                <div style={{ width: '120px', textAlign: 'right' }}>Focus Time</div>
                                            </div>
                                            
                                            {users.slice(3).map((user, idx) => (
                                                <div key={user.id} className="list-row" style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: idx !== (users.length - 4) ? `1px solid ${COLORS.border}` : 'none', cursor: 'pointer' }}>
                                                    <div style={{ width: '60px', fontSize: '15px', fontWeight: 600, color: COLORS.textSecondary, fontFamily: 'monospace' }}>
                                                        {idx + 4}
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#2A2A2A', objectFit: 'cover' }} />
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#E5E7EB' }}>{user.name}</span>
                                                    </div>
                                                    <div style={{ width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#F97316', fontSize: '13px', fontWeight: 600 }}>
                                                        {user.streak || 0} <Flame size={12} style={{ marginLeft: '4px' }} />
                                                    </div>
                                                    <div style={{ width: '120px', fontSize: '13px', color: '#FFFFFF', fontWeight: 600, textAlign: 'right' }}>
                                                        {formatXP(user.xp)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ➡️ RIGHT COLUMN (Fixed Stats) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                                    
                                    <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img 
                                            src={currentUserStats.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUserStats.name)}`} 
                                            alt={currentUserStats.name} 
                                            style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${COLORS.border}`, backgroundColor: '#1A1A1A', marginBottom: '16px', objectFit: 'cover' }} 
                                        />
                                        
                                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFF' }}>{currentUserStats.name}</h2>
                                        
                                        <div style={{ marginTop: '12px', background: COLORS.cardHover, border: `1px solid ${COLORS.border}`, borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Trophy size={14} color={COLORS.textSecondary} />
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.textSecondary }}>Top {currentUserStats.percentile}% in users</span>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.textSecondary }}>Today's summary</h3>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '8px' }}>Rank</span>
                                                <span style={{ fontSize: '20px', fontWeight: 800, color: '#FBBF24' }}>#{currentUserStats.rank}</span>
                                                <span style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '4px' }}>Global</span>
                                            </div>

                                            <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '8px' }}>Streak</span>
                                                <span style={{ fontSize: '20px', fontWeight: 800, color: '#F97316' }}>{currentUserStats.streak} days</span>
                                                <span style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '4px' }}>Current</span>
                                            </div>

                                            <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '8px' }}>Focus Time</span>
                                                <span style={{ fontSize: '20px', fontWeight: 800, color: COLORS.primary }}>{formatXP(currentUserStats.focusTime)}</span>
                                                <span style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '4px' }}>Today</span>
                                            </div>

                                            <div className="flat-card" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '12px', color: COLORS.textSecondary, fontWeight: 600, marginBottom: '8px' }}>Percentile</span>
                                                <span style={{ fontSize: '20px', fontWeight: 800, color: '#34D399' }}>{currentUserStats.percentile}%</span>
                                                <span style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '4px' }}>Today</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* You vs The World */}
                                    <div style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>You vs the world</h4>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '42px', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em', lineHeight: 1 }}>{100 - currentUserStats.percentile}</span>
                                            <span style={{ fontSize: '18px', fontWeight: 700, color: COLORS.textSecondary }}>%</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary, lineHeight: 1.5, maxWidth: '80%' }}>
                                            Focused more than {100 - currentUserStats.percentile}% of users today.
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(Leaderboard);
