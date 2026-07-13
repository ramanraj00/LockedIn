import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import ShaderBackground from '../shaderbackground/ShaderBackground'; 
import { deriveKEK, decryptDEK } from '../../utils/e2eMasterKey';
import { useCrypto } from '../../context/CryptoContext';

const Login = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('login'); 
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const [successMsg, setSuccessMsg] = useState(null); 
    const [isFlipping, setIsFlipping] = useState(false);

    const { setDek } = useCrypto(); // Get context setter

    const [formData, setFormData] = useState({
        email: '', password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

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

                setSuccessMsg("Logged in with Google Successfully!");
                setIsFlipping(true); 
                setTimeout(() => navigate('/profile'), 1200); 

            } catch (err) {
                setError("Network error. Try again."); setLoading(false);
            }
        },
        onError: () => setError("Google Authentication Failed")
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null);

        if (!formData.email || !formData.password) {
            setError("Please fill all fields"); return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/signin", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email, 
                    password: formData.password
                })
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Invalid credentials"); setLoading(false); return;
            }

            // 🔥 E2E DECRYPTION (RAM ONLY) 🔥
            console.log("LOGIN RESPONSE DATA:", data);

            if (data.encryptedDEK_pwd && data.userSalt && data.pbkdf2Iterations) {
                try {
                    console.log("Keys Backend se aa gayi! Decrypting...");
                    if (data.kdf && data.kdf !== "PBKDF2") {
                        throw new Error(`Unsupported KDF algorithm: ${data.kdf}`);
                    }
                    const passwordKEK = await deriveKEK(formData.password, data.userSalt, data.pbkdf2Iterations);
                    console.log("passwordKEK successfully derived.");
                    
                    const dek = await decryptDEK(data.encryptedDEK_pwd, passwordKEK);
                    console.log("Decryption SUCCESS! Setting DEK in RAM...");
                    
                    setDek(dek);
                } catch (cryptoErr) {
                    console.error("E2E Decryption Failed", cryptoErr);
                    setError("Encryption validation failed (Wrong password or tampered data)."); 
                    setLoading(false);
                    return;
                }
            } else {
                 console.log("Backend ne Keys nahi bheji!! Naya account zaroori hai, ya signup update nahi hua.");
            }

            setSuccessMsg("Login Successful!");
            setIsFlipping(true);
            setTimeout(() => navigate('/profile'), 1200); 
        } catch (err) {
            setError("Something went wrong."); setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null);
        if (!formData.email) {
            setError("Please enter your email"); return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/forgetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to send link"); setLoading(false); return;
            }

            setSuccessMsg("Reset link sent! Check your inbox.");
            setTimeout(() => {
                setSuccessMsg(null); setView('login'); setLoading(false);
            }, 3000);
        } catch (err) {
            setError("Something went wrong."); setLoading(false);
        }
    };

    const handleFormSubmit = view === 'login' ? handleLogin : handleForgotPassword;

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

            <div className="hidden md:block">
                <ShaderBackground />
            </div>

            <div className="h-[100dvh] w-full flex items-center justify-center p-0 md:p-4 lg:p-8 relative z-10 overflow-hidden">
                <div className={`w-full max-w-[1100px] h-[100dvh] md:h-auto md:min-h-[700px] flex flex-col md:flex-row backdrop-blur-xl md:rounded-3xl overflow-hidden relative transition-all duration-300 ${isFlipping ? 'animate-page-turn' : ''}`}
                    style={{ background: "rgba(20, 24, 54, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderTop: "1px solid rgba(255, 255, 255, 0.15)", borderLeft: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: `8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2)` }}
                >
                    <div className="absolute inset-0 md:relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black h-[100dvh] md:h-auto z-0">
                        <img src="/lokind.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#01040a]/95 md:hidden pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-[12dvh] md:h-auto md:flex-1 p-5 md:p-10 pb-0 md:pb-8 justify-center md:justify-between pointer-events-none">
                            <div className="animate-fade-in pointer-events-auto flex justify-center md:justify-start">
                                <span onClick={() => navigate('/')} className="text-white text-3xl md:text-5xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] cursor-pointer" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                            </div>
                            <div className="hidden md:flex flex-col pointer-events-auto mb-0">
                                <span className="text-white/80 text-[12px] font-medium mb-1 md:mb-2">Welcome back to your</span>
                                <div className="text-white text-[22px] md:text-[28px] lg:text-[30px] font-bold leading-[1.2] tracking-tight">Personal hub for clarity<br />and productivity</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-[55%] mt-[12dvh] md:mt-0 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10 rounded-t-[2.5rem] md:rounded-none h-[88dvh] md:h-auto bg-transparent">
                        <div className="w-full max-w-[400px] mx-auto z-10 relative flex flex-col justify-center">
                            
                            <div className="hidden md:block text-center mb-5 transition-all">
                                <h2 className="text-2xl font-semibold text-white mb-1.5 tracking-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                                    {view === 'login' ? 'Log In to Account' : 'Reset Password'}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    {view === 'login' ? 'Enter your credentials to access your hub.' : 'Enter your email to receive a secure reset link.'}
                                </p>
                            </div>

                            {view === 'login' && (
                                <div className="animate-fade-in w-full flex flex-col items-center">
                                    <button onClick={() => loginWithGoogle()} type="button" className="w-full flex items-center justify-center gap-3 py-2.5 md:py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white text-[13px] font-medium transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        Log in with Google
                                    </button>
                                    <div className="flex items-center w-full gap-4 my-2.5 md:my-4 opacity-40">
                                        <div className="h-[1px] flex-1 bg-white/20"></div>
                                        <span className="text-slate-300 text-[11px] uppercase tracking-widest font-bold">Or</span>
                                        <div className="h-[1px] flex-1 bg-white/20"></div>
                                    </div>
                                </div>
                            )}

                            <div className="min-h-[32px] md:min-h-[46px] w-full mb-2 md:mb-3 flex items-center justify-center">
                                {error ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-white/30 text-red-400 text-[12.5px] md:text-[13px] font-medium animate-shake backdrop-blur-md"><span className="truncate">{error}</span></div>
                                ) : successMsg ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-white/30 text-emerald-400 text-[12.5px] md:text-[13px] font-medium backdrop-blur-md"><span className="truncate">{successMsg}</span></div>
                                ) : null}
                            </div>

                            <form onSubmit={handleFormSubmit} className="flex flex-col gap-2.5 md:gap-3">
                                <div key={view} className="animate-fade-in flex flex-col gap-2.5 md:gap-3 w-full">
                                    <div className="flex flex-col relative pb-[14px] md:pb-[18px]">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 md:py-3 text-[13px] text-white outline-none focus:border-white/30 transition-colors" />
                                    </div>

                                    {view === 'login' && (
                                        <div className="flex flex-col relative pb-[14px] md:pb-[18px]">
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2.5 md:py-3 text-[13px] text-white outline-none focus:border-white/30 transition-colors pr-12" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"><Eye size={16} /></button>
                                            </div>
                                            <span onClick={() => !loading && setView('forgot_email')} className="absolute bottom-0 right-1 text-[10px] text-slate-400 hover:text-white cursor-pointer transition-colors">Forgot password?</span>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={loading || successMsg} className="w-full bg-white/10 border border-white/20 text-white font-semibold py-2.5 md:py-3 rounded-xl hover:bg-white/20 hover:scale-[1.01] transition-all mt-1 flex justify-center items-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-[13px]">
                                    {loading ? "Processing..." : view === 'login' ? "Log In" : "Send Reset Link"}
                                </button>
                            </form>

                            <div className="mt-3 md:mt-4 text-center text-xs text-slate-400 font-medium">
                                {view === 'login' ? (
                                    <>Don't have an account? <span onClick={() => navigate('/signup')} className="text-slate-300 hover:text-white hover:underline cursor-pointer transition-colors">Sign up</span></>
                                ) : (
                                    <span onClick={() => !loading && setView('login')} className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white cursor-pointer transition-colors"><ArrowLeft size={14} /> Back to Log In</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;