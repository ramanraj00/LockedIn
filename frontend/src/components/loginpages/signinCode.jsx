import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🌟 DEMO AVATARS
const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude&backgroundColor=d1d4f9"
];

const Signin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
    // 🌟 UX States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const [successMsg, setSuccessMsg] = useState(null); 
    const [fieldErrors, setFieldErrors] = useState({}); 

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        imageUrl: AVATARS[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAvatarSelect = (avatarUrl) => {
        setFormData((prev) => ({
            ...prev,
            imageUrl: avatarUrl
        }));
    };

    const handleGoogleAuth = () => {
        window.location.href = "http://localhost:3000/api/auth/google"; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setSuccessMsg(null);
        setFieldErrors({});

        let tempErrors = {};
        if(!formData.name) tempErrors.name = "Name is required";
        if(!formData.email) tempErrors.email = "Email is required";
        if(!formData.password) tempErrors.password = "Password is required";
        
        if (Object.keys(tempErrors).length > 0) {
            setFieldErrors(tempErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    imageUrl: formData.imageUrl
                })
            });

            const data = await response.json();

            // ⚠️ Error Handling UX
            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const newFieldErrors = {};
                    data.errors.forEach(err => {
                        const fieldName = err.path[0];
                        // 👇 FIX APPLIED: Handles multiple errors per field
                        newFieldErrors[fieldName] = newFieldErrors[fieldName] 
                            ? newFieldErrors[fieldName] + " • " + err.message 
                            : err.message;
                    });
                    setFieldErrors(newFieldErrors);
                } else {
                    setError(data.message || "Failed to sign up");
                }
                return;
            }

            // ✅ Success UX
            setSuccessMsg(data.message || "Account created Successfully!");
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.message || "Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-black">
            <div className="w-full max-w-[1100px] min-h-[700px] flex flex-col md:flex-row bg-[#050505] rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                
                {/* 🖼️ LEFT SIDE: IMAGE WITH LOGO */}
                <div className="relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black min-h-[300px] md:min-h-full">
                    <img 
                        src="/lokind.jpg" 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div 
                        onClick={() => navigate('/')}
                        className="absolute top-8 left-8 md:top-10 md:left-10 z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                        <span 
                            className="text-white text-3xl md:text-4xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none"
                            style={{ fontFamily: "'Pixeloid', sans-serif" }}
                        >
                            LockedIn
                        </span>
                    </div>
                </div>

                {/* ⚫ RIGHT SIDE: FORM */}
                <div className="w-full md:w-[55%] bg-[#050505] p-8 md:p-10 lg:p-16 flex flex-col justify-center">
                    <div className="w-full max-w-[400px] mx-auto">
                        
                        <div className="text-center mb-6">
                            <h2 
                                className="text-2xl font-semibold text-white mb-2 tracking-tight"
                                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                            >
                                Sign Up Account
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Enter your personal data to create your account.
                            </p>
                        </div>

                        {/* Google Button */}
                        <button 
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.08] bg-transparent hover:bg-white/[0.03] transition-colors text-white text-sm font-medium cursor-pointer"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.72 17.57C14.73 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.7 5.88 14.12H2.18V16.99C4.01 20.63 7.7 23 12 23Z" fill="#34A853"/>
                                <path d="M5.88 14.12C5.66 13.46 5.53 12.75 5.53 12C5.53 11.25 5.66 10.54 5.88 9.88V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.88 14.12Z" fill="#FBBC05"/>
                                <path d="M12 5.38C13.62 5.38 15.07 5.94 16.21 7.03L19.37 3.87C17.46 2.09 14.97 1 12 1C7.7 1 4.01 3.37 2.18 7.01L5.88 9.88C6.74 7.3 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>

                        <div className="flex items-center gap-4 my-5">
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                            <span className="text-zinc-600 text-[11px] uppercase tracking-widest font-semibold">Or</span>
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                        </div>

                        {/* ✅ SUCCESS & GENERIC ERROR BANNERS */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center transition-all">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center transition-all">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[13px] text-zinc-400 font-medium ml-1">Choose your Avatar</label>
                                <div className="flex items-center justify-between gap-3 px-1">
                                    {AVATARS.map((avatar, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => handleAvatarSelect(avatar)}
                                            className={`cursor-pointer rounded-full overflow-hidden transition-all duration-300 w-12 h-12 md:w-[52px] md:h-[52px] ${
                                                formData.imageUrl === avatar 
                                                    ? 'ring-[3px] ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                                    : 'opacity-50 hover:opacity-80'
                                            }`}
                                        >
                                            <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-white/5" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NAME FIELD */}
                            <div className="flex flex-col gap-1.5 mt-1">
                                <label className="text-[13px] text-zinc-400 font-medium ml-1">Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    disabled={loading}
                                    placeholder="eg. John" 
                                    className={`w-full bg-[#121212] border ${fieldErrors.name ? 'border-red-500/50' : 'border-white/[0.05]'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-[#161616] transition-all disabled:opacity-50`} 
                                />
                                {fieldErrors.name && <span className="text-[11px] text-red-400 font-medium ml-1">{fieldErrors.name}</span>}
                            </div>

                            {/* EMAIL FIELD */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-zinc-400 font-medium ml-1">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    disabled={loading}
                                    placeholder="eg. johnfrans@gmail.com" 
                                    className={`w-full bg-[#121212] border ${fieldErrors.email ? 'border-red-500/50' : 'border-white/[0.05]'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-[#161616] transition-all disabled:opacity-50`} 
                                />
                                {fieldErrors.email && <span className="text-[11px] text-red-400 font-medium ml-1">{fieldErrors.email}</span>}
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-zinc-400 font-medium ml-1">Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        disabled={loading}
                                        placeholder="Enter your password" 
                                        className={`w-full bg-[#121212] border ${fieldErrors.password ? 'border-red-500/50' : 'border-white/[0.05]'} rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:bg-[#161616] transition-all pr-12 disabled:opacity-50`} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                                {fieldErrors.password ? (
                                    <span className="text-[11px] text-red-400 font-medium ml-1">{fieldErrors.password}</span>
                                ) : (
                                    <span className="text-[11px] text-zinc-500 font-medium ml-1 mt-0.5">Must be at least 8 characters.</span>
                                )}
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button 
                                type="submit" 
                                disabled={loading || successMsg}
                                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-zinc-400 font-medium">
                            Already have an account?{' '}
                            <span 
                                onClick={() => !loading && navigate('/login')} 
                                className={`text-white hover:underline cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Log in
                            </span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signin;