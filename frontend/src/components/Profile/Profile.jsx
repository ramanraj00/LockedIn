import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Plus, Menu, X, Edit2, Check } from 'lucide-react';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const Profile = () => {
    const navigate = useNavigate();
    
    // Core State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    // Edit About State
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [aboutText, setAboutText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Add Link State
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("");

    // Fetch User Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/auth/me", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load profile");
                
                setUser(data.user);
                setAboutText(data.user.about || "");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Close Sidebar on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };
        if (sidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarOpen]);

    // Handle Saving the About Section
    const handleSaveAbout = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/profile", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ about: aboutText })
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setIsEditingAbout(false);
            }
        } catch (err) {
            console.error("Error saving about:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Adding a new Link
    const handleSaveLink = async (e) => {
        e.preventDefault();
        if (!newLinkUrl) return;
        
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/profile/link", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: "other", url: newLinkUrl })
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setIsAddingLink(false);
                setNewLinkUrl("");
            }
        } catch (err) {
            console.error("Error saving link:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium tracking-widest text-slate-400">LOADING HUB...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] text-white relative overflow-x-hidden font-sans">
            
            {/* FLOATING MENU BUTTON */}
            <button 
                onClick={() => setSidebarOpen(true)}
                className="fixed top-6 left-6 z-40 w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* FLOATING SIDEBAR (Auto-Hide) */}
            {/* Backdrop / Overlay */}
            <div className={`fixed inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}></div>
            
            <div 
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full w-[280px] bg-[#111111] border-r border-white/10 z-50 p-6 flex flex-col gap-8 transition-transform duration-300 ease-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-2xl font-bold tracking-widest" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {SIDEBAR_ITEMS.map((item) => (
                        <button 
                            key={item}
                            className={`w-full text-left px-5 py-3.5 rounded-xl text-[15px] font-medium transition-all border ${
                                item === 'Profile' 
                                    ? 'bg-white/[0.08] text-white border-white/20' 
                                    : 'bg-transparent text-slate-400 border-transparent hover:bg-white/[0.03] hover:text-white hover:border-white/10'
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN PROFILE CONTENT */}
            <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24 w-full max-w-[1200px] mx-auto min-h-screen flex flex-col relative z-10">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {user && (
                    <div className="flex flex-col gap-16 animate-[fadeIn_0.5s_ease-out]">
                        
                        {/* TOP SECTION: Avatar + Info */}
                        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                            
                            {/* Avatar Column */}
                            <div className="flex flex-col gap-5 items-center shrink-0 w-full md:w-auto relative">
                                <div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full overflow-hidden border border-white/20 p-1.5 shadow-2xl bg-white/[0.02] relative group">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A1A]">
                                        {/* Shows actual Google image if available */}
                                        <img 
                                            src={user.imageUrl || '/avatars/default.png'} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                </div>
                                
                                {/* Links Add / View */}
                                <div className="flex flex-col w-full items-center gap-3">
                                    {/* List Links */}
                                    {user.links && user.links.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {user.links.map((link, idx) => (
                                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all">
                                                    <LinkIcon size={18} />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Link Flow */}
                                    {isAddingLink ? (
                                        <form onSubmit={handleSaveLink} className="flex items-center gap-2 w-[220px]">
                                            <input 
                                                autoFocus
                                                type="url" 
                                                placeholder="https://..." 
                                                value={newLinkUrl}
                                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                                className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-white/40"
                                            />
                                            <button type="submit" disabled={isSaving} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                                                <Check size={16} />
                                            </button>
                                            <button type="button" onClick={() => setIsAddingLink(false)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                                <X size={16} />
                                            </button>
                                        </form>
                                    ) : (
                                        <button onClick={() => setIsAddingLink(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 border-dashed text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all">
                                            <Plus size={16} /> Add Link
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Info Column (Name + About) */}
                            <div className="flex flex-col gap-6 w-full pt-4">
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                                    {user.name}
                                </h1>
                                
                                <div className="flex flex-col gap-3 relative max-w-[700px]">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">About</h3>
                                        {!isEditingAbout && (
                                            <button onClick={() => setIsEditingAbout(true)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-md">
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Edit Mode vs View Mode */}
                                    {isEditingAbout ? (
                                        <div className="flex flex-col gap-3 animate-[fadeIn_0.2s]">
                                            <textarea 
                                                value={aboutText}
                                                onChange={(e) => setAboutText(e.target.value)}
                                                className="w-full bg-white/[0.02] border border-white/20 rounded-xl p-4 text-white text-base outline-none focus:border-white/50 min-h-[120px] resize-y"
                                                placeholder="Tell everyone what you're working on..."
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => { setIsEditingAbout(false); setAboutText(user.about); }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">Cancel</button>
                                                <button onClick={handleSaveAbout} disabled={isSaving} className="px-5 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors flex items-center gap-2">
                                                    {isSaving ? "Saving..." : "Save Bio"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-200 text-base md:text-lg leading-relaxed font-medium bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl">
                                            {user.about || "This user hasn't written a bio yet. They are too busy staying LockedIn."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DIVIDER */}
                        <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent"></div>

                        {/* BADGES SECTION */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-white text-2xl font-bold tracking-tight">Achievement Badges</h3>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                {user.badges && user.badges.length > 0 ? (
                                    user.badges.map((badge, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-3 p-4 hover:border-white/20 hover:bg-white/[0.06] transition-all shadow-lg hover:-translate-y-1">
                                            {badge.imageUrl ? (
                                                <img src={badge.imageUrl} alt={badge.name} className="w-14 h-14 object-contain" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-[#1A1A1A]/80 border border-white/10 flex items-center justify-center text-2xl shadow-inner">🏆</div>
                                            )}
                                            <span className="text-xs font-semibold text-slate-300 text-center tracking-wide">{badge.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    /* Placeholder state to match your sketch */
                                    Array(8).fill(0).map((_, idx) => (
                                        <div key={idx} className="aspect-[4/3] rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/5 font-mono">?</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;