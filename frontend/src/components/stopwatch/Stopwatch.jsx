import React, { useEffect, useCallback, memo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Play, Pause, RotateCcw, Save, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DitherButton } from "../dither-kit/button";

// 🔥 THE ULTIMATE ZERO-RENDER STORE ENGINE (ATOMIC STATE) 🔥
function createStore(initialState) {
    const store = {
        state: initialState,
        listeners: new Set(),
        getState() { return this.state; },
        setState(newState) {
            let hasChanges = false;
            for (let key in newState) {
                if (this.state[key] !== newState[key]) hasChanges = true;
            }
            if (!hasChanges) return;
            this.state = { ...this.state, ...newState };
            this.listeners.forEach(l => l());
        },
        subscribe(listener) {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }
    };
    return store;
}

const timerStore = createStore({ isRunning: false, time: 0, taskName: "", strictMode: false, sessionId: null });
const uiStore = createStore({ sidebarOpen: false, isDesktop: window.innerWidth >= 1024 });
const statsStore = createStore({ totalDaytime: 0, totalSessions: 0 }); 
const toastStore = createStore({ toasts: [] }); 

const useTimer = (selector) => useSyncExternalStore((l) => timerStore.subscribe(l), () => selector(timerStore.getState()));
const useUI = (selector) => useSyncExternalStore((l) => uiStore.subscribe(l), () => selector(uiStore.getState()));
const useStats = (selector) => useSyncExternalStore((l) => statsStore.subscribe(l), () => selector(statsStore.getState()));
const useToast = (selector) => useSyncExternalStore((l) => toastStore.subscribe(l), () => selector(toastStore.getState()));

const showToast = (message) => {
    const id = Date.now();
    const currentToasts = toastStore.getState().toasts;
    toastStore.setState({ toasts: [...currentToasts, { id, message }] });
    setTimeout(() => {
        const remainingToasts = toastStore.getState().toasts.filter(t => t.id !== id);
        toastStore.setState({ toasts: remainingToasts });
    }, 3000);
};

// --- CONSTANTS & STYLES (ULTRA-PREMIUM FLOATING THEME) ---
const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const COLORS = {
    bg: '#050505',          
    card: '#000000',        
    sidebar: '#15181C',     // 🔥 Workspace Matching Sidebar Color 🔥
    textPrimary: '#E0E0E0', 
    textSecondary: '#A3A3A3',
    textMuted: '#737373', 
    border: 'rgba(255, 255, 255, 0.12)', 
    borderHover: 'rgba(255, 255, 255, 0.18)',
};

// 💎 PREMIUM CARD STYLING 💎
const heavyCardStyle = {
    background: 'linear-gradient(180deg, #111111 0%, #000000 100%)', 
    border: `1px solid ${COLORS.border}`, 
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 32px 64px rgba(0,0,0,1), 0 0 40px rgba(255,255,255,0.02)'
};

const heavyInputStyle = {
    background: '#070707', 
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: 'inset 0 2px 12px rgba(0,0,0,1), 0 1px 0px rgba(255,255,255,0.04)'
};

const secondaryButtonStyle = {
    background: 'linear-gradient(180deg, #18181B 0%, #050505 100%)', 
    border: `1px solid ${COLORS.border}`,
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.8)'
};

const capsuleStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.5)',
    padding: '6px 14px',
    borderRadius: '999px',
    display: 'inline-block'
};

const ToastOverlay = memo(() => {
    const toasts = useToast(s => s.toasts);
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="bg-[#22262B] text-[#E0E0E0] px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10 font-medium text-[14px] flex items-center gap-3 backdrop-blur-xl"
                        style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                    >
                        {t.message.includes("Saved") ? <Target size={16} className="text-[#34D399]" /> : <Play size={16} className="text-[#60A5FA]" />}
                        {t.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

// 🔥 RESTORED EXACT WORKSPACE SIDEBAR ICON 🔥
const CustomSidebarIcon = memo(() => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
));

// 🔥 EXACT FROSTED GLASS HAMBURGER BUTTON FROM WORKSPACE 🔥
const HamburgerButton = memo(() => (
    <button onMouseEnter={() => uiStore.setState({ sidebarOpen: true })} onClick={() => uiStore.setState({ sidebarOpen: true })} className="sidebar-trigger"
        style={{ position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}>
        <CustomSidebarIcon />
    </button>
));

const Header = memo(() => (
    <div className="w-full mb-4 md:mb-8 mt-12 md:mt-2 flex-shrink-0">
        <h1 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#E0E0E0]">Focus Session</h1>
        <p className="hidden sm:block text-[15px] md:text-[17px] text-[#A3A3A3] mt-2 font-medium">Track and save your deep work intervals.</p>
    </div>
));

const QuickStats = memo(() => {
    const totalDaytime = useStats(s => s.totalDaytime);
    const totalSessions = useStats(s => s.totalSessions);

    const hours = Math.floor(totalDaytime / 3600);
    const minutes = Math.floor((totalDaytime % 3600) / 60);

    return (
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-3 md:gap-6 flex-shrink-0">
            <div className="w-full rounded-[20px] md:rounded-[32px] p-5 md:p-8 flex flex-col justify-start flex-1 min-h-[120px] md:min-h-[240px]" style={heavyCardStyle}>
                
                <div className="flex items-center mb-4 md:mb-8">
                    <h3 className="text-[10px] md:text-[12px] font-bold tracking-[0.15em] text-[#E0E0E0] uppercase" style={capsuleStyle}>
                        Today's Progress
                    </h3>
                </div>
                
                <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start w-full mt-auto md:mt-0">
                    <div className="mb-0 md:mb-6 flex flex-col items-center md:items-start">
                        <div className="text-2xl md:text-[38px] font-bold text-[#E0E0E0] tracking-tight leading-none">{hours}h {minutes}m</div>
                        <div className="text-[12px] md:text-[14px] text-[#A3A3A3] mt-2 font-medium">Focus Time</div>
                    </div>
                    <div className="hidden md:block w-full h-[1px] bg-white/10 mb-6" style={{boxShadow: '0 1px 0 rgba(0,0,0,0.5)'}}></div>
                    <div className="flex flex-col items-center md:items-start">
                        <div className="text-2xl md:text-[38px] font-bold text-[#E0E0E0] tracking-tight leading-none">{totalSessions}</div>
                        <div className="text-[12px] md:text-[14px] text-[#A3A3A3] mt-2 font-medium">Sessions</div>
                    </div>
                </div>
            </div>
            
            <div className="hidden lg:flex w-full rounded-[32px] p-8 flex-col relative text-center flex-1 min-h-[200px]" style={heavyCardStyle}>
                
                <div className="absolute top-6 left-6">
                    <h3 className="text-[10px] md:text-[12px] font-bold tracking-[0.15em] text-[#E0E0E0] uppercase" style={capsuleStyle}>
                        Quick Guide
                    </h3>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center mt-6 w-full">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={heavyInputStyle}>
                        <Target size={28} strokeWidth={1.5} className="text-[#A3A3A3] w-8 h-8" />
                    </div>
                    <h4 className="text-[#E0E0E0] font-semibold mb-2 text-[16px]">Stay Locked In</h4>
                    <p className="text-[14px] md:text-[15px] text-[#A3A3A3] leading-relaxed font-medium px-2">
                        Enter your task, start the timer, and focus deeply.
                    </p>
                </div>
            </div>
        </div>
    );
});

const TaskInput = memo(() => {
    const taskName = useTimer(s => s.taskName);
    const isRunning = useTimer(s => s.isRunning);
    
    return (
        <div className="w-full mb-3 md:mb-6 flex-shrink-0">
            <label className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-[#A3A3A3] uppercase mb-2 block ml-2">Current Task</label>
            <div className="w-full flex items-center gap-3 md:gap-4 rounded-[14px] md:rounded-2xl px-4 py-3 md:px-6 md:py-5 transition-all" style={heavyInputStyle}>
                <Target size={18} className={`flex-shrink-0 md:w-5 md:h-5 ${isRunning ? 'text-[#E0E0E0]' : 'text-[#A3A3A3]'}`} />
                <input 
                    type="text" value={taskName} onChange={(e) => timerStore.setState({ taskName: e.target.value })}
                    placeholder="What are you focusing on?" 
                    className="bg-transparent border-none outline-none text-[#E0E0E0] placeholder:text-[#737373] w-full text-[14px] md:text-[16px] font-medium"
                />
            </div>
        </div>
    );
});

const StrictModeToggle = memo(() => {
    const strictMode = useTimer(s => s.strictMode);
    return (
        <div className="flex items-center justify-end w-full pr-2 mb-2 md:mb-6 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => timerStore.setState({ strictMode: !strictMode })}>
                <span className={`text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase transition-colors ${strictMode ? 'text-[#E0E0E0]' : 'text-[#A3A3A3] group-hover:text-[#E0E0E0]'}`}>Strict Mode</span>
                <div className={`w-8 h-4 md:w-9 md:h-5 rounded-full p-1 transition-colors duration-300 border flex items-center border-white/10 ${strictMode ? 'bg-white/10' : 'bg-[#1A1A1A]'}`} style={{boxShadow: 'inset 0 1px 3px rgba(0,0,0,1), 0 1px 0 rgba(255,255,255,0.05)'}}>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-transform duration-300 ${strictMode ? 'bg-[#E0E0E0] translate-x-3 md:translate-x-4' : 'bg-[#A3A3A3] translate-x-0'}`} style={{boxShadow: '0 2px 4px rgba(0,0,0,0.5)'}} />
                </div>
            </div>
        </div>
    );
});

const AnimatedDigit = memo(({ digit }) => (
    <div className="relative inline-block overflow-hidden" style={{ width: '1ch', height: '1.2em' }}>
        <AnimatePresence>
            <motion.span 
                key={digit} 
                initial={{ y: "100%", opacity: 0 }} 
                animate={{ y: "0%", opacity: 1 }} 
                exit={{ y: "-100%", opacity: 0 }} 
                transition={{ type: "spring", stiffness: 350, damping: 30 }} 
                className="absolute inset-0 flex items-center justify-center"
            >
                {digit}
            </motion.span>
        </AnimatePresence>
    </div>
));

const DigitSubscriber = memo(({ selector }) => {
    const digit = useTimer(selector);
    return <AnimatedDigit digit={digit} />;
});

const TimerDigits = memo(() => (
    <div className="text-[64px] sm:text-[90px] md:text-[130px] lg:text-[160px] font-black tabular-nums leading-none flex items-center justify-center select-none text-[#888888] w-full"
        style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif", letterSpacing: '-0.04em' }}>
        <DigitSubscriber selector={s => Math.floor(s.time / 600)} />
        <DigitSubscriber selector={s => Math.floor((s.time / 60) % 10)} />
        <span className="text-[#555555] font-bold mx-1 sm:mx-2 md:mx-4" style={{ transform: 'translateY(-6%)' }}>:</span>
        <DigitSubscriber selector={s => Math.floor((s.time % 60) / 10)} />
        <DigitSubscriber selector={s => s.time % 10} />
    </div>
));

const fetchTodayStats = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/session/stopwatch/today-stats", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
            statsStore.setState({ totalDaytime: data.totalDaytime, totalSessions: data.totalSessions });
        }
    } catch (err) {
        console.error("Failed to fetch stats", err);
    }
};

const handleStartBackend = async (taskName) => {
    try {
        const res = await fetch("http://localhost:3000/api/session/stopwatch/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ taskName })
        });
        const data = await res.json();
        if (data.success) {
            timerStore.setState({ sessionId: data.sessionId });
        }
    } catch (err) {
        console.error("Backend Start failed", err);
    }
};

const handleStopBackend = async (sessionId, isFinalSave = false) => {
    try {
        await fetch("http://localhost:3000/api/session/stopwatch/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId, isFinalSave }) 
        });
        fetchTodayStats(); 
    } catch (err) {
        console.error("Backend Stop failed", err);
    }
};

const StartPauseButton = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    const handleStartPause = useCallback(() => {
        const state = timerStore.getState();
        const newState = !state.isRunning;
        timerStore.setState({ isRunning: newState });
        if (newState) {
            showToast("Timer Started");
            handleStartBackend(state.taskName);
        } else {
            showToast("Timer Paused");
            handleStopBackend(state.sessionId, false);
        }
    }, []);

    return (
        <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:w-56">
            <DitherButton 
                color="blue" 
                variant="hatched" 
                bloom="aura" 
                onClick={handleStartPause}
                className="w-full flex items-center justify-center gap-2 py-3.5 md:py-5 font-semibold text-[14px] md:text-[15px] text-white"
            >
                <AnimatePresence mode="wait">
                    <motion.div key={isRunning ? 'pause' : 'play'} initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 45 }} transition={{ duration: 0.15 }}>
                        {isRunning ? <Pause size={20} fill="currentColor" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" /> : <Play size={20} fill="currentColor" className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />}
                    </motion.div>
                </AnimatePresence>
                {isRunning ? 'Pause' : 'Start'}
            </DitherButton>
        </motion.div>
    );
});

const SaveButton = memo(() => {
    const hasTime = useTimer(s => s.time > 0);
    const handleSave = useCallback(() => {
        const state = timerStore.getState();
        if (state.time > 0) {
            handleStopBackend(state.sessionId, true); 
            showToast("Session Saved Successfully!");
            timerStore.setState({ isRunning: false, time: 0, taskName: "", sessionId: null }); 
        }
    }, []);

    return (
        <motion.button onClick={handleSave} disabled={!hasTime} whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 sm:px-0 sm:w-36 py-3.5 md:py-5 rounded-[14px] md:rounded-2xl font-medium text-[14px] md:text-[15px] text-[#A3A3A3] hover:text-[#E0E0E0] transition-colors duration-200" style={secondaryButtonStyle}
        >
            <Save size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Save</span>
        </motion.button>
    );
});

const ResetButton = memo(() => {
    const hasTime = useTimer(s => s.time > 0);
    const handleReset = useCallback(() => {
        const state = timerStore.getState();
        if (state.isRunning) {
            handleStopBackend(state.sessionId, false);
        }
        timerStore.setState({ isRunning: false, time: 0, sessionId: null });
    }, []);

    return (
        <motion.button onClick={handleReset} disabled={!hasTime} whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-[46px] h-[46px] sm:w-[64px] sm:h-auto py-0 sm:py-5 rounded-[14px] md:rounded-2xl text-[#A3A3A3] hover:text-[#E0E0E0] transition-colors duration-200" style={secondaryButtonStyle}
        >
            <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" />
        </motion.button>
    );
});

const ControlsBar = memo(() => (
    <div className="flex flex-row items-center gap-2 md:gap-4 w-full justify-center mt-auto flex-shrink-0">
        <StartPauseButton />
        <SaveButton />
        <ResetButton />
    </div>
));

// 🔥 ULTIMATE BACKGROUND WORKER ENGINE (Zero Lag, Zero Jump) 🔥
const TimerEngine = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    
    useEffect(() => {
        if (!isRunning) return;

        const startTimestamp = Date.now();
        const startAccumulatedTime = timerStore.getState().time;
        
        const tick = () => {
            const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
            // timerStore ki khasiyat ye hai ki agar "time" same hua toh wo UI re-render nahi karega!
            // Isiliye hum safely tick ko zyada speed me chala sakte hain.
            timerStore.setState({ time: startAccumulatedTime + elapsedSeconds });
        };

        // 🌟 NAYA MAGIC: Inline Web Worker
        // Main thread ko browser sleep kar deta hai, par Web Worker active rehta hai background me!
        const workerCode = `
            let interval;
            self.onmessage = function(e) {
                if (e.data === 'start') {
                    // Hum interval 250ms (0.25 sec) pe chala rahe hain.
                    // Isse calculation ekdam pin-point accurate hogi aur koi second jump nahi karega.
                    interval = setInterval(() => {
                        self.postMessage('tick');
                    }, 250);
                } else if (e.data === 'stop') {
                    clearInterval(interval);
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);

        // Worker har 250ms me hume signal dega
        worker.onmessage = () => {
            tick();
        };

        worker.postMessage('start'); // Worker start karo

        // Fallback: Agar OS extreme power-saving mode me chala jaye toh wapas tab pe aate hi time sync ho
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') tick();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            worker.postMessage('stop');
            worker.terminate(); // Memory free karo
            URL.revokeObjectURL(blobUrl);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isRunning]);
    
    return null; 
});

const SystemEffects = memo(() => {
    const isRunning = useTimer(s => s.isRunning);
    const time = useTimer(s => s.time);

    useEffect(() => {
        if (isRunning || time > 0) {
            const m = Math.floor(time / 60);
            const s = time % 60;
            document.title = `(${Math.floor(m/10)}${m%10}:${Math.floor(s/10)}${s%10}) LockedIn Focus`;
        } else {
            document.title = 'LockedIn | Focus';
        }
    }, [isRunning, time]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            const state = timerStore.getState();
            if (state.strictMode && document.visibilityState === 'hidden' && state.isRunning) {
                timerStore.setState({ isRunning: false });
                handleStopBackend(state.sessionId, false);
                showToast("Timer Paused (Strict Mode)");
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            const state = timerStore.getState();
            
            if (e.code === 'Space') { 
                e.preventDefault(); 
                const newState = !state.isRunning;
                timerStore.setState({ isRunning: newState }); 
                if (newState) {
                    showToast("Timer Started");
                    handleStartBackend(state.taskName);
                } else {
                    showToast("Timer Paused");
                    handleStopBackend(state.sessionId, false);
                }
            } 
            else if (e.code === 'Escape') { 
                e.preventDefault(); 
                if (state.isRunning) {
                    handleStopBackend(state.sessionId, false);
                }
                timerStore.setState({ isRunning: false, time: 0, sessionId: null }); 
            } 
            else if (e.code === 'Enter') {
                e.preventDefault();
                if (state.time > 0) {
                    handleStopBackend(state.sessionId, true);
                    showToast("Session Saved Successfully!");
                    timerStore.setState({ isRunning: false, time: 0, taskName: "", sessionId: null }); 
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return null;
});

const FocusCard = memo(() => {
    return (
        <div className="lg:col-span-2 rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-12 flex flex-col relative w-full min-h-[360px] md:h-full md:min-h-0" style={heavyCardStyle}>
            <TaskInput />
            <StrictModeToggle />
            
            <div className="flex-1 flex flex-col justify-center items-center py-2 md:py-8 w-full">
                <TimerDigits />
            </div>
            
            <ControlsBar />
            <TimerEngine />
            <SystemEffects />
        </div>
    );
});

const SidebarOverlay = memo(() => {
    const sidebarOpen = useUI(s => s.sidebarOpen);
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 40, transition: 'opacity 0.4s ease', opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}></div>
    );
});

// 🔥 EXACT ORIGINAL WORKSPACE SIDEBAR PANEL 🔥
const SidebarPanel = memo(({ navigate, handleLogout }) => {
    const sidebarOpen = useUI(s => s.sidebarOpen);
    return (
        <div 
            onMouseLeave={() => uiStore.setState({ sidebarOpen: false })}
            style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, zIndex: 50, padding: 24, display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                <span style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                <button onClick={() => uiStore.setState({ sidebarOpen: false })} style={{ padding: 8, color: COLORS.textMuted, cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = item === 'Stopwatch';
                    return (
                        <button key={item} onClick={() => navigate(`/${item.toLowerCase()}`)}
                            style={{ width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, border: isActive ? `1px solid ${COLORS.borderHover}` : '1px solid transparent', backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : 'transparent', color: isActive ? COLORS.textPrimary : COLORS.textMuted, cursor: 'pointer' }}>
                            {item}
                        </button>
                    );
                })}
            </div>
            <div style={{ paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, marginTop: 'auto' }}>
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
});

const WindowResizeListener = memo(() => {
    useEffect(() => {
        const handleResize = () => uiStore.setState({ isDesktop: window.innerWidth >= 1024 });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return null;
});

const MainContainer = memo(({ children }) => {
    const sidebarOpen = useUI(s => s.sidebarOpen);
    const isDesktop = useUI(s => s.isDesktop);
    
    return (
        <main 
            className="w-full h-[100dvh] overflow-y-auto md:overflow-hidden flex flex-col justify-start md:justify-center items-center px-4 sm:px-6 md:px-8 py-4 md:py-8 pt-16 transition-all duration-300 relative z-10" 
            style={{ paddingLeft: (sidebarOpen && isDesktop) ? '300px' : undefined }}
        >
            {children}
        </main>
    );
});

const Stopwatch = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchTodayStats();
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    }, [navigate]);

    return (
        <>
            <style>{`
                .sidebar-trigger:hover { transform: scale(1.05); }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
            <div className="h-screen w-full relative font-sans text-white selection:bg-white/20 flex overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
                <ToastOverlay /> 
                <WindowResizeListener />
                <HamburgerButton />
                <SidebarOverlay />
                <SidebarPanel navigate={navigate} handleLogout={handleLogout} />
                <MainContainer>
                    <div className="w-full max-w-5xl mx-auto flex flex-col justify-start md:justify-center h-full max-h-full">
                        <Header />
                        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-4 md:pb-0">
                            <FocusCard />
                            <QuickStats />
                        </div>
                    </div>
                </MainContainer>
            </div>
        </>
    );
};

export default Stopwatch;