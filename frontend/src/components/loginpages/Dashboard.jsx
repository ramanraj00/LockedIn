import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // 🔴 LOGOUT FUNCTIONALITY
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include" // Cookie delete karwane ke liye zaroori hai
            });
            
            if (response.ok) {
                // Logout successful hone par login page bhej do
                navigate('/login');
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#02040c] text-white flex flex-col relative overflow-hidden">
            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* NAVBAR */}
            <nav className="w-full px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/[0.05] relative z-10 backdrop-blur-md bg-[#02040c]/50">
                <div className="text-2xl tracking-widest cursor-pointer drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Pixeloid', sans-serif" }}>
                    LockedIn
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-sm font-semibold text-slate-200"
                >
                    Log Out
                </button>
            </nav>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8 relative z-10 flex flex-col items-center justify-center">
                
                <div className="animate-fade-in w-full max-w-2xl bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10 md:p-14 text-center backdrop-blur-xl shadow-[0_0_60px_rgba(99,102,241,0.05)]">
                    
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <span className="text-2xl">🛡️</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                        Welcome to Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed">
                        You have successfully passed the security layer. This is a protected route, meaning no one can access this page without a valid login token.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-[#010308] border border-white/[0.03] flex flex-col items-center hover:bg-white/[0.02] transition-colors">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Auth Status</span>
                            <span className="text-lg md:text-xl font-bold text-emerald-400">Authenticated</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#010308] border border-white/[0.03] flex flex-col items-center hover:bg-white/[0.02] transition-colors">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Security Level</span>
                            <span className="text-lg md:text-xl font-bold text-indigo-400">Maximum</span>
                        </div>
                    </div>
                    
                </div>
            </main>

            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                `}
            </style>
        </div>
    );
};

export default Dashboard;