import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { Trophy, Crown, Lock } from 'lucide-react'; 

// 🔥 SWIPER.JS IMPORTS 
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { apiFetch } from '../apiClient';

// 🔥 Premium, soft metallic accents
const COLORS = {
    bg: '#0F0F0F',
    card: '#171717',
    cardHover: '#1E1E1E',
    textPrimary: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#505050',
    border: '#262626',
    gold: '#F59E0B',   
    silver: '#B4B4B8', 
    bronze: '#C98B66', 
    green: '#10B981',
    blue: '#60A5FA',
    orange: '#FB923C',
};

const formatXP = (seconds) => {
    if (!seconds || seconds <= 0) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`; 
};

// 🔥 Helper function for Name-based Background Colors
const getColorFromName = (name) => {
    const gradients = [
        'linear-gradient(135deg, #6366F1, #8B5CF6)',
        'linear-gradient(135deg, #EC4899, #F43F5E)',
        'linear-gradient(135deg, #F97316, #EAB308)',
        'linear-gradient(135deg, #22C55E, #14B8A6)',
        'linear-gradient(135deg, #06B6D4, #3B82F6)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

// 🌟 OPTIMIZATION: Avatar har table row me render hota hai, memo se unnecessary re-renders band
const Avatar = memo(({ src, name, size = 32, style = {} }) => {
    const [error, setError] = useState(false);
    const initial = (name || 'U').charAt(0).toUpperCase();
    const hasValidSrc = src && src.trim() !== '' && src !== 'null' && src !== 'undefined' && !src.includes('default');
    
    if (!hasValidSrc || error) {
        return (
            <div style={{
                width: size, height: size, borderRadius: style.borderRadius || '50%',
                background: getColorFromName(name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', fontWeight: 800, fontSize: size * 0.45,
                flexShrink: 0, ...style
            }}>
                {initial}
            </div>
        );
    }
    
    return (
        <img
            src={src}
            alt={name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setError(true)}
            style={{ width: size, height: size, borderRadius: style.borderRadius || '50%', objectFit: 'cover', flexShrink: 0, ...style }}
        />
    );
});

const getAvatarUrl = (avatar, name) => {
    if (avatar && avatar !== 'null' && avatar !== 'undefined') {
        if (avatar.startsWith('http://localhost:5173')) {
            return avatar.replace('http://localhost:5173', '');
        }
        if (avatar.startsWith('http') || avatar.startsWith('data:')) {
            return avatar;
        }
        if (avatar.includes('avatars/')) {
            return avatar.startsWith('/') ? avatar : `/${avatar}`;
        }
        if (avatar.includes('uploads/')) {
            return avatar.startsWith('/') ? `http://localhost:3000${avatar}` : `http://localhost:3000/${avatar}`;
        }
        if (avatar.startsWith('/')) {
            return `http://localhost:3000${avatar}`;
        }
        return avatar;
    }
    return null;
};

// =======================================================
// 🔥 COMPONENT: Clean & SUPER SMOOTH Top3 Stack (SAFARI OPTIMIZED)
// =======================================================
const Top3Stack = memo(({ top3Users, navigate }) => {
    if (!top3Users || top3Users.length < 3) return null;

    const top3 = [
        { ...top3Users[0], rank: 1, accent: '#FBBF24', title: 'Champion' },   
        { ...top3Users[1], rank: 2, accent: '#94A3B8', title: 'Challenger' }, 
        { ...top3Users[2], rank: 3, accent: '#F97316', title: 'Contender' },  
    ];

    const renderFakeCard = (color1, color2, color3, side) => {
        const angle = side === 'left' ? '135deg' : '225deg';
        return (
            <div className="fake-card">
                <div style={{ width: '100%', height: '100px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                    <div style={{ 
                        position: 'absolute', inset: -20, 
                        background: `linear-gradient(${angle}, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
                        opacity: 0.85,
                        zIndex: 0
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(24,24,27,0) 20%, #18181B)', zIndex: 0 }} />
                </div>
            </div>
        );
    };

    return (
        <div className="top3-stack-container">
            <div className="fake-card-wrapper fake-l3">{renderFakeCard('#06b6d4', '#3b82f6', '#8b5cf6', 'left')}</div> 
            <div className="fake-card-wrapper fake-l2">{renderFakeCard('#3b82f6', '#f59e0b', '#ef4444', 'left')}</div> 
            <div className="fake-card-wrapper fake-l1">{renderFakeCard('#ec4899', '#8b5cf6', '#eab308', 'left')}</div> 

            <div className="fake-card-wrapper fake-r3">{renderFakeCard('#4f46e5', '#a855f7', '#f97316', 'right')}</div> 
            <div className="fake-card-wrapper fake-r2">{renderFakeCard('#3b82f6', '#4338ca', '#f43f5e', 'right')}</div> 
            <div className="fake-card-wrapper fake-r1">{renderFakeCard('#8b5cf6', '#ec4899', '#06b6d4', 'right')}</div> 

            {top3.map((user, idx) => (
                <div 
                    key={user.id || user._id || `top3-${idx}`} 
                    className="top3-wrapper" 
                    data-rank={user.rank}
                    onClick={() => navigate(`/profile/${user.id || user._id}`)}
                >
                    <div className="top3-card" style={{ padding: 0 }}>
                        <div style={{ width: '100%', height: '100px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: -20, backgroundImage: `url(${getAvatarUrl(user.avatar, user.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px) brightness(0.7)', zIndex: 0 }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(24,24,27,0) 20%, #18181B)', zIndex: 0 }} />
                            
                            <div style={{ position: 'relative', zIndex: 2, marginTop: '8px' }}>
                                <Avatar src={getAvatarUrl(user.avatar, user.name)} name={user.name} size={64} style={{ borderRadius: '12px' }} />
                                <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#18181B', borderRadius: '8px', padding: '2px 10px', border: `1px solid ${user.accent}50`, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
                                    {user.rank === 1 ? <Crown color={user.accent} size={11} strokeWidth={2.5} /> : <Trophy color={user.accent} size={11} strokeWidth={2.5} />}
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: user.accent }}>#{user.rank}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, zIndex: 2, padding: '16px 12px 10px 12px' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#FFF' }}>{user.name}</h3>
                            <span style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{user.title}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', margin: 'auto 0 16px 0', zIndex: 2 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#8A8A8A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>FOCUS</span>
                                <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 800 }}>{formatXP(user.xp)}</span>
                            </div>
                            <div style={{ width: '1px', height: '28px', backgroundColor: '#2A2A2D', alignSelf: 'center' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', color: '#8A8A8A', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>STREAK</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <img src="/color-fire.webp" alt="Streak" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                    <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 800 }}>{user.streak || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

// ─── MODULE LEVEL: Static badge data ───
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
    { id: 'crowned',   name: 'Crowned',   description: "Honorable",         requirement: 'Stay consistent for 12 months and 1 day', requiredDays: 366, imageUrl: '/badges/lastlevel.webp' },
];

// =======================================================
// 🔥 COMPONENT: Floating 3D Dialer Carousel
// =======================================================
const BadgeCarousel = memo(() => {
    const [badgeData, setBadgeData] = useState({ activeDays: 0, totalFocusTime: 0 });

    useEffect(() => {
        let mounted = true;
        const loadStats = async () => {
            try {
                const [authRes, heatmapRes] = await Promise.allSettled([
                    apiFetch("/api/auth/me", { credentials: "include" }),
                    apiFetch("/api/dashboard/dashboard/heatmap", { credentials: "include" })
                ]);
                
                let focusTime = 0;
                let activeD = 0;
                
                if (authRes.status === 'fulfilled' && authRes.value.ok) {
                    const data = await authRes.value.json();
                    if (data?.user) focusTime = Number(data.user.totalFocusTimeAllTime || data.user.xp || 0);
                }
                
                if (heatmapRes.status === 'fulfilled' && heatmapRes.value.ok) {
                    const data = await heatmapRes.value.json();
                    if (data?.heatmapData) {
                        activeD = data.heatmapData.filter(d => d.intensity > 0 || d.hours > 0).length;
                    }
                }
                
                if (mounted) setBadgeData({ activeDays: activeD, totalFocusTime: focusTime });
            } catch (error) { console.error("Error loading badge stats", error); }
        };
        loadStats();
        return () => { mounted = false; };
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0 16px', marginTop: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', paddingBottom: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.01em', margin: 0 }}>
                            Achievements
                        </h3>
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, width: '130%', height: '2px',
                            background: 'linear-gradient(to right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                            borderRadius: '2px'
                        }} />
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
                <Swiper
                    key={`swiper-${badgeData.activeDays}-${badgeData.totalFocusTime}`}
                    effect={'coverflow'} grabCursor={true} centeredSlides={true} slidesPerView={3} loop={true} slideToClickedSlide={true} 
                    coverflowEffect={{ rotate: 0, stretch: 250, depth: 300, modifier: 1, slideShadows: false }}
                    modules={[EffectCoverflow]} style={{ width: '100%', maxWidth: '550px', height: '160px' }} 
                >
                    {ALL_BADGES.map((badge) => (
                        <SwiperSlide key={badge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                            {({ isActive, isPrev, isNext }) => {
                                const showBadge = isActive || isPrev || isNext;
                                const isUnlocked = badge.id === 'feather' 
                                    ? (badgeData.totalFocusTime >= 36000) 
                                    : (badgeData.activeDays >= badge.requiredDays);
                                    
                                return (
                                    <div style={{ 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                        opacity: showBadge ? (isActive ? 1 : 0.4) : 0, 
                                        transform: isActive ? 'scale(1.2)' : 'scale(1)', 
                                        pointerEvents: showBadge ? 'auto' : 'none'
                                    }}>
                                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                                            <img src={badge.imageUrl} alt={badge.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'none' }} />
                                            {!isUnlocked && (
                                                <div style={{
                                                    position: 'absolute', bottom: '4px', right: '4px', width: '24px', height: '24px',
                                                    borderRadius: '50%', backgroundColor: '#111218', border: '2px solid #2A2C38', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.6)', zIndex: 10
                                                }}>
                                                    <Lock size={11} color="#8A8F9E" strokeWidth={2.5} />
                                                </div>
                                            )}
                                            {isActive && (
                                                <div className="badge-shimmer-overlay" style={{
                                                    position: 'absolute', inset: 0, zIndex: 2,
                                                    WebkitMaskImage: `url(${badge.imageUrl})`, maskImage: `url(${badge.imageUrl})`,
                                                    WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center', maskPosition: 'center', pointerEvents: 'none'
                                                }} />
                                            )}
                                        </div>
                                        <span style={{
                                            marginTop: '12px', fontSize: '11px', fontWeight: 800, color: '#FFF',
                                            letterSpacing: '0.08em', textTransform: 'uppercase', opacity: isActive ? 1 : 0, 
                                            transition: 'opacity 0.3s ease', textAlign: 'center'
                                        }}>
                                            {badge.name}
                                        </span>
                                    </div>
                                );
                            }}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
});


// =======================================================
// 🔥 COMPONENT: Extracted Table to prevent main re-renders
// =======================================================
const LeaderboardTable = memo(({ tableUsers, navigate }) => {
    if (!tableUsers || tableUsers.length === 0) return null;
    return (
        <div className="table-container" style={{ width: '100%', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div className="table-header-row" style={{ display: 'flex', padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`, fontSize: '12px', color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#1A1A1A', flexShrink: 0 }}>
                <div style={{ width: '60px' }}>Rank</div>
                <div style={{ flex: 1 }}>Name</div>
                <div style={{ width: '140px' }}>Today's time</div>
                <div style={{ width: '90px', textAlign: 'center' }}>Streak</div>
            </div>
            
            <div className="table-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {tableUsers.map((user, idx, arr) => (
                    <div key={user.id || user._id || `table-${idx}`} className="list-row" onClick={() => navigate(`/profile/${user.id || user._id}`)} 
                         style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: idx !== arr.length - 1 ? `1px solid ${COLORS.border}` : 'none', cursor: 'pointer' }}>
                        <div style={{ width: '60px', fontSize: '14px', fontWeight: 700, color: COLORS.textSecondary }}>#{idx + 4}</div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar src={getAvatarUrl(user.avatar, user.name)} name={user.name} size={32} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.textPrimary }}>{user.name}</span>
                        </div>
                        <div style={{ width: '140px', fontSize: '14px', color: COLORS.textPrimary, fontWeight: 600 }}>{formatXP(user.xp)}</div>
                        <div style={{ width: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: COLORS.textPrimary }}>
                            <img src="/color-fire.webp" alt="Streak" style={{ width: 24, height: 24, objectFit: 'contain' }} /> 
                            {user.streak || 0}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// =======================================================
// MAIN COMPONENT
// =======================================================
const CACHE_KEY = 'leaderboard_cache';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentUserStats, setCurrentUserStats] = useState({
        name: '', avatar: null, rank: '-', streak: 0, focusTime: 0, percentile: 0
    });

    useEffect(() => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { users: cachedUsers, stats: cachedStats } = JSON.parse(cached);
                if (cachedUsers && cachedUsers.length > 0) {
                    setUsers(cachedUsers);
                    setCurrentUserStats(cachedStats);
                    setIsLoading(false); 
                }
            }
        } catch (e) { }

        const fetchData = async (isBackground = false) => {
            const startTime = Date.now();
            if (!isBackground && users.length === 0) setIsLoading(true);
            try {
                const [leaderboardRes, authRes] = await Promise.allSettled([
                    apiFetch('/api/leaderboard', { credentials: 'include' }),
                    apiFetch("/api/auth/me", { credentials: "include" })
                ]);

                let leaderboardData = [];
                if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
                    leaderboardData = await leaderboardRes.value.json();
                }
                setUsers(leaderboardData);
                
                let loggedInName = '';
                let loggedInAvatar = null;
                let loggedInId = null;
                let loggedInStreak = 0;
                let loggedInXp = 0;
                
                if (authRes.status === 'fulfilled' && authRes.value.ok) {
                    const authData = await authRes.value.json();
                    if (authData && authData.user) {
                        const u = authData.user;
                        loggedInName = u.name || u.username || '';
                        loggedInAvatar = u.avatar || u.imageUrl || u.picture || null;
                        loggedInId = u._id || u.id || null;
                        loggedInStreak = Number(u.streak || 0);
                        loggedInXp = Number(u.xp || u.focusTime || 0);
                    }
                }

                let myIndex = -1;
                if (loggedInId) {
                    myIndex = leaderboardData.findIndex(u => u.id === loggedInId || u._id === loggedInId);
                }
                if (myIndex === -1 && loggedInName) {
                    myIndex = leaderboardData.findIndex(u => u.name?.toLowerCase() === loggedInName.toLowerCase());
                }

                let newStats;
                if (myIndex !== -1) {
                    const me = leaderboardData[myIndex];
                    const totalUsers = leaderboardData.length;
                    const beatCount = totalUsers - (myIndex + 1);
                    const percentile = totalUsers > 1 ? Math.floor((beatCount / totalUsers) * 100) : 99;
                    
                    newStats = {
                        name: me.name || loggedInName, 
                        avatar: me.avatar || loggedInAvatar,
                        rank: myIndex + 1, 
                        streak: me.streak || loggedInStreak,
                        focusTime: me.xp || loggedInXp, 
                        percentile: Math.max(1, percentile)
                    };
                } else {
                    newStats = { 
                        name: loggedInName, avatar: loggedInAvatar, rank: '-', streak: loggedInStreak, focusTime: loggedInXp, percentile: 0 
                    };
                }

                setCurrentUserStats(newStats);
                
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                        users: leaderboardData,
                        stats: newStats
                    }));
                } catch (e) { }

            } catch (error) { 
                console.error("Error fetching data:", error); 
            } finally { 
                const elapsed = Date.now() - startTime;
                const delay = Math.max(0, 1500 - elapsed);
                setTimeout(() => {
                    setIsLoading(false); 
                }, delay);
            }
        };

        fetchData(false);

        const intervalId = setInterval(() => {
            fetchData(true);
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    const handleNavigate = useCallback((id) => {
        let cleanId = id.toString().replace('/profile/', '');
        navigate(`/profile/${cleanId}`);
    }, [navigate]);

    const top3Users = useMemo(() => users.slice(0, 3), [users]);
    const tableUsers = useMemo(() => users.slice(3, 8), [users]);

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                @font-face {
                    font-family: 'Poppins';
                    src: url('/poppin.ttf') format('truetype');
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background-color: ${COLORS.bg}; }
                
                .list-row { transition: background 0.15s ease; cursor: pointer; }
                .list-row:hover { background: ${COLORS.cardHover} !important; }

                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-up { animation: fadeUp 0.35s ease forwards; }

                /* 🔥 Hidden scrollbars for clean look */
                .main-content-wrapper::-webkit-scrollbar { display: none; }
                .main-content-wrapper { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
                .skeleton {
                    background: #1A1A1A;
                    background-image: linear-gradient(90deg, #1A1A1A 0px, #242424 50%, #1A1A1A 100%);
                    background-size: 1000px 100%; animation: shimmer 2s infinite linear; border-radius: 6px;
                }
                
                .badge-shimmer-overlay::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
                    transform: skewX(-20deg);
                    animation: badge-shine 3s infinite;
                }
                @keyframes badge-shine {
                    0% { left: -150%; }
                    20% { left: 150%; }
                    100% { left: 150%; }
                }

                .decorative-corner {
                    position: absolute;
                    top: -32px;
                    right: calc(360px + 32px);
                    width: 90px;
                    height: 90px;
                    border-top: 2px dashed rgba(255,255,255,0.25);
                    border-right: 2px dashed rgba(255,255,255,0.25);
                    border-top-right-radius: 16px;
                    pointer-events: none;
                    z-index: 10;
                    -webkit-mask-image: linear-gradient(to bottom left, black 10%, transparent 90%);
                    mask-image: linear-gradient(to bottom left, black 10%, transparent 90%);
                }

                .fake-card-wrapper {
                    position: absolute;
                    width: 170px;
                    height: 220px;
                    will-change: transform, opacity;
                    z-index: 0;
                    pointer-events: none;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }

                .fake-card {
                    width: 100%;
                    height: 100%;
                    background: #18181B; 
                    border: 1px solid #27272A;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    position: relative;
                    overflow: hidden;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }

                .fake-l1 { transform: translate3d(-80px, 22px, 0) rotate(-14deg) scale(0.9); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.4s ease-out 0.0s; }
                .fake-r1 { transform: translate3d(80px, 22px, 0) rotate(14deg) scale(0.9); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.4s ease-out 0.0s; }
                .fake-l2 { transform: translate3d(-120px, 38px, 0) rotate(-20deg) scale(0.85); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.4s ease-out 0.1s; }
                .fake-r2 { transform: translate3d(120px, 38px, 0) rotate(20deg) scale(0.85); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.4s ease-out 0.1s; }
                .fake-l3 { transform: translate3d(-160px, 58px, 0) rotate(-26deg) scale(0.8); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.4s ease-out 0.2s; }
                .fake-r3 { transform: translate3d(160px, 58px, 0) rotate(26deg) scale(0.8); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.4s ease-out 0.2s; }

                .top3-stack-container:hover .fake-l1, .top3-stack-container:hover .fake-l2, .top3-stack-container:hover .fake-l3 { opacity: 0; transform: translate3d(-135%, 0, 0) rotate(0deg) scale(0.9); }
                .top3-stack-container:hover .fake-r1, .top3-stack-container:hover .fake-r2, .top3-stack-container:hover .fake-r3 { opacity: 0; transform: translate3d(135%, 0, 0) rotate(0deg) scale(0.9); }

                .top3-stack-container:hover .fake-l3, .top3-stack-container:hover .fake-r3 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.3s ease-out 0.3s; }
                .top3-stack-container:hover .fake-l2, .top3-stack-container:hover .fake-r2 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.3s ease-out 0.4s; }
                .top3-stack-container:hover .fake-l1, .top3-stack-container:hover .fake-r1 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.3s ease-out 0.5s; }
                
                .top3-stack-container { position: relative; width: 100%; height: 240px; display: flex; justify-content: center; align-items: center; margin-bottom: 40px; perspective: 1200px; }
                
                .top3-wrapper { position: absolute; width: 170px; height: 220px; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden; }
                .top3-card { width: 100%; height: 100%; background: #18181B; border: 1px solid #27272A; border-radius: 16px; display: flex; flex-direction: column; padding: 16px 14px; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.5); cursor: pointer; overflow: hidden; position: relative; will-change: transform; transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden; }
                
                .top3-wrapper[data-rank="1"] { z-index: 3; transform: translate3d(0, 0, 0) rotate(0deg); }
                .top3-wrapper[data-rank="2"] { z-index: 2; transform: translate3d(-40px, 8px, 0) rotate(-8deg) scale(0.95); }
                .top3-wrapper[data-rank="3"] { z-index: 1; transform: translate3d(40px, 8px, 0) rotate(8deg) scale(0.95); }

                .top3-stack-container:hover .top3-wrapper[data-rank="1"] { transform: translate3d(0, -10px, 0) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-135%, 0, 0) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(135%, 0, 0) rotate(0deg); }

                .top3-wrapper:hover { z-index: 20 !important; }
                .top3-wrapper:hover .top3-card { transform: translate3d(0, -12px, 0) scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.8); border-color: #27272A !important; }

                @media (max-width: 1024px) {
                    .main-content-wrapper { padding: 56px 20px 20px 20px !important; overflow-y: auto !important; }
                    .leaderboard-header { margin-left: 0 !important; flex-direction: column !important; align-items: flex-start !important; gap: 12px; margin-bottom: 24px !important; }
                    .main-grid { display: flex !important; flex-direction: column !important; gap: 32px; height: auto !important; }
                    .left-col, .right-col { height: auto !important; min-height: auto !important; }
                    .table-container { flex: none !important; height: auto !important; min-height: auto !important; }
                    .table-scroll { overflow-y: visible !important; height: auto !important; }
                    .list-row { padding: 20px 24px !important; } 
                    .decorative-corner { display: none; }
                }

                @media (max-width: 768px) {
                    .leaderboard-title { font-size: 36px !important; }
                    .table-container { overflow-x: auto !important; }
                    .table-header-row, .table-scroll { min-width: 500px; }
                    .top3-stack-container { transform: scale(0.75) !important; margin-bottom: 10px !important; height: 280px !important; margin-top: 10px !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-110%, 0, 0) rotate(0deg) !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(110%, 0, 0) rotate(0deg) !important; }
                    .stats-header { padding: 24px 16px !important; flex-direction: column !important; text-align: center !important; }
                    .stats-val { font-size: 22px !important; }
                    .badge-carousel-wrapper { transform: scale(0.85); }
                }

                @media (max-width: 480px) {
                    .leaderboard-title { font-size: 32px !important; }
                    .top3-stack-container { transform: scale(0.6) !important; margin-bottom: 0px !important; height: 260px !important; margin-top: 10px !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-105%, 0, 0) rotate(0deg) !important; }
                    .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(105%, 0, 0) rotate(0deg) !important; }
                    .badge-carousel-wrapper { transform: scale(0.7); margin-bottom: 10px !important; }
                }
            `}</style>

            <Sidebar activePage="Leaderboard" />

            {/* Whole page scrolls naturally */}
           <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 36px', width: '100%', overflowY: 'hidden' }}>
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    <div className="leaderboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', marginLeft: '64px' }}>
                        <div style={{ position: 'relative', paddingBottom: '12px' }}>
                            <h1 className="leaderboard-title" style={{ fontFamily: "'Poppins', sans-serif", fontSize: '48px', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
                                Leaderboard
                            </h1>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '130%', height: '2px', background: 'linear-gradient(to right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)', borderRadius: '2px' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '7px 14px', fontSize: '11px', color: COLORS.textSecondary, fontWeight: 500 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: COLORS.green }} />
                                Updates every 5 minutes
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="animate-fade-up main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '32px', flex: 1, position: 'relative' }}>
                            <div className="decorative-corner" />

                            {/* Left Column (No scroll, matches right column height) */}
                            <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '16px', height: '100%' }}>
                                <div style={{ position: 'relative', width: '100%', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', perspective: '1200px' }}>
                                    <div className="skeleton" style={{ position: 'absolute', width: '170px', height: '220px', borderRadius: '16px', transform: 'translate3d(-120px, 38px, 0) rotate(-20deg) scale(0.85)', opacity: 0.6, zIndex: 1, border: '1px solid #27272A' }} />
                                    <div className="skeleton" style={{ position: 'absolute', width: '170px', height: '220px', borderRadius: '16px', transform: 'translate3d(120px, 38px, 0) rotate(20deg) scale(0.85)', opacity: 0.6, zIndex: 1, border: '1px solid #27272A' }} />
                                    <div style={{ position: 'relative', width: '170px', height: '220px', borderRadius: '16px', zIndex: 3, border: '1px solid #27272A', display: 'flex', flexDirection: 'column', padding: '16px 14px', background: '#18181B', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                                        <div className="skeleton" style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '12px', alignSelf: 'center', marginTop: '8px', zIndex: 2 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px', gap: '8px', zIndex: 2 }}>
                                            <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />
                                            <div className="skeleton" style={{ width: '50%', height: '10px', borderRadius: '4px' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: 'auto', marginBottom: '4px', zIndex: 2 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                <div className="skeleton" style={{ width: '30px', height: '8px', borderRadius: '2px' }} />
                                                <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: '4px' }} />
                                            </div>
                                            <div style={{ width: '1px', height: '28px', backgroundColor: '#2A2A2D', alignSelf: 'center' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                <div className="skeleton" style={{ width: '30px', height: '8px', borderRadius: '2px' }} />
                                                <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ width: '100%', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '0', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                    <div style={{ display: 'flex', padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`, backgroundColor: '#1A1A1A' }}>
                                        <div className="skeleton" style={{ width: '40px', height: '12px', borderRadius: '4px' }} />
                                        <div className="skeleton" style={{ flex: 1, height: '12px', borderRadius: '4px', margin: '0 24px' }} />
                                        <div className="skeleton" style={{ width: '100px', height: '12px', borderRadius: '4px' }} />
                                        <div className="skeleton" style={{ width: '60px', height: '12px', borderRadius: '4px', marginLeft: '24px' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {[1, 2, 3, 4, 5].map((i, idx) => (
                                            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: idx !== 4 ? `1px solid ${COLORS.border}` : 'none' }}>
                                                <div className="skeleton" style={{ width: '24px', height: '16px', borderRadius: '4px' }} />
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '36px' }}>
                                                    <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                    <div className="skeleton" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
                                                </div>
                                                <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
                                                <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%', marginLeft: '80px' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (No scroll, matches left column height) */}
                            <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '16px', height: '100%' }}>
                                <div style={{ height: '240px', width: '100%', flexShrink: 0, marginBottom: '40px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '0 16px', marginTop: '10px', marginBottom: '16px' }}>
                                        <div className="skeleton" style={{ width: '140px', height: '24px', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
                                        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '12px', opacity: 0.4 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <div className="skeleton" style={{ width: '90px', height: '90px', borderRadius: '16px' }} />
                                            <div className="skeleton" style={{ width: '70px', height: '12px', borderRadius: '4px' }} />
                                        </div>
                                        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '12px', opacity: 0.4 }} />
                                    </div>
                                </div>

                                <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: '360px', background: '#121212', borderRadius: '0', border: '1px solid #27272A', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                                    <div style={{ padding: '36px 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div className="skeleton" style={{ width: '96px', height: '96px', borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.12)' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                                            <div className="skeleton" style={{ width: '70%', height: '28px', borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'minmax(90px, 1fr) minmax(90px, 1fr)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '10px' }}>
                                            <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                                            <div className="skeleton" style={{ width: '50px', height: '28px', borderRadius: '6px' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '10px' }}>
                                            <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                                            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', gap: '10px' }}>
                                            <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                                            <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '6px' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '3px' }} />
                                            <div className="skeleton" style={{ width: '50px', height: '28px', borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-up main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '32px', flex: 1, position: 'relative' }}>
                            <div className="decorative-corner" />

                            {/* Left Column (No scroll, perfectly aligned with right side) */}
                            <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '16px', height: '100%' }}>
                                <Top3Stack top3Users={top3Users} navigate={handleNavigate} />
                                <LeaderboardTable tableUsers={tableUsers} navigate={handleNavigate} />
                            </div>

                            {/* Right Column (No scroll, perfectly aligned with left side) */}
                            <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '16px', height: '100%' }}>
                                <div className="badge-carousel-wrapper" style={{ height: '240px', width: '100%', flexShrink: 0, marginBottom: '40px' }}>
                                    <BadgeCarousel />
                                </div>

                                <div style={{
                                    position: 'relative', width: '100%', flex: 1, minHeight: '360px', background: '#121212', borderRadius: '0',
                                    border: '1px solid #27272A', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', 
                                }}>
                                    
                                    <div style={{
                                        position: 'absolute', inset: -20,
                                        backgroundImage: `url(${getAvatarUrl(currentUserStats.avatar, currentUserStats.name)})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) brightness(0.5)',
                                        zIndex: 0, transform: 'translateZ(0)', willChange: 'transform'
                                    }} />

                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to bottom, rgba(18,18,18,0.2) 0%, #121212 150px)',
                                        zIndex: 0
                                    }} />

                                    <div className="stats-header" style={{ position: 'relative', zIndex: 1, padding: '36px 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <Avatar 
                                            src={getAvatarUrl(currentUserStats.avatar, currentUserStats.name)} 
                                            name={currentUserStats.name} 
                                            size={96} 
                                            style={{ border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }} 
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em', lineHeight: 1.2, wordBreak: 'break-word' }}>
                                                {currentUserStats.name}
                                            </h2>
                                        </div>
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

                                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'minmax(90px, 1fr) minmax(90px, 1fr)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>CURRENT RANK</span>
                                            <span className="stats-val" style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>#{currentUserStats.rank !== '-' ? currentUserStats.rank : '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>PERCENTILE</span>
                                            <span className="stats-val" style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>Top {currentUserStats.percentile}%</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>FOCUS TIME</span>
                                            <span className="stats-val" style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatXP(currentUserStats.focusTime)}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>STREAK</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src="/color-fire.webp" alt="Streak" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                                <span className="stats-val" style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>{currentUserStats.streak}</span>
                                            </div>
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

export default Leaderboard;