import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ShaderBackground from '../shaderbackground/ShaderBackground';
import { deriveKEK, decryptDEK, encryptDEK, generateUserSalt } from '../../utils/e2eMasterKey';

const ResetPassword = () => {
    const { token } = useParams(); 
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [recoveryKey, setRecoveryKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    
    const [encryptedDEKRec, setEncryptedDEKRec] = useState(null);
    const [oldSalt, setOldSalt] = useState(null);
    const [oldIterations, setOldIterations] = useState(250000);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/auth/verify-reset-token/${token}`);
                const data = await res.json();
                if (res.ok && data.encryptedDEK_rec) {
                    setEncryptedDEKRec(data.encryptedDEK_rec);
                    setOldSalt(data.userSalt);
                    setOldIterations(data.pbkdf2Iterations);
                }
            } catch (err) {
                console.error("Failed to fetch recovery data", err);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null);

        const formattedKey = recoveryKey.replace(/-/g, '').trim().toUpperCase();
        if (formattedKey.length < 64) { // 64 hex chars = 32 bytes = 256 bits
            setError("Invalid Recovery Key Format."); return;
        }

        if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError("Password must be at least 8 chars long with uppercase, lowercase, number, and special character."); return;
        }

        setLoading(true);
        try {
            let newEncryptedDEK_pwd = null;
            let newUserSalt = null;
            const NEW_ITERATIONS = 250000;
            const KDF_TYPE = "PBKDF2";
            
            if (encryptedDEKRec && oldSalt) {
                try {
                    const recoveryKEK = await deriveKEK(formattedKey, oldSalt, oldIterations);
                    const dek = await decryptDEK(encryptedDEKRec, recoveryKEK);
                    
                    newUserSalt = generateUserSalt();
                    const newPasswordKEK = await deriveKEK(password, newUserSalt, NEW_ITERATIONS);
                    newEncryptedDEK_pwd = await encryptDEK(dek, newPasswordKEK);
                } catch (cryptoErr) {
                    setError("Invalid Recovery Key. Decryption failed.");
                    setLoading(false); return;
                }
            }

            const response = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    password: password,
                    encryptedDEK_pwd: newEncryptedDEK_pwd, 
                    userSalt: newUserSalt,
                    pbkdf2Iterations: NEW_ITERATIONS,
                    kdf: KDF_TYPE
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid or expired token");
                setLoading(false); return;
            }

            setSuccessMsg("Password reset successfully! Your tasks are recovered.");
            setIsFlipping(true);
            setTimeout(() => navigate('/login'), 1200);

        } catch (err) {
            setError("Network error. Please try again.");
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
                    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                    @keyframes cinematicFoldOut { 0% { transform: perspective(2000px) scale(1) rotateY(0deg) translateZ(0px); opacity: 1; } 20% { transform: perspective(2000px) scale(0.98) rotateY(-2deg) translateZ(-20px); opacity: 0.95; } 100% { transform: perspective(2000px) scale(0.85) rotateY(-45deg) translateZ(-300px) translateX(-150px); opacity: 0; } }
                    .animate-page-turn { transform-origin: left center; transform-style: preserve-3d; animation: cinematicFoldOut 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
                `}
            </style>
            
            <ShaderBackground />

            <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10 overflow-hidden">
                <div className={`w-full max-w-[420px] bg-[#030612]/95 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border-[1.5px] border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.15)] relative overflow-hidden flex flex-col ${isFlipping ? 'animate-page-turn' : ''}`}>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                        <div className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[90px] mix-blend-screen"></div>
                        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/15 rounded-full blur-[90px] mix-blend-screen"></div>
                        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[70px] mix-blend-screen"></div>
                    </div>
                    
                    <div className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-screen rounded-[2.5rem]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                    <div className="relative z-10 flex flex-col">
                        <div className="flex justify-center mb-6 mt-2">
                            <span onClick={() => navigate('/')} className="text-white text-3xl md:text-[32px] tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] select-none cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-1.5 tracking-tight drop-shadow-md" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Secure Reset</h2>
                            <p className="text-slate-400 text-xs md:text-sm font-medium">Recover data & create new password.</p>
                        </div>

                        <div className="h-[46px] w-full mb-3 flex items-center justify-center">
                            {error ? (
                                <div className="w-full h-full flex items-center gap-3 px-4 rounded-xl bg-[#2a0e12]/80 border border-red-500/20 text-red-400 text-[12px] font-medium transition-all animate-shake shadow-[0_4px_20px_rgba(239,68,68,0.15)] backdrop-blur-md">
                                    <span className="leading-snug truncate">{error}</span>
                                </div>
                            ) : successMsg ? (
                                <div className="w-full h-full flex items-center gap-3 px-4 rounded-xl bg-[#062417]/80 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium transition-all shadow-[0_4px_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
                                    <span className="leading-snug truncate">{successMsg}</span>
                                </div>
                            ) : null}
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            {/* RECOVERY KEY INPUT */}
                            <div className="flex flex-col relative pb-[12px]">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={recoveryKey} 
                                        onChange={(e) => setRecoveryKey(e.target.value)} 
                                        disabled={loading}
                                        placeholder=" " 
                                        className="peer w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 pt-4 pb-2 text-[12px] md:text-[13px] text-emerald-400 font-mono tracking-widest focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.04] transition-all disabled:opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" 
                                    />
                                    <label className="absolute left-4 top-1.5 text-slate-400 text-[10px] font-medium transition-all duration-200 pointer-events-none translate-y-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-indigo-400">
                                        64-Character Recovery Key
                                    </label>
                                </div>
                            </div>

                            {/* NEW PASSWORD INPUT */}
                            <div className="flex flex-col relative pb-[12px]">
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        disabled={loading}
                                        placeholder=" " 
                                        className="peer w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 pt-4 pb-2 text-[13px] text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.04] transition-all pr-12 disabled:opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" 
                                    />
                                    <label className="absolute left-4 top-1.5 text-slate-400 text-[10px] font-medium transition-all duration-200 pointer-events-none translate-y-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-indigo-400">
                                        New Password
                                    </label>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50">
                                        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading || successMsg} className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-400 active:scale-[0.98] transition-all mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(99,102,241,0.25)] border border-indigo-400/50">
                                {loading ? "Updating..." : "Recover & Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;