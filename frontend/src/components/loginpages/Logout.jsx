import React from 'react';

const Logout = () => {

    // 🔴 SECURE LOGOUT FUNCTIONALITY (FIXED B-F CACHE ISSUE)
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include" 
            });
            
            if (response.ok) {
                // Security: Clear localStorage and sessionStorage
                localStorage.clear();
                sessionStorage.clear();
                
                // 🔥 Hard redirect to wipe React memory state
                window.location.replace('/login');
            }
        } catch (error) {
            console.error("Logout failed", error);
            // Error aane par bhi user ko force bahar nikalo
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('/login');
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#02040c] text-white flex flex-col relative overflow-hidden items-center justify-center">
            
            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* MAIN CONTENT */}
            <div className="animate-fade-in w-full max-w-lg bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10 md:p-14 text-center backdrop-blur-xl shadow-[0_0_60px_rgba(239,68,68,0.05)] relative z-10">
                
                <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🔒</span>
                </div>

                <h1 className="text-3xl font-bold mb-4 tracking-tight text-white" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                    Secure Session
                </h1>
                
                <p className="text-slate-400 text-sm md:text-base mb-10 max-w-sm mx-auto leading-relaxed">
                    Are you sure you want to log out? This will safely end your current session and clear all sensitive data from this device.
                </p>

                <button 
                    onClick={handleLogout}
                    className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-base font-bold text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                    End Session
                </button>
                
                <div className="mt-8 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Level</span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">E2E ENCRYPTED</span>
                </div>
            </div>

            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                `}
            </style>
        </div>
    );
};

export default Logout;