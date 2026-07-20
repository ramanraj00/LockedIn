import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrypto } from '../../context/CryptoContext'; 
import { X, ChevronDown, ChevronUp, ChevronRight, Plus, History, ArrowLeft } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar'; // 🔥 Import tera naya Sidebar component

const COLORS = {
    bg: '#000000',
    card: '#0A0A0A',
    border: 'rgba(255,255,255,0.15)',
    borderHover: 'rgba(255,255,255,0.12)',
    textPrimary: '#B0B0B4',   
    textSecondary: '#9CA3AF',
    textMuted: '#A1A1AA',
};

const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const h = Math.floor(safeSeconds / 3600);
    const m = Math.floor((safeSeconds % 3600) / 60);
    const s = Math.floor(safeSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const Workspace = () => {
    const navigate = useNavigate();
    const { dek, isLocked, encryptData, decryptData } = useCrypto();

    const [daySessions, setDaySessions] = useState([]);
    const [tasksByDay, setTasksByDay] = useState({});
    const [timersByDay, setTimersByDay] = useState({});
    const [loading, setLoading] = useState(true);
    
    const [expandedBoxes, setExpandedBoxes] = useState({});
    
    const [viewMode, setViewMode] = useState('main'); 
    const [historyRange, setHistoryRange] = useState('month'); 
    const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
    const [expandedHistoryNodes, setExpandedHistoryNodes] = useState({});

    const [editingDayId, setEditingDayId] = useState(null);
    const [addingTaskDayId, setAddingTaskDayId] = useState(null);
    const [newTaskText, setNewTaskText] = useState("");
    const [isCreatingBox, setIsCreatingBox] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    
    const [localStartTimes, setLocalStartTimes] = useState({});
    const [now, setNow] = useState(Date.now());
    const [decryptedTexts, setDecryptedTexts] = useState({});
    const dropdownRef = useRef(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [deleteWarning, setDeleteWarning] = useState(null); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setHistoryDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (globalError) {
            const timer = setTimeout(() => setGlobalError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [globalError]);

    useEffect(() => {
        if (isLocked) return;
        const decryptAll = async () => {
            const updated = { ...decryptedTexts };
            let changed = false;
            for (const dayId of Object.keys(tasksByDay)) {
                for (const task of tasksByDay[dayId]) {
                    if (!(task._id in updated)) {
                        try { updated[task._id] = await decryptData(task.encryptedDescription); } 
                        catch (err) { updated[task._id] = "⚠️ Decryption Failed"; }
                        changed = true;
                    }
                }
            }
            if (changed) setDecryptedTexts(updated);
        };
        decryptAll();
    }, [tasksByDay, isLocked, decryptData]);

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
                });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (!isLocked) fetchWorkspaceData(); }, [isLocked]);

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

    const isToday = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
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
            if (res.ok) {
                fetchWorkspaceData();
                setViewMode('main'); 
            }
            else {
                const errData = await res.json().catch(() => ({}));
                setGlobalError(errData.error || errData.message || "Failed to create box");
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

    const handleCompleteDay = async (dayId) => {
        const running = getRunningSession(dayId);
        if (running) {
            const startT = localStartTimes[dayId] || new Date(running.startTime).getTime();
            const elapsed = Math.max(0, Math.floor((Date.now() - startT) / 1000));
            setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(s => s._id === running._id ? { ...s, status: 'completed', duration: elapsed } : s) }));
        }
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        const tasks = tasksByDay[dayId] || [];
        const taskStatus = tasks.length === 0 ? 'active' : tasks.every(t => t.status === true) ? 'completed' : 'pending';
        try {
            await fetch(`http://localhost:3000/api/session/day/${dayId}/complete`, { method: "PATCH", credentials: "include" });
            await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: taskStatus }), credentials: "include"
            });
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
        } catch (err) {}
    };

    const confirmAddTask = async (dayId) => {
        if (!newTaskText.trim()) return;
        const plaintext = newTaskText.trim();
        setNewTaskText("");
        setAddingTaskDayId(null);
        try {
            const encryptedDescription = await encryptData(plaintext);
            const res = await fetch("http://localhost:3000/api/task/addtask", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId, encryptedDescription, encryptedAESKey: "e2e_v2" }),
                credentials: "include"
            });
            if (res.ok) {
                fetchTasks(dayId);
                await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "pending" }), credentials: "include"
                });
            } else setGlobalError("Failed to add task");
        } catch (err) { setGlobalError(err.message); }
    };

    const handleToggleTask = async (taskId, currentStatus, dayId) => {
        const updatedTasks = (tasksByDay[dayId] || []).map(t => t._id === taskId ? { ...t, status: !currentStatus } : t);
        setTasksByDay(prev => ({ ...prev, [dayId]: updatedTasks }));
        const newStatus = updatedTasks.length === 0 ? 'active' : updatedTasks.every(t => t.status === true) ? 'completed' : 'pending';
        try {
            await fetch(`http://localhost:3000/api/task/patchtask/${taskId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: !currentStatus }), credentials: "include"
            });
            await fetch(`http://localhost:3000/api/session/day/${dayId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }), credentials: "include"
            });
            fetchTasks(dayId);
        } catch (err) {}
    };

    const handleDeleteTask = async (taskId, dayId) => {
        const tasks = tasksByDay[dayId] || [];
        const day = daySessions.find(d => d._id === dayId);
        const isOld = day && !isToday(day.date);
        if (tasks.length === 1 && isOld) { setDeleteWarning({ taskId, dayId }); return; }
        setTasksByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(t => t._id !== taskId) }));
        setDecryptedTexts(prev => { const n = { ...prev }; delete n[taskId]; return n; });
        try {
            await fetch(`http://localhost:3000/api/task/deletetask/${taskId}`, { method: "DELETE", credentials: "include" });
            fetchTasks(dayId);
        } catch (err) {}
    };

    const confirmDeleteLastTask = async () => {
        if (!deleteWarning) return;
        const { taskId, dayId } = deleteWarning;
        setDeleteWarning(null);
        setTasksByDay(prev => ({ ...prev, [dayId]: [] }));
        setDecryptedTexts(prev => { const n = { ...prev }; delete n[taskId]; return n; });
        try { await fetch(`http://localhost:3000/api/task/deletetask/${taskId}`, { method: "DELETE", credentials: "include" }); } catch {}
        handleDeleteDaySession(dayId);
    };

    const handleDeleteDaySession = async (dayId) => {
        setDaySessions(prev => prev.filter(d => d._id !== dayId));
        setTasksByDay(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        setTimersByDay(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        try { await fetch(`http://localhost:3000/api/session/day/${dayId}`, { method: "DELETE", credentials: "include" }); } catch {}
    };

    const handleStartTimer = async (dayId) => {
        const exactStart = Date.now();
        const optimisticId = 'opt_' + exactStart;
        setLocalStartTimes(prev => ({ ...prev, [dayId]: exactStart }));
        setTimersByDay(prev => ({ ...prev, [dayId]: [...(prev[dayId] || []), { _id: optimisticId, status: 'running', startTime: new Date(exactStart).toISOString(), duration: 0 }] }));
        try {
            const res = await fetch("http://localhost:3000/api/session/session/start", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ daySessionId: dayId }), credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(s => s._id === optimisticId ? data.session : s) }));
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

    const handlePauseTimer = async (dayId) => {
        const sessions = timersByDay[dayId] || [];
        const localRunning = sessions.find(s => s.status === 'running');
        const localRunningId = localRunning?._id;
        if (localRunning) {
            const startT = localStartTimes[dayId] || new Date(localRunning.startTime).getTime();
            const elapsed = Math.max(0, Math.floor((Date.now() - startT) / 1000));
            setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(s => s._id === localRunningId ? { ...s, status: 'paused', duration: elapsed } : s) }));
        }
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        try {
            const sessRes = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
            if (!sessRes.ok) return;
            const sessData = await sessRes.json();
            const realRunning = (sessData.sessions || []).find(s => s.status === 'running');
            if (!realRunning) return; 
            const res = await fetch(`http://localhost:3000/api/session/session/${realRunning._id}/pause`, { method: "PATCH", credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(s => (s._id === localRunningId || s._id === realRunning._id) ? data.session : s) }));
            }
        } catch (err) {}
    };

    const handleResumeTimer = async (dayId, sessionId) => {
        const exactStart = Date.now();
        const optimisticId = 'opt_' + exactStart;
        setLocalStartTimes(prev => ({ ...prev, [dayId]: exactStart }));
        setTimersByDay(prev => ({ ...prev, [dayId]: [...(prev[dayId] || []), { _id: optimisticId, status: 'running', startTime: new Date(exactStart).toISOString(), duration: 0 }] }));
        try {
            const res = await fetch(`http://localhost:3000/api/session/session/${sessionId}/resume`, { method: "POST", credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).map(s => s._id === optimisticId ? data.session : s) }));
            }
        } catch (err) { setTimersByDay(prev => ({ ...prev, [dayId]: (prev[dayId] || []).filter(s => s._id !== optimisticId) })); }
    };

    const handleResetTimer = async (dayId) => {
        setTimersByDay(prev => ({ ...prev, [dayId]: [] }));
        setLocalStartTimes(prev => { const n = { ...prev }; delete n[dayId]; return n; });
        try {
            const res = await fetch(`http://localhost:3000/api/session/day/${dayId}/sessions`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                const sessions = data.sessions || [];
                const running = sessions.find(s => s.status === 'running');
                if (running) await fetch(`http://localhost:3000/api/session/session/${running._id}/pause`, { method: "PATCH", credentials: "include" });
                await Promise.all(sessions.map(s => fetch(`http://localhost:3000/api/session/session/${s._id}`, { method: "DELETE", credentials: "include" }).catch(() => {})));
            }
        } catch (err) {}
        fetchTimers(dayId);
    };

    const getCalculatedTime = (dayId) => {
        const sessions = timersByDay[dayId] || [];
        let totalSeconds = 0;
        sessions.forEach(s => {
            if (s.status === 'completed' || s.status === 'paused') totalSeconds += (s.duration || 0);
            else if (s.status === 'running') {
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
        const tasks = tasksByDay[day._id] || [];
        if (tasks.length === 0) return 'active';
        if (tasks.every(t => t.status === true)) return 'completed';
        return 'pending';
    };

    // 🔥 FIX: Ye function check karta hai ki box dikhana chahiye ya nahi (Ghost box hide karega)
    const isValidBox = (day) => {
        if (isToday(day.date)) return true; // Aaj ka box hamesha dikhega
        const tasks = tasksByDay[day._id] || [];
        const time = getCalculatedTime(day._id);
        return tasks.length > 0 || time > 0; // Sirf tab dikhega jab isme koi task ho ya timer chala ho
    };

    const getGroupedHistory = () => {
        const current = new Date();
        let cutoff = new Date();
        if (historyRange === 'month') cutoff.setMonth(current.getMonth() - 1);
        else if (historyRange === '3months') cutoff.setMonth(current.getMonth() - 3);
        else if (historyRange === '6months') cutoff.setMonth(current.getMonth() - 6);
        else if (historyRange === 'year') cutoff.setFullYear(current.getFullYear() - 1);

        // Filter lagaya empty boxes hatane ke liye
        const filtered = daySessions.filter(s => new Date(s.date) >= cutoff && isValidBox(s));
        const grouped = {};
        
        filtered.forEach(session => {
            const d = new Date(session.date);
            const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const dateNum = d.getDate();
            let weekNum = 1;
            if (dateNum > 7 && dateNum <= 14) weekNum = 2;
            else if (dateNum > 14 && dateNum <= 21) weekNum = 3;
            else if (dateNum > 21) weekNum = 4;
            const weekName = `Week ${weekNum}`;

            if (!grouped[monthName]) grouped[monthName] = {};
            if (!grouped[monthName][weekName]) grouped[monthName][weekName] = [];
            grouped[monthName][weekName].push(session);
        });
        return grouped;
    };

    const toggleHistoryNode = (nodeId) => {
        setExpandedHistoryNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    // Filter lagaya empty ghost boxes hatane ke liye
    const mainScreenDays = daySessions.filter(day => {
        const d = new Date(day.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);
        return d >= sevenDaysAgo && isValidBox(day);
    });

    const groupedHistory = getGroupedHistory();

    const renderDaySession = (day) => {
        const isExpanded = expandedBoxes[day._id] === true; 
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
                                <span style={{ fontSize: 20, fontWeight: 400 }}>{new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span style={{ fontSize: 11, color: statusLabel === 'completed' ? '#34D399' : statusLabel === 'pending' ? '#FBBF24' : COLORS.textMuted, border: `1px solid ${statusLabel === 'completed' ? 'rgba(52,211,153,0.3)' : statusLabel === 'pending' ? 'rgba(251,191,36,0.3)' : COLORS.border}`, padding: '2px 8px', borderRadius: 12, marginLeft: 16 }}>{statusLabel}</span>
                                {!isExpanded && tasks.length > 0 && <span style={{ fontSize: 11, color: COLORS.textPrimary, backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>}
                            </div>
                            {day.deadline && <span style={{ fontSize: 12, color: COLORS.textMuted }}>deadline: {new Date(day.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 16px', borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, letterSpacing: '0.1em', marginRight: 4 }}>{timeStr}</span>
                                <div style={{ height: 20, width: 1, backgroundColor: COLORS.borderHover, margin: '0 4px' }}></div>
                                {isConfirming ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>{confirmAction.type === 'save' ? 'end day?' : 'reset timer?'}</span>
                                        <button onClick={() => { if (confirmAction.type === 'save') handleCompleteDay(day._id); else handleResetTimer(day._id); setConfirmAction(null); }} className="timer-text-btn save-btn">yes</button>
                                        <button onClick={() => setConfirmAction(null)} className="timer-text-btn reset-btn">no</button>
                                    </div>
                                ) : isDayCompleted ? (
                                    <button onClick={() => handleReopenDay(day._id)} className="timer-text-btn start-btn">Reopen</button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {!runningSession ? (
                                            <button onClick={() => pausedSession ? handleResumeTimer(day._id, pausedSession._id) : handleStartTimer(day._id)} className="timer-text-btn start-btn">{pausedSession ? "Resume" : "Start"}</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handlePauseTimer(day._id)} className="timer-text-btn pause-btn">Pause</button>
                                                <button onClick={() => setConfirmAction({ type: 'reset', dayId: day._id })} className="timer-text-btn reset-btn">Reset</button>
                                                <button onClick={() => setConfirmAction({ type: 'save', dayId: day._id })} className="timer-text-btn save-btn">Save</button>
                                            </>
                                        )}
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
                                    <input type="date" style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} onChange={(e) => { if (e.target.value) handleUpdateDaySession(day._id, day.title, e.target.value); }} />
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
                                    <input type="text" autoFocus placeholder="new task..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') confirmAddTask(day._id); }} style={{ flex: 1, background: 'transparent', border: 'none', color: COLORS.textPrimary, fontSize: 14, outline: 'none' }} />
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
                                            <span style={{ color: COLORS.textPrimary, fontSize: 14, textDecoration: task.status ? 'line-through' : 'none' }}>{decryptedTexts[task._id] || task.encryptedDescription}</span>
                                        )}
                                    </div>
                                    {deleteWarning?.taskId === task._id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            <span style={{ fontSize: 12, color: '#FBBF24', whiteSpace: 'nowrap' }}>time won't count in analytics</span>
                                            <button onClick={confirmDeleteLastTask} className="action-btn" style={{ color: '#EF4444' }}>delete</button>
                                            <button onClick={() => setDeleteWarning(null)} className="action-btn">keep</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <button onClick={() => handleToggleTask(task._id, task.status, day._id)} className="action-btn">{task.status ? 'undo' : 'done'}</button>
                                            <button onClick={() => handleDeleteTask(task._id, day._id)} className="action-btn">delete</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {tasks.length === 0 && addingTaskDayId !== day._id && <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 16 }}>no tasks yet.</div>}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLocked) {
        return (
            <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textPrimary, fontFamily: "'Inter', sans-serif" }}>
                <div style={{ backgroundColor: COLORS.card, padding: 40, borderRadius: 16, border: `1px solid ${COLORS.border}`, textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
                    <h2 style={{ fontSize: 24, fontWeight: 600, color: 'white', marginBottom: 12 }}>Workspace Locked</h2>
                    <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>Your encryption key was cleared for security reasons because the page was refreshed.</p>
                    <button onClick={() => navigate('/login')} style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}>Log In to Unlock Keys</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                .header-btn { background: none; border: none; color: ${COLORS.textPrimary}; font-size: 14px; font-weight: 400; cursor: pointer; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
                .header-btn:hover { opacity: 0.6; }
                .timer-text-btn { font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 6px; border: 1px solid transparent; outline: none; }
                .start-btn { background: #E5E7EB; color: #000; }
                .start-btn:hover { background: #FFFFFF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,255,255,0.1); }
                .pause-btn { background: rgba(239,68,68,0.15); color: #F87171; border-color: rgba(239,68,68,0.3); }
                .pause-btn:hover { background: rgba(239,68,68,0.25); }
                .reset-btn { background: transparent; color: #A1A1AA; border-color: rgba(255,255,255,0.15); }
                .reset-btn:hover { background: rgba(255,255,255,0.05); color: #FFFFFF; }
                .save-btn { background: rgba(16,185,129,0.15); color: #34D399; border-color: rgba(16,185,129,0.3); }
                .save-btn:hover { background: rgba(16,185,129,0.25); }
                .action-btn { background: none; border: none; color: ${COLORS.textMuted}; font-size: 13px; font-weight: 400; cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center; }
                .action-btn:hover { color: ${COLORS.textPrimary} !important; }
                .edit-input { background: transparent; border: 1px solid ${COLORS.border}; color: ${COLORS.textPrimary}; font-size: 14px; padding: 4px 8px; border-radius: 4px; outline: none; width: 100%; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
            
            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'Inter', monospace, sans-serif", position: 'relative', overflowX: 'hidden' }}>
                
                {/* 🔥 NAYA SIDEBAR COMPONENT YAHAN AAGAYA */}
                <Sidebar activePage="Workspace" />

                <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)', width: '100%', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                    {globalError && <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '10px 24px', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(15,15,15,0.95)', color: '#F87171', fontSize: 13, borderRadius: 8, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }}>{globalError}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 400 }}>
                                {viewMode === 'main' ? 'workspace' : 'history'}
                            </h1>
                            {viewMode === 'history' && (
                                <span style={{ color: COLORS.textMuted, fontSize: 14 }}>
                                    / last {historyRange.replace('months', ' months').replace('year', ' year').replace('month', ' month')}
                                </span>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {viewMode === 'history' ? (
                                <button onClick={() => setViewMode('main')} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, padding: '8px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                            ) : (
                                <>
                                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                                        <button onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, padding: '8px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <History size={14} /> History
                                        </button>
                                        
                                        {historyDropdownOpen && (
                                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 12, background: '#FFFFFF', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: 220, zIndex: 100, overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
                                                {[
                                                    { id: 'month', label: 'Last 1 Month' },
                                                    { id: '3months', label: 'Last 3 Months' },
                                                    { id: '6months', label: 'Last 6 Months' },
                                                    { id: 'year', label: 'Last 1 Year' }
                                                ].map((option, idx) => (
                                                    <button key={option.id} onClick={() => { setHistoryRange(option.id); setViewMode('history'); setHistoryDropdownOpen(false); }}
                                                        style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'transparent', border: 'none', borderBottom: idx !== 3 ? '1px solid #F3F4F6' : 'none', color: '#111827', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        {option.label}
                                                        <ChevronRight size={16} color="#9CA3AF" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleCreateDaySession} disabled={isCreatingBox} style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary, padding: '8px 16px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                                        {isCreatingBox ? 'creating...' : '+ new box'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                        {viewMode === 'main' ? (
                            mainScreenDays.length > 0 ? mainScreenDays.map(renderDaySession) : (
                                <div style={{ color: COLORS.textMuted, textAlign: 'center', padding: '40px 0' }}>No workspace found in the last 7 days. Create a new box!</div>
                            )
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
                                {Object.keys(groupedHistory).length === 0 ? (
                                    <div style={{ color: COLORS.textMuted, textAlign: 'center', padding: '40px 0' }}>No history found for this time range.</div>
                                ) : (
                                    Object.keys(groupedHistory).map(month => (
                                        <div key={month} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 12, backgroundColor: COLORS.card, overflow: 'hidden' }}>
                                            <button onClick={() => toggleHistoryNode(month)} style={{ width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', transition: 'background 0.2s' }}>
                                                {month}
                                                {expandedHistoryNodes[month] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </button>
                                            
                                            {expandedHistoryNodes[month] && (
                                                <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                    {Object.keys(groupedHistory[month]).map(week => (
                                                        <div key={month+week} style={{ borderLeft: `2px solid ${COLORS.borderHover}`, paddingLeft: 24, marginLeft: 8, marginTop: 16 }}>
                                                            <button onClick={() => toggleHistoryNode(month+week)} style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: COLORS.textPrimary, fontSize: 16, cursor: 'pointer', padding: '8px 0' }}>
                                                                {week}
                                                                {expandedHistoryNodes[month+week] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                                            </button>
                                                            
                                                            {expandedHistoryNodes[month+week] && (
                                                                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 48 }}>
                                                                    {groupedHistory[month][week].map(day => renderDaySession(day))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Workspace;