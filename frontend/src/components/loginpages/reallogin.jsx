import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import ShaderBackground from '../shaderbackground/ShaderBackground'; 
import { deriveKEK, decryptDEK, encryptDEK, generateWorkspaceDEK, generateUserSalt, generateRecoveryKey } from '../../utils/e2eMasterKey';
import { useCrypto } from '../../context/CryptoContext';

// Helper for readability
const generateRecoverySalt = () => generateUserSalt();

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 🔥 NEW: Signup page se data pakadne ke liye!
    
    // 🔥 VIEWS
    const [view, setView] = useState('login'); 
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const [successMsg, setSuccessMsg] = useState(null); 
    const [isFlipping, setIsFlipping] = useState(false);

    const [cryptoData, setCryptoData] = useState(null);
    const [vaultPassword, setVaultPassword] = useState('');
    const [recoveryKeyDisplay, setRecoveryKeyDisplay] = useState(null);
    const [recoverySaved, setRecoverySaved] = useState(false);
    
    // Recovery States
    const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
    const [recoveredDEK, setRecoveredDEK] = useState(null); 

    const { setDek } = useCrypto();
    const [formData, setFormData] = useState({ email: '', password: '' });

    // 🔥 MAGIC INTERCEPTOR: Agar user Signup page se Google Login karke aaya hai
    useEffect(() => {
        if (location.state && location.state.fromSignup) {
            if (location.state.isNewUser || !location.state.cryptoKeys) {
                setView('vault_setup'); // Seedha Vault Setup dikhao (Bina doosri baar login karwaye)
            } else {
                setCryptoData(location.state.cryptoKeys);
                setView('vault_unlock');
            }
            // State clear kardo taaki refresh par wapas trigger na ho
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    // 🟢 1. NORMAL EMAIL LOGIN (Authentication + AUTO UNLOCK!)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null);
        if (!formData.email || !formData.password) return setError("Please fill all fields");

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/signin", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Invalid credentials"); setLoading(false); return;
            }

            if (data.cryptoKeys) {
                setCryptoData(data.cryptoKeys);
                
                try {
                    const { encryptedDEK_pwd, userSalt, pbkdf2Iterations } = data.cryptoKeys;
                    const passwordKEK = await deriveKEK(formData.password, userSalt, pbkdf2Iterations);
                    const masterDEK = await decryptDEK(encryptedDEK_pwd, passwordKEK);
                    
                    // 🔥 Hamesha True (Keep unlocked)
                    await setDek(masterDEK, true); 
                    setSuccessMsg("Logged in & Vault Unlocked!");
                    setIsFlipping(true);
                    
                    // 🔥 SPA Navigation is BACK!
                  setTimeout(() =>navigate('/profile'), 1200);
                    return; 
                } catch (autoUnlockErr) {
                    setView('vault_unlock');
                }
            } else {
                setView('vault_setup');
            }
            setLoading(false);
        } catch (err) {
            setError("Something went wrong."); setLoading(false);
        }
    };

    // 🟢 2. GOOGLE LOGIN
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError(null); setLoading(true);
            try {
                const response = await fetch("http://localhost:3000/api/auth/google-auth", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: tokenResponse.access_token })
                });

                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || "Google Authentication Failed");
                    setLoading(false); return;
                }

                if (data.isNewUser || !data.cryptoKeys) {
                    setView('vault_setup'); 
                } else {
                    setCryptoData(data.cryptoKeys);
                    setView('vault_unlock'); 
                }
                setLoading(false);
            } catch (err) {
                setError("Network error. Try again."); setLoading(false);
            }
        },
        onError: () => setError("Google Authentication Failed")
    });

    // 🟢 3. SETUP VAULT
    const handleVaultSetupSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (vaultPassword.length < 8) return setError("Vault Password must be at least 8 characters.");
        setLoading(true);
        try {
            const masterDEK = await generateWorkspaceDEK(); 
            const userSalt = generateUserSalt();
            const recoverySalt = generateRecoverySalt(); 
            const pbkdf2Iterations = 250000;
            
            const passwordKEK = await deriveKEK(vaultPassword, userSalt, pbkdf2Iterations);
            const recoveryKey = generateRecoveryKey();
            const recoveryKEK = await deriveKEK(recoveryKey, recoverySalt, pbkdf2Iterations);

            const encryptedDEK_pwd = await encryptDEK(masterDEK, passwordKEK);
            const encryptedDEK_rec = await encryptDEK(masterDEK, recoveryKEK);

            const setupRes = await fetch("http://localhost:3000/api/auth/setup-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify({
                    encryptedDEK_pwd, encryptedDEK_rec, userSalt, 
                    recoverySalt, pbkdf2Iterations, kdf: "PBKDF2"
                })
            });

            if (!setupRes.ok) throw new Error("Failed to save keys.");
            
            await setDek(masterDEK, true); 
            setRecoveryKeyDisplay(recoveryKey);
            setView('setup_recovery_display'); 
            setLoading(false);
        } catch (err) {
            setError("Failed to create vault.");
            setLoading(false);
        }
    };

    // 🟢 4. UNLOCK VAULT
    const handleVaultUnlockSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!vaultPassword) return setError("Please enter your Vault Password.");
        setLoading(true);
        try {
            const { encryptedDEK_pwd, userSalt, pbkdf2Iterations } = cryptoData;
            const passwordKEK = await deriveKEK(vaultPassword, userSalt, pbkdf2Iterations);
            const masterDEK = await decryptDEK(encryptedDEK_pwd, passwordKEK);
            
            await setDek(masterDEK, true); 
            setSuccessMsg("Vault Unlocked!");
            setIsFlipping(true);
             setTimeout(() => navigate('/profile'), 1200); // Isko 
        } catch (err) {
            setError("Unable to decrypt your workspace. Please verify your Vault Password.");
            setLoading(false);
        }
    };
    
    // 🟢 5. RECOVER VAULT 
    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        setError(null); setLoading(true);

        try {
            if (!cryptoData || (!cryptoData.encryptedDEK_rec && !cryptoData.encryptedDEK_pwd)) {
                throw new Error("Recovery data missing.");
            }

            const { encryptedDEK_rec, pbkdf2Iterations } = cryptoData;
            
            const rawKey = recoveryKeyInput.replace(/[\s-]/g, '').toUpperCase();
            
            const keysToTry = [ rawKey, rawKey.replace(/-/g, '') ];
            const saltsToTry = [];
            if (cryptoData.recoverySalt) saltsToTry.push(cryptoData.recoverySalt);
            if (cryptoData.userSalt) saltsToTry.push(cryptoData.userSalt);

            let masterDEK = null;

            for (const key of keysToTry) {
                for (const salt of saltsToTry) {
                    try {
                        const recoveryKEK = await deriveKEK(key, salt, pbkdf2Iterations);
                        masterDEK = await decryptDEK(encryptedDEK_rec, recoveryKEK);
                        if (masterDEK) break; 
                    } catch (err) {} 
                }
                if (masterDEK) break;
            }

            if (!masterDEK) throw new Error("Invalid Recovery Key. Please check the characters.");
            
            await setDek(masterDEK, true); 
            setRecoveredDEK(masterDEK); 
            setView('new_vault_password');
            setLoading(false);

        } catch (err) {
            setError(`Failed: ${err.message || "Decryption failed"}`);
            setLoading(false);
        }
    };

    // 🟢 6. SET NEW VAULT PASSWORD
    const handleNewVaultSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (vaultPassword.length < 8) return setError("Vault Password must be at least 8 characters.");
        
        setLoading(true);
        try {
            const userSalt = generateUserSalt();
            const newRecoverySalt = generateRecoverySalt(); 
            const pbkdf2Iterations = 250000;
            
            const passwordKEK = await deriveKEK(vaultPassword, userSalt, pbkdf2Iterations);
            const newRecoveryKey = generateRecoveryKey();
            const newRecoveryKEK = await deriveKEK(newRecoveryKey, newRecoverySalt, pbkdf2Iterations);

            const encryptedDEK_pwd = await encryptDEK(recoveredDEK, passwordKEK);
            const encryptedDEK_rec = await encryptDEK(recoveredDEK, newRecoveryKEK);

            const resetRes = await fetch("http://localhost:3000/api/auth/reset-vault-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify({
                    encryptedDEK_pwd, encryptedDEK_rec, userSalt, 
                    recoverySalt: newRecoverySalt, pbkdf2Iterations, kdf: "PBKDF2"
                })
            });

            if (!resetRes.ok) throw new Error("Reset failed.");

            setRecoveredDEK(null);
            setRecoveryKeyDisplay(newRecoveryKey);
            setView('new_recovery_display');
            setLoading(false);
        } catch (err) {
            setError("Failed to reset vault keys.");
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        if (view === 'login') return handleLogin(e);
        if (view === 'vault_setup') return handleVaultSetupSubmit(e);
        if (view === 'vault_unlock') return handleVaultUnlockSubmit(e);
        if (view === 'recover_vault') return handleRecoverySubmit(e);
        if (view === 'new_vault_password') return handleNewVaultSubmit(e);
    };

    return (
        <>
            <style>
                {`
                    @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
                    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    @keyframes cinematicFoldOut {
                        0% { transform: perspective(2000px) scale(1) rotateY(0deg) translateZ(0px); opacity: 1; }
                        20% { transform: perspective(2000px) scale(0.98) rotateY(-2deg) translateZ(-20px); opacity: 0.95; }
                        100% { transform: perspective(2000px) scale(0.85) rotateY(-45deg) translateZ(-300px) translateX(-150px); opacity: 0; }
                    }
                    .animate-page-turn { transform-origin: left center; transform-style: preserve-3d; animation: cinematicFoldOut 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
                `}
            </style>

            <div className="hidden md:block"><ShaderBackground /></div>

            {/* 🔥 CROP FIX PRESERVED */}
            <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 lg:p-8 relative z-10 overflow-y-auto py-10">
                <div className={`w-full max-w-[1100px] md:min-h-[700px] flex flex-col md:flex-row backdrop-blur-xl rounded-3xl overflow-hidden relative transition-all duration-300 my-auto shadow-2xl ${isFlipping ? 'animate-page-turn' : ''}`}
                    style={{ background: "rgba(20, 24, 54, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderTop: "1px solid rgba(255, 255, 255, 0.15)", borderLeft: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: `8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2)` }}
                >
                    {/* LEFT PANEL */}
                    <div className="absolute inset-0 md:relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black h-full md:h-auto z-0">
                        <img src="/lokind.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#01040a]/95 md:hidden pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-[12dvh] md:h-auto md:flex-1 p-5 md:p-10 pb-0 md:pb-8 justify-center md:justify-between pointer-events-none">
                            <div className="animate-fade-in pointer-events-auto flex justify-center md:justify-start">
                                <span onClick={() => navigate('/')} className="text-white text-3xl md:text-5xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] cursor-pointer" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                            </div>
                            <div className="hidden md:flex flex-col pointer-events-auto mb-0">
                                <span className="text-white/80 text-[12px] font-medium mb-1 md:mb-2">You can easily</span>
                                <div className="text-white text-[22px] md:text-[28px] lg:text-[30px] font-bold leading-[1.2] tracking-tight">Get access your personal<br />hub for clarity and<br />productivity</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="w-full md:w-[55%] mt-[12dvh] md:mt-0 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10 rounded-t-[2.5rem] md:rounded-none h-[88dvh] md:h-auto bg-transparent">
                        <div className="w-full max-w-[400px] mx-auto z-10 relative flex flex-col justify-center">
                            
                            <div className="hidden md:block text-center mb-5">
                                <h2 className="text-2xl font-semibold text-white mb-1.5 tracking-tight">
                                    {view === 'login' ? 'Log In to Account' : view === 'vault_setup' ? 'Create Vault Password' : 'Secure Vault'}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    {view === 'login' ? 'Enter your credentials.' : 
                                     view === 'vault_setup' ? 'This password protects your encrypted data. It is different from your login password.' :
                                     view === 'vault_unlock' ? 'Unlock your workspace to continue.' : ''}
                                </p>
                            </div>

                            <div className="min-h-[32px] md:min-h-[46px] w-full mb-2 md:mb-3 flex items-center justify-center">
                                {error ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-white/30 text-red-400 text-[12.5px] md:text-[13px] font-medium animate-shake backdrop-blur-md"><span className="truncate">{error}</span></div>
                                ) : successMsg ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-white/30 text-emerald-400 text-[12.5px] md:text-[13px] font-medium backdrop-blur-md"><span className="truncate">{successMsg}</span></div>
                                ) : null}
                            </div>

                            {/* RECOVERY DISPLAYS */}
                            {view === 'new_recovery_display' ? (
                                <div className="animate-fade-in flex flex-col gap-4">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-2">
                                        <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Critical Warning</p>
                                        <p className="text-white/80 text-[11px] leading-relaxed">
                                            This key will never be shown again. This replaces your old Recovery Key.
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white/10 border border-emerald-500/30 rounded-xl font-mono text-center text-emerald-400 select-all">
                                        {recoveryKeyDisplay}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => {navigator.clipboard.writeText(recoveryKeyDisplay)}} className="flex-1 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10">Copy</button>
                                        <button type="button" onClick={() => {
                                            const blob = new Blob([recoveryKeyDisplay], {type: "text/plain"});
                                            const link = document.createElement("a");
                                            link.href = URL.createObjectURL(blob);
                                            link.download = "LockedIn-Recovery-Key.txt";
                                            link.click();
                                        }} className="flex-1 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10">Download TXT</button>
                                    </div>
                                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer mt-2">
                                        <input type="checkbox" className="w-4 h-4 accent-emerald-500" checked={recoverySaved} onChange={(e) => setRecoverySaved(e.target.checked)} />
                                        I have saved my NEW Recovery Key.
                                    </label>
                                    <button onClick={async () => {
                                        setSuccessMsg("Reset Complete! Please Log In.");
                                        setIsFlipping(true);
                                        sessionStorage.removeItem("workspace_dek");
                                        setTimeout(() => navigate('/'), 1200); 
                                    }} disabled={!recoverySaved} className="w-full bg-emerald-500/20 text-emerald-400 py-3 rounded-xl disabled:opacity-50 mt-2 transition-all">
                                        Log In Again
                                    </button>
                                </div>
                            ) : view === 'setup_recovery_display' ? (
                                <div className="animate-fade-in flex flex-col gap-4">
                                    <p className="text-white text-sm">Please save this Recovery Key safely. You will need it if you forget your Vault Password.</p>
                                    <div className="p-3 bg-white/10 border border-emerald-500/30 rounded-xl font-mono text-center text-emerald-400 select-all">
                                        {recoveryKeyDisplay}
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => {navigator.clipboard.writeText(recoveryKeyDisplay)}} className="flex-1 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10">Copy</button>
                                        <button type="button" onClick={() => {
                                            const blob = new Blob([recoveryKeyDisplay], {type: "text/plain"});
                                            const link = document.createElement("a");
                                            link.href = URL.createObjectURL(blob);
                                            link.download = "LockedIn-Recovery-Key.txt";
                                            link.click();
                                        }} className="flex-1 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10">Download TXT</button>
                                    </div>
                                    <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer mt-2">
                                        <input type="checkbox" className="w-4 h-4 accent-emerald-500" checked={recoverySaved} onChange={(e) => setRecoverySaved(e.target.checked)} />
                                        I have saved my Recovery Key.
                                    </label>
                                                                       <button onClick={() => {
                                        setSuccessMsg("Vault Setup Complete!");
                                        setIsFlipping(true);
                                        // 🔥 YE WALI LINE BADALNI HAI 👇
                                        setTimeout(() => navigate('/profile'), 1200); 
                                    }} disabled={!recoverySaved} className="w-full bg-emerald-500/20 text-emerald-400 py-3 rounded-xl disabled:opacity-50 mt-2 transition-all">
                                        Enter Workspace
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="flex flex-col gap-2.5 md:gap-3">
                                    
                                    {view === 'login' && (
                                        <div className="animate-fade-in flex flex-col items-center w-full">
                                            
                                            <button onClick={() => loginWithGoogle()} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 md:py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white text-[13px] font-medium transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                                Continue with Google
                                            </button>

                                            <div className="flex items-center w-full gap-4 my-2.5 md:my-4 opacity-40">
                                                <div className="h-[1px] flex-1 bg-white/20"></div>
                                                <span className="text-slate-300 text-[11px] uppercase tracking-widest font-bold">Or</span>
                                                <div className="h-[1px] flex-1 bg-white/20"></div>
                                            </div>

                                            <div className="flex flex-col gap-2.5 md:gap-3 w-full">
                                                {/* 🔥 BORDER FIX PRESERVED */}
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="bg-white/[0.05] border border-transparent rounded-xl px-4 py-2.5 md:py-3 text-[13px] text-white outline-none focus:bg-white/[0.08] transition-colors" />
                                                <div className="relative">
                                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Login Password" className="w-full bg-white/[0.05] border border-transparent rounded-xl px-4 py-2.5 md:py-3 text-[13px] text-white pr-12 outline-none focus:bg-white/[0.08] transition-colors" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"><Eye size={16} /></button>
                                                </div>
                                                
                                                <div className="flex justify-end mt-0.5 pr-1">
                                                    <span onClick={() => navigate('/forgot-password')} className="text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">Forgot Password?</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {view === 'vault_setup' && (
                                        <div className="animate-fade-in flex flex-col gap-3 w-full">
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Create Vault Password" className="w-full bg-white/[0.05] border border-transparent rounded-xl px-4 py-3 text-[13px] text-white pr-12 outline-none focus:bg-white/[0.08] transition-colors" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={16} /></button>
                                            </div>
                                            <p className="text-xs text-emerald-500/70 mt-1 flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                                                Vault will stay unlocked automatically.
                                            </p>
                                        </div>
                                    )}

                                    {view === 'vault_unlock' && (
                                        <div className="animate-fade-in flex flex-col gap-3 w-full">
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Enter Vault Password" className="w-full bg-white/[0.05] border border-transparent rounded-xl px-4 py-3 text-[13px] text-white pr-12 outline-none focus:bg-white/[0.08] transition-colors" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={16} /></button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-emerald-500/70 flex items-center gap-2">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                                                    Auto-Unlock Active
                                                </span>
                                                <span onClick={() => { setView('recover_vault'); setError(null); }} className="text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors">Forgot Vault Password?</span>
                                            </div>
                                        </div>
                                    )}

                                    {view === 'recover_vault' && (
                                        <div className="animate-fade-in flex flex-col gap-3 w-full">
                                            <p className="text-slate-300 text-sm">Enter your 64-character Recovery Key to restore your data.</p>
                                            <textarea value={recoveryKeyInput} onChange={(e) => setRecoveryKeyInput(e.target.value)} placeholder="B474-F8CA-25B8..." rows="3" className="w-full bg-white/[0.05] border border-transparent rounded-xl px-4 py-3 text-[13px] text-emerald-400 font-mono resize-none outline-none focus:bg-white/[0.08] transition-colors" />
                                            <span onClick={() => setView('vault_unlock')} className="text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors">&larr; Back to Unlock</span>
                                        </div>
                                    )}

                                    {view === 'new_vault_password' && (
                                        <div className="animate-fade-in flex flex-col gap-3 w-full">
                                            <p className="text-emerald-400 text-sm font-medium">Vault Recovered! Set a NEW Vault Password.</p>
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Create NEW Vault Password" className="w-full bg-white/[0.05] border border-transparent rounded-xl px-4 py-3 text-[13px] text-white pr-12 outline-none focus:bg-white/[0.08] transition-colors" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={16} /></button>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading || successMsg} className="w-full bg-white/10 border border-white/20 text-white font-semibold py-2.5 md:py-3 rounded-xl hover:bg-white/20 hover:scale-[1.01] transition-all mt-1 flex justify-center items-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-[13px]">
                                        {loading ? "Processing..." : 
                                         view === 'login' ? "Log In" : 
                                         view === 'vault_setup' ? "Setup Vault" : 
                                         view === 'vault_unlock' ? "Unlock Vault" : 
                                         view === 'recover_vault' ? "Recover Vault" : "Confirm Reset"}
                                    </button>

                                    {view === 'login' && (
                                        <div className="mt-3 md:mt-4 text-center text-xs text-slate-400 font-medium">
                                            Don't have an account? <span onClick={() => navigate('/signup')} className="text-slate-300 hover:text-white hover:underline cursor-pointer transition-colors">Sign up</span>
                                        </div>
                                    )}

                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;