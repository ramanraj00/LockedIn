import React, { createContext, useEffect, useState } from 'react';
import { Gift, AlertTriangle, X } from 'lucide-react';

export const CalendarContext = createContext();

export const CalendarNotificationProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [notification, setNotification] = useState(null);

    // Fetch Events when app loads
    const fetchEvents = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/calendar", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
                checkUpcomingEvents(data);
            }
        } catch (err) {
            console.error("Failed to fetch calendar events for notifications");
        }
    };

    const checkUpcomingEvents = (allEvents) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const upcoming = allEvents.find(e => e.date === tomorrowString && (e.type === 'birthday' || e.type === 'important'));
        
        if (upcoming) {
            setNotification({
                title: upcoming.type === 'birthday' ? "Tomorrow is a Birthday! 🎉" : "Important Event Tomorrow! ⚠️",
                message: upcoming.title,
                type: upcoming.type,
                color: upcoming.color
            });
        }
    };

    useEffect(() => {
        // App khulte hi check karega
        fetchEvents();
        
        // Har 12 ghante me dubara check karega agar tab open reh jaye
        const interval = setInterval(fetchEvents, 12 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <CalendarContext.Provider value={{ events, fetchEvents }}>
            {children}
            
            {/* 🔴 GLOBAL POPUP TOAST */}
            {notification && (
                <div className="fixed top-5 right-5 z-[100] animate-fade-in shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <div className="bg-[#141824] border border-white/10 p-4 rounded-2xl flex items-start gap-4 max-w-sm" style={{ borderLeft: `4px solid ${notification.color}` }}>
                        <div className="mt-0.5">
                            {notification.type === 'birthday' ? 
                                <Gift size={24} className="text-pink-500" /> : 
                                <AlertTriangle size={24} className="text-red-500" />
                            }
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">{notification.title}</h4>
                            <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-white transition">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </CalendarContext.Provider>
    );
};
