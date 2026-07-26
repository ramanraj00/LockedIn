import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/Sidebar'; 
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, CheckCircle2 } from 'lucide-react';

const AVATARS = [
    "/avatars/gwen.png", 
    "/avatars/spidey.png", 
    "/avatars/buttercup.png", 
    "/avatars/henry.png"
];

const FONTS = [
    { id: 'Inter', name: 'Inter', desc: 'Clean & modern' },
    { id: 'Outfit', name: 'Outfit', desc: 'Geometric & bold' },
    { id: 'Pixeloid', name: 'Pixeloid', desc: 'Retro gaming 8-bit' },
    { id: 'Instrument Sans', name: 'Instrument', desc: 'Elegant & sleek' }
];

// 🔥 DARK THEME REVERTED
const THEME = {
    bg: '#0A0A0A',
    sectionBg: '#121212',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    cardHover: 'rgba(255,255,255,0.03)',
    accent: '#FFFFFF',
    inputBg: 'rgba(255,255,255,0.03)'
};

const Settings = () => {
    const navigate = useNavigate();
    const { 
        fontFamily, setFontFamily, 
        fontSizeMultiplier, setFontSizeMultiplier, 
        textBrightness, setTextBrightness 
    } = useSettings();

    const [profile, setProfile] = useState({ name: '', email: '', avatar: AVATARS[0] });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    // 🔥 TOAST STATE
    const [toast, setToast] = useState(null);

    // 🔥 SMOOTH SLIDER STATES (Local state prevents whole app from re-rendering on every drag step)
    const [localScale, setLocalScale] = useState(fontSizeMultiplier || 1);
    const [localBrightness, setLocalBrightness] = useState(textBrightness || 1);

    // Sync local states if context changes externally
    useEffect(() => { setLocalScale(fontSizeMultiplier); }, [fontSizeMultiplier]);
    useEffect(() => { setLocalBrightness(textBrightness); }, [textBrightness]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
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

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:3000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: profile.name, email: profile.email, avatar: profile.avatar })
            });
            if (res.ok) {
                showToast("Profile Updated Successfully!");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
            navigate('/login');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // --- REUSABLE UI COMPONENTS ---

    const Section = ({ children }) => (
        <div style={{
            border: `1px solid ${THEME.border}`,
            borderRadius: '16px',
            backgroundColor: THEME.sectionBg,
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
            {children}
        </div>
    );

    const Row = ({ title, description, children, isLast = false, alignTop = false }) => (
        <div style={{
            display: 'flex',
            borderBottom: isLast ? 'none' : `1px solid ${THEME.border}`,
            padding: '32px',
            gap: '40px',
            alignItems: alignTop ? 'flex-start' : 'center',
            flexDirection: 'row'
        }}>
            <div style={{ width: '280px', flexShrink: 0 }}>
                <h3 style={{ color: THEME.textPrimary, fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0', letterSpacing: '0.3px' }}>{title}</h3>
                <p style={{ color: THEME.textSecondary, fontSize: '13px', lineHeight: '1.6', margin: 0, fontWeight: 400 }}>{description}</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                {children}
            </div>
        </div>
    );

    const SelectCard = ({ selected, onClick, title, subtitle }) => (
        <div 
            onClick={onClick}
            style={{
                flex: 1,
                minWidth: '160px',
                border: `1px solid ${selected ? THEME.textPrimary : THEME.border}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: selected ? THEME.cardHover : 'transparent',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: `2px solid ${selected ? THEME.textPrimary : THEME.textSecondary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px', transition: 'all 0.2s'
            }}>
                {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: THEME.textPrimary }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: THEME.textPrimary, fontSize: '14px', fontWeight: 600 }}>{title}</span>
                <span style={{ color: THEME.textSecondary, fontSize: '12px', fontWeight: 400 }}>{subtitle}</span>
            </div>
        </div>
    );

    const TextInput = ({ value, onChange, placeholder, type = "text" }) => (
        <input 
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: '100%', maxWidth: '320px',
                backgroundColor: THEME.inputBg,
                border: `1px solid ${THEME.border}`,
                color: THEME.textPrimary,
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                transition: 'border 0.2s'
            }}
            onFocus={(e) => { e.target.style.borderColor = THEME.textPrimary; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onBlur={(e) => { e.target.style.borderColor = THEME.border; e.target.style.backgroundColor = THEME.inputBg; }}
        />
    );

    // 🔥 UPDATED SLIDER FOR BUTTERY SMOOTH 60FPS
    const Slider = ({ value, min, max, step, onChange, onCommit, formatLabel }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '360px' }}>
            <input 
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={onChange}
                onMouseUp={onCommit}
                onTouchEnd={onCommit}
                className="premium-slider"
                style={{ flex: 1 }}
            />
            <span style={{ color: THEME.textPrimary, fontSize: '14px', fontWeight: 600, width: '45px', textAlign: 'right' }}>
                {formatLabel(value)}
            </span>
        </div>
    );

    const Button = ({ onClick, children, danger = false, disabled = false }) => (
        <button 
            onClick={onClick}
            disabled={disabled}
            style={{
                backgroundColor: danger ? 'transparent' : THEME.textPrimary,
                color: danger ? '#ef4444' : THEME.bg,
                border: danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
                if(!disabled && danger) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                if(!disabled && !danger) e.currentTarget.style.opacity = 0.9;
            }}
            onMouseOut={(e) => {
                if(!disabled && danger) e.currentTarget.style.backgroundColor = 'transparent';
                if(!disabled && !danger) e.currentTarget.style.opacity = 1;
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: THEME.bg, overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Custom Styles for Premium Slider Dark Mode */}
            <style>{`
                .premium-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    outline: none;
                }
                .premium-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FFFFFF;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: transform 0.1s;
                }
                .premium-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                .premium-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FFFFFF;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    border: none;
                }
            `}</style>

            {/* 🔥 TOAST NOTIFICATION (DARK THEME) */}
            {toast && (
                <div style={{
                    position: 'absolute',
                    top: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#FFFFFF',
                    color: '#0A0A0A',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <CheckCircle2 size={18} color="#059669" />
                    {toast}
                    <style>{`
                        @keyframes slideDown {
                            from { opacity: 0; transform: translate(-50%, -20px); }
                            to { opacity: 1; transform: translate(-50%, 0); }
                        }
                    `}</style>
                </div>
            )}

            {/* SIDEBAR */}
            <Sidebar activePage="Settings" />

            {/* MAIN CONTENT AREA - Full Width */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '48px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%' }}>
                    
                    {/* HEADER */}
                    <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                            width: '32px', height: '32px', 
                            background: THEME.cardHover,
                            border: `1px solid ${THEME.border}`, 
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <SettingsIcon size={18} color={THEME.textPrimary} />
                        </div>
                        <h1 style={{ color: THEME.textPrimary, fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>Settings</h1>
                    </div>

                    {/* SECTION 1: DISPLAY */}
                    <Section>
                        <Row 
                            title="Typography" 
                            description="Choose the primary font family for the application."
                            alignTop={true}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
                                {FONTS.map(font => (
                                    <SelectCard 
                                        key={font.id}
                                        selected={fontFamily === font.id}
                                        onClick={() => setFontFamily(font.id)}
                                        title={font.name}
                                        subtitle={font.desc}
                                    />
                                ))}
                            </div>
                        </Row>
                        
                        <Row 
                            title="Interface Scale" 
                            description="Adjust the overall size of text and UI elements."
                        >
                            <Slider 
                                value={localScale} min={0.7} max={1.3} step={0.05} 
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setLocalScale(val);
                                    // Instant DOM update for buttery smoothness skipping React re-render
                                    document.documentElement.style.setProperty('--font-size-multiplier', val);
                                }}
                                onCommit={() => setFontSizeMultiplier(localScale)}
                                formatLabel={(v) => `${Math.round(v * 100)}%`}
                            />
                        </Row>

                        <Row 
                            title="Text Brightness" 
                            description="Dim or brighten text across the app without affecting the screen."
                            isLast={true}
                        >
                            <Slider 
                                value={localBrightness} min={0.3} max={1} step={0.05} 
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setLocalBrightness(val);
                                    // Instant DOM update for buttery smoothness skipping React re-render
                                    document.documentElement.style.setProperty('--text-brightness', val);
                                }}
                                onCommit={() => setTextBrightness(localBrightness)}
                                formatLabel={(v) => `${Math.round(v * 100)}%`}
                            />
                        </Row>
                    </Section>

                    {/* SECTION 2: PROFILE */}
                    <Section>
                        <Row 
                            title="Profile Avatar" 
                            description="Choose your avatar from the available options."
                        >
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {AVATARS.map((avatar, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => setProfile(p => ({ ...p, avatar }))}
                                        style={{
                                            width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                                            border: profile.avatar === avatar ? `2px solid ${THEME.textPrimary}` : `2px solid transparent`,
                                            padding: '2px',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            opacity: profile.avatar === avatar ? 1 : 0.4,
                                            transform: profile.avatar === avatar ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        <div style={{
                                            width: '100%', height: '100%', borderRadius: '50%',
                                            backgroundImage: `url(${avatar})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </Row>

                        <Row 
                            title="Display Name" 
                            description="Your public name visible on the leaderboard."
                        >
                            <TextInput 
                                value={profile.name} 
                                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} 
                                placeholder="Enter your name" 
                            />
                        </Row>

                        <Row 
                            title="Email Address" 
                            description="Your primary login email address."
                            isLast={true}
                        >
                            <TextInput 
                                value={profile.email} 
                                onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} 
                                placeholder="Enter your email" 
                                type="email"
                            />
                        </Row>
                    </Section>

                    {/* SECTION 3: ACTIONS */}
                    <Section>
                        <Row 
                            title="Save Changes" 
                            description="Apply and save your profile updates."
                        >
                            <Button onClick={handleProfileUpdate} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Row>

                        <Row 
                            title="Sign Out" 
                            description="Securely log out of your current session."
                            isLast={true}
                        >
                            <Button onClick={handleLogout} disabled={isLoggingOut} danger={true}>
                                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                            </Button>
                        </Row>
                    </Section>

                </div>
            </div>
        </div>
    );
};

export default Settings;
