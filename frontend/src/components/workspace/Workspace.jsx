import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const COLORS = {
    bg: '#000000',
    card: '#0A0A0A',
    sidebar: '#15181C',
    border: 'rgba(255,255,255,0.15)',
    borderHover: 'rgba(255,255,255,0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#A1A1AA',
};

const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const h = Math.floor(safeSeconds / 3600);
    const m = Math.floor((safeSeconds % 3600) / 60);
    const s = Math.floor(safeSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const E2E = {
    _keyCache: null,
    async getKey() {
        if (this._keyCache) return this._keyCache;
        const stored = localStorage.getItem('lockedin_e2e_key');
        if (stored) {
            try {
                const rawKey = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
                this._keyCache = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt']);
                return this._keyCache;
            } catch { localStorage.removeItem('lockedin_e2e_key'); }
        }
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const exported = await crypto.subtle.exportKey('raw', key);
        localStorage.setItem('lockedin_e2e_key', btoa(String.fromCharCode(...new Uint8Array(exported))));
        this._keyCache = key;
        return key;
    },
    async encrypt(plaintext) {
        const key = await this.getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(plaintext);
        const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
        const combined = new Uint8Array(iv.length + new Uint8Array(cipherBuf).length);
        combined.set(iv);
        combined.set(new Uint8Array(cipherBuf), iv.length);
        return btoa(String.fromCharCode(...combined));
    },
    async decrypt(cipherB64) {
        try {
            if (!cipherB64 || cipherB64.length < 30) return cipherB64;
            const key = await this.getKey();
            const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
            if (combined.length < 28) return cipherB64;
            const iv = combined.slice(0, 12);
            const ciphertext = combined.slice(12);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
            return new TextDecoder().decode(decrypted);
        } catch { return cipherB64; }
    }
};

const Workspace = () => {
    const navigate = useNavigate();

    const [daySessions, setDaySessions] = useState([]);
    const [tasksByDay, setTasksByDay] = useState({});
    const [timersByDay, setTimersByDay] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedBoxes, setExpandedBoxes] = useState({});
    const [editingDayId, setEditingDayId] = useState(null);
    const [addingTaskDayId, setAddingTaskDayId] = useState(null);
    const [newTaskText, setNewTaskText] = useState("");
    const [isCreatingBox, setIsCreatingBox] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    
    const [localStartTimes, setLocalStartTimes] = useState({});
    const [now, setNow] = useState(Date.now());
    const [decryptedTexts, setDecryptedTexts] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    // 🔥 NEW: Inline confirm (no more browser popup)
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'save'|'reset', dayId }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setSidebarOpen(false);
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const decryptAll = async () => {
            const updated = { ...decryptedTexts };
            let changed = false;
            for (const dayId of Object.keys(tasksByDay)) {
                for (const task of tasksByDay[dayId]) {
                    if (!(task._id in updated)) {
                        updated[task._id] = await E2E.decrypt(task.encryptedDescription);
                        changed = true;
                    }
                }
            }
            if (changed) setDecryptedTexts(updated);
        };
        decryptAll();
    }, [tasksByDay]);

    const fetchWorkspaceData = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/session/day/all", { credentials: "include" });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if (data.daySessions) {
                setDaySessions(data.daySessions);
                data.daySessions.forEach(day => {
                    fetchTasks(day._id);
                    fetchTimers(day._id);
                    if (isToday(day.date)) {
                        setExpandedBoxes(prev => ({ ...prev, [day._id]: true }));
                    }
                });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchWorkspaceData(); }, []);

    const fetchTasks = async (dayId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/task/gettask/${dayId}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTasksByDay(prev => ({ ...prev, [dayId]: data }));
            }
        } catch (err) {}
    };

    const fetchTimers = async (dayId) => {
        try {
            const res = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTimersByDay(prev => ({ ...prev, [dayId]: data.sessions || [] }));
            }
        } catch (err) {}
    };

    const handleCreateDaySession = async () => {
        setIsCreatingBox(true);
        setGlobalError(null);
        try {
            const res = await fetch("http://localhost:3000/api/session/day/add", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "My Workspace", date: new Date() }),
                credentials: "include"
            });
            if (res.ok) fetchWorkspaceData();
            else {
                const errData = await res.json().catch(() => ({}));
                setGlobalError(`Error: ${errData.error || errData.message}`);
            }
        } catch (err) { setGlobalError(err.message); }
        finally { setIsCreatingBox(false); }
    };

    const handleUpdateDaySession = async (dayId, title, deadline) => {
        try {
            const body = {};
            if (title) body.title = title;
            if (deadline) body.deadline = deadline;
            await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body), credentials: "include"
            });
            fetchWorkspaceData();
        } catch (err) {}
    };

    // 🔥 FIX: No more window.confirm — called from inline UI
    const handleCompleteDay = async (dayId) => {
        const running = getRunningSession(dayId);
        if (running) {
            const startT = localStartTimes[dayId] || new Date(running.startTime).getTime();
            const elapsed = Math.max(0, Math.floor((Date.now() - startT) / 1000));
            setTimersByDay(prev => ({
                ...prev,
                [dayId]: (prev[dayId] || []).map(s =>
                    s._id === running._id ? { ...s, status: 'completed', duration: elapsed } : s
                )
            }));
        }
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        try {
            await fetch(`http://localhost:3000/api/session/day/${dayId}/complete`, { method: "PATCH", credentials: "include" });
            fetchWorkspaceData();
        } catch (err) {}
    };

    const handleReopenDay = async (dayId) => {
        try {
            await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "active" }), credentials: "include"
            });
            fetchWorkspaceData();
        } catch (err) { console.error(err); }
    };

    const confirmAddTask = async (dayId) => {
        if (!newTaskText.trim()) return;
        const plaintext = newTaskText.trim();
        setNewTaskText("");
        setAddingTaskDayId(null);
        try {
            const encryptedDescription = await E2E.encrypt(plaintext);
            const res = await fetch("http://localhost:3000/api/task/addtask", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId, encryptedDescription, encryptedAESKey: "e2e_v1" }),
                credentials: "include"
            });
            if (res.ok) fetchTasks(dayId);
            else setGlobalError("Failed to add task");
        } catch (err) { setGlobalError(err.message); }
    };

    const handleToggleTask = async (taskId, currentStatus, dayId) => {
        setTasksByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(t => t._id === taskId ? { ...t, status: !currentStatus } : t) }));
        try {
            await fetch(`http://localhost:3000/api/task/patchtask/${taskId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: !currentStatus }), credentials: "include"
            });
            fetchTasks(dayId);
        } catch (err) {}
    };

    const handleDeleteTask = async (taskId, dayId) => {
        setTasksByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(t => t._id !== taskId) }));
        setDecryptedTexts(prev => { const n = { ...prev }; delete n[taskId]; return n; });
        try {
            await fetch(`http://localhost:3000/api/task/deletetask/${taskId}`, { method: "DELETE", credentials: "include" });
            fetchTasks(dayId);
        } catch (err) {}
    };

    // ═══════════════ TIMER HANDLERS — USE API RESPONSE, NO fetchTimers RACE ═══════════════

    const handleStartTimer = async (dayId) => {
        const exactStart = Date.now();
        const optimisticId = 'opt_' + exactStart;

        setLocalStartTimes(prev => ({ ...prev, [dayId]: exactStart }));
        setTimersByDay(prev => ({
            ...prev,
            [dayId]: [...(prev[dayId] || []), { _id: optimisticId, status: 'running', startTime: new Date(exactStart).toISOString(), duration: 0 }]
        }));

        try {
            const res = await fetch("http://localhost:3000/api/session/session/start", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId }), credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                // 🔥 Replace optimistic with real session (NO fetchTimers = NO race condition)
                setTimersByDay(prev => ({
                    ...prev,
                    [dayId]: (prev[dayId] || []).map(s => s._id === optimisticId ? data.session : s)
                }));
            } else {
                setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(s => s._id !== optimisticId) }));
                setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
                const errData = await res.json().catch(() => ({}));
                setGlobalError(errData.message || "Failed to start timer");
            }
        } catch (err) {
            setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(s => s._id !== optimisticId) }));
            setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        }
    };

    // 🔥 PAUSE FIX: Use API response directly — no fetchTimers overwriting paused state
    const handlePauseTimer = async (dayId, sessionId) => {
        // Step 1: Optimistic freeze
        const sessions = timersByDay[dayId] || [];
        const runSess = sessions.find(s => s._id === sessionId);
        let elapsed = 0;
        if (runSess) {
            const startT = localStartTimes[dayId] || new Date(runSess.startTime).getTime();
            elapsed = Math.max(0, Math.floor((Date.now() - startT) / 1000));
            setTimersByDay(prev => ({
                ...prev,
                [dayId]: (prev[dayId] || []).map(s =>
                    s._id === sessionId ? { ...s, status: 'paused', duration: elapsed } : s
                )
            }));
        }
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });

        // Step 2: Find real ID if optimistic
        let realId = sessionId;
        if (sessionId.startsWith('opt_')) {
            try {
                const sessRes = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
                if (sessRes.ok) {
                    const sessData = await sessRes.json();
                    const real = (sessData.sessions || []).find(s => s.status === 'running');
                    if (real) realId = real._id;
                    else return; // no running session to pause
                }
            } catch { return; }
        }

        // Step 3: Pause on server and use response
        try {
            const res = await fetch(`http://localhost:3000/api/session/session/${realId}/pause`, { method: "PATCH", credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                // 🔥 Update with server's confirmed paused session — NO fetchTimers
                setTimersByDay(prev => ({
                    ...prev,
                    [dayId]: (prev[dayId] || []).map(s =>
                        (s._id === sessionId || s._id === realId) ? data.session : s
                    )
                }));
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Pause failed:", errData.message);
                setGlobalError(errData.message || "Pause failed");
                fetchTimers(dayId); // Fallback: re-sync with server
            }
        } catch (err) {
            console.error("Pause error:", err);
            fetchTimers(dayId);
        }
    };

    const handleResumeTimer = async (dayId, sessionId) => {
        const exactStart = Date.now();
        const optimisticId = 'opt_' + exactStart;

        setLocalStartTimes(prev => ({ ...prev, [dayId]: exactStart }));
        setTimersByDay(prev => ({
            ...prev,
            [dayId]: [...(prev[dayId] || []), { _id: optimisticId, status: 'running', startTime: new Date(exactStart).toISOString(), duration: 0 }]
        }));

        try {
            const res = await fetch(`http://localhost:3000/api/session/session/${sessionId}/resume`, { method: "POST", credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                // Replace optimistic with real session
                setTimersByDay(prev => ({
                    ...prev,
                    [dayId]: (prev[dayId] || []).map(s => s._id === optimisticId ? data.session : s)
                }));
            }
        } catch (err) {
            setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(s => s._id !== optimisticId) }));
        }
    };

    // 🔥 RESET FIX: No window.confirm — called from inline UI
    const handleResetTimer = async (dayId) => {
        setTimersByDay(prev => ({ ...prev, [dayId]: [] }));
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });

        try {
            const res = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                const sessions = data.sessions || [];
                const running = sessions.find(s => s.status === 'running');
                if (running) {
                    await fetch(`http://localhost:3000/api/session/session/${running._id}/pause`, { method: "PATCH", credentials: "include" });
                }
                await Promise.all(
                    sessions.map(s => fetch(`http://localhost:3000/api/session/session/${s._id}`, { method: "DELETE", credentials: "include" }).catch(() => {}))
                );
            }
        } catch (err) { console.error("Reset error:", err); }
        fetchTimers(dayId);
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch { navigate("/login"); }
    };

    const isToday = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const getCalculatedTime = (dayId) => {
        const sessions = timersByDay[dayId] || [];
        let totalSeconds = 0;
        sessions.forEach(s => {
            if (s.status === 'completed' || s.status === 'paused') {
                totalSeconds += (s.duration || 0);
            } else if (s.status === 'running') {
                const startTimeToUse = localStartTimes[dayId] || new Date(s.startTime).getTime();
                const elapsed = Math.max(0, Math.floor((now - startTimeToUse) / 1000));
                totalSeconds += elapsed;
            }
        });
        return totalSeconds;
    };

    const getRunningSession = (dayId) => (timersByDay[dayId] || []).find(s => s.status === 'running');
    const getPausedSession = (dayId) => [...(timersByDay[dayId] || [])].reverse().find(s => s.status === 'paused');

    const getDeadlineStatus = (day) => {
        if (day.status === 'completed') return 'completed';
        const tasks = tasksByDay[day._id] || [];
        const allCompleted = tasks.length > 0 && tasks.every(t => t.status);
        if (allCompleted) return 'completed';
        if (!day.deadline) return 'active';
        const daysDiff = (new Date(day.deadline).getTime() - Date.now()) / (1000 * 3600 * 24);
        if (daysDiff < 0) return 'overdue';
        if (daysDiff <= 2) return 'pending';
        return 'active';
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                .sidebar-trigger:hover { transform: scale(1.05); }
                .header-btn {
                    background: none; border: none; color: ${COLORS.textPrimary}; 
                    font-size: 14px; font-weight: 400; cursor: pointer; transition: opacity 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .header-btn:hover { opacity: 0.6; }
                .timer-text-btn {
                    font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;
                    text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px;
                    border-radius: 6px; border: 1px solid transparent; outline: none;
                }
                .start-btn { background: #E5E7EB; color: #000; }
                .start-btn:hover { background: #FFFFFF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,255,255,0.1); }
                .pause-btn { background: rgba(239,68,68,0.15); color: #F87171; border-color: rgba(239,68,68,0.3); }
                .pause-btn:hover { background: rgba(239,68,68,0.25); }
                .reset-btn { background: transparent; color: #A1A1AA; border-color: rgba(255,255,255,0.15); }
                .reset-btn:hover { background: rgba(255,255,255,0.05); color: #FFFFFF; }
                .save-btn { background: rgba(16,185,129,0.15); color: #34D399; border-color: rgba(16,185,129,0.3); }
                .save-btn:hover { background: rgba(16,185,129,0.25); }
                .action-btn {
                    background: none; border: none; color: ${COLORS.textMuted}; 
                    font-size: 13px; font-weight: 400; cursor: pointer; transition: color 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .action-btn:hover { color: #FFFFFF !important; }
                .edit-input {
                    background: transparent; border: 1px solid ${COLORS.border}; 
                    color: #FFF; font-size: 14px; padding: 4px 8px; border-radius: 4px; outline: none; width: 100%;
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
            
            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', monospace, sans-serif", position: 'relative', overflowX: 'hidden' }}>
                
                <button onMouseEnter={() => setSidebarOpen(true)} onClick={() => setSidebarOpen(true)} className="sidebar-trigger"
                    style={{ position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}>
                    <CustomSidebarIcon />
                </button>

                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 40, transition: 'opacity 0.4s ease', opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}></div>

                <div ref={sidebarRef} onMouseLeave={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, zIndex: 50, padding: 24, display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                        <span style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                        <button onClick={() => setSidebarOpen(false)} style={{ padding: 8, color: COLORS.textMuted, cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {SIDEBAR_ITEMS.map((item) => {
                            const isActive = item === 'Workspace';
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

                <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)', width: '100%', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 400 }}>workspace</h1>
                        <button onClick={handleCreateDaySession} disabled={isCreatingBox} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, padding: '8px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                            {isCreatingBox ? 'creating...' : '+ new box'}
                        </button>
                    </div>

                    {globalError && (
                        <div style={{ marginBottom: 32, padding: '12px 16px', border: '1px solid #EF4444', color: '#EF4444', fontSize: 13, borderRadius: 4 }}>
                            {globalError} <button onClick={() => setGlobalError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>x</button>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                        {daySessions.map(day => {
                            const isExpanded = expandedBoxes[day._id] !== false; 
                            const isEditing = editingDayId === day._id;
                            const tasks = tasksByDay[day._id] || [];
                            const runningSession = getRunningSession(day._id);
                            const pausedSession = getPausedSession(day._id);
                            const timeStr = formatTime(getCalculatedTime(day._id));
                            const statusLabel = getDeadlineStatus(day);
                            const isDayCompleted = day.status === 'completed';
                            const isConfirming = confirmAction?.dayId === day._id;

                            return (
                                <div key={day._id} style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                                    <div style={{ flex: '1 1 100%', border: `1px solid ${COLORS.border}`, borderRadius: 8, backgroundColor: COLORS.card, padding: 24, transition: 'all 0.3s ease-in-out' }}>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: isExpanded ? 16 : 0, borderBottom: isExpanded ? `1px solid ${COLORS.border}` : 'none', transition: 'all 0.3s ease' }}>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span style={{ fontSize: 20, fontWeight: 400 }}>
                                                        {new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, padding: '2px 8px', borderRadius: 12, marginLeft: 16 }}>
                                                        {statusLabel}
                                                    </span>
                                                    {!isExpanded && tasks.length > 0 && (
                                                        <span style={{ fontSize: 11, color: COLORS.textPrimary, backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>
                                                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                                        </span>
                                                    )}
                                                </div>
                                                {day.deadline && (
                                                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                                                        deadline: {new Date(day.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* CENTER: Timer + Buttons */}
                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 16px', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                                                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: '0.1em', marginRight: 4 }}>
                                                        {timeStr}
                                                    </span>
                                                    
                                                    <div style={{ height: 20, width: 1, backgroundColor: COLORS.borderHover, margin: '0 4px' }}></div>

                                                    {/* 🔥 INLINE CONFIRM — replaces ugly browser popup */}
                                                    {isConfirming ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                                                                {confirmAction.type === 'save' ? 'end day?' : 'reset timer?'}
                                                            </span>
                                                            <button onClick={() => {
                                                                if (confirmAction.type === 'save') handleCompleteDay(day._id);
                                                                else handleResetTimer(day._id);
                                                                setConfirmAction(null);
                                                            }} className="timer-text-btn save-btn">yes</button>
                                                            <button onClick={() => setConfirmAction(null)} className="timer-text-btn reset-btn">no</button>
                                                        </div>
                                                    ) : isDayCompleted ? (
                                                        <button onClick={() => handleReopenDay(day._id)} className="timer-text-btn start-btn">
                                                            Reopen
                                                        </button>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {!runningSession ? (
                                                                <button onClick={() => pausedSession ? handleResumeTimer(day._id, pausedSession._id) : handleStartTimer(day._id)} className="timer-text-btn start-btn">
                                                                    {pausedSession ? "Resume" : "Start"}
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handlePauseTimer(day._id, runningSession._id)} className="timer-text-btn pause-btn">
                                                                    Pause
                                                                </button>
                                                            )}
                                                            <button onClick={() => setConfirmAction({ type: 'reset', dayId: day._id })} className="timer-text-btn reset-btn">
                                                                Reset
                                                            </button>
                                                            <button onClick={() => setConfirmAction({ type: 'save', dayId: day._id })} className="timer-text-btn save-btn">
                                                                Save
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '6px 16px' }}>
                                                    <button onClick={() => { setAddingTaskDayId(day._id); setExpandedBoxes(p => ({ ...p, [day._id]: true })); }} className="header-btn" title="Add New Task"><Plus size={16} /></button>
                                                    <button onClick={() => setExpandedBoxes(p => ({ ...p, [day._id]: !isExpanded }))} className="header-btn" title={isExpanded ? "Collapse" : "Expand"}>
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                    <button onClick={() => { setEditingDayId(isEditing ? null : day._id); setExpandedBoxes(p => ({ ...p, [day._id]: true })); }} className="header-btn">{isEditing ? 'done' : 'edit'}</button>
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        <button className="header-btn" onClick={(e) => { const input = e.currentTarget.nextSibling; try { input.showPicker(); } catch { input.focus(); } }}>Deadline</button>
                                                        <input type="date" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                                            onChange={(e) => { if (e.target.value) handleUpdateDaySession(day._id, day.title, e.target.value); }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div style={{ paddingTop: 16, animation: 'fadeIn 0.3s ease-in-out' }}>
                                                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                                                {addingTaskDayId === day._id && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                                                        <span style={{ color: COLORS.textMuted, fontSize: 14 }}>+</span>
                                                        <input type="text" autoFocus placeholder="new task..." value={newTaskText}
                                                            onChange={(e) => setNewTaskText(e.target.value)}
                                                            onKeyDown={(e) => { if(e.key === 'Enter') confirmAddTask(day._id); }}
                                                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFF', fontSize: 14, outline: 'none' }} />
                                                        <button onClick={() => confirmAddTask(day._id)} className="action-btn">save</button>
                                                        <button onClick={() => { setAddingTaskDayId(null); setNewTaskText(''); }} className="action-btn">cancel</button>
                                                    </div>
                                                )}
                                                {tasks.map((task, idx) => (
                                                    <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`, opacity: task.status ? 0.3 : 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                                            <span style={{ color: COLORS.textMuted, fontSize: 14, width: 20 }}>{idx + 1}.</span>
                                                            {isEditing ? (
                                                                <input type="text" className="edit-input" defaultValue={decryptedTexts[task._id] || task.encryptedDescription} />
                                                            ) : (
                                                                <span style={{ color: '#FFFFFF', fontSize: 14, textDecoration: task.status ? 'line-through' : 'none' }}>
                                                                    {decryptedTexts[task._id] || task.encryptedDescription}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 16 }}>
                                                            <button onClick={() => handleToggleTask(task._id, task.status, day._id)} className="action-btn">{task.status ? 'undo' : 'done'}</button>
                                                            <button onClick={() => handleDeleteTask(task._id, day._id)} className="action-btn">delete</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {tasks.length === 0 && addingTaskDayId !== day._id && (
                                                    <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 16 }}>no tasks yet.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Workspace;