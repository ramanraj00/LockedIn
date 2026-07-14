import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from '../shaderbackground/ShaderBackground';

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccessMsg(null);
        if (!email) return setError("Please enter your email");

        setLoading(true);
        try {
            // Tumhare bheje hue backend route par request ja rahi hai
            const response = await fetch("http://localhost:3000/api/auth/forgetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }) 
            });
            const data = await response.json();
            
            if (!response.ok) {
                setError(data.message || "Failed to send reset link");
                setLoading(false);
                return;
            }

            setSuccessMsg("Reset link sent to your email! Please check your inbox.");
            setIsFlipping(true);
            setTimeout(() => navigate('/login'), 2500); // Thodi der baad wapas login pe bhej dega
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
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

            <div className="h-[100dvh] w-full flex items-center justify-center p-0 md:p-4 lg:p-8 relative z-10 overflow-hidden">
                <div className={`w-full max-w-[1100px] h-[100dvh] md:h-auto md:min-h-[700px] flex flex-col md:flex-row backdrop-blur-xl md:rounded-3xl overflow-hidden relative transition-all duration-300 ${isFlipping ? 'animate-page-turn' : ''}`}
                    style={{ background: "rgba(20, 24, 54, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", borderTop: "1px solid rgba(255, 255, 255, 0.15)", borderLeft: "1px solid rgba(255, 255, 255, 0.15)", boxShadow: `8px 12px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 4px rgba(0, 0, 0, 0.2)` }}
                >
                    {/* LEFT PANEL */}
                    <div className="absolute inset-0 md:relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black h-[100dvh] md:h-auto z-0">
                        <img src="/lokind.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#01040a]/95 md:hidden pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-[12dvh] md:h-auto md:flex-1 p-5 md:p-10 pb-0 md:pb-8 justify-center md:justify-between pointer-events-none">
                            <div className="animate-fade-in pointer-events-auto flex justify-center md:justify-start">
                                <span onClick={() => navigate('/')} className="text-white text-3xl md:text-5xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] cursor-pointer" style={{ fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                            </div>
                            <div className="hidden md:flex flex-col pointer-events-auto mb-0">
                                <span className="text-white/80 text-[12px] font-medium mb-1 md:mb-2">You can easily</span>
                                <div className="text-white text-[22px] md:text-[28px] lg:text-[30px] font-bold leading-[1.2] tracking-tight">Recover your personal<br />hub and regain<br />your access</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="w-full md:w-[55%] mt-[12dvh] md:mt-0 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative z-10 rounded-t-[2.5rem] md:rounded-none h-[88dvh] md:h-auto bg-transparent">
                        <div className="w-full max-w-[400px] mx-auto z-10 relative flex flex-col justify-center">
                            
                            <div className="hidden md:block text-center mb-6">
                                <h2 className="text-2xl font-semibold text-white mb-1.5 tracking-tight">Forgot Password?</h2>
                                <p className="text-slate-400 text-sm font-medium">Enter your email address to receive a reset link.</p>
                            </div>

                            {/* Error / Success Alerts */}
                            <div className="min-h-[32px] md:min-h-[46px] w-full mb-3 flex items-center justify-center">
                                {error ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-white/30 text-red-400 text-[12.5px] md:text-[13px] font-medium animate-shake backdrop-blur-md"><span className="truncate">{error}</span></div>
                                ) : successMsg ? (
                                    <div className="w-full py-2 md:py-0 md:h-full flex items-center gap-3 px-4 rounded-xl bg-black/80 border border-emerald-500/30 text-emerald-400 text-[12.5px] md:text-[13px] font-medium backdrop-blur-md"><span className="truncate">{successMsg}</span></div>
                                ) : null}
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <div className="animate-fade-in flex flex-col gap-3 w-full">
                                    <input type="email" value={email} onChange={(e) => {setEmail(e.target.value); setError(null);}} placeholder="Email Address" className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white outline-none focus:border-white/30 transition-colors" />
                                </div>
                                
                                <button type="submit" disabled={loading || successMsg} className="w-full bg-white/10 border border-white/20 text-white font-semibold py-2.5 md:py-3 rounded-xl hover:bg-white/20 hover:scale-[1.01] transition-all mt-2 flex justify-center items-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-[13px] disabled:opacity-50">
                                    {loading ? "Sending Link..." : "Send Reset Link"}
                                </button>
                                
                                <div className="mt-4 text-center text-xs text-slate-400 font-medium">
                                    Remember your password? <span onClick={() => navigate('/login')} className="text-slate-300 hover:text-white hover:underline cursor-pointer transition-colors">Log in</span>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
