import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Gift, AlertCircle } from 'lucide-react';
import { CalendarContext } from '../../context/CalendarNotificationProvider'; 

const Calendar = () => {
    const { events, fetchEvents } = useContext(CalendarContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); 
    
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventForm, setEventForm] = useState({ title: '', color: '#10B981', type: 'normal' }); 
    const [loading, setLoading] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleDayClick = (dayStr) => {
        setSelectedDate(dayStr);
        setEventForm({ title: '', color: '#10B981', type: 'normal' });
        setShowModal(true);
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/calendar", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...eventForm, date: selectedDate })
            });
            if (res.ok) {
                await fetchEvents();
                setShowModal(false);
            }
        } catch (err) {
            console.error("Error adding event");
        }
        setLoading(false);
    };

    const renderMonthGrid = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const totalCells = firstDay + daysInMonth;
        const totalWeeks = Math.ceil(totalCells / 7); 
        const prevMonthDays = new Date(year, month, 0).getDate(); 

        const grid = [];
        let cellIndex = 0; 
        
        // PREVIOUS MONTH
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            const isSunday = (cellIndex % 7 === 0);
            grid.push(
                <div key={`prev-${i}`} className={`relative flex flex-col min-h-0 border-r border-b border-[#38383A] ${isSunday ? 'bg-gradient-to-b from-transparent to-white/[0.03]' : ''}`}>
                  <div className="flex justify-end p-2 shrink-0">
                      <span className="text-[13px] font-semibold text-[#666666]">{dayNum}</span>
                  </div>
                </div>
            );
            cellIndex++;
        }
        
        // CURRENT MONTH
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dayStr);
            const isToday = dayStr === new Date().toISOString().split('T')[0];
            const isFirstDay = day === 1;
            const isSunday = (cellIndex % 7 === 0);

            grid.push(
                <div key={day} 
                    onClick={() => handleDayClick(dayStr)}
                    // 🔴 min-h-0 add kiya gaya hai taaki box content ki vajah se bada na ho
                    className={`relative flex flex-col min-h-0 group border-r border-b border-[#38383A] cursor-pointer transition-all duration-300 overflow-hidden ${isSunday ? 'bg-gradient-to-b from-transparent to-white/[0.03] hover:bg-[#2C2C2E]' : 'hover:bg-[#2C2C2E]'}`}>
                    
                    {/* Header: Fixed height for Date Number */}
                    <div className="flex justify-end p-1.5 shrink-0">
                        <div className="w-7 h-7 flex items-center justify-center">
                            <span className={`flex items-center justify-center transition-all ${isToday ? 'bg-gradient-to-tr from-[#FF3B30] to-[#FF453A] text-black font-extrabold text-[14px] w-full h-full rounded-full shadow-[0_0_15px_rgba(255,59,48,0.5)]' : 'text-[#EBEBF5]/80 font-semibold text-[13px] group-hover:text-white'}`}>
                                {isFirstDay && !isToday ? `1 ${monthNames[month].substring(0, 3)}` : day}
                            </span>
                        </div>
                    </div>

                    {/* 🔴 Scrollable Events: flex-1 aur min-h-0 se sirf iske andar hi scroll aayega */}
                    <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1.5 w-full px-1.5 pb-1.5 min-h-0">
                        {dayEvents.map((evt, idx) => {
                            const isImportant = evt.type === 'important';
                            const isBirthday = evt.type === 'birthday';
                            
                            return (
                                <div key={idx} 
                                    className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-[1px] hover:shadow-lg cursor-pointer shrink-0 overflow-hidden" 
                                    style={{ 
                                        backgroundColor: `${evt.color}25`, 
                                        border: `1px solid ${evt.color}30`,
                                        borderLeft: `4px solid ${evt.color}`
                                    }}>
                                    
                                    {isImportant && (
                                        <AlertCircle size={14} fill="#FF3B30" color="white" strokeWidth={2} className="shrink-0 drop-shadow-md" />
                                    )}
                                    {isBirthday && (
                                        <Gift size={14} color="#FFD60A" strokeWidth={2.5} className="shrink-0 drop-shadow-md" />
                                    )}

                                    <span className="truncate tracking-wide text-white text-[12px] font-semibold">
                                        {evt.title}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
            cellIndex++;
        }

        // NEXT MONTH
        const remainingCells = (totalWeeks * 7) - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const isFirstNextMonth = i === 1;
            const nextMonthShort = monthNames[(month + 1) % 12].substring(0, 3);
            const isSunday = (cellIndex % 7 === 0);
            
            grid.push(
                <div key={`next-${i}`} className={`relative flex flex-col min-h-0 border-r border-b border-[#38383A] ${isSunday ? 'bg-gradient-to-b from-transparent to-white/[0.03]' : ''}`}>
                    <div className="flex justify-end p-2 shrink-0">
                        <span className="text-[13px] font-semibold text-[#666666]">
                            {isFirstNextMonth ? `1 ${nextMonthShort}` : i}
                        </span>
                    </div>
                </div>
            );
            cellIndex++;
        }

        return { grid, totalWeeks };
    };

    return (
        <div className="h-screen w-full bg-[#1E1E1E] text-white flex flex-col font-sans overflow-hidden selection:bg-[#FF3B30]/30">
            
            <div className="flex items-center justify-between px-8 py-5 shrink-0 bg-[#1E1E1E]">
                <div className="flex-1">
                    <h1 className="text-[32px] font-extrabold tracking-tight text-white drop-shadow-sm">
                        {view === 'month' ? monthNames[currentDate.getMonth()] : ''} <span className="text-[#EBEBF5]/50 font-medium ml-1">{currentDate.getFullYear()}</span>
                    </h1>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="flex bg-[#121212] rounded-full p-1 border border-white/[0.05] shadow-inner">
                        <button onClick={() => setView('month')} className={`px-7 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${view === 'month' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Month</button>
                        <button onClick={() => setView('year')} className={`px-7 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${view === 'year' ? 'bg-[#3A3A3C] text-white shadow-md' : 'text-[#8E8E93] hover:text-white'}`}>Year</button>
                    </div>
                </div>

                <div className="flex-1 flex justify-end items-center gap-3">
                    <button onClick={() => changeMonth(view === 'month' ? -1 : -12)} className="p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronLeft size={20} strokeWidth={2.5} /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-5 py-1.5 rounded-full bg-[#121212] border border-white/[0.05] text-[13px] font-bold text-[#EBEBF5] hover:text-white hover:bg-[#2C2C2E] transition-all shadow-sm">Today</button>
                    <button onClick={() => changeMonth(view === 'month' ? 1 : 12)} className="p-2.5 rounded-full hover:bg-white/[0.08] transition-colors text-[#8E8E93] hover:text-white"><ChevronRight size={20} strokeWidth={2.5} /></button>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#1E1E1E]">
                {view === 'month' && (() => {
                    const { grid, totalWeeks } = renderMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
                    return (
                        <>
                            <div className="grid grid-cols-7 shrink-0 border-b border-[#38383A] bg-[#1E1E1E]">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="py-2.5 pr-3 text-right text-[13px] font-bold tracking-wider text-[#EBEBF5]/60 uppercase">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
                                {grid}
                            </div>
                        </>
                    )
                })()}

                {view === 'year' && (
                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
                        {monthNames.map((month, idx) => (
                            <div key={month} className="flex flex-col group">
                                <h3 className="text-[#FF3B30] font-extrabold text-xl mb-4 cursor-pointer transition-colors group-hover:text-[#FF453A]" onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), idx, 1)); setView('month'); }}>{month}</h3>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-center text-[11px] font-bold text-[#8E8E93]">{d}</div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                <button type="submit" disabled={loading} className="text-[#0A84FF] text-[15px] font-bold hover:text-blue-400 transition-colors bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 px-4 py-1.5 rounded-full">{loading ? 'Saving...' : 'Add'}</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
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