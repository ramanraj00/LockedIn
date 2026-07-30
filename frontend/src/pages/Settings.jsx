import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../apiClient';

const AVATARS = [
    "/avatars/gwen.webp", 
    "/avatars/spidey.webp", 
    "/avatars/buttercup.webp", 
    "/avatars/henry.webp"
];

// 🔥 10 COMPLETELY UNIQUE FONTS!
const FONTS = [
    { id: 'Inter', name: 'Inter', desc: 'Clean & modern' },
    { id: 'Playfair', name: 'Playfair', desc: 'Elegant editorial' },
    { id: 'SpaceMono', name: 'Space Mono', desc: 'Tech & developer' },
    { id: 'Righteous', name: 'Righteous', desc: 'Futuristic sci-fi' },
    { id: 'Cinzel', name: 'Cinzel', desc: 'Epic fantasy' },
    { id: 'Bangers', name: 'Bangers', desc: 'Comic book style' },
    { id: 'Caveat', name: 'Caveat', desc: 'Casual handwritten' },
    { id: 'ChakraPetch', name: 'Chakra Petch', desc: 'Cyberpunk mecha' },
    { id: 'Milkshake', name: 'Milkshake', desc: 'Fun cursive script' },
    { id: 'Pixeloid', name: 'Pixeloid', desc: 'Retro gaming 8-bit' }
];

const THEME = {
    bg: '#0F0F0F',      
    sectionBg: '#151515',
    border: '#2A2A2A',
    textPrimary: '#F0F0F0',
    textSecondary: '#8A8A8A',
};

const SETTINGS_CSS = `
    /* 🔥 DIRECT GOOGLE FONTS IMPORT FOR ALL NEW UNIQUE FONTS */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Righteous&family=Space+Mono:wght@700&family=Cinzel:wght@700&family=Bangers&family=Caveat:wght@700&family=Chakra+Petch:wght@600&display=swap');

    /* LOCAL FONTS */
    @font-face {
        font-family: 'Milkshake';
        src: url('/font/Milkshake.otf');
    }

    /* SLIDER HOVER & GLOW */
    .sleek-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 2px;
        outline: none;
        transition: transform 0.2s ease;
    }
    .sleek-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #FFFFFF;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sleek-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #FFFFFF;
        cursor: pointer;
        border: none;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sleek-slider:hover::-webkit-slider-thumb {
        transform: scale(1.3);
        box-shadow: 0 0 12px rgba(255,255,255,0.4);
    }
    .sleek-slider:hover::-moz-range-thumb {
        transform: scale(1.3);
        box-shadow: 0 0 12px rgba(255,255,255,0.4);
    }

    /* SQUARE CARDS LIFT & GLOW */
    .premium-card {
        background-color: rgba(255,255,255,0.01);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .premium-card:hover {
        background-color: rgba(255,255,255,0.03) !important;
        transform: translateY(-4px);
        border-color: rgba(255,255,255,0.2) !important;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .premium-card.selected {
        background-color: rgba(255,255,255,0.05) !important;
        border-color: #FFFFFF !important;
        transform: none;
        box-shadow: none;
    }

    /* INPUTS FOCUS & HOVER */
    .premium-input {
        width: 280px;
        background-color: rgba(255,255,255,0.01);
        border: 1px solid #2A2A2A;
        color: #F0F0F0;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 13px;
        outline: none;
        transition: all 0.2s ease;
    }
    .premium-input:focus {
        border-color: #FFFFFF !important;
        background-color: rgba(255,255,255,0.05) !important;
        box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
    }
    .premium-input:hover:not(:focus) {
        border-color: rgba(255,255,255,0.2);
        background-color: rgba(255,255,255,0.02);
    }

    /* AVATAR SCALING */
    .premium-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        cursor: pointer;
        padding: 2px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
        opacity: 0.5;
    }
    .premium-avatar:hover {
        transform: scale(1.15);
        opacity: 0.8;
    }
    .premium-avatar.selected {
        border-color: #FFFFFF !important;
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(255,255,255,0.15);
    }

    /* BUTTON BOUNCE */
    .premium-btn {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .premium-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255,255,255,0.1);
    }
    .premium-btn:active:not(:disabled) {
        transform: translateY(0);
    }
    
    .danger-btn:hover:not(:disabled) {
        background-color: rgba(239, 68, 68, 0.1) !important;
        border-color: #ef4444 !important;
        box-shadow: 0 5px 15px rgba(239, 68, 68, 0.15);
    }

    @keyframes slideDown {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
`;

// ═══════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════

const Badge = memo(({ text }) => (
    <span style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#A1A1AA',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 600,
        marginLeft: '10px',
        letterSpacing: '0.5px'
    }}>
        {text}
    </span>
));

const Kbd = memo(({ children }) => (
    <span style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
        margin: '0 4px',
        boxShadow: '0 2px 0 rgba(0,0,0,0.2)' 
    }}>
        {children}
    </span>
));

const SettingBlock = memo(({ title, description, children }) => (
    <div className="flex flex-col md:flex-row w-full mb-6 rounded-xl shadow-lg border border-[#2A2A2A] bg-[#151515]">
        <div className="w-full md:w-[280px] shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#2A2A2A]">
            <h3 className="text-[#F0F0F0] text-[15px] font-semibold mb-2">{title}</h3>
            <p className="text-[#8A8A8A] text-[13px] leading-relaxed m-0">{description}</p>
        </div>
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
));

const SettingRow = memo(({ title, description, children, isLast = false }) => (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 gap-4 md:gap-6 transition-colors duration-200 hover:bg-white/5 ${isLast ? '' : 'border-b border-[#2A2A2A]'}`}>
        <div className="flex-1">
            <h4 className="text-[#F0F0F0] text-[14px] font-medium mb-1">{title}</h4>
            {description && <p className="text-[#8A8A8A] text-[12px] m-0">{description}</p>}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-start sm:justify-end shrink-0">
            {children}
        </div>
    </div>
));

// 🔥 10 PREVIEWS MAPPED PERFECTLY
const FontCard = memo(({ selected, onClick, font }) => (
    <div 
        className={`premium-card w-full aspect-square md:w-[160px] md:h-[160px] ${selected ? 'selected' : ''}`}
        onClick={onClick}
        style={{
            border: `1px solid ${selected ? '#FFFFFF' : THEME.border}`,
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: `1px solid ${selected ? '#FFFFFF' : '#444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />}
            </div>
        </div>
        
        <div className="keep-font" style={{ 
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '52px', color: selected ? '#FFFFFF' : THEME.textPrimary,
            fontFamily: font.id === 'Inter' ? 'Inter, sans-serif' : 
                        font.id === 'Playfair' ? "'Playfair Display', serif" :
                        font.id === 'SpaceMono' ? "'Space Mono', monospace" :
                        font.id === 'Righteous' ? "'Righteous', cursive" :
                        font.id === 'Cinzel' ? "'Cinzel', serif" :
                        font.id === 'Bangers' ? "'Bangers', cursive" :
                        font.id === 'Caveat' ? "'Caveat', cursive" :
                        font.id === 'ChakraPetch' ? "'Chakra Petch', sans-serif" :
                        font.id === 'Milkshake' ? 'Milkshake, cursive' :
                        font.id === 'Pixeloid' ? 'Pixeloid, sans-serif' : 'sans-serif'
        }}>
            Aa
        </div>
        <div style={{ textAlign: 'center' }}>
            <div style={{ color: selected ? '#FFFFFF' : THEME.textPrimary, fontSize: '14px', fontWeight: 600 }}>{font.name}</div>
        </div>
    </div>
));

const TextInput = memo(({ value, onChange, placeholder, type = "text" }) => (
    <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="premium-input w-full md:w-[280px]"
    />
));

const SmartSlider = memo(({ initialValue, min, max, step, onCommit, formatLabel }) => {
    const [val, setVal] = useState(initialValue);

    useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    const handleChange = useCallback((e) => {
        setVal(parseFloat(e.target.value));
    }, []);

    const handleCommit = useCallback(() => {
        onCommit(val);
    }, [val, onCommit]);

    const percentage = ((val - min) / (max - min)) * 100;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '300px' }}>
            <input 
                type="range" 
                min={min} max={max} step={step}
                value={val}
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                className="sleek-slider"
                style={{ 
                    flex: 1,
                    background: `linear-gradient(to right, #FFFFFF ${percentage}%, #333333 ${percentage}%)` 
                }}
            />
            <span style={{ color: THEME.textPrimary, fontSize: '14px', fontWeight: 600, width: '45px', textAlign: 'right' }}>
                {formatLabel(val)}
            </span>
        </div>
    );
});

const ActionButton = memo(({ onClick, children, danger = false, disabled = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`premium-btn ${danger ? 'danger-btn' : ''}`}
        style={{
            backgroundColor: danger ? 'transparent' : '#FFFFFF',
            color: danger ? '#ef4444' : '#000000',
            border: danger ? `1px solid rgba(239, 68, 68, 0.4)` : '1px solid #FFFFFF',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
        }}
    >
        {children}
    </button>
));

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
const Settings = () => {
    const navigate = useNavigate();
    const { 
        fontFamily, setFontFamily, 
        fontSizeMultiplier, setFontSizeMultiplier, 
        textBrightness, setTextBrightness 
    } = useSettings();

    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

    const [profile, setProfile] = useState({ name: '', email: '', avatar: AVATARS[0] });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);

    // Password setup for OAuth users changing email
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const showToast = useCallback((message) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(message);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }, []);

    useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullscreen]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiFetch('/api/auth/me', { credentials: 'include' });
                const data = await res.json();
                if (data.success && data.user) {
                    setProfile({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        avatar: data.user.avatar || data.user.imageUrl || AVATARS[0]
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user data");
            }
        };
        fetchUser();
    }, []);

    const handleProfileUpdate = useCallback(async () => {
        // Strict Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email)) {
            showToast("Please enter a valid email address!");
            return;
        }
        
        setIsSaving(true);
        try {
            const bodyData = { name: profile.name, email: profile.email, avatar: profile.avatar };
            if (newPassword) {
                // Hashing the password client-side to match the login/signup flow
                const encoder = new TextEncoder();
                const encodedData = encoder.encode(newPassword);
                const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashedPass = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                bodyData.newPassword = hashedPass;
            }

            const res = await apiFetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(bodyData)
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showToast("Profile Updated Successfully!");
                setShowPasswordPrompt(false);
                setNewPassword('');
            } else {
                if (res.status === 400 && data.requirePasswordSetup) {
                    setShowPasswordPrompt(true);
                } else {
                    showToast(data.message || "Failed to update profile.");
                }
            }
        } catch (err) {
            console.error(err);
            showToast("Network error occurred.");
        } finally {
            setIsSaving(false);
        }
    }, [profile, newPassword, showToast]);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            navigate('/login');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoggingOut(false);
        }
    }, [navigate]);

    const handleResetLayout = useCallback(() => {
        setFontFamily('Inter');
        setFontSizeMultiplier(1);
        setTextBrightness(1);
        showToast("Layout reset to default!");
    }, [setFontFamily, setFontSizeMultiplier, setTextBrightness, showToast]);

    const handleNameChange = useCallback((e) => setProfile(p => ({ ...p, name: e.target.value })), []);
    const handleEmailChange = useCallback((e) => setProfile(p => ({ ...p, email: e.target.value })), []);
    const handleAvatarSelect = useCallback((avatar) => setProfile(p => ({ ...p, avatar })), []);

    const commitScale = useCallback((val) => setFontSizeMultiplier(val), [setFontSizeMultiplier]);
    const commitBrightness = useCallback((val) => setTextBrightness(val), [setTextBrightness]);
    const formatPercent = useCallback((v) => `${Math.round(v * 100)}%`, []);

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: THEME.bg, color: THEME.textPrimary, fontFamily: "'Inter', monospace, sans-serif", position: 'relative', overflowX: 'hidden' }}>
            <div style={{ paddingTop: isMobile ? 84 : 32, paddingBottom: 48, paddingLeft: isMobile ? '24px' : 'clamp(96px, 6vw, 120px)', paddingRight: isMobile ? '24px' : 'clamp(96px, 6vw, 120px)', width: '100%', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
            
            <style>{SETTINGS_CSS}</style>

            {toast && (
                <div style={{
                    position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#FFFFFF', color: '#0A0A0A', padding: '12px 24px',
                    borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '12px',
                    fontSize: '13px', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 1000, animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <CheckCircle2 size={16} color="#059669" />
                    {toast}
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                
                <div className="w-full" style={{ padding: isMobile ? '24px 0' : '0' }}>
                    
                    <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 style={{ color: THEME.textPrimary, fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>Settings</h1>
                    </div>

                    <SettingBlock 
                        title="Typography" 
                        description="Choose the primary font family for the application."
                    >
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-5 p-6 md:p-8">
                            {FONTS.map(font => (
                                <FontCard 
                                    key={font.id}
                                    selected={fontFamily === font.id}
                                    onClick={() => setFontFamily(font.id)}
                                    font={font}
                                />
                            ))}
                        </div>
                    </SettingBlock>
                    
                    <SettingBlock 
                        title="Interface Display" 
                        description="Customize the scaling and brightness of the interface."
                    >
                        <SettingRow title="Interface Scale" description="Adjust the overall size of text and UI elements.">
                            <SmartSlider 
                                initialValue={fontSizeMultiplier || 1}
                                min={0.7} max={1.3} step={0.05} 
                                onCommit={commitScale}
                                formatLabel={formatPercent}
                            />
                        </SettingRow>

                        <SettingRow title="Text Brightness" description="Dim or brighten text across the app without affecting the screen." isLast={true}>
                            <SmartSlider 
                                initialValue={textBrightness || 1}
                                min={0.3} max={1} step={0.05} 
                                onCommit={commitBrightness}
                                formatLabel={formatPercent}
                            />
                        </SettingRow>
                    </SettingBlock>

                    <SettingBlock 
                        title="Fullscreen Mode" 
                        description="Toggle the app's full screen state."
                    >
                        <SettingRow 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    Fullscreen Shortcut <Badge text="Desktop" />
                                </div>
                            }
                            description={
                                <span>Press the <Kbd>F</Kbd> key on your keyboard to enter or exit fullscreen.</span>
                            }
                            isLast={true}
                        >
                            <ActionButton onClick={toggleFullscreen}>
                                Toggle Fullscreen
                            </ActionButton>
                        </SettingRow>
                    </SettingBlock>

                    <SettingBlock 
                        title="Profile Information" 
                        description="Update your personal details and avatar."
                    >
                        <SettingRow title="Profile Avatar">
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {AVATARS.map((avatar, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleAvatarSelect(avatar)}
                                        className={`premium-avatar ${profile.avatar === avatar ? 'selected' : ''}`}
                                    >
                                        <div style={{
                                            width: '100%', height: '100%', borderRadius: '50%',
                                            backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center'
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </SettingRow>

                        <SettingRow title="Display Name">
                            <TextInput value={profile.name} onChange={handleNameChange} placeholder="Enter your name" />
                        </SettingRow>

                        <SettingRow title="Email Address" isLast={true}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                                <TextInput value={profile.email} onChange={handleEmailChange} placeholder="Enter your email" type="email" />
                                {showPasswordPrompt && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        padding: '16px', 
                                        backgroundColor: '#FFFFFF', 
                                        borderRadius: '8px',
                                        width: '280px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <p style={{ color: '#000000', fontSize: '12px', margin: '0 0 12px 0', lineHeight: 1.4, fontWeight: 500 }}>
                                            Since you signed up with Google, please set a password to change your email.
                                        </p>
                                        <input 
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter a new password"
                                            style={{ 
                                                width: '100%',
                                                backgroundColor: 'rgba(0,0,0,0.05)',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                color: '#000000',
                                                padding: '10px 12px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </SettingRow>
                    </SettingBlock>

                    <SettingBlock 
                        title="Account Actions" 
                        description="Save your changes or securely log out."
                    >
                        <SettingRow title="Save Changes">
                            <ActionButton onClick={handleProfileUpdate} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </ActionButton>
                        </SettingRow>

                        <SettingRow title="Reset Layout" description="Restore default font, scale, and brightness.">
                            <ActionButton onClick={handleResetLayout}>
                                Reset Layout
                            </ActionButton>
                        </SettingRow>

                        <SettingRow title="Sign Out" isLast={true}>
                            <ActionButton onClick={handleLogout} disabled={isLoggingOut}>
                                {isLoggingOut ? 'Signing out...' : 'Log Out'}
                            </ActionButton>
                        </SettingRow>
                    </SettingBlock>

                </div>
            </div>
            </div>
        </div>
    );
};

export default Settings;