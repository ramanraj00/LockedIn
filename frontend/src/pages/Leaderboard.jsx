import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { Trophy, Crown, Activity, Lock } from 'lucide-react'; 

// 🔥 SWIPER.JS IMPORTS 
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
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
    gold: '#F59E0B',   
    silver: '#B4B4B8', 
    bronze: '#C98B66', 
    green: '#10B981',
    blue: '#60A5FA',
    orange: '#FB923C',
};

const formatXP = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; 
};

const getAvatarUrl = (avatar, name) => {
    if (avatar && avatar.startsWith('http://localhost:5173')) {
        return avatar.replace('http://localhost:5173', '');
    }
    if (avatar) return avatar;
    const avatarCount = 4;
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % avatarCount) + 1;
    return `/avatars/avatar${index}.png`;
};

// =======================================================
// 🔥 COMPONENT: Clean & SUPER SMOOTH Top3 Stack
// =======================================================
const Top3Stack = memo(({ users, navigate }) => {
    if (users.length < 3) return null;

    const top3 = [
        { ...users[0], rank: 1, accent: '#FBBF24', title: 'Champion' },   
        { ...users[1], rank: 2, accent: '#94A3B8', title: 'Challenger' }, 
        { ...users[2], rank: 3, accent: '#F97316', title: 'Contender' },  
    ];

    return (
        <div className="top3-stack-container">
            {top3.map((user) => (
                <div 
                    key={user.id || user._id} 
                    className="top3-wrapper" 
                    data-rank={user.rank}
                    onClick={() => navigate(`/profile/${user.id || user._id}`)}
                >
                    <div className="top3-card" style={{ padding: 0 }}>
                        <div style={{ width: '100%', height: '100px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: -20, backgroundImage: `url(${getAvatarUrl(user.avatar, user.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(15px) brightness(0.7)', zIndex: 0, transform: 'translateZ(0)', willChange: 'transform' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(24,24,27,0) 20%, #18181B)', zIndex: 0 }} />
                            
                            <div style={{ position: 'relative', zIndex: 2, marginTop: '8px' }}>
                                <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} referrerPolicy="no-referrer" style={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover' }} />
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
                                    <img src="/color-fire.png" alt="Streak" style={{ width: 24, height: 24, objectFit: 'contain' }} />
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


// =======================================================
// 🔥 COMPONENT: Floating 3D Dialer Carousel
// =======================================================
const BadgeCarousel = memo(() => {
    const ALL_BADGES = [
        { id: 'feather',   name: 'Feather',   description: 'Beginner',          requirement: 'Complete 24 hours on the app',        requiredDays: 1,   imageUrl: '/badges/firstlevel.png'  },
        { id: 'shard',     name: 'Shard',     description: 'Growing Stronger',  requirement: 'Complete 10 days on the app',         requiredDays: 10,  imageUrl: '/badges/secondlevel.png' },
        { id: 'scout',     name: 'Scout',     description: 'Explorer',          requirement: 'Complete 1 month on the app',         requiredDays: 30,  imageUrl: '/badges/thirdlevel.png'  },
        { id: 'hunter',    name: 'Hunter',    description: 'Focus Achiever',    requirement: 'Complete 2 months on the app',        requiredDays: 60,  imageUrl: '/badges/4thlevel.png'    },
        { id: 'pacific',   name: 'Pacific',   description: 'Calm Consistency',  requirement: 'Stay consistent for 3 months',       requiredDays: 90,  imageUrl: '/badges/fifthlevel.png'  },
        { id: 'nova',      name: 'Nova',      description: 'Big Breakthrough',  requirement: 'Stay consistent for 5 months',       requiredDays: 150, imageUrl: '/badges/sixthlevel.png'  },
        { id: 'phantom',   name: 'Phantom',   description: 'Elite',             requirement: 'Stay consistent for 8 months',       requiredDays: 240, imageUrl: '/badges/seventhlevel.png'},
        { id: 'monarch',   name: 'Monarch',   description: 'Legendary',         requirement: 'Stay consistent for 10 months',      requiredDays: 300, imageUrl: '/badges/eightlevel.png'  },
        { id: 'celestial', name: 'Celestial', description: 'Highest Rank',      requirement: 'Stay consistent for 12 months',      requiredDays: 365, imageUrl: '/badges/ninelevel.png'   },
        { id: 'crowned',   name: 'Crowned',   description: "Honorable",         requirement: 'Stay consistent for 12 months and 1 day', requiredDays: 366, imageUrl: '/badges/lastlevel.png' },
    ];

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: '0 16px', marginTop: '10px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.01em', margin: 0 }}>Achievements</h3>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px' }}>
                <Swiper
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={3} 
                    loop={true}
                    slideToClickedSlide={true} 
                    coverflowEffect={{
                        rotate: 0,       
                        stretch: 220,    // 🔥 YE RAHA MAIN CHANGE! (Space ko directly 110 -> 220 kiya hai gap ke liye)
                        depth: 300,      
                        modifier: 1,   
                        slideShadows: false, 
                    }}
                    modules={[EffectCoverflow]}
                    style={{ width: '100%', maxWidth: '550px', height: '160px' }} // 🔥 MaxWidth bada ki taaki badges cut na ho border par
                >
                    {ALL_BADGES.map((badge) => (
                        <SwiperSlide key={badge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                            {({ isActive, isPrev, isNext }) => {
                                const showBadge = isActive || isPrev || isNext;
                                
                                return (
                                    <div style={{ 
                                        display: 'flex',
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                        opacity: showBadge ? (isActive ? 1 : 0.4) : 0, 
                                        transform: isActive ? 'scale(1.2)' : 'scale(1)', 
                                        pointerEvents: showBadge ? 'auto' : 'none'
                                    }}>
                                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                                            <img 
                                                src={badge.imageUrl} 
                                                alt={badge.name} 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain',
                                                    filter: 'none' 
                                                }} 
                                            />

                                            {/* LOCK ICON */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '4px',
                                                right: '4px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: '#111218', 
                                                border: '2px solid #2A2C38', 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                                                zIndex: 10
                                            }}>
                                                <Lock size={11} color="#8A8F9E" strokeWidth={2.5} />
                                            </div>

                                            {isActive && (
                                                <div className="badge-shimmer-overlay" style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    zIndex: 2,
                                                    WebkitMaskImage: `url(${badge.imageUrl})`,
                                                    maskImage: `url(${badge.imageUrl})`,
                                                    WebkitMaskSize: 'contain',
                                                    maskSize: 'contain',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    maskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center',
                                                    maskPosition: 'center',
                                                    pointerEvents: 'none'
                                                }} />
                                            )}
                                        </div>
                                        
                                        <span style={{
                                            marginTop: '12px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            color: '#FFF',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            opacity: isActive ? 1 : 0, 
                                            transition: 'opacity 0.3s ease',
                                            textAlign: 'center'
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
// MAIN COMPONENT
// =======================================================
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
                const res = await fetch('http://localhost:3000/api/leaderboard', { credentials: 'include' });
                const leaderboardData = res.ok ? await res.json() : [];
                setUsers(leaderboardData);
                
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
                    setCurrentUserStats({ 
                        name: loggedInName, avatar: loggedInAvatar, rank: '-', streak: loggedInStreak, focusTime: loggedInXp, percentile: 0 
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

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', sans-serif" }}>
            
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background-color: ${COLORS.bg}; }
                
                .list-row { transition: background 0.15s ease; cursor: pointer; }
                .list-row:hover { background: ${COLORS.cardHover} !important; }

                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-up { animation: fadeUp 0.35s ease forwards; }

                /* 🔥 SCROLLBAR HIDING 🔥 */
                .right-column-scroll::-webkit-scrollbar, .table-scroll::-webkit-scrollbar { display: none; }
                .right-column-scroll, .table-scroll { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
                .skeleton {
                    background: #1A1A1A;
                    background-image: linear-gradient(90deg, #1A1A1A 0px, #242424 50%, #1A1A1A 100%);
                    background-size: 1000px 100%; animation: shimmer 2s infinite linear; border-radius: 6px;
                }
                
                /* 🔥 BADGE SHIMMER EFFECT 🔥 */
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
                
                /* 🔥 SUPER SMOOTH CARD ANIMATIONS 🔥 */
                .top3-stack-container {
                    position: relative;
                    width: 100%;
                    height: 240px; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 0px;
                    perspective: 1200px; 
                }
                
                .top3-wrapper {
                    position: absolute;
                    width: 170px;  
                    height: 220px; 
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    will-change: transform;
                    transform: translateZ(0);
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
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    cursor: pointer;
                    overflow: hidden; 
                    position: relative;
                    will-change: transform;
                    transform: translateZ(0);
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
                
                .top3-wrapper[data-rank="1"] { z-index: 3; transform: translateX(0) translateY(0) rotate(0deg) translateZ(0); }
                .top3-wrapper[data-rank="2"] { z-index: 2; transform: translateX(-40px) translateY(8px) rotate(-8deg) scale(0.95) translateZ(0); }
                .top3-wrapper[data-rank="3"] { z-index: 1; transform: translateX(40px) translateY(16px) rotate(8deg) scale(0.9) translateZ(0); }

                .top3-stack-container:hover .top3-wrapper[data-rank="1"] { transform: translateX(0) translateY(-10px) rotate(0deg) translateZ(0); }
                .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translateX(-135%) translateY(0) rotate(0deg) translateZ(0); }
                .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translateX(135%) translateY(0) rotate(0deg) translateZ(0); }

                .top3-wrapper:hover { z-index: 20 !important; }
                .top3-wrapper:hover .top3-card {
                    transform: translateY(-12px) scale(1.05) translateZ(0);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.8);
                    border-color: #27272A !important; 
                }
            `}</style>

            <Sidebar activePage="Leaderboard" />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 36px', width: '100%', overflowY: 'hidden' }}>
                <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    {/* ===== HEADER ===== */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginLeft: '64px' }}>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.03em', margin: 0 }}>
                            Leaderboard
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '7px 14px', fontSize: '11px', color: COLORS.textSecondary, fontWeight: 500 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: COLORS.green }} />
                                Updates every 5 minutes
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px', flex: 1, minHeight: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '10px' }} />)}
                                </div>
                                <div className="skeleton" style={{ height: '90px', borderRadius: '10px' }} />
                                <div className="skeleton" style={{ flex: 1, borderRadius: '10px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="skeleton" style={{ height: '240px', borderRadius: '10px', background: 'transparent' }} />
                                <div className="skeleton" style={{ flex: 1, borderRadius: '10px' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '32px', flex: 1, minHeight: 0 }}>
                            
                            {/* ⬅️ LEFT COLUMN */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0, height: '100%', paddingBottom: '16px' }}>
                                
                                <Top3Stack users={users} navigate={navigate} />

                                {/* Table for Rank 4+ */}
                                {users.length > 3 && (
                                    <div className="table-container" style={{ width: '100%', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minHeight: 0, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', padding: '16px 24px', borderBottom: `1px solid ${COLORS.border}`, fontSize: '12px', color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#1A1A1A', flexShrink: 0 }}>
                                            <div style={{ width: '60px' }}>Rank</div>
                                            <div style={{ flex: 1 }}>Name</div>
                                            <div style={{ width: '140px' }}>Today's time</div>
                                            <div style={{ width: '90px', textAlign: 'center' }}>Streak</div>
                                        </div>
                                        
                                        <div className="table-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                                            {users.slice(3, 9).map((user, idx, arr) => (
                                                <div key={user.id || user._id} className="list-row" onClick={() => navigate(`/profile/${user.id || user._id}`)} style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: idx !== arr.length - 1 ? `1px solid ${COLORS.border}` : 'none', cursor: 'pointer' }}>
                                                    <div style={{ width: '60px', fontSize: '14px', fontWeight: 700, color: COLORS.textSecondary }}>#{idx + 4}</div>
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} referrerPolicy="no-referrer"
                                                            style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#222', objectFit: 'cover' }} />
                                                        <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.textPrimary }}>{user.name}</span>
                                                    </div>
                                                    <div style={{ width: '140px', fontSize: '14px', color: COLORS.textPrimary, fontWeight: 600 }}>{formatXP(user.xp)}</div>
                                                    <div style={{ width: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: COLORS.textPrimary }}>
                                                        {/* 🔥 Fire icon size 24px in table */}
                                                        <img src="/color-fire.png" alt="Streak" style={{ width: 24, height: 24, objectFit: 'contain' }} /> 
                                                        {user.streak || 0}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ➡️ RIGHT COLUMN */}
                            <div className="right-column-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0, height: '100%', paddingBottom: '16px', overflowY: 'hidden' }}>
                                
                                {/* 🔥 BADGE CAROUSEL */}
                                <div style={{ height: '240px', width: '100%', flexShrink: 0 }}>
                                    <BadgeCarousel />
                                </div>

                                {/* 🔥 HERO CARD */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    flex: 1, 
                                    background: '#121212',
                                    borderRadius: '24px',
                                    border: '1px solid #27272A',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)', 
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to bottom, #1E1E1E 0%, #121212 150px)',
                                        zIndex: 0
                                    }} />

                                    {/* 1. TOP SECTION */}
                                    <div style={{ position: 'relative', zIndex: 1, padding: '36px 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <img 
                                            src={getAvatarUrl(currentUserStats.avatar, currentUserStats.name)} 
                                            alt={currentUserStats.name} 
                                            referrerPolicy="no-referrer"
                                            style={{ 
                                                width: 96, 
                                                height: 96, 
                                                borderRadius: '50%', 
                                                objectFit: 'cover', 
                                                border: '2px solid rgba(255,255,255,0.12)', 
                                                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                                                flexShrink: 0 
                                            }} 
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                            <h2 style={{ 
                                                margin: 0, 
                                                fontSize: '28px', 
                                                fontWeight: 800, 
                                                color: '#FFF', 
                                                letterSpacing: '-0.02em', 
                                                lineHeight: 1.2, 
                                                wordBreak: 'break-word' 
                                            }}>
                                                {currentUserStats.name}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* 2. MAIN DIVIDER LINE */}
                                    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

                                    {/* 3. BOTTOM SECTION */}
                                    <div style={{ 
                                        position: 'relative', 
                                        zIndex: 1, 
                                        flex: 1, 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gridTemplateRows: '1fr 1fr',
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>CURRENT RANK</span>
                                            <span style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>#{currentUserStats.rank !== '-' ? currentUserStats.rank : '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>PERCENTILE</span>
                                            <span style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>Top {currentUserStats.percentile}%</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>FOCUS TIME</span>
                                            <span style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatXP(currentUserStats.focusTime)}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                            <span style={{ fontSize: '11px', color: '#8A8A8A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>DAY STREAK</span>
                                            <span style={{ fontSize: '28px', color: '#FFF', fontWeight: 800, letterSpacing: '-0.02em' }}>{currentUserStats.streak || 0}</span>
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