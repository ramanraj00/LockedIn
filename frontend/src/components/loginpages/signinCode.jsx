import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from '../shaderbackground/ShaderBackground';

const AVATARS = [
    "/avatars/gwen.png", "/avatars/spidey.png", "/avatars/buttercup.png", "/avatars/henry.png"
];

const Signin = () => {
    const navigate = useNavigate();
    
    // 'signup' (login/signup) | 'forgot_email' (request link)
    const [view, setView] = useState('signup'); 

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const [successMsg, setSuccessMsg] = useState(null); 
    const [fieldErrors, setFieldErrors] = useState({}); 
    const [isFlipping, setIsFlipping] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', imageUrl: AVATARS[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAvatarSelect = (avatarUrl) => setFormData(prev => ({ ...prev, imageUrl: avatarUrl }));
    
    const handleGoogleAuth = () => { window.location.href = "http://localhost:3000/api/auth/google"; };

    // 1️⃣ SIGNUP LOGIC
    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null); setFieldErrors({});

        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Name is required";
        if (!formData.email) tempErrors.email = "Email is required";
        if (!formData.password) tempErrors.password = "Password is required";

        if (Object.keys(tempErrors).length > 0) {
            setFieldErrors(tempErrors); return; 
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name, email: formData.email, 
                    password: formData.password, imageUrl: window.location.origin + formData.imageUrl
                })
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Failed to sign up"); setLoading(false); return;
            }

            setSuccessMsg(data.message || "Account created Successfully!");
            setIsFlipping(true);
            setTimeout(() => navigate('/login'), 1200); 
        } catch (err) {
            setError("Something went wrong."); setLoading(false);
        }
    };

    // 2️⃣ FORGOT PASSWORD (Send Reset Link)
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null); setFieldErrors({});

        if (!formData.email) {
            setFieldErrors({ email: "Email is required" }); return;
        }

        setLoading(true);
        try {
            // Tumhare backend me route ka naam mostly /forget-password hoga based on your controller
           // ISE LAGA DO (capital P):
            const response = await fetch("http://localhost:3000/api/auth/forgetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();

            // Backend returns 200 even if user not found (security best practice), so we check response.ok
            if (!response.ok) {
                setError(data.message || "Failed to send link"); setLoading(false); return;
            }

            setSuccessMsg("Reset link sent! Please check your email inbox.");
            
            // Auto switch back to normal view after 3 seconds
            setTimeout(() => {
                setSuccessMsg(null);
                setView('signup'); 
                setLoading(false);
            }, 3000);
        } catch (err) {
            setError("Something went wrong."); setLoading(false);
        }
    };

    const handleFormSubmit = view === 'signup' ? handleSignup : handleForgotPassword;

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

            <ShaderBackground />

            <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-4 lg:p-8 relative z-10 overflow-hidden">
                <div className={`w-full max-w-[1100px] min-h-screen md:min-h-[700px] flex flex-col md:flex-row bg-[#02040c]/90 backdrop-blur-md md:rounded-3xl overflow-hidden md:border-[1.5px] border-indigo-500/20 md:shadow-[0_0_60px_rgba(99,102,241,0.12)] relative ${isFlipping ? 'animate-page-turn' : ''}`}>
                    
                    {/* LEFT SIDE */}
                    <div className="absolute inset-0 md:relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black min-h-screen md:min-h-full z-0">
                        <img src="/lokind.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#01040a]/95 md:hidden pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-[35vh] md:h-full p-8 md:p-10 pb-6 md:pb-8 justify-between pointer-events-none">
                            <div className="animate-fade-in pt-4 md:pt-0 pointer-events-auto">
                                <span onClick={() => navigate('/')} className="text-white text-4xl md:text-5xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] cursor-pointer" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                            </div>
                            <div className="flex flex-col pointer-events-auto mb-0">
                                <span className="text-white/80 text-[12px] font-medium mb-1 md:mb-2">You can easily</span>
                                <div className="text-white text-[22px] md:text-[28px] lg:text-[30px] font-bold leading-[1.2] tracking-tight">Get access your personal<br />hub for clarity and<br />productivity</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="w-full md:w-[55%] mt-[35vh] md:mt-0 bg-[#030612] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden z-10 rounded-t-[2.5rem] md:rounded-none min-h-[65vh] md:min-h-full">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
                            <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/15 rounded-full blur-[120px] mix-blend-screen"></div>
                        </div>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                        <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent z-20"></div>

                        <div className="w-full max-w-[400px] mx-auto z-10 relative flex flex-col justify-center">
                            
                            <div className="text-center mb-5 transition-all">
                                <h2 className="text-2xl font-semibold text-white mb-1.5 tracking-tight" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                                    {view === 'signup' ? 'Sign Up Account' : 'Reset Password'}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    {view === 'signup' ? 'Enter your personal data to create your account.' : 'Enter your email to receive a secure reset link.'}
                                </p>
                            </div>

                            {view === 'signup' && (
                                <div className="animate-fade-in">
                                    <button onClick={handleGoogleAuth} type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white text-sm font-medium transition-all">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/><path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.72 17.57C14.73 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.7 5.88 14.12H2.18V16.99C4.01 20.63 7.7 23 12 23Z" fill="#34A853"/><path d="M5.88 14.12C5.66 13.46 5.53 12.75 5.53 12C5.53 11.25 5.66 10.54 5.88 9.88V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.88 14.12Z" fill="#FBBC05"/><path d="M12 5.38C13.62 5.38 15.07 5.94 16.21 7.03L19.37 3.87C17.46 2.09 14.97 1 12 1C7.7 1 4.01 3.37 2.18 7.01L5.88 9.88C6.74 7.3 9.15 5.38 12 5.38Z" fill="#EA4335"/></svg>
                                        Continue with Google
                                    </button>
                                    <div className="flex items-center gap-4 my-4 opacity-40"><div className="h-[1px] flex-1 bg-white/20"></div><span className="text-slate-300 text-[11px] uppercase font-bold">Or</span><div className="h-[1px] flex-1 bg-white/20"></div></div>
                                </div>
                            )}

                            <div className="h-[46px] w-full mb-3 flex items-center justify-center">
                                {error ? (
                                    <div className="w-full h-full flex items-center gap-3 px-4 rounded-xl bg-[#2a0e12]/80 border border-red-500/20 text-red-400 text-[12px] font-medium animate-shake backdrop-blur-md"><span className="truncate">{error}</span></div>
                                ) : successMsg ? (
                                    <div className="w-full h-full flex items-center gap-3 px-4 rounded-xl bg-[#062417]/80 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium backdrop-blur-md"><span className="truncate">{successMsg}</span></div>
                                ) : null}
                            </div>

                            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
                                <div key={view} className="animate-fade-in flex flex-col gap-3 w-full">
                                    
                                    {view === 'signup' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] text-slate-300 ml-1">Choose Avatar</label>
                                                <div className="flex justify-between gap-3 px-1">
                                                    {AVATARS.map((avatar, idx) => (
                                                        <img key={idx} src={avatar} onClick={() => handleAvatarSelect(avatar)} className={`cursor-pointer rounded-full w-[46px] h-[46px] transition-all ${formData.imageUrl === avatar ? 'ring-[2px] ring-indigo-400 scale-110' : 'opacity-50'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col relative pb-[18px]">
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-indigo-400/50" />
                                                {fieldErrors.name && <span className="absolute bottom-0 left-1 text-[10px] text-red-400">{fieldErrors.name}</span>}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-col relative pb-[18px]">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-indigo-400/50" />
                                        {fieldErrors.email && <span className="absolute bottom-0 left-1 text-[10px] text-red-400">{fieldErrors.email}</span>}
                                    </div>

                                    {view === 'signup' && (
                                        <div className="flex flex-col relative pb-[18px]">
                                            <div className="relative">
                                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-indigo-400/50 pr-12" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={16} /></button>
                                            </div>
                                            {fieldErrors.password && <span className="absolute bottom-0 left-1 text-[10px] text-red-400">{fieldErrors.password}</span>}
                                            <span onClick={() => !loading && setView('forgot_email')} className="absolute bottom-0 right-1 text-[10px] text-indigo-400 cursor-pointer">Forgot password?</span>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={loading || successMsg} className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-400 mt-1 flex justify-center items-center">
                                    {loading ? "Processing..." : view === 'signup' ? "Create Account" : "Send Reset Link"}
                                </button>
                            </form>

                            <div className="mt-4 text-center text-xs text-slate-400 font-medium">
                                {view === 'signup' ? (
                                    <>Already have an account? <span onClick={() => navigate('/login')} className="text-indigo-400 cursor-pointer">Log in</span></>
                                ) : (
                                    <span onClick={() => !loading && setView('signup')} className="flex items-center justify-center gap-1.5 cursor-pointer"><ArrowLeft size={14} /> Back to Sign Up</span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signin;