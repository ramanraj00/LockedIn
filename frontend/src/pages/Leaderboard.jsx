import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard, EffectCoverflow } from 'swiper/modules'; 
import { Trophy, Flame, Crown, Lock } from 'lucide-react';
import { ThinkingOrb } from 'thinking-orbs';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

// Modern warm-accent dashboard palette (inspired, NOT copied)
const COLORS = {
    bg: '#0F0F0F',
    card: '#171717',
    cardHover: '#1E1E1E',
    textPrimary: '#F0F0F0',
    textSecondary: '#8A8A8A',
    textMuted: '#505050',
    border: '#262626',
    // Warm data accents
    gold: '#FACC15',
    silver: '#94A3B8',
    bronze: '#D97706',
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

const getAvatarUrl = (avatar, name) => {
    if (!avatar) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
    if (avatar.startsWith('http://localhost:5173')) {
        return avatar.replace('http://localhost:5173', '');
    }
    return avatar;
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
        name: 'User', avatar: null, rank: '-', streak: 0, focusTime: 0, percentile: 0
    });

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:3000/api/leaderboard', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                    
                    let loggedInName = 'Sinchan';
                    let loggedInAvatar = null;
                    try {
                        const localUser = localStorage.getItem('user') || localStorage.getItem('profile');
                        if (localUser) {
                            const parsed = JSON.parse(localUser);
                            if (parsed.name) loggedInName = parsed.name;
                            if (parsed.imageUrl || parsed.avatar) loggedInAvatar = parsed.imageUrl || parsed.avatar;
                        }
                    } catch (e) { console.error("Could not parse local user:", e); }

                    const myIndex = data.findIndex(u => u.name.toLowerCase() === loggedInName.toLowerCase());
                    if (myIndex !== -1) {
                        const me = data[myIndex];
                        const totalUsers = data.length;
                        const beatCount = totalUsers - (myIndex + 1);
                        const percentile = totalUsers > 1 ? Math.floor((beatCount / totalUsers) * 100) : 99;
                        setCurrentUserStats({
                            name: me.name, avatar: me.avatar || loggedInAvatar,
                            rank: myIndex + 1, streak: me.streak || 0,
                            focusTime: me.xp || 0, percentile: Math.max(1, percentile)
                        });
                    } else {
                        setCurrentUserStats({ name: loggedInName, avatar: loggedInAvatar, rank: '-', streak: 0, focusTime: 0, percentile: 0 });
                    }
                }
            } catch (error) { console.error("Error fetching leaderboard data:", error); }
            finally { setIsLoading(false); }
        };
        fetchLeaderboardData();
    }, []);

    // ========== TOP 3 PODIUM CARDS (YOUR UNIQUE DESIGN) ==========
    const renderTop3Cards = () => {
        if (users.length < 3) return null;
        const top3 = [
            { ...users[0], rank: 1, accent: COLORS.gold, title: 'Champion' },
            { ...users[1], rank: 2, accent: COLORS.silver, title: 'Challenger' },
            { ...users[2], rank: 3, accent: COLORS.bronze, title: 'Contender' },
        ];

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', marginBottom: '8px' }}>
                {top3.map((user) => (
                    <div key={user.id} style={{ 
                        background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', 
                        padding: '20px', position: 'relative', overflow: 'hidden',
                        transition: 'border-color 0.2s, background 0.2s', cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/profile/${user.id || user._id}`)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = user.accent + '40'; e.currentTarget.style.background = COLORS.cardHover; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.card; }}
                    >
                        {/* Subtle top accent line */}
                        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', background: `linear-gradient(90deg, transparent, ${user.accent}60, transparent)` }} />

                        {/* Avatar + Name Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative' }}>
                                    <img 
                                        src={getAvatarUrl(user.avatar, user.name)} alt={user.name}
                                        referrerPolicy="no-referrer"
                                        style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${user.accent}`, objectFit: 'cover' }} 
                                    />
                                    <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', background: user.accent, color: '#000', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '10px' }}>
                                        {user.rank}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: COLORS.textPrimary }}>{user.name}</h3>
                                    <span style={{ fontSize: '10px', color: user.accent, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{user.title}</span>
                                </div>
                            </div>
                            {user.rank === 1 ? <Crown color={user.accent} size={22} /> : <Trophy color={user.accent} size={20} />}
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${COLORS.border}`, paddingTop: '12px' }}>
                            <div>
                                <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2px' }}>Focus</div>
                                <div style={{ fontSize: '14px', color: COLORS.textPrimary, fontWeight: 700 }}>{formatXP(user.xp)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2px' }}>Streak</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                    <span style={{ fontSize: '14px', color: COLORS.textPrimary, fontWeight: 700 }}>{user.streak || 0}</span>
                                    <Flame size={13} color={COLORS.orange} />
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
                            
                            {/* ⬅️ LEFT COLUMN — YOUR UNIQUE LAYOUT */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, height: '100%' }}>
                                
                                {renderTop3Cards()}

                                {/* Badge Showcase (YOUR UNIQUE FEATURE) */}
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
                                            <div key={user.id} className="list-row" onClick={() => navigate(`/profile/${user.id || user._id}`)} style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: idx !== Math.min(users.length - 4, 5) ? `1px solid ${COLORS.border}` : 'none', flex: 1, cursor: 'pointer' }}>
                                                <div style={{ width: '55px', fontSize: '13px', fontWeight: 600, color: COLORS.textSecondary }}>{idx + 4}</div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} referrerPolicy="no-referrer"
                                                        style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#222', objectFit: 'cover' }} />
                                                    <span style={{ fontSize: '13px', fontWeight: 500, color: COLORS.textPrimary }}>{user.name}</span>
                                                </div>
                                                <div style={{ width: '130px', fontSize: '13px', color: COLORS.textPrimary, fontWeight: 500 }}>{formatXP(user.xp)}</div>
                                                <div style={{ width: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: COLORS.textPrimary }}>
                                                    <Flame size={13} color={COLORS.orange} strokeWidth={2.5} /> {user.streak || 0}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ➡️ RIGHT COLUMN */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                
                                {/* Profile Card */}
                                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={getAvatarUrl(currentUserStats.avatar, currentUserStats.name)} alt={currentUserStats.name} referrerPolicy="no-referrer"
                                        style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#222', objectFit: 'cover', marginBottom: '14px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: 700, color: '#FFF' }}>{currentUserStats.name}</h3>
                                    <div style={{ background: '#222', borderRadius: '14px', padding: '5px 14px', fontSize: '11px', fontWeight: 500, color: COLORS.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Trophy size={12} color={COLORS.textSecondary} />
                                        Top {currentUserStats.percentile}% in Timmo users
                                    </div>
                                </div>

                                {/* Today's Summary */}
                                <div>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: COLORS.textSecondary }}>Today's summary</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {[
                                            { label: 'Rank', value: `#${currentUserStats.rank}`, color: COLORS.gold, sub: 'Today' },
                                            { label: 'Streak', value: `${currentUserStats.streak} days`, color: COLORS.orange, sub: 'Current' },
                                            { label: 'Focus Time', value: formatXP(currentUserStats.focusTime), color: COLORS.blue, sub: 'Today' },
                                            { label: 'Percentile', value: `${currentUserStats.percentile}%`, color: COLORS.green, sub: 'Today' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '14px' }}>
                                                <div style={{ fontSize: '11px', color: COLORS.textSecondary, fontWeight: 500, marginBottom: '6px' }}>{item.label}</div>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: item.color }}>{item.value}</div>
                                                <div style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '4px' }}>{item.sub}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* You vs The World */}
                                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '24px', position: 'relative', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        <div style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            {(users[0]?.name || 'YOU')} VS THE WORLD
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '38px', fontWeight: 900, color: '#FFF', lineHeight: 1 }}>{100 - currentUserStats.percentile}</span>
                                            <span style={{ fontSize: '16px', fontWeight: 700, color: COLORS.textSecondary }}>%</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                                            Focused more than {100 - currentUserStats.percentile}% of users today.
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', transform: 'scale(2.2)', transformOrigin: 'bottom right', pointerEvents: 'none', zIndex: 1, opacity: 0.75 }}>
                                        <ThinkingOrb state="searching" size={64} speed={0.65} />
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
