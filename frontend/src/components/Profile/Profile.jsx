import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link as LinkIcon, Plus, X, Edit2, Check, Share2, Lock, Search, ChevronLeft, Bell, UserPlus, UserMinus, UserCheck } from 'lucide-react';
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
    const [currentUser, setCurrentUser] = useState(null); // The logged-in user
    const [loading, setLoading] = useState(true);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [error, setError] = useState(null);
    const [activeDays, setActiveDays] = useState(0);
    
    const [showShareToast, setShowShareToast] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    
    // Add Link states
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("");

    // SEARCH STATE
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    // FOLLOW STATE
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followModalData, setFollowModalData] = useState({ isOpen: false, type: 'followers', users: [], isLoading: false });

    // NOTIFICATION STATE
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowDropdown(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search logic
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) { setSearchResults([]); return; }
            setIsSearching(true);
            try {
                const response = await fetch(`http://localhost:3000/api/auth/search?q=${searchQuery}`, { method: 'GET', credentials: 'include' });
                const data = await response.json();
                if (data.success) setSearchResults(data.users);
            } catch (err) { console.error(err); } finally { setIsSearching(false); }
        };
        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/auth/notifications`, { method: 'GET', credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.read).length);
            }
        } catch (err) { console.error("Error fetching notifications", err); }
    };

    // Mark Notifications Read
    const handleNotificationsOpen = async () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            setUnreadCount(0);
            try {
                await fetch(`http://localhost:3000/api/auth/notifications/read`, { method: 'PUT', credentials: 'include' });
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch (err) { console.error("Error marking read", err); }
        }
    };

    // Load Profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) setLoading(true);
            setIsFetchingProfile(true);
            try {
                // Get Current Logged In User Data first
                const meResponse = await fetch("http://localhost:3000/api/auth/me", { method: "GET", credentials: "include" });
                const meData = await meResponse.json();
                if (meResponse.ok) {
                    setCurrentUser(meData.user);
                    fetchNotifications();
                }

                // Get Target Profile Data
                let url = isPublicView ? `http://localhost:3000/api/auth/profile/${userId}` : "http://localhost:3000/api/auth/me";
                const response = await fetch(url, { method: "GET", credentials: "include" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load profile");
                
                setUser(data.user);
                setAboutText(data.user.about || "");
                setFollowersCount(data.user.followers?.length || 0);
                setFollowingCount(data.user.following?.length || 0);

                // Check if current user is following this profile
                if (isPublicView && meData.user && meData.user.following) {
                    setIsFollowing(meData.user.following.includes(data.user._id));
                }

                const targetId = isPublicView ? userId : data.user._id;
                try {
                    // 🔥 ACTUAL API URL FROM ANALYTICS COMPONENT
                    let heatmapUrl = "http://localhost:3000/api/dashboard/dashboard/heatmap";
                    if (isPublicView) {
                        // Passing userId as query param in case backend supports fetching for others
                        heatmapUrl = `http://localhost:3000/api/dashboard/dashboard/heatmap?userId=${targetId}`;
                    }

                    const heatmapRes = await fetch(heatmapUrl, { method: "GET", credentials: "include" });
                    const heatData = await heatmapRes.json();
                    
                    if (heatmapRes.ok && heatData.heatmapData) {
                        // Exactly matching the Analytics logic: d.intensity > 0 || d.hours > 0
                        const activeCount = heatData.heatmapData.filter(d => (d.intensity > 0 || d.hours > 0)).length;
                        setActiveDays(activeCount);
                    } else {
                        setActiveDays(0);
                    }
                } catch (heatErr) { 
                    console.error("Heatmap Error:", heatErr);
                    setActiveDays(0); 
                }

            } catch (err) {
                if (!isPublicView) navigate("/signup");
                else setError(err.message);
            } finally {
                setLoading(false);
                setIsFetchingProfile(false);
            }
        };
        fetchProfile();
    }, [userId, isPublicView, navigate]);

    const handleSaveAbout = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/profile", {
                method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ about: aboutText })
            });
            const data = await response.json();
            if (response.ok) { setUser(data.user); setIsEditingAbout(false); }
        } catch (err) {} finally { setIsSaving(false); }
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
        navigator.clipboard.writeText(`${window.location.origin}/profile/${user._id}`);
        setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2500);
    };

    // 🔥 FOLLOW LOGIC
    const handleToggleFollow = async () => {
        if (!currentUser || !user) return;
        setIsFollowLoading(true);
        const wasFollowing = isFollowing;
        
        // Optimistic UI Update
        setIsFollowing(!wasFollowing);
        setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);

        try {
            const response = await fetch(`http://localhost:3000/api/auth/follow/${user._id}`, {
                method: 'POST', credentials: 'include'
            });
            if (!response.ok) throw new Error("Failed to follow");
        } catch (err) {
            // Revert on error
            setIsFollowing(wasFollowing);
            setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
            console.error("Error following user", err);
        } finally {
            setIsFollowLoading(false);
        }
    };

    // 🔥 OPEN FOLLOWERS/FOLLOWING MODAL
    const openFollowModal = async (type) => {
        setFollowModalData({ isOpen: true, type, users: [], isLoading: true });
        try {
            const response = await fetch(`http://localhost:3000/api/auth/follow-data/${user._id}`, { method: 'GET', credentials: 'include' });
            const data = await response.json();
            if (response.ok) {
                setFollowModalData({ isOpen: true, type, users: data[type] || [], isLoading: false });
            }
        } catch (err) {
            setFollowModalData(prev => ({ ...prev, isLoading: false }));
        }
    };

    const renderAvatar = (userObj = user) => {
        const isGoogleUser = userObj?.authProvider === 'google' || !!userObj?.googleId;
        const hasRealImage = userObj?.imageUrl && userObj.imageUrl.trim() !== '' && !userObj.imageUrl.includes('default');
        if (hasRealImage) return <img src={userObj.imageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
        if (isGoogleUser) return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: getColorFromName(userObj?.name), color: '#fff', fontWeight: 700 }}>{userObj?.name?.charAt(0).toUpperCase()}</div>;
        return <img src={getRandomAvatar(userObj?.name)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    };

    if (loading) return <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]"><Sidebar activePage="Profile" /><div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" /></div>;

    return (
        <>
            <style>{`
    @keyframes fadeScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes diagonalShine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(25deg); }
        100% { transform: translateX(200%) translateY(200%) rotate(25deg); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

    /* SEARCH & NOTIFICATION CSS */
    .search-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 16px 10px 42px; color: #fff; width: 260px; font-size: 14px; outline: none; transition: all 0.2s; }
    .search-input:focus { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); width: 280px; }
    .search-result-item { padding: 12px 16px; display: flex; alignItems: center; gap: 12px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .search-result-item:hover { background: rgba(255,255,255,0.06); }
    .search-result-item:last-child { border-bottom: none; }
    
    .follow-stat { cursor: pointer; transition: opacity 0.2s; }
    .follow-stat:hover { opacity: 0.7; }
    
    .follow-btn { display: flex; alignItems: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; border: none; }
    .follow-btn.unfollowed { background: #FFFFFF; color: #000000; }
    .follow-btn.unfollowed:hover { background: #E5E7EB; transform: scale(1.02); }
    .follow-btn.followed { background: rgba(255,255,255,0.08); color: #FFFFFF; border: 1px solid rgba(255,255,255,0.2); }
    .follow-btn.followed:hover { background: rgba(255,255,255,0.15); color: #D1D5DB; border-color: rgba(255,255,255,0.3); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeScale 0.2s ease-out; }
    .modal-content { background: #1A1D21; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 90%; max-width: 400px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .notif-bell { position: relative; padding: 10px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #D1D5DB; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .notif-bell:hover { background: rgba(255,255,255,0.08); }
    .notif-badge { position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #EF4444; border-radius: 50%; border: 2px solid #1A1D21; }

    /* BADGE CSS */
    .badge-card { position: relative; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; overflow: hidden; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.15); }
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

            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, position: 'relative', overflowX: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
                
                {showShareToast && (
                    <div style={{ position: 'fixed', top: 24, right: 24, backgroundColor: 'rgba(16,185,129,0.9)', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 100, animation: 'toastIn 0.3s ease-out', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        ✓ Profile link copied!
                    </div>
                )}

                {!isPublicView && <Sidebar activePage="Profile" />}

                {/* MODAL POPUP FOR FOLLOWERS/FOLLOWING */}
                {followModalData.isOpen && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setFollowModalData({ isOpen: false, type: '', users: [], isLoading: false }) }}>
                        <div className="modal-content">
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>{followModalData.type}</h3>
                                <button onClick={() => setFollowModalData({ isOpen: false, type: '', users: [], isLoading: false })} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}><X size={20}/></button>
                            </div>
                            <div style={{ overflowY: 'auto', padding: '10px 0', maxHeight: '60vh' }}>
                                {followModalData.isLoading ? (
                                    <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>Loading...</div>
                                ) : followModalData.users.length > 0 ? (
                                    followModalData.users.map(u => (
                                        <div key={u._id} className="search-result-item" onClick={() => { setFollowModalData({ isOpen: false, type: '', users: [], isLoading: false }); navigate(`/profile/${u._id}`); }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', fontSize: 16 }}>{renderAvatar(u)}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{u.name}</span>
                                                {u.username && <span style={{ color: COLORS.textMuted, fontSize: 13 }}>@{u.username}</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>No {followModalData.type} yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)', width: '100%', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, opacity: isFetchingProfile ? 0.3 : 1, transition: 'opacity 0.2s ease-in-out', pointerEvents: isFetchingProfile ? 'none' : 'auto' }}>

                    {error && (
                        <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171', fontSize: 14, fontWeight: 500 }}>{error}</div>
                    )}

                    {user && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                
                                {/* LEFT COLUMN: AVATAR, LINKS, FOLLOW STATS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', flexShrink: 0, width: 220 }}>
                                    <div style={{ width: 180, height: 180, borderRadius: '50%', border: `2px solid ${COLORS.borderHover}`, backgroundColor: COLORS.card, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontSize: '72px' }}>
                                        {renderAvatar()}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
                                        
                                        {/* FOLLOW STATS */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 0', borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, width: '100%', justifyContent: 'center' }}>
                                            <div className="follow-stat" onClick={() => openFollowModal('followers')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{followersCount}</span>
                                                <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>Followers</span>
                                            </div>
                                            <div style={{ width: 1, height: 24, backgroundColor: COLORS.borderHover }}></div>
                                            <div className="follow-stat" onClick={() => openFollowModal('following')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{followingCount}</span>
                                                <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>Following</span>
                                            </div>
                                        </div>

                                        {/* FOLLOW BUTTON (Only Public View) */}
                                        {isPublicView && currentUser && currentUser._id !== user._id && (
                                            <button 
                                                className={`follow-btn ${isFollowing ? 'followed' : 'unfollowed'}`}
                                                onClick={handleToggleFollow}
                                                disabled={isFollowLoading}
                                                onMouseOver={(e) => { if(isFollowing) e.currentTarget.innerText = "Unfollow" }}
                                                onMouseOut={(e) => { if(isFollowing) e.currentTarget.innerText = "Following" }}
                                            >
                                                {isFollowLoading ? "..." : isFollowing ? "Following" : "Follow"}
                                            </button>
                                        )}

                                        {/* ADD LINK BUTTON AND EXISTING LINKS */}
                                        <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                            {!isPublicView && (
                                                isAddingLink ? (
                                                    <form onSubmit={handleSaveLink} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                                        <input autoFocus type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.borderHover}`, color: COLORS.textPrimary, borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none' }} />
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

                                        {user.links && user.links.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                                                {user.links.map((link, idx) => (
                                                    <div key={idx} className="link-item" style={{ position: 'relative' }}>
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted, textDecoration: 'none' }}><LinkIcon size={18} /></a>
                                                        {!isPublicView && (
                                                            <button onClick={() => handleDeleteLink(idx)} className="link-delete-btn" title="Delete Link">
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, flex: 1, paddingTop: 16, minWidth: 280 }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 20 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#E5E7EB', lineHeight: 1.1 }}>{user.name}</h1>
                                            {user.username && <span style={{ color: COLORS.textMuted, fontSize: 16, fontWeight: 500, marginTop: 6 }}>@{user.username}</span>}
                                        </div>

                                        {/* SEARCH, NOTIFICATIONS, BACK */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
                                            
                                            {/* 🔥 NOTIFICATION BELL */}
                                            {!isPublicView && (
                                                <div ref={notifRef} style={{ position: 'relative' }}>
                                                    <button className="notif-bell" onClick={handleNotificationsOpen}>
                                                        <Bell size={20} />
                                                        {unreadCount > 0 && <span className="notif-badge"></span>}
                                                    </button>
                                                    
                                                    {showNotifications && (
                                                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 300, backgroundColor: COLORS.card, border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                                                            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.borderHover}`, fontWeight: 600 }}>Notifications</div>
                                                            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                                                {notifications.length > 0 ? notifications.map(n => (
                                                                    <div key={n._id} className="search-result-item" onClick={() => { setShowNotifications(false); navigate(`/profile/${n.sender._id}`); }}>
                                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', fontSize: 12, backgroundColor: '#333' }}>
                                                                            {renderAvatar(n.sender)}
                                                                        </div>
                                                                        <div style={{ fontSize: 14 }}>
                                                                            <span style={{ fontWeight: 600, color: '#fff' }}>{n.sender.name}</span> started following you.
                                                                        </div>
                                                                    </div>
                                                                )) : <div style={{ padding: 20, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>No notifications</div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div ref={searchRef} style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, pointerEvents: 'none' }}><Search size={16} /></div>
                                                <input type="text" className="search-input" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} />
                                                
                                                {showDropdown && searchQuery.trim() !== "" && (
                                                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '100%', minWidth: 260, backgroundColor: COLORS.card, border: `1px solid ${COLORS.borderHover}`, borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                                                        {isSearching ? ( <div style={{ padding: 16, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>Searching...</div>
                                                        ) : searchResults.length > 0 ? (
                                                            searchResults.map(result => (
                                                                <div key={result._id} className="search-result-item" onClick={() => { navigate(`/profile/${result._id}`); setShowDropdown(false); setSearchQuery(""); }}>
                                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#333', flexShrink: 0, fontSize: '12px' }}>{renderAvatar(result)}</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{result.name}</span>
                                                                        {result.username && <span style={{ color: COLORS.textMuted, fontSize: 12 }}>@{result.username}</span>}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : ( <div style={{ padding: 16, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }}>No users found</div> )}
                                                    </div>
                                                )}
                                            </div>

                                            {isPublicView && (
                                                <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#E5E7EB', fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'opacity 0.2s', padding: 0 }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                                                    <ChevronLeft size={20} strokeWidth={3} />
                                                    Back
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700, marginTop: 12 }}>
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
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', height: 35 }}>
                                                    <button onClick={() => { setIsEditingAbout(false); setAboutText(user.about || ""); }} style={{ height: '100%', padding: '0 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: COLORS.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                                    <button onClick={handleSaveAbout} disabled={isSaving} style={{ height: '100%', padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, backgroundColor: '#D1D5DB', color: '#111', border: 'none', cursor: 'pointer' }}>
                                                        {isSaving ? "Saving..." : "Save Bio"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p style={{ color: COLORS.textSecondary, fontSize: 16, lineHeight: 1.7, fontWeight: 400, backgroundColor: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', padding: 20, borderRadius: 16, minHeight: 167, boxSizing: 'border-box' }}>
                                                {user.about || "This user hasn't written a bio yet. They are too busy staying LockedIn."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 RESTORED ACHIEVEMENT BADGES SECTION 🔥 */}
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
