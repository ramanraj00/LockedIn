import React, { useEffect, useCallback, memo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Save, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DitherButton } from "../dither-kit/button";
import Sidebar from '../../components/Sidebar/Sidebar'; // 🔥 Import tera naya Sidebar component

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
const statsStore = createStore({ totalDaytime: 0, totalSessions: 0 }); 
const toastStore = createStore({ toasts: [] }); 

const useTimer = (selector) => useSyncExternalStore((l) => timerStore.subscribe(l), () => selector(timerStore.getState()));
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

const COLORS = {
    bg: '#050505',          
    card: '#000000',        
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

const Header = memo(() => (
    <div className="w-full mb-4 md:mb-8 mt-12 md:mt-2 flex-shrink-0">
        <h1 className="text-2xl md:text-[34px] font-bold tracking-tight text-[#E0E0E0]">Focus Session</h1>
        <p className="hidden sm:block text-[15px] md:text-[17px] text-[#A3A3A3] mt-2 font-medium">Track and save your deep work intervals.</p>
    </div>
));

const QuickStats = memo(() => {
    const totalDaytime = useStats(s => s.totalDaytime);
    const totalSessions = useStats(s => s.totalSessions);

    // 🔥 FIX: Agar ek bhi session formally save nahi hua (0 sessions), toh timer ko completely ZERO (0) force kar do.
    const validDaytime = totalSessions === 0 ? 0 : totalDaytime;

    const hours = Math.floor(validDaytime / 3600);
    const minutes = Math.floor((validDaytime % 3600) / 60);

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
                        {/* 🔥 Ab ye directly updated valid hours/minutes dikhayega */}
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
            <div className="flex items-center gap-2 md:gap-3">
                <span className={`text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase transition-colors ${strictMode ? 'text-[#E0E0E0]' : 'text-[#A3A3A3]'}`}>
                    Strict Mode
                </span>
                
                {/* 🔥 PURE CSS BRUTALIST SWITCH 🔥 */}
                <label className="switch sw-10">
                    <input 
                        type="checkbox" 
                        tabIndex="-1" 
                        checked={strictMode}
                        onChange={(e) => timerStore.setState({ strictMode: e.target.checked })} 
                    />
                    <span className="track"><span className="thumb"></span></span>
                </label>
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
        
        // 🔥 Send isReset: true explicitly to backend
        fetch("http://localhost:3000/api/session/stopwatch/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId: state.sessionId, isFinalSave: false, isReset: true })
        });
        
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
            timerStore.setState({ time: startAccumulatedTime + elapsedSeconds });
        };

        const workerCode = `
            let interval;
            self.onmessage = function(e) {
                if (e.data === 'start') {
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

        worker.onmessage = () => {
            tick();
        };

        worker.postMessage('start'); 

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') tick();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            worker.postMessage('stop');
            worker.terminate(); 
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

const MainContainer = memo(({ children }) => {
    return (
        <main className="w-full h-[100dvh] overflow-y-auto md:overflow-hidden flex flex-col justify-start md:justify-center items-center px-4 sm:px-6 md:px-8 py-4 md:py-8 pt-16 transition-all duration-300 relative z-10">
            {children}
        </main>
    );
});

const Stopwatch = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchTodayStats();
    }, []);

    return (
        <>
            <style>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

                /* =========================================
                   🔥 PURE CSS BRUTALIST SWITCH 🔥
                   ========================================= */
                .switch {
                  /* Theme tokens — override these to recolour the switch */
                  --primary: #F4FF2B;
                  --secondary: #0F191E;
                  --surface: #E2F1F2;
                  --on: var(--secondary);                                       
                  --off: color-mix(in srgb, var(--secondary) 22%, var(--surface)); 
                  --thumb: var(--surface);
                  position: relative;
                  display: inline-flex;
                  cursor: pointer;
                  -webkit-tap-highlight-color: transparent;
                }
                .switch input { position: absolute; opacity: 0; width: 0; height: 0; }
                .switch .track {
                  position: relative;
                  width: 52px; height: 28px;
                  border-radius: 9999px;
                  background: var(--off);
                  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .switch .thumb {
                  position: absolute;
                  top: 3px; left: 3px;
                  width: 22px; height: 22px;
                  border-radius: 50%;
                  background: var(--thumb);
                  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, box-shadow 0.3s ease;
                }
                .switch input:checked + .track { background: var(--on); }
                .switch input:checked + .track .thumb { transform: translateX(24px); }
                .switch input:focus-visible + .track { outline: 2px solid var(--primary); outline-offset: 2px; }

                /* .sw-10 Variation */
                .sw-10 .track { background: var(--surface); border: 2px solid var(--secondary); box-shadow: 3px 3px 0 var(--secondary); }
                .sw-10 .thumb { top: 1px; left: 1px; background: var(--secondary); }
                .sw-10 input:checked + .track { background: var(--primary); }

                /* Respect prefers-reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                  .switch .track, .switch .thumb { transition: none !important; }
                }
            `}</style>

            <div className="h-screen w-full relative font-sans text-white selection:bg-white/20 flex overflow-hidden" style={{ backgroundColor: COLORS.bg }}>
                <ToastOverlay /> 
                {/* ... baaki sab same rahega ... */}
                
                {/* 🔥 NAYA SIDEBAR COMPONENT YAHAN AAGAYA 🔥 */}
                <Sidebar activePage="Stopwatch" />
                
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