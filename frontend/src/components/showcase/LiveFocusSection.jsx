import React, { memo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, CheckCircle2, Flame, Monitor, Palette, BookOpen, FileText, BarChart2, Clock, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../apiClient';

const formatXP = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`; 
};

// Helper for Name-based Background Colors for original Top 3 cards
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

import { API_BASE_URL } from '../../apiClient';

const getAvatarUrl = (avatar, name) => {
    if (avatar && avatar !== 'null' && avatar !== 'undefined') {
        if (avatar.startsWith('http://localhost:5173')) return avatar.replace('http://localhost:5173', '');
        if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
        if (avatar.includes('avatars/')) return avatar.startsWith('/') ? avatar : `/${avatar}`;
        if (avatar.includes('uploads/')) return avatar.startsWith('/') ? `${API_BASE_URL}${avatar}` : `${API_BASE_URL}/${avatar}`;
        if (avatar.startsWith('/')) return `${API_BASE_URL}${avatar}`;
        return avatar;
    }
    return null;
};

// =======================================================
// 🔥 COMPONENT: Restored Original Top 3 Stack
// =======================================================
const Top3Stack = memo(({ top3Users, navigate }) => {
    if (!top3Users || top3Users.length < 3) return null;

    const top3 = [
        { ...top3Users[0], rank: 1, accent: '#10B981', title: 'Champion' },   
        { ...top3Users[1], rank: 2, accent: '#EC4899', title: 'Challenger' }, 
        { ...top3Users[2], rank: 3, accent: '#EF4444', title: 'Contender' },  
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
        <div className="top3-stack-container" style={{ position: 'relative', width: '100%', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1200px', zIndex: 10 }}>
            <style>{`
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

                .fake-l1 { transform: translate3d(-60px, 15px, 0) rotate(-10deg) scale(0.9); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.4s ease-out 0.0s; }
                .fake-r1 { transform: translate3d(60px, 15px, 0) rotate(10deg) scale(0.9); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.4s ease-out 0.0s; }
                .fake-l2 { transform: translate3d(-90px, 25px, 0) rotate(-15deg) scale(0.85); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.4s ease-out 0.1s; }
                .fake-r2 { transform: translate3d(90px, 25px, 0) rotate(15deg) scale(0.85); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.4s ease-out 0.1s; }
                .fake-l3 { transform: translate3d(-120px, 35px, 0) rotate(-20deg) scale(0.8); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.4s ease-out 0.2s; }
                .fake-r3 { transform: translate3d(120px, 35px, 0) rotate(20deg) scale(0.8); transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.4s ease-out 0.2s; }

                .top3-stack-container:hover .fake-l1, .top3-stack-container:hover .fake-l2, .top3-stack-container:hover .fake-l3 { opacity: 0; transform: translate3d(-125%, 0, 0) rotate(0deg) scale(0.9); }
                .top3-stack-container:hover .fake-r1, .top3-stack-container:hover .fake-r2, .top3-stack-container:hover .fake-r3 { opacity: 0; transform: translate3d(125%, 0, 0) rotate(0deg) scale(0.9); }

                .top3-stack-container:hover .fake-l3, .top3-stack-container:hover .fake-r3 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.0s, opacity 0.3s ease-out 0.3s; }
                .top3-stack-container:hover .fake-l2, .top3-stack-container:hover .fake-r2 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s, opacity 0.3s ease-out 0.4s; }
                .top3-stack-container:hover .fake-l1, .top3-stack-container:hover .fake-r1 { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 0.3s ease-out 0.5s; }
                
                .top3-wrapper { position: absolute; width: 170px; height: 220px; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden; cursor: pointer; }
                .top3-card { width: 100%; height: 100%; background: #18181B; border: 1px solid #27272A; border-radius: 16px; display: flex; flex-direction: column; padding: 16px 14px 10px 14px; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.5); overflow: hidden; position: relative; will-change: transform; transform: translate3d(0, 0, 0); -webkit-backface-visibility: hidden; backface-visibility: hidden; }
                
                .top3-wrapper[data-rank="1"] { z-index: 3; transform: translate3d(0, 0, 0) rotate(0deg); }
                .top3-wrapper[data-rank="2"] { z-index: 2; transform: translate3d(-30px, 6px, 0) rotate(-6deg) scale(0.95); }
                .top3-wrapper[data-rank="3"] { z-index: 1; transform: translate3d(30px, 6px, 0) rotate(6deg) scale(0.95); }

                .top3-stack-container:hover .top3-wrapper[data-rank="1"] { transform: translate3d(0, -10px, 0) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-125%, 0, 0) rotate(0deg); }
                .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(125%, 0, 0) rotate(0deg); }

                .top3-wrapper:hover { z-index: 20 !important; }
                .top3-wrapper:hover .top3-card { transform: translate3d(0, -12px, 0) scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.8); border-color: #27272A !important; }
                
                @media (max-width: 768px) {
                    .top3-stack-container {
                        transform: scale(0.75);
                        height: 200px !important;
                    }
                    .top3-stack-container:hover .top3-wrapper[data-rank="2"] { transform: translate3d(-90%, 0, 0) rotate(0deg); }
                    .top3-stack-container:hover .top3-wrapper[data-rank="3"] { transform: translate3d(90%, 0, 0) rotate(0deg); }
                    .top3-stack-container:hover .fake-l1, .top3-stack-container:hover .fake-l2, .top3-stack-container:hover .fake-l3 { transform: translate3d(-90%, 0, 0) scale(0.9); }
                    .top3-stack-container:hover .fake-r1, .top3-stack-container:hover .fake-r2, .top3-stack-container:hover .fake-r3 { transform: translate3d(90%, 0, 0) scale(0.9); }
                }
            `}</style>
            
            <div className="fake-card-wrapper fake-l3">{renderFakeCard('#06b6d4', '#3b82f6', '#8b5cf6', 'left')}</div> 
            <div className="fake-card-wrapper fake-l2">{renderFakeCard('#3b82f6', '#f59e0b', '#ef4444', 'left')}</div> 
            <div className="fake-card-wrapper fake-l1">{renderFakeCard('#ec4899', '#8b5cf6', '#eab308', 'left')}</div> 

            <div className="fake-card-wrapper fake-r3">{renderFakeCard('#4f46e5', '#a855f7', '#f97316', 'right')}</div> 
            <div className="fake-card-wrapper fake-r2">{renderFakeCard('#3b82f6', '#4338ca', '#f43f5e', 'right')}</div> 
            <div className="fake-card-wrapper fake-r1">{renderFakeCard('#8b5cf6', '#ec4899', '#06b6d4', 'right')}</div> 

            {top3.map((user, idx) => (
                <div key={idx} className="top3-wrapper" data-rank={user.rank} onClick={() => navigate(`/profile/${user.id || user._id}`)}>
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
                                <span style={{ fontSize: '15px', color: '#FFF', fontWeight: 800 }}>{user.displayTime || formatXP(user.xp)}</span>
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

// =======================================================
// 🔥 COMPONENT: Modern White Table exactly like the screenshot
// =======================================================
const LeaderboardTable = memo(({ tableUsers }) => {
    if (!tableUsers || tableUsers.length === 0) return null;
    return (
        <div className="w-full bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[22%]">User</th>
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[25%]">Task</th>
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[15%]">Duration</th>
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[13%]">Streak</th>
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[12%]">Time</th>
                            <th className="py-5 px-6 text-[13px] font-bold text-gray-500 uppercase tracking-wide w-[13%] text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableUsers.map((user, idx) => {
                            const initials = user.name.split(' ').map(n => n[0]).join('');
                            return (
                                <tr key={idx} className={idx !== tableUsers.length - 1 ? 'border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer' : 'hover:bg-gray-50/50 transition-colors cursor-pointer'}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0" style={{ backgroundColor: user.color }}>
                                                {initials}
                                            </div>
                                            <span className="font-bold text-gray-900 truncate">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <user.TaskIcon size={16} style={{ color: user.color }} strokeWidth={2.5} className="shrink-0" />
                                            <span className="font-semibold text-gray-600 truncate">{user.task}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">{user.duration}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Flame size={15} fill="#3B82F6" className="text-blue-500 shrink-0" />
                                            <span className="font-bold text-gray-900">{user.streak}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-gray-400 whitespace-nowrap">{user.time}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end">
                                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                                                user.status === 'Completed' 
                                                ? 'bg-green-50 text-green-600 border-green-100/50' 
                                                : user.status === 'In Progress' 
                                                ? 'bg-blue-50 text-blue-600 border-blue-100/50'
                                                : 'bg-orange-50 text-orange-600 border-orange-100/50'
                                            }`}>
                                                {user.status === 'Completed' ? <CheckCircle2 size={13} strokeWidth={3} /> : user.status === 'In Progress' ? <Clock size={13} strokeWidth={3} /> : <AlertCircle size={13} strokeWidth={3} />} {user.status}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
});


// MAIN COMPONENT
const LiveFocusSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
  }, []);

  const handleNavigate = useCallback(() => {}, []);

  const top3Users = [
        { id: '1', name: 'Buttercup', xp: 14200, streak: 45, avatar: '/avatars/buttercup.webp', displayTime: '1h 3m' },
        { id: '2', name: 'Gwen', xp: 12100, streak: 30, avatar: '/avatars/gwen.webp', displayTime: '1h' },
        { id: '3', name: 'Spidey', xp: 11000, streak: 20, avatar: '/avatars/spidey.webp', displayTime: '45m' },
  ];
  
  // Custom mock data mimicking exactly the screenshot provided by user
  const tableUsers = [
        { id: '4', name: 'Butterfly', task: 'Flutter App Development', TaskIcon: Monitor, color: '#A855F7', duration: '2h 15m', streak: '42 days', time: 'Just now', status: 'In Progress' },
        { id: '5', name: 'grim', task: 'Backend System Architecture', TaskIcon: BarChart2, color: '#3B82F6', duration: '4h 30m', streak: '112 days', time: '10m ago', status: 'Completed' },
        { id: '6', name: 'Shane Levine', task: 'Reading Philosophy', TaskIcon: BookOpen, color: '#F97316', duration: '1h 45m', streak: '65 days', time: '5m ago', status: 'Paused' },
        { id: '7', name: 'Christopher Nolan', task: 'Script Writing', TaskIcon: FileText, color: '#10B981', duration: '3h 20m', streak: '88 days', time: '1h 30m ago', status: 'Completed' },
  ];

  return (
    <section className="relative w-full min-h-[100vh] bg-[#FAF9F6] border-t border-[#D4D4D8] z-10 flex flex-col justify-center pt-20 pb-12 overflow-visible">
      {/* Vertical Lines wrapping the content, connecting to the top border */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1150px] border-l border-r border-[#D4D4D8] pointer-events-none z-0 hidden md:block"></div>
      
      <div className="max-w-7xl w-full mx-auto px-4 md:px-12 flex flex-col items-center shrink-0 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif-elegant font-semibold text-[#1F2937] mb-2 tracking-tight">
              Focus Sessions & Charts
            </h2>
            <p className="text-[#6B7280] text-base md:text-lg">
              Real-time updates of deep work, consistency streaks, and task completions from users around the globe.
            </p>
          </motion.div>
        </div>

        {/* The New Layout - Completely floating and clean */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl flex flex-col gap-8"
        >
            <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
                {isLoading ? (
                    <div style={{ position: 'relative', width: '100%', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: '1200px' }}>
                        <div style={{ position: 'absolute', width: '170px', height: '220px', borderRadius: '16px', transform: 'translate3d(-70px, 12px, -30px) rotate(-6deg) scale(0.95)', background: '#E5E5E5', zIndex: 1 }} className="animate-pulse" />
                        <div style={{ position: 'absolute', width: '170px', height: '220px', borderRadius: '16px', transform: 'translate3d(70px, 12px, -30px) rotate(6deg) scale(0.95)', background: '#E5E5E5', zIndex: 1 }} className="animate-pulse" />
                        <div style={{ position: 'relative', width: '170px', height: '220px', borderRadius: '16px', zIndex: 3, background: '#D4D4D4' }} className="animate-pulse" />
                    </div>
                ) : (
                    <Top3Stack top3Users={top3Users} navigate={handleNavigate} />
                )}
            </div>

            <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
                {isLoading ? (
                    <div className="w-full bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] h-[400px] animate-pulse p-8">
                        <div className="h-8 bg-gray-100 rounded-md w-full mb-6"></div>
                        <div className="h-12 bg-gray-100 rounded-md w-full mb-4"></div>
                        <div className="h-12 bg-gray-100 rounded-md w-full mb-4"></div>
                        <div className="h-12 bg-gray-100 rounded-md w-full mb-4"></div>
                        <div className="h-12 bg-gray-100 rounded-md w-full mb-4"></div>
                    </div>
                ) : (
                    <LeaderboardTable tableUsers={tableUsers} />
                )}
            </div>
            
        </motion.div>
      </div>
    </section>
  );
};

export default LiveFocusSection;
