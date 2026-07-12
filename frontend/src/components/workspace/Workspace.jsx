import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Plus, Clock, Edit2, Check, Trash2, Play, Pause, Square, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];

const COLORS = {
    bg: '#1A1D21',
    card: '#22262B',
    sidebar: '#15181C',
    boxBg: 'rgba(30, 41, 59, 0.4)', 
    boxBorder: 'rgba(56, 189, 248, 0.2)', 
    textPrimary: '#D1D5DB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textPink: '#F472B6', 
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
};

const CustomSidebarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <path d="M18 5v14l3-2.5V7.5z" />
    </svg>
);

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const Workspace = () => {
    const navigate = useNavigate();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const [daySessions, setDaySessions] = useState([]);
    const [tasksByDay, setTasksByDay] = useState({});
    const [timersByDay, setTimersByDay] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [expandedBoxes, setExpandedBoxes] = useState({});
    const [editingDayId, setEditingDayId] = useState(null);
    const [isCreatingBox, setIsCreatingBox] = useState(false);
    
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchWorkspaceData = async () => {
        try {
            // 🔥 URL FIX: Added /session
            const res = await fetch("http://localhost:3000/api/session/day/all", { credentials: "include" });
            
            if (!res.ok) {
                const errText = await res.text();
                console.error("GET ALL Error:", errText);
                return;
            }

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
        } catch (err) {
            console.error("Failed to fetch workspace:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    const fetchTasks = async (dayId) => {
        try {
            // Task URL (Agar yahan bhi issue aaya toh baad me dekh lenge)
            const res = await fetch(`http://localhost:3000/api/gettask/${dayId}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTasksByDay(prev => ({ ...prev, [dayId]: data }));
            }
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    };

    const fetchTimers = async (dayId) => {
        try {
            // 🔥 URL FIX: Added /session
            const res = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTimersByDay(prev => ({ ...prev, [dayId]: data.sessions || [] }));
            }
        } catch (err) {
            console.error("Failed to fetch timers:", err);
        }
    };

    const handleCreateDaySession = async () => {
        setIsCreatingBox(true);
        try {
            // 🔥 URL FIX: Added /session
            const res = await fetch("http://localhost:3000/api/session/day/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "My Workspace", date: new Date() }),
                credentials: "include"
            });
            
            if (res.ok) {
                fetchWorkspaceData();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Backend Error: ${errData.message || res.statusText || 'URL NOT FOUND (404)'}`);
            }
        } catch (err) {
            alert(`Network Error: ${err.message}. Backend server chal raha hai na?`);
        } finally {
            setIsCreatingBox(false);
        }
    };

    const handleUpdateDaySession = async (dayId, title, deadline) => {
        try {
            // 🔥 URL FIX: Added /session
            await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, deadline }),
                credentials: "include"
            });
            fetchWorkspaceData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteDay = async (dayId) => {
        if (!window.confirm("Are you sure you want to finish this day? Timer will stop.")) return;
        try {
            // 🔥 URL FIX: Added /session
            await fetch(`http://localhost:3000/api/session/day/${dayId}/complete`, {
                method: "PATCH",
                credentials: "include"
            });
            fetchWorkspaceData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = async (dayId) => {
        const text = prompt("Enter new task:");
        if (!text) return;
        
        try {
            const res = await fetch("http://localhost:3000/api/addtask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId, encryptedDescription: text, encryptedAESKey: "dummy_key" }),
                credentials: "include"
            });
            if (!res.ok) {
                 const errText = await res.text();
                 alert(`Failed to add task: ${errText}`);
            } else {
                 fetchTasks(dayId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleTask = async (taskId, currentStatus, dayId) => {
        try {
            await fetch(`http://localhost:3000/api/patchtask/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: !currentStatus }),
                credentials: "include"
            });
            fetchTasks(dayId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTask = async (taskId, dayId) => {
        try {
            await fetch(`http://localhost:3000/api/deletetask/${taskId}`, {
                method: "DELETE",
                credentials: "include"
            });
            fetchTasks(dayId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartTimer = async (dayId) => {
        try {
            // 🔥 URL FIX: Added /session/session (Kyunki tumhara router aise setup hai)
            await fetch("http://localhost:3000/api/session/session/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId }),
                credentials: "include"
            });
            fetchTimers(dayId);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePauseTimer = async (dayId, sessionId) => {
        try {
            // 🔥 URL FIX: Added /session/session
            await fetch(`http://localhost:3000/api/session/session/${sessionId}/pause`, {
                method: "PATCH",
                credentials: "include"
            });
            fetchTimers(dayId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleResumeTimer = async (dayId, sessionId) => {
        try {
            // 🔥 URL FIX: Added /session/session
            await fetch(`http://localhost:3000/api/session/session/${sessionId}/resume`, {
                method: "POST",
                credentials: "include"
            });
            fetchTimers(dayId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch (error) { navigate("/login"); }
    };

    const isToday = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const isBoxLocked = (createdAt) => {
        return (Date.now() - new Date(createdAt).getTime()) > (24 * 60 * 60 * 1000);
    };

    const getCalculatedTime = (dayId) => {
        const sessions = timersByDay[dayId] || [];
        let totalSeconds = 0;
        
        sessions.forEach(s => {
            if (s.status === 'completed' || s.status === 'paused') {
                totalSeconds += (s.duration || 0);
            } else if (s.status === 'running' && s.startTime) {
                totalSeconds += Math.floor((now - new Date(s.startTime).getTime()) / 1000);
            }
        });
        return totalSeconds;
    };

    const getRunningSession = (dayId) => {
        return (timersByDay[dayId] || []).find(s => s.status === 'running');
    };
    
    const getPausedSession = (dayId) => {
        const sessions = timersByDay[dayId] || [];
        return [...sessions].reverse().find(s => s.status === 'paused');
    };

    const getDeadlineStatus = (day) => {
        const tasks = tasksByDay[day._id] || [];
        const allCompleted = tasks.length > 0 && tasks.every(t => t.status);
        
        if (allCompleted) return { label: 'Completed', color: '#10B981' };
        if (!day.deadline) return { label: 'Active', color: '#3B82F6' };
        
        const deadlineTime = new Date(day.deadline).getTime();
        const timeDiff = deadlineTime - Date.now();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (timeDiff < 0) return { label: 'Overdue', color: '#EF4444' };
        if (daysDiff <= 2) return { label: 'Pending', color: '#F59E0B' };
        
        return { label: 'Active', color: '#3B82F6' };
    };

    return (
        <>
            <style>{`
                .workspace-box { transition: all 0.3s ease; }
                .workspace-task { transition: all 0.2s ease; }
                .workspace-task:hover { background: rgba(255,255,255,0.03); }
                .sidebar-trigger:hover { transform: scale(1.05); }
                input.edit-input {
                    background: transparent; border: 1px solid rgba(255,255,255,0.2); 
                    color: inherit; font-size: inherit; font-family: inherit;
                    padding: 4px 8px; border-radius: 4px; outline: none; width: 100%;
                }
                input.edit-input:focus { border-color: ${COLORS.textPink}; }
                
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
            `}</style>
            
            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, position: 'relative', overflowX: 'hidden', fontFamily: "'Inter', monospace, sans-serif" }}>
                
                <button 
                    onMouseEnter={() => setSidebarOpen(true)}
                    onClick={() => setSidebarOpen(true)}
                    className="sidebar-trigger"
                    style={{ position: 'fixed', top: 24, left: 24, zIndex: 40, width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' }}
                >
                    <CustomSidebarIcon />
                </button>

                {/* SIDEBAR */}
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 40, transition: 'opacity 0.4s ease', opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}></div>
                <div ref={sidebarRef} onMouseLeave={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 280, backgroundColor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, zIndex: 50, padding: 24, display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 }}>
                        <span style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Pixeloid', sans-serif" }}>LockedIn</span>
                        <button onClick={() => setSidebarOpen(false)} style={{ padding: 8, color: COLORS.textMuted, cursor: 'pointer', background: 'none', border: 'none', borderRadius: 8 }}><X size={20} /></button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {SIDEBAR_ITEMS.map((item) => (
                            <button 
                                key={item} 
                                onClick={() => navigate(`/${item.toLowerCase()}`)} 
                                style={{ width: '100%', textAlign: 'left', padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, border: item === 'Workspace' ? `1px solid ${COLORS.borderHover}` : '1px solid transparent', backgroundColor: item === 'Workspace' ? 'rgba(255,255,255,0.04)' : 'transparent', color: item === 'Workspace' ? COLORS.textPrimary : COLORS.textMuted, cursor: 'pointer' }}>
                                {item}
                            </button>
                        ))}
                    </div>

                    <div style={{ paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, marginTop: 'auto' }}>
                        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)', width: '100%', maxWidth: 1000, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 24 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '0.05em', color: '#E5E7EB', fontFamily: "'Pixeloid', monospace" }}>Workspace</h1>
                        <button 
                            onClick={handleCreateDaySession}
                            disabled={isCreatingBox}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.border}`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <Plus size={16} /> {isCreatingBox ? 'Creating...' : 'Create Task Box'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {daySessions.map(day => {
                            const isExpanded = !!expandedBoxes[day._id];
                            const locked = isBoxLocked(day.createdAt);
                            const isEditing = editingDayId === day._id;
                            const tasks = tasksByDay[day._id] || [];
                            const runningSession = getRunningSession(day._id);
                            const pausedSession = getPausedSession(day._id);
                            const timeStr = formatTime(getCalculatedTime(day._id));
                            const statusObj = getDeadlineStatus(day);

                            return (
                                <div key={day._id} className="workspace-box" style={{ width: '100%', backgroundColor: COLORS.boxBg, border: `1px solid ${COLORS.boxBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: isExpanded ? `1px solid ${COLORS.border}` : 'none' }}>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }} onClick={() => setExpandedBoxes(p => ({ ...p, [day._id]: !isExpanded }))}>
                                                <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPink, letterSpacing: '0.02em', fontFamily: 'monospace' }}>
                                                    {day.title || new Date(day.date).toLocaleDateString()}
                                                </span>
                                                <span style={{ fontSize: 12, color: COLORS.textMuted }}>{new Date(day.createdAt || day.date).toLocaleDateString()}</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 24 }}>
                                                {!locked && !isEditing && (
                                                    <>
                                                        <button onClick={() => handleAddTask(day._id)} style={{ background: 'none', border: 'none', color: COLORS.textPrimary, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            Add
                                                        </button>
                                                        <button onClick={() => setEditingDayId(day._id)} style={{ background: 'none', border: 'none', color: COLORS.textPrimary, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => {
                                                            const dl = prompt("Enter deadline date (YYYY-MM-DD):", day.deadline ? day.deadline.split('T')[0] : "");
                                                            if (dl) handleUpdateDaySession(day._id, day.title, new Date(dl));
                                                        }} style={{ background: 'none', border: 'none', color: COLORS.textPrimary, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            Deadline
                                                        </button>
                                                    </>
                                                )}
                                                {isEditing && (
                                                    <button onClick={() => setEditingDayId(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '4px 12px', borderRadius: 4, color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                                                        Done Editing
                                                    </button>
                                                )}
                                                <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.05)', color: statusObj.color, textTransform: 'uppercase', letterSpacing: '0.1em', border: `1px solid ${statusObj.color}40` }}>
                                                    {statusObj.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPink, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
                                                {timeStr}
                                            </div>
                                            
                                            {day.status !== 'completed' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {runningSession ? (
                                                        <button onClick={() => handlePauseTimer(day._id, runningSession._id)} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: 8, borderRadius: 8, color: COLORS.textPink, cursor: 'pointer', display: 'flex' }}>
                                                            <Pause size={18} />
                                                        </button>
                                                    ) : pausedSession ? (
                                                        <button onClick={() => handleResumeTimer(day._id, pausedSession._id)} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: 8, borderRadius: 8, color: '#10B981', cursor: 'pointer', display: 'flex' }}>
                                                            <Play size={18} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleStartTimer(day._id)} style={{ background: 'none', border: 'none', color: COLORS.textPink, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                                                            Start
                                                        </button>
                                                    )}
                                                    
                                                    <button onClick={() => handleCompleteDay(day._id)} style={{ background: 'none', border: 'none', color: COLORS.textPrimary, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                                                        Reset
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: '24px' }}>
                                            {tasks.length === 0 ? (
                                                <div style={{ textAlign: 'center', color: COLORS.textMuted, padding: '32px 0', fontSize: 14 }}>
                                                    No tasks created yet. {locked ? 'Box is locked.' : 'Click "Add" to create one.'}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                    {tasks.map((task, idx) => (
                                                        <div key={task._id} className="workspace-task" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, opacity: task.status ? 0.5 : 1 }}>
                                                            
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                                                <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textMuted, fontFamily: 'monospace', width: 30 }}>{idx + 1}.</span>
                                                                
                                                                <div style={{ flex: 1, padding: '12px 16px', border: `1px solid ${COLORS.border}`, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                                                    {isEditing ? (
                                                                        <input type="text" className="edit-input" defaultValue={task.encryptedDescription} onBlur={(e) => {
                                                                            // API call save changes (Agar frontend editing chaiye toh yahan logic lagana hoga)
                                                                        }} />
                                                                    ) : (
                                                                        <span style={{ fontSize: 15, color: COLORS.textPrimary, textDecoration: task.status ? 'line-through' : 'none', fontFamily: 'monospace' }}>
                                                                            {task.encryptedDescription}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <button onClick={() => handleDeleteTask(task._id, day._id)} style={{ padding: '8px 16px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.border}`, color: '#E5E7EB', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>
                                                                    delete
                                                                </button>
                                                                <button onClick={() => handleToggleTask(task._id, task.status, day._id)} style={{ padding: '10px 16px', borderRadius: 6, backgroundColor: task.status ? '#10B981' : 'rgba(255,255,255,0.05)', border: `1px solid ${task.status ? '#10B981' : COLORS.border}`, color: task.status ? '#000' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                                    {task.status ? <Check size={16} /> : <div style={{ width: 16, height: 16 }} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
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