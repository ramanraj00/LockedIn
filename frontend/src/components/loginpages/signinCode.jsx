import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from '../shaderbackground/ShaderBackground'; // 👈 adjust path as needed

const AVATARS = [
    "/avatars/gwen.png",
    "/avatars/spidey.png",
    "/avatars/buttercup.png",
    "/avatars/henry.png"
];

const Signin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
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

    const validateForm = () => {
        let tempErrors = {};
        
        if (!formData.name || formData.name.trim() === '') {
            tempErrors.name = "Name is required";
        } else if (formData.name.trim().length < 3) {
            tempErrors.name = "Name must be at least 3 characters";
        } else if (formData.name.length > 50) {
            tempErrors.name = "Name cannot exceed 50 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            tempErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            tempErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            tempErrors.password = "Password is required for local Signup";
        } else {
            const passErrors = [];
            if (formData.password.length < 8) passErrors.push("Password must be at least 8 characters");
            if (formData.password.length > 100) passErrors.push("Cannot exceed 100 characters");
            if (!/[A-Z]/.test(formData.password)) passErrors.push("Must contain at least one uppercase letter");
            if (!/[a-z]/.test(formData.password)) passErrors.push("Must contain at least one lowercase letter");
            if (!/[0-9]/.test(formData.password)) passErrors.push("Must contain at least one number");
            if (!/[!@#$%^&*]/.test(formData.password)) passErrors.push("Must include special character");
            
            if (passErrors.length > 0) {
                tempErrors.password = passErrors.join(" • ");
            }
        }

        return tempErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setSuccessMsg(null);
        setFieldErrors({});

        const tempErrors = validateForm();
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
                    imageUrl: window.location.origin + formData.imageUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const newFieldErrors = {};
                    data.errors.forEach(err => {
                        const fieldName = err.path[0];
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
        <>
            <style>
                {`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-4px); }
                        40%, 80% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fadeIn 1.2s ease-out forwards;
                    }

                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(40px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-slide-up {
                        opacity: 0;
                        animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
                    }
                `}
            </style>

            {/* 🎨 WebGL SHADER BACKGROUND — replaces static gradient */}
            <ShaderBackground />

            <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-4 lg:p-8 relative z-10">
                <div className="w-full max-w-[1100px] min-h-screen md:min-h-[700px] flex flex-col md:flex-row bg-[#01040a]/80 backdrop-blur-sm md:rounded-3xl overflow-hidden md:border border-white/[0.05] md:shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative">
                    
                    {/* 🖼️ LEFT SIDE */}
                    <div className="absolute inset-0 md:relative w-full md:w-[45%] flex flex-col overflow-hidden bg-black min-h-screen md:min-h-full z-0">
                        <img 
                            src="/lokind.jpg" 
                            alt="Background" 
                            className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#01040a]/95 md:hidden pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col h-[35vh] md:h-full p-8 md:p-10 pb-6 md:pb-8 justify-between pointer-events-none">
                            <div className="animate-fade-in pt-4 md:pt-0 pointer-events-auto">
                                <span 
                                    onClick={() => navigate('/')}
                                    className="text-white text-4xl md:text-5xl tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] select-none cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{ fontFamily: "'Pixeloid', sans-serif" }}
                                >
                                    LockedIn
                                </span>
                            </div>
                            
                            <div className="flex flex-col pointer-events-auto mb-0">
                                <span className="text-white/80 text-[12px] md:text-[13px] font-medium mb-1 md:mb-2 drop-shadow-md">
                                    You can easily
                                </span>
                                <div className="text-white text-[22px] md:text-[28px] lg:text-[30px] font-bold leading-[1.2] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                    Get access your personal<br />
                                    hub for clarity and<br />
                                    productivity
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ⚫ RIGHT SIDE */}
                    <div className="w-full md:w-[55%] mt-[35vh] md:mt-0 bg-gradient-to-br from-[#051330]/95 to-[#01040a]/95 backdrop-blur-[24px] md:border-l border-white/[0.04] p-6 sm:p-8 md:p-10 lg:p-16 flex flex-col justify-center relative overflow-hidden z-10 rounded-t-[2.5rem] md:rounded-none shadow-[0_-20px_40px_rgba(0,0,0,0.5)] md:shadow-none animate-slide-up min-h-[65vh] md:min-h-full">
                        
                        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-400/15 rounded-full blur-[90px] pointer-events-none"></div>

                        <div className="w-full max-w-[400px] mx-auto z-10">
                            
                            <div className="text-center mb-6">
                                <h2 
                                    className="text-2xl font-semibold text-white mb-2 tracking-tight"
                                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                                >
                                    Sign Up Account
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    Enter your personal data to create your account.
                                </p>
                            </div>

                            <button 
                                type="button"
                                onClick={handleGoogleAuth}
                                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-sm transition-colors text-white text-sm font-medium cursor-pointer"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                                    <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.72 17.57C14.73 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.7 5.88 14.12H2.18V16.99C4.01 20.63 7.7 23 12 23Z" fill="#34A853"/>
                                    <path d="M5.88 14.12C5.66 13.46 5.53 12.75 5.53 12C5.53 11.25 5.66 10.54 5.88 9.88V7.01H2.18C1.43 8.5 1 10.2 1 12C1 13.8 1.43 15.5 2.18 16.99L5.88 14.12Z" fill="#FBBC05"/>
                                    <path d="M12 5.38C13.62 5.38 15.07 5.94 16.21 7.03L19.37 3.87C17.46 2.09 14.97 1 12 1C7.7 1 4.01 3.37 2.18 7.01L5.88 9.88C6.74 7.3 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                                </svg>
                                Google
                            </button>

                            <div className="flex items-center gap-4 my-5 opacity-70">
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                                <span className="text-slate-400 text-[11px] uppercase tracking-widest font-semibold">Or</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center transition-all animate-shake">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center transition-all">
                                    {successMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[13px] text-slate-300 font-medium ml-1">Choose your Avatar</label>
                                    <div className="flex items-center justify-between gap-3 px-1">
                                        {AVATARS.map((avatar, index) => (
                                            <div 
                                                key={index}
                                                onClick={() => handleAvatarSelect(avatar)}
                                                className={`cursor-pointer rounded-full overflow-hidden transition-all duration-300 w-12 h-12 md:w-[52px] md:h-[52px] ${
                                                    formData.imageUrl === avatar 
                                                        ? 'ring-[3px] ring-indigo-400 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                                                        : 'opacity-50 hover:opacity-80'
                                                }`}
                                            >
                                                <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover bg-white/5" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col mt-2">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            id="name"
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            disabled={loading}
                                            placeholder=" " 
                                            className={`peer w-full bg-white/[0.03] border ${fieldErrors.name ? 'border-red-500/60 animate-shake' : 'border-white/[0.06]'} rounded-xl px-4 pt-5 pb-2.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.06] transition-all disabled:opacity-50`} 
                                        />
                                        <label 
                                            htmlFor="name"
                                            className={`absolute left-4 top-2 text-slate-400 text-[11px] font-medium transition-all duration-200 pointer-events-none
                                            translate-y-0
                                            peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal
                                            peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-indigo-400 peer-focus:font-medium
                                            ${fieldErrors.name ? 'text-red-400 peer-focus:text-red-400' : ''}`}
                                        >
                                            Name
                                        </label>
                                    </div>
                                    {fieldErrors.name && <span className="text-[11px] text-red-400 font-medium ml-1 mt-1.5">{fieldErrors.name}</span>}
                                </div>

                                <div className="flex flex-col">
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            id="email"
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            disabled={loading}
                                            placeholder=" " 
                                            className={`peer w-full bg-white/[0.03] border ${fieldErrors.email ? 'border-red-500/60 animate-shake' : 'border-white/[0.06]'} rounded-xl px-4 pt-5 pb-2.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.06] transition-all disabled:opacity-50`} 
                                        />
                                        <label 
                                            htmlFor="email"
                                            className={`absolute left-4 top-2 text-slate-400 text-[11px] font-medium transition-all duration-200 pointer-events-none
                                            translate-y-0
                                            peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal
                                            peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-indigo-400 peer-focus:font-medium
                                            ${fieldErrors.email ? 'text-red-400 peer-focus:text-red-400' : ''}`}
                                        >
                                            Email Address
                                        </label>
                                    </div>
                                    {fieldErrors.email && <span className="text-[11px] text-red-400 font-medium ml-1 mt-1.5">{fieldErrors.email}</span>}
                                </div>

                                <div className="flex flex-col">
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            id="password"
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            disabled={loading}
                                            placeholder=" " 
                                            className={`peer w-full bg-white/[0.03] border ${fieldErrors.password ? 'border-red-500/60 animate-shake' : 'border-white/[0.06]'} rounded-xl px-4 pt-5 pb-2.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.06] transition-all pr-12 disabled:opacity-50`} 
                                        />
                                        <label 
                                            htmlFor="password"
                                            className={`absolute left-4 top-2 text-slate-400 text-[11px] font-medium transition-all duration-200 pointer-events-none
                                            translate-y-0
                                            peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal
                                            peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-indigo-400 peer-focus:font-medium
                                            ${fieldErrors.password ? 'text-red-400 peer-focus:text-red-400' : ''}`}
                                        >
                                            Password
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <span className="text-[11px] text-red-400 font-medium ml-1 mt-1.5 leading-snug">{fieldErrors.password}</span>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading || successMsg}
                                    className="w-full bg-indigo-500 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-600 active:scale-[0.98] transition-all mt-3 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

                            <div className="mt-6 text-center text-sm text-slate-400 font-medium">
                                Already have an account?{' '}
                                <span 
                                    onClick={() => !loading && navigate('/login')} 
                                    className={`text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                                >
                                    Log in
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signin;