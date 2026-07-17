import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Gift, AlertCircle, Plus, Clock, LogOut, X } from 'lucide-react';
import { CalendarContext } from '../../context/CalendarNotificationProvider'; 

const SIDEBAR_ITEMS = ['Profile', 'Workspace', 'Calendar', 'Stopwatch', 'Analytics', 'Leaderboard', 'Settings'];
const COLORS = {
    bg: '#090A0C',
    card: '#0A0A0A',
    sidebar: '#15181C',
    border: 'rgba(255,255,255,0.15)',
    borderHover: 'rgba(255,255,255,0.12)',
    textPrimary: '#B0B0B4',   
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

const CurrentTimeLine = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const h = now.getHours();
    const m = now.getMinutes();
    const top = (h * 60) + m;
    
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); 

    return (
        <div className="absolute left-0 right-0 z-50 flex items-center pointer-events-none" style={{ top: `${top}px` }}>
            <div className="bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] ml-1 shadow-[0_2px_4px_rgba(255,59,48,0.4)]">
                {timeString}
            </div>
            <div className="flex-1 h-[2px] bg-[#FF3B30] shadow-[0_0_5px_rgba(255,59,48,0.5)]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] -ml-1 shadow-[0_0_5px_rgba(255,59,48,0.5)]"></div>
        </div>
    )
}

const Calendar = () => {
    const navigate = useNavigate();
    const { events, fetchEvents } = useContext(CalendarContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); 
    
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [eventForm, setEventForm] = useState({ title: '', color: '#10B981', type: 'normal' }); 
    const [loading, setLoading] = useState(false);

    const [tempEvents, setTempEvents] = useState([]);
    const [expandedDays, setExpandedDays] = useState({});
    
    const timelineRef = useRef(null);
    const mobileStripRef = useRef(null); 

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setSidebarOpen(false);
        };
        if (sidebarOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", { method: "POST", credentials: "include" });
            navigate("/login");
        } catch { navigate("/login"); }
    };

    useEffect(() => { setTempEvents([]); }, [events]);

    useEffect(() => {
        if (timelineRef.current) {
            if (selectedDate === new Date().toLocaleDateString('en-CA')) {
                const h = new Date().getHours();
                timelineRef.current.scrollTop = Math.max(0, (h - 1) * 60);
            } else {
                timelineRef.current.scrollTop = 9 * 60; 
            }
        }
    }, [selectedDate, view]);

    useEffect(() => {
        if (mobileStripRef.current && window.innerWidth < 768) {
            const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
            const d = new Date(selectedDate);
            if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                const cellIndex = firstDay + d.getDate() - 1;
                const weekIndex = Math.floor(cellIndex / 7);
                
                setTimeout(() => {
                    if (mobileStripRef.current) {
                        const stripWidth = mobileStripRef.current.clientWidth;
                        mobileStripRef.current.scrollTo({ left: stripWidth * weekIndex, behavior: 'smooth' });
                    }
                }, 50);
            }
        }
    }, [selectedDate, currentDate, view]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setExpandedDays({}); 
    };

    const handleDayClick = (dayStr) => {
        setSelectedDate(dayStr);
        if (window.innerWidth >= 768) {
            setEventForm({ title: '', color: '#10B981', type: 'normal' });
            setShowModal(true);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        const newEvent = { ...eventForm, date: selectedDate, tempId: Date.now(), createdAt: new Date().toISOString() };
        setTempEvents(prev => [...prev, newEvent]);
        setShowModal(false); 

        try {
            const res = await fetch("http://localhost:3000/api/calendar", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEvent)
            });
            if (res.ok) fetchEvents();
        } catch (err) {
            console.error("Error adding event");
        }
    };

    const allEvents = [...events, ...tempEvents];

    const formatDateHeader = (dateStr) => {
        if (!dateStr) return 'Select a date';
        const d = new Date(dateStr);
        const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
        const day = d.getDate();
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        return `${weekday} — ${day} ${month} ${year}`;
    }

    const getEventTime = (evt) => {
        if (evt.createdAt) {
            const d = new Date(evt.createdAt);
            if (!isNaN(d.getTime())) return { h: d.getHours(), m: d.getMinutes() };
        }
        return { h: 10, m: 0 }; 
    }

    const formatAppleTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        if (m === 0) return `${hour12} ${ampm}`;
        const min = m < 10 ? `0${m}` : m;
        return `${hour12}:${min} ${ampm}`;
    }

    const displayTimeRange = (h, m) => {
        const start = formatAppleTime(h, m);
        const endH = (h + 1) % 24;
        const end = formatAppleTime(endH, m);
        return `${start.replace(' ', '')} - ${end.replace(' ', '')}`;
    }

    const getEventLayout = (dateEvents) => {
        let eventsLayout = dateEvents.map(evt => {
            const t = getEventTime(evt);
            const top = (t.h * 60) + t.m;
            return { evt, top, bottom: top + 60 };
        });

        eventsLayout.sort((a, b) => a.top - b.top);

        const clusters = [];
        let currentCluster = [];
        let clusterEnd = -1;

        eventsLayout.forEach(item => {
            if (currentCluster.length === 0) {
                currentCluster.push(item);
                clusterEnd = item.bottom;
            } else if (item.top < clusterEnd) {
                currentCluster.push(item);
                clusterEnd = Math.max(clusterEnd, item.bottom);
            } else {
                clusters.push(currentCluster);
                currentCluster = [item];
                clusterEnd = item.bottom;
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        const layout = [];
        clusters.forEach(cluster => {
            const columns = [];
            cluster.forEach(item => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const column = columns[i];
                    const lastItem = column[column.length - 1];
                    if (item.top >= lastItem.bottom - 1) { 
                        column.push(item);
                        placed = true;
                        break;
                    }
                }
                if (!placed) columns.push([item]);
            });

            const numColumns = columns.length;
            const widthPercent = 100 / numColumns;

            columns.forEach((col, colIndex) => {
                col.forEach(item => {
                    layout.push({
                        evt: item.evt,
                        top: item.top,
                        widthPercent: widthPercent,
                        leftPercent: colIndex * widthPercent
                    });
                });
            });
        });

        return layout;
    }

    const renderMonthGrid = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const totalCells = firstDay + daysInMonth;
        const totalWeeks = Math.ceil(totalCells / 7); 
        const prevMonthDays = new Date(year, month, 0).getDate(); 

        const grid = [];
        let cellIndex = 0; 
        
        const todayStr = new Date().toLocaleDateString('en-CA'); 

        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            grid.push(
                <div key={`prev-${i}`} className="relative md:border-r md:border-b border-[#38383A] max-md:h-[48px] max-md:bg-transparent max-md:opacity-40 md:bg-[#141415] md:opacity-40">
                  <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                      <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 w-full h-full md:h-auto relative">
                          <span className="text-[17px] md:text-[13px] font-semibold text-[#666666] z-10">{dayNum}</span>
                      </div>
                  </div>
                </div>
            );
            cellIndex++;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const m = String(month + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const dayStr = `${year}-${m}-${d}`;
            
            const dayEvents = allEvents.filter(e => e.date === dayStr);
            const hasEvents = dayEvents.length > 0;
            const firstEventColor = hasEvents ? (dayEvents[0].type === 'important' ? '#FF3B30' : dayEvents[0].type === 'birthday' ? '#FFD60A' : dayEvents[0].color) : null;
            
            const isToday = dayStr === todayStr;
            const isPast = dayStr < todayStr;
            const isFirstDay = day === 1;

            const isSelected = selectedDate === dayStr;

            const cellClasses = isPast 
                ? 'max-md:bg-transparent max-md:opacity-60 md:bg-[#151516] md:opacity-60 md:hover:opacity-100 md:hover:bg-[#222224]' 
                : 'max-md:bg-transparent md:bg-[#1E1E1E] md:hover:bg-[#252528]';

            const isExpanded = expandedDays[dayStr];
            const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 2);

            grid.push(
                <div key={day} 
                    onClick={() => handleDayClick(dayStr)}
                    className={`relative group md:border-r md:border-b border-[#38383A] max-md:h-[48px] cursor-pointer transition-all duration-300 md:overflow-hidden ${cellClasses}`}>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                        
                        <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 pointer-events-none w-full h-full md:h-auto relative">
                            
                            {hasEvents && !isToday && !isSelected && (
                                <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full opacity-[0.22]" style={{ backgroundColor: firstEventColor }}></div>
                            )}
                            
                            {isSelected && !isToday && (
                                <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-[#3A3A3C]"></div>
                            )}

                            <div className={`w-[36px] h-[36px] md:w-7 md:h-7 flex items-center justify-center rounded-full transition-all z-10`}>
                                <span className={`flex items-center justify-center transition-all ${isToday ? 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white font-extrabold text-[16px] md:text-[14px] w-full h-full rounded-full shadow-[0_0_15px_rgba(255,59,48,0.5)]' : 'text-[#EBEBF5] font-semibold text-[17px] md:text-[13px] group-hover:text-white'}`}>
                                    {isFirstDay && !isToday ? <><span className="md:hidden">{day}</span><span className="hidden md:inline">1 {monthNames[month].substring(0, 3)}</span></> : day}
                                </span>
                            </div>
                        </div>

                        <div className={`hidden md:flex flex-1 flex-col gap-1 w-full px-1.5 pb-1.5 hide-scrollbar ${isExpanded ? 'overflow-y-auto pointer-events-auto' : 'overflow-hidden'}`}>
                            {visibleEvents.map((evt, idx) => {
                                const isImportant = evt.type === 'important';
                                const isBirthday = evt.type === 'birthday';
                                return (
                                    <div key={idx} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-white/[0.04] border border-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.08] hover:shadow-md transition-all duration-200 cursor-pointer shrink-0">
                                        {isImportant ? <AlertCircle size={12} fill="#FF3B30" color="white" className="shrink-0" /> : isBirthday ? <Gift size={12} color="#FFD60A" strokeWidth={2.5} className="shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: evt.color }}></div>}
                                        <span className={`truncate tracking-wide text-[11.5px] ${isImportant ? 'font-bold text-white' : 'font-medium text-white/90'}`}>{evt.title}</span>
                                    </div>
                                )
                            })}
                            {dayEvents.length > 2 && (
                                <div onClick={(e) => { e.stopPropagation(); setExpandedDays(prev => ({ ...prev, [dayStr]: !prev[dayStr] })); }} className="px-2 py-0.5 mt-0.5 text-[11px] font-bold text-[#8E8E93] hover:text-white transition-colors cursor-pointer w-fit rounded-md shrink-0 pointer-events-auto">
                                    {isExpanded ? 'Show less' : `+${dayEvents.length - 2} more`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
            cellIndex++;
        }

        const remainingCells = (totalWeeks * 7) - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const isFirstNextMonth = i === 1;
            const nextMonthShort = monthNames[(month + 1) % 12].substring(0, 3);
            grid.push(
                <div key={`next-${i}`} className="relative md:border-r md:border-b border-[#38383A] max-md:h-[48px] max-md:bg-transparent max-md:opacity-40 md:bg-[#141415] md:opacity-40">
                    <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:items-stretch max-md:pt-0">
                        <div className="flex justify-center md:justify-end items-center md:items-start p-0 md:p-1.5 shrink-0 w-full h-full md:h-auto relative">
                            <span className="text-[17px] md:text-[13px] font-semibold text-[#666666] z-10">
                                {isFirstNextMonth ? <><span className="md:hidden">{i}</span><span className="hidden md:inline">1 {nextMonthShort}</span></> : i}
                            </span>
                        </div>
                    </div>
                </div>
            );
            cellIndex++;
        }

        return { grid, totalWeeks };
    };

    // 🚀 PREMIUM YEAR VIEW MINI GRID 
    const renderMiniMonth = (year, monthIndex) => {
        const daysInMonth = getDaysInMonth(year, monthIndex);
        const firstDay = getFirstDayOfMonth(year, monthIndex);
        const prevMonthDays = new Date(year, monthIndex, 0).getDate(); 
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
        const currentDayNum = today.getDate();

        const cells = [];
        
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push(
                <div key={`prev-${i}`} className="flex justify-center items-center pointer-events-none">
                    <span className="text-[10px] md:text-[13px] font-semibold text-[#48484A]">
                        {prevMonthDays - i}
                    </span>
                </div>
            );
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === currentDayNum;
            
            const m = String(monthIndex + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const dayStr = `${year}-${m}-${dStr}`;
            
            const dayEvents = allEvents.filter(e => e.date === dayStr);
            const hasEvents = dayEvents.length > 0;
            
            cells.push(
                <div key={`curr-${day}`} 
                     className="flex justify-center items-center cursor-pointer relative z-10 group/cell"
                     onClick={(e) => {
                         e.stopPropagation(); 
                         setSelectedDate(dayStr); 
                         setCurrentDate(new Date(year, monthIndex, 1));
                         setView('month');
                     }}
                >
                    <div className="relative flex justify-center items-center w-5 h-5 md:w-7 md:h-7 rounded-full transition-all">
                        {/* Event indicator (No dot) */}
                        {hasEvents && !isToday && (
                            <div className="absolute inset-0 rounded-full bg-white/[0.08] group-hover/cell:bg-white/[0.15] transition-colors shadow-sm"></div>
                        )}
                        
                        <span className={`relative z-10 w-full h-full flex items-center justify-center rounded-full text-[10px] md:text-[13px] font-semibold transition-all ${isToday ? 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-white shadow-[0_0_12px_rgba(255,59,48,0.5)]' : hasEvents ? 'text-white' : 'text-[#EBEBF5] group-hover/cell:bg-white/[0.05]'}`}>
                            {day}
                        </span>
                    </div>
                </div>
            );
        }
        
        const remainingCells = 42 - cells.length; 
        for (let i = 1; i <= remainingCells; i++) {
            cells.push(
                <div key={`next-${i}`} className="flex justify-center items-center pointer-events-none">
                    <span className="text-[10px] md:text-[13px] font-semibold text-[#48484A]">
                        {i}
                    </span>
                </div>
            );
        }
        
        return cells;
    }

    return (
        <div className="h-screen w-full bg-[#1E1E1E] text-white flex flex-col font-sans overflow-hidden selection:bg-[#FF3B30]/30 relative">
            
            <button 
                onMouseEnter={() => setSidebarOpen(true)} 
                onClick={() => setSidebarOpen(true)} 
                className="sidebar-trigger"
                style={{ 
                    position: 'fixed', top: 16, left: 16, zIndex: 40, width: 44, height: 44, 
                    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', 
                    border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', color: COLORS.textSecondary, cursor: 'pointer', 
                    backdropFilter: 'blur(8px)', transition: 'all 0.2s ease' 
                }}>
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
                        const isActive = item === 'Calendar';
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

            <div className="flex flex-col md:flex-row items-center justify-between pl-[72px] md:pl-[84px] pr-4 md:pr-8 py-3 md:py-5 shrink-0 bg-[#1E1E1E] gap-4 md:gap-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-white drop-shadow-sm leading-none flex items-center gap-1">
                        <ChevronLeft className="md:hidden text-[#FF3B30] -ml-2 cursor-pointer shrink-0" size={32} strokeWidth={2.5} onClick={() => changeMonth(-1)} />
                        {view === 'month' ? monthNames[currentDate.getMonth()] : ''} <span className="hidden md:inline text-[#EBEBF5]/50 font-medium ml-1">{currentDate.getFullYear()}</span>
                    </h1>
                    <button onClick={() => {
                        if (!selectedDate) setSelectedDate(new Date().toLocaleDateString('en-CA'));
                        setEventForm({ title: '', color: '#10B981', type: 'normal' });
                        setShowModal(true);
                    }} className="md:hidden flex items-center justify-center p-1 text-[#FF3B30] hover:bg-white/10 rounded-full transition-colors shrink-0">
                        <Plus size={30} strokeWidth={2.5}/>
                    </button>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto mt-1 md:mt-0">
                    <div className="flex bg-[#121212] rounded-full p-1 border border-white/[0.05] shadow-inner mr-2 md:mr-0">
                        <button onClick={() => setView('month')} className={`px-4 md:px-7 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-300 ${view === 'month' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Month</button>
                        <button onClick={() => setView('year')} className={`px-4 md:px-7 py-1.5 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-300 ${view === 'year' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Year</button>
                    </div>

                    <div className="flex items-center gap-1 md:gap-3">
                        <button onClick={() => changeMonth(view === 'month' ? -1 : -12)} className="hidden md:block p-1.5 md:p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronLeft size={20} strokeWidth={2.5} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 md:px-5 py-1.5 rounded-full bg-[#121212] border border-white/[0.05] text-[12px] md:text-[13px] font-bold text-[#EBEBF5] hover:text-white transition-all shadow-sm">Today</button>
                        <button onClick={() => changeMonth(view === 'month' ? 1 : 12)} className="p-1.5 md:p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronRight size={20} strokeWidth={2.5} /></button>
                        <button onClick={() => {
                            if (!selectedDate) setSelectedDate(new Date().toLocaleDateString('en-CA'));
                            setEventForm({ title: '', color: '#10B981', type: 'normal' });
                            setShowModal(true);
                        }} className="hidden md:flex items-center ml-2 gap-1.5 px-4 py-1.5 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] text-[13px] font-bold hover:bg-[#0A84FF]/20 transition-colors">
                            Add Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1E1E1E] min-h-0">
                {view === 'month' && (() => {
                    const { grid, totalWeeks } = renderMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
                    const selectedDateEvents = allEvents.filter(e => e.date === selectedDate);

                    return (
                        <>
                            <div className="hidden md:grid grid-cols-7 shrink-0 border-b border-[#38383A] bg-[#1E1E1E]">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="py-2.5 text-right pr-3 text-[13px] font-bold tracking-wider text-[#EBEBF5]/60 uppercase">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="hidden md:grid flex-1 grid-cols-7 min-h-0 shrink-0" style={{ gridTemplateRows: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
                                {grid}
                            </div>

                            <div className="md:hidden bg-[#1E1E1E] shrink-0 mt-1">
                                <div className="grid grid-cols-7 mb-1.5 px-1">
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="text-center text-[10px] font-extrabold text-[#8E8E93] uppercase">
                                            {day.substring(0, 1)}
                                        </div>
                                    ))}
                                </div>
                                
                                <div 
                                    className="flex overflow-x-auto snap-x snap-mandatory w-full hide-scrollbar border-b border-[#38383A] pb-3" 
                                    ref={mobileStripRef}
                                >
                                    {Array.from({ length: totalWeeks }).map((_, i) => (
                                        <div key={i} className="w-full shrink-0 snap-center grid grid-cols-7 px-1">
                                            {grid.slice(i * 7, (i + 1) * 7)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:hidden flex-1 flex flex-col min-h-0 bg-[#121212]">
                                <div className="px-5 py-3 shrink-0 bg-[#1A1A1C] border-b border-[#38383A] flex items-center justify-between shadow-sm z-20">
                                    <h3 className="text-white font-bold text-[15px]">
                                        {formatDateHeader(selectedDate)}
                                    </h3>
                                    <span className="text-[#8E8E93] text-[12px] font-semibold bg-[#2C2C2E] px-2 py-0.5 rounded-full">
                                        {selectedDateEvents.length} Tasks
                                    </span>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto relative bg-[#1E1E1E] scroll-smooth" ref={timelineRef}>
                                    
                                    {selectedDate === new Date().toLocaleDateString('en-CA') && (
                                        <CurrentTimeLine />
                                    )}

                                    <div className="flex flex-col relative w-full h-[1440px]">
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} className="h-[60px] flex items-start border-t border-[#38383A]/50 relative w-full">
                                                <span className="text-[#8E8E93] text-[11px] font-medium w-[50px] text-right pr-2 -mt-[7.5px] bg-[#1E1E1E]">
                                                    {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="absolute top-0 bottom-0 left-[55px] right-[12px]">
                                            {getEventLayout(selectedDateEvents).map((item) => {
                                                const { evt, top, widthPercent, leftPercent } = item;
                                                const { h, m } = getEventTime(evt);
                                                
                                                return (
                                                    <div key={evt._id || evt.tempId} 
                                                         className="absolute p-2 flex flex-col justify-start rounded-r-lg rounded-l-[3px] border-l-[3.5px] shadow-sm overflow-hidden"
                                                         style={{ 
                                                             top: `${top}px`, 
                                                             height: '58px', 
                                                             left: `calc(${leftPercent}% + 1px)`,
                                                             width: `calc(${widthPercent}% - 2px)`,
                                                             backgroundColor: `${evt.color}25`, 
                                                             borderColor: evt.color,
                                                             backdropFilter: 'blur(5px)'
                                                         }}>
                                                         <span className="text-[14px] font-bold text-white/95 leading-tight truncate">{evt.title}</span>
                                                         <span className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1 font-semibold truncate">
                                                             <Clock size={10} className="shrink-0" />
                                                             {displayTimeRange(h, m)}
                                                         </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                })()}

                {/* 🚀 APPLE STYLE "LOCKEDIN" TOUCH YEAR VIEW */}
                {view === 'year' && (
                    <div className="flex-1 overflow-y-auto p-2 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4 md:gap-8 min-h-0 pb-12">
                        {monthNames.map((month, idx) => (
                            <div key={month} 
                                 className="flex flex-col group bg-[#1A1A1C]/30 hover:bg-[#1A1A1C]/70 border border-transparent hover:border-white/[0.04] p-2 md:p-4 rounded-[12px] md:rounded-[20px] transition-all duration-300 shadow-sm" 
                                 onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), idx, 1)); setView('month'); }}>
                                
                                <h3 className="text-[#FF3B30] font-extrabold text-[15px] md:text-[22px] mb-2 md:mb-3 transition-colors group-hover:text-[#FF453A] pl-1 drop-shadow-sm flex items-center justify-between cursor-pointer">
                                    {month}
                                    <ChevronRight size={18} strokeWidth={3} className="text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-all -translate-x-3 group-hover:translate-x-0" />
                                </h3>
                                
                                <div className="grid grid-cols-7 gap-y-1 gap-x-0 md:gap-x-1">
                                    {['S','M','T','W','T','F','S'].map((d, i) => (
                                        <div key={`header-${i}`} className="text-center text-[9px] md:text-[11px] font-bold text-[#8E8E93] mb-1">
                                            {d}
                                        </div>
                                    ))}
                                    {renderMiniMonth(currentDate.getFullYear(), idx)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 transition-all"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.12] w-full max-w-[340px] rounded-[24px] p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] animate-fade-in relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleAddEvent} className="flex flex-col">
                            
                            <div className="bg-[#323234]/80 rounded-[18px] flex items-center justify-between px-4 py-3.5 mb-2 shadow-inner border border-white/[0.03]">
                                <input 
                                    required 
                                    autoFocus
                                    type="text" 
                                    value={eventForm.title} 
                                    onChange={e => setEventForm({...eventForm, title: e.target.value})} 
                                    placeholder="New Event" 
                                    className="bg-transparent text-white text-[22px] font-semibold w-full outline-none placeholder-[#8E8E93] caret-[#0A84FF]" 
                                />
                                
                                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1.5 cursor-pointer ml-3 shrink-0 hover:bg-white/20 transition-all shadow-sm border border-white/5">
                                    <input 
                                        type="color" 
                                        value={eventForm.color} 
                                        onChange={e => setEventForm({...eventForm, color: e.target.value})} 
                                        className="apple-color-picker cursor-pointer"
                                    />
                                    <div className="flex flex-col pointer-events-none opacity-60">
                                        <ChevronLeft size={10} strokeWidth={3} className="rotate-90 -mb-[2px] text-white" />
                                        <ChevronLeft size={10} strokeWidth={3} className="-rotate-90 -mt-[2px] text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#323234]/80 rounded-[16px] px-4 py-3.5 mb-2 shadow-inner border border-white/[0.03]">
                                <span className="text-white text-[15px] font-medium">{selectedDate}</span>
                            </div>

                            <div className="bg-[#323234]/80 rounded-[16px] px-4 py-3 shadow-inner border border-white/[0.03] flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] transition-colors">
                                <span className="text-white/80 text-[15px] font-medium pointer-events-none">Event Type</span>
                                <div className="relative flex items-center">
                                    <select 
                                        value={eventForm.type} 
                                        onChange={e => setEventForm({...eventForm, type: e.target.value})} 
                                        className="bg-white/10 hover:bg-white/20 transition-all text-white text-[14px] font-semibold outline-none appearance-none cursor-pointer rounded-lg pl-3 pr-8 py-1.5 shadow-sm border border-white/5"
                                    >
                                        <option value="normal" className="bg-[#28282B] text-white">Normal</option>
                                        <option value="important" className="bg-[#28282B] text-white">Important</option>
                                        <option value="birthday" className="bg-[#28282B] text-white">Birthday</option>
                                    </select>
                                    <ChevronRight size={14} strokeWidth={3} className="text-white/50 absolute right-2.5 pointer-events-none group-hover:text-white/80 transition-colors" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2 mt-3 mb-1">
                                <button type="button" onClick={() => setShowModal(false)} className="text-[#8E8E93] text-[15px] font-medium hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={loading} className="text-[#0A84FF] text-[15px] font-bold hover:text-blue-400 transition-colors bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 px-4 py-1.5 rounded-full">Add</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .sidebar-trigger:hover { transform: scale(1.05); }

                .apple-color-picker {
                    -webkit-appearance: none;
                    padding: 0;
                    border: none;
                    border-radius: 50%;
                    width: 14px;
                    height: 14px;
                    background: transparent;
                }
                .apple-color-picker::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                .apple-color-picker::-webkit-color-swatch {
                    border: none;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default Calendar;