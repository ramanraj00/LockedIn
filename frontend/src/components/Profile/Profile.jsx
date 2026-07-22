import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link as LinkIcon, Plus, X, Edit2, Check, Share2, Lock } from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';

const COLORS = {
    bg: '#1A1D21',
    card: '#22262B',
    textPrimary: '#D1D5DB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
};

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
    { id: 'crowned',   name: 'Crowned',   description: "Honorable", requirement: 'Stay consistent for 12 months and 1 day', requiredDays: 366, imageUrl: '/badges/lastlevel.png' },
];

const getColorFromName = (name) => {
    const gradients = [
        'linear-gradient(135deg, #6366F1, #8B5CF6)',
        'linear-gradient(135deg, #EC4899, #F43F5E)',
        'linear-gradient(135deg, #F97316, #EAB308)',
        'linear-gradient(135deg, #22C55E, #14B8A6)',
        'linear-gradient(135deg, #06B6D4, #3B82F6)',
        'linear-gradient(135deg, #8B5CF6, #EC4899)',
        'linear-gradient(135deg, #F43F5E, #F97316)',
        'linear-gradient(135deg, #14B8A6, #06B6D4)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

const getRandomAvatar = (name) => {
    const avatarCount = 4;
    let hash = 0;
    for (let i = 0; i < (name || 'U').length; i++) {
        hash = (name || 'U').charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % avatarCount) + 1;
    return `/avatars/avatar${index}.png`;
};

const Profile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const isPublicView = !!userId;
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeDays, setActiveDays] = useState(0);
    
    const [showShareToast, setShowShareToast] = useState(false);

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [isAddingLink, setIsAddingLink] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let url, options;
                if (isPublicView) {
                    url = `http://localhost:3000/api/auth/profile/${userId}`;
                    options = { method: "GET" };
                } else {
                    url = "http://localhost:3000/api/auth/me";
                    options = { method: "GET", credentials: "include" };
                }
                const response = await fetch(url, options);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load profile");
                setUser(data.user);
                setAboutText(data.user.about || "");

                const targetId = isPublicView ? userId : data.user._id;
                try {
                    const heatmapRes = await fetch(`http://localhost:3000/api/heatmap/${targetId}`, {
                        method: "GET", credentials: "include"
                    });
                    const heatmapData = await heatmapRes.json();
                    if (heatmapRes.ok && heatmapData.data) {
                        setActiveDays(heatmapData.data.length || 0);
                    }
                } catch (heatErr) {
                    setActiveDays(0);
                }

            } catch (err) {
                if (!isPublicView) {
                    navigate("/signup");
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, isPublicView, navigate]);

    const handleSaveAbout = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/profile", {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ about: aboutText })
            });
            const data = await response.json();
            if (response.ok) { setUser(data.user); setIsEditingAbout(false); }
        } catch (err) { console.error("Error saving about:", err); }
        finally { setIsSaving(false); }
    };

    const handleSaveLink = async (e) => {
        e.preventDefault();
        if (!newLinkUrl) return;
        setIsSaving(true);
        try {
            const updatedLinks = [...(user.links || []), { platform: "other", url: newLinkUrl }];
            const response = await fetch("http://localhost:3000/api/auth/profile/links", {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links: updatedLinks })
            });
            const data = await response.json();
            if (response.ok) { setUser(data.user); setIsAddingLink(false); setNewLinkUrl(""); }
        } catch (err) { console.error("Error saving link:", err); }
        finally { setIsSaving(false); }
    };

    const handleDeleteLink = async (indexToRemove) => {
        try {
            const updatedLinks = user.links.filter((_, idx) => idx !== indexToRemove);
            setUser({ ...user, links: updatedLinks }); 
            
            await fetch("http://localhost:3000/api/auth/profile/links", {
                method: "PUT", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links: updatedLinks })
            });
        } catch (err) { console.error("Error deleting link:", err); }
    };

    const handleShareProfile = () => {
        const shareUrl = `${window.location.origin}/profile/${user._id}`;
        navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
    };

    const renderAvatar = () => {
        const isGoogleUser = user.authProvider === 'google' || !!user.googleId;
        const hasRealImage = user.imageUrl && user.imageUrl.trim() !== '' && !user.imageUrl.includes('default.png') && !user.imageUrl.includes('default_avatar');

        if (hasRealImage) {
            return (
                <img src={user.imageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            );
        }
        if (isGoogleUser) {
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: getColorFromName(user.name), color: '#fff', fontSize: 72, fontWeight: 700, userSelect: 'none' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
            );
        }
        return (
            <img src={getRandomAvatar(user.name)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                    e.target.onerror = null; e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;font-size:72px;font-weight:700">${(user.name || '?').charAt(0).toUpperCase()}</div>`;
                }} />
        );
    };
       if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
                {/* 🔥 Yahan Sidebar add kar diya! Jitter khatam. */}
                <Sidebar activePage="Profile" /> 
                <div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
            </div>
        );
    }



    return (
        <>
            <style>{`
    @keyframes toastIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes diagonalShine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(25deg); }
        100% { transform: translateX(200%) translateY(200%) rotate(25deg); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

    /* 🔥 PURE CSS HOVER ANIMATIONS */
    .badge-card {
        position: relative; border-radius: 20px; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 12px; padding: 20px; cursor: pointer;
        transition: all 0.3s ease; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.15);
    }
    .badge-card.unlocked { background: rgba(20, 24, 54, 0.5); box-shadow: 8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
    .badge-card.locked { background: rgba(20, 24, 54, 0.2); box-shadow: 8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
    
    .badge-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 8px 16px 40px rgba(0, 0, 0, 0.4), inset 1px 1px 2px rgba(255, 255, 255, 0.15), inset -1px -1px 4px rgba(0, 0, 0, 0.2); }
    
    .badge-shine { position: absolute; inset: 0; z-index: 1; overflow: hidden; border-radius: 20px; pointer-events: none; opacity: 0; transition: opacity 0.3s; }
    .badge-card:hover .badge-shine { opacity: 1; }
    
    .badge-shine-inner { position: absolute; top: 0; left: 0; width: 60%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent); transform: translateX(-100%) translateY(-100%) rotate(25deg); }
    .badge-card:hover .badge-shine-inner { animation: diagonalShine 1.5s ease-out forwards; }
    
    .badge-img { width: 88px; height: 88px; object-fit: contain; transition: transform 0.3s ease; filter: none; }
    .badge-card.unlocked:hover .badge-img { transform: scale(1.15); }
    
    .badge-locked-overlay { position: absolute; inset: 0; border-radius: 20px; background-color: rgba(10, 12, 30, 0.75); backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border: 1px solid rgba(255,255,255,0.08); opacity: 0; pointer-events: none; transition: opacity 0.25s ease-out; }
    .badge-card.locked:hover .badge-locked-overlay { opacity: 1; }
    
    .badge-unlocked-tooltip { position: absolute; bottom: calc(100% + 12px); left: 50%; transform: translateX(-50%) translateY(10px); width: 230px; padding: 14px 16px; border-radius: 16px; background: rgba(20, 24, 54, 0.9); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 30; display: flex; flex-direction: column; gap: 8px; opacity: 0; pointer-events: none; transition: all 0.2s ease-out; }
    .badge-card.unlocked:hover .badge-unlocked-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }

    .link-item { position: relative; display: inline-block; }
    .link-delete-btn { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background-color: #EF4444; color: #fff; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; opacity: 0; transform: scale(0.8); transition: all 0.2s; box-shadow: 0 2px 8px rgba(239,68,68,0.4); z-index: 10; }
    .link-item:hover .link-delete-btn { opacity: 1; transform: scale(1); }
`}</style>

            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, position: 'relative', overflowX: 'hidden', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                
                {showShareToast && (
                    <div style={{ position: 'fixed', top: 24, right: 24, backgroundColor: 'rgba(16,185,129,0.9)', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 100, animation: 'toastIn 0.3s ease-out', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        ✓ Profile link copied!
                    </div>
                )}

                {/* 🔥 NAYA SIDEBAR COMPONENT YAHAN AAGAYA */}
                {!isPublicView && <Sidebar activePage="Profile" />}

                <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)', width: '100%', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>

                    {error && (
                        <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171', fontSize: 14, fontWeight: 500 }}>{error}</div>
                    )}

                    {user && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', flexShrink: 0, width: 220 }}>
                                    <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${COLORS.border}`, padding: 4, backgroundColor: 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: COLORS.card }}>
                                            {renderAvatar()}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                                        {user.links && user.links.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                                                {user.links.map((link, idx) => (
                                                    <div key={idx} className="link-item">
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted, textDecoration: 'none' }}>
                                                            <LinkIcon size={18} />
                                                        </a>
                                                        {!isPublicView && (
                                                            <button onClick={() => handleDeleteLink(idx)} className="link-delete-btn" title="Delete Link">
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                            {!isPublicView && (
                                                isAddingLink ? (
                                                    <form onSubmit={handleSaveLink} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                                        <input autoFocus type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.borderHover}`, color: COLORS.textPrimary, borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none' }} />
                                                        {/* 🔥 FIXED: White Premium Buttons */}
                                                        <button type="submit" disabled={isSaving} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.04)', color: '#E5E7EB', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}><Check size={16} /></button>
                                                        <button type="button" onClick={() => setIsAddingLink(false)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.04)', color: '#E5E7EB', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}><X size={16} /></button>
                                                    </form>
                                                ) : (
                                                    <button onClick={() => setIsAddingLink(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', border: `1px dashed ${COLORS.border}`, fontSize: 14, fontWeight: 500, color: COLORS.textMuted, cursor: 'pointer' }}>
                                                        <Plus size={16} /> Add Link
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 🔥 SHIFTING COMPLETELY FIXED */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, flex: 1, paddingTop: 16, minWidth: 280 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#E5E7EB', lineHeight: 1.1 }}>{user.name}</h1>
                                        <button onClick={handleShareProfile} style={{ padding: 10, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, cursor: 'pointer', flexShrink: 0 }} title="Share Profile">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700 }}>
                                        
                                        {/* HEADER HEIGHT FIXED TO 26px */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
                                            <h3 style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>About</h3>
                                            {!isPublicView && !isEditingAbout && (
                                                <button onClick={() => setIsEditingAbout(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.textMuted, backgroundColor: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', height: '100%' }}>
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                            )}
                                        </div>

                                        {isEditingAbout ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, padding: 16, color: COLORS.textSecondary, fontSize: 15, outline: 'none', minHeight: 120, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Tell everyone what you're working on..." />
                                                {/* BUTTONS CONTAINER EXACT HEIGHT 35px */}
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', height: 35 }}>
                                                    <button onClick={() => { setIsEditingAbout(false); setAboutText(user.about || ""); }} style={{ height: '100%', padding: '0 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: COLORS.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                                    <button onClick={handleSaveAbout} disabled={isSaving} style={{ height: '100%', padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, backgroundColor: '#D1D5DB', color: '#111', border: 'none', cursor: 'pointer' }}>
                                                        {isSaving ? "Saving..." : "Save Bio"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* VIEW BOX EXACT HEIGHT 167px */
                                            <p style={{ color: COLORS.textSecondary, fontSize: 16, lineHeight: 1.7, fontWeight: 400, backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, minHeight: 167, boxSizing: 'border-box' }}>
                                                {user.about || "This user hasn't written a bio yet. They are too busy staying LockedIn."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: 1, width: '100%', background: `linear-gradient(to right, ${COLORS.border}, transparent)` }}></div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3 style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700 }}>Achievement Badges</h3>
                                    <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>
                                        {activeDays} active {activeDays === 1 ? 'day' : 'days'}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 20 }}>
                                   {ALL_BADGES.map((badge) => {
                                        const isUnlocked = activeDays >= badge.requiredDays;
                                        return (
                                            <div key={badge.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                                                
                                                <div className="badge-shine">
                                                    <div className="badge-shine-inner"></div>
                                                </div>

                                                <div style={{ position: 'relative', width: 88, height: 88, zIndex: 2 }}>
                                                    <img src={badge.imageUrl} alt={badge.name} className="badge-img" style={{ dropShadow: isUnlocked ? 'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' : 'none' }} />
                                                    {!isUnlocked && (
                                                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(20, 24, 54, 0.9)', border: '2px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                                            <Lock size={11} color="#9CA3AF" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', letterSpacing: '0.03em', color: isUnlocked ? '#FFFFFF' : '#C9CDDB', zIndex: 2, textShadow: '0 1px 4px rgba(0,0,0,0.3)', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {badge.name}
                                                </div>

                                                <div style={{ fontSize: 12, fontWeight: 500, textAlign: 'center', color: isUnlocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)', zIndex: 2, width: '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                                    {badge.description}
                                                </div>

                                                {!isUnlocked && (
                                                    <div className="badge-locked-overlay">
                                                        <Lock size={32} color="rgba(255,255,255,0.5)" />
                                                        <span style={{ fontSize: 16, fontWeight: 800, color: '#E5E7EB', letterSpacing: '0.2em', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>LOCKED</span>
                                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textAlign: 'center', padding: '0 16px', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{badge.requirement}</span>
                                                        <div style={{ width: '60%', height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 4 }}>
                                                            <div style={{ width: `${Math.min((activeDays / badge.requiredDays) * 100, 100)}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #6366F1, #818CF8)' }}></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {isUnlocked && (
                                                    <div className="badge-unlocked-tooltip">
                                                        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: 'rgba(20, 24, 54, 0.9)', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                                                        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{badge.name}</span>
                                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{badge.description}</span>
                                                        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '2px 0' }}></div>
                                                        <span style={{ fontSize: 12, color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>✓ Unlocked!</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                   })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Profile;