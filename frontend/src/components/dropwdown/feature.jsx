import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart as ReBarChart, Bar, XAxis, ResponsiveContainer, Cell, LabelList } from "recharts";

// ─── BAR DATA ───
const barData = [
  { label: "Mon", hours: 3 },
  { label: "Tue", hours: 4 },
  { label: "Wed", hours: 5 },
  { label: "Thu", hours: 6 },
  { label: "Fri", hours: 7 },
  { label: "Sat", hours: 5 },
  { label: "Sun", hours: 6 },
];

// Custom Label for Top of the Bars (e.g., "3hr")
const CustomBarLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#cbd5e1"
      fontSize={10}
      textAnchor="middle"
      className="font-mono font-bold"
    >
      {value}hr
    </text>
  );
};

// Custom Tick for Bottom X-Axis (e.g., "Mon")
const CustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y + 14}
      fill="#94a3b8"
      fontSize={10}
      textAnchor="middle"
      className="font-medium tracking-wide"
    >
      {payload.value}
    </text>
  );
};

// ─── ULTRA SMOOTH RECHARTS BAR CHART (animates on scroll with delay) ───
const BarChart = memo(function BarChart() {
  const chartRef = useRef(null);
  const [animKey, setAnimKey] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;

    let delayTimer = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          // 600ms delay — user page pe settle ho jaye pehle
          delayTimer = setTimeout(() => {
            setIsVisible(true);
            setAnimKey((prev) => prev + 1);
          }, 600);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(delayTimer);
    };
  }, [isVisible]);

  return (
    <div
      ref={chartRef}
      className="flex-1 border border-slate-500/30 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[240px] sm:min-h-[270px]"
      style={{ background: "rgba(25, 30, 58, 0.65)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />

      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6 block">
        Weekly Focus Hours
      </span>

      <div className="w-full flex-1 min-h-[140px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart key={animKey} data={barData} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(165,180,252,0.95)" />
                <stop offset="100%" stopColor="rgba(99,102,241,0.6)" />
              </linearGradient>
              <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(148,163,184,0.8)" />
                <stop offset="100%" stopColor="rgba(100,116,139,0.5)" />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(203,213,225,0.5)" />
                <stop offset="100%" stopColor="rgba(148,163,184,0.2)" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={<CustomXAxisTick />}
            />

            <Bar
              dataKey="hours"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              isAnimationActive={isVisible}
              animationDuration={1100}
              animationEasing="ease-out"
            >
              {barData.map((entry, index) => {
                let gradient = "url(#colorLow)";
                if (entry.hours >= 6) gradient = "url(#colorHigh)";
                else if (entry.hours >= 4) gradient = "url(#colorMed)";
                return <Cell key={`cell-${index}`} fill={gradient} />;
              })}
              <LabelList dataKey="hours" content={<CustomBarLabel />} />
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

// ─── STOPWATCH ───
const Stopwatch = memo(function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(time / 60).toString().padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");

  const handleToggle = useCallback(() => setIsRunning((p) => !p), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  const circumference = 2 * Math.PI * 72;
  const progress = (time % 60) / 60;
  const offset = circumference - progress * circumference;

  return (
    <div
      className="w-full sm:w-auto sm:min-w-[220px] border border-slate-500/30 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden"
      style={{ background: "rgba(25, 30, 58, 0.65)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />

      <div className="relative w-[160px] h-[160px] sm:w-[170px] sm:h-[170px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="3" />
          <circle
            cx="80" cy="80" r="72"
            fill="none"
            stroke="rgba(129,140,248,0.6)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <span className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-blue-100 z-10">
          {mins}:{secs}
        </span>
      </div>

      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
        Stopwatch
      </span>

      <div className="flex items-center gap-2 w-full">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer ${
            isRunning
              ? "bg-transparent border border-slate-500/50 text-slate-300 hover:bg-white/5"
              : "bg-indigo-500/80 hover:bg-indigo-500 text-white border border-indigo-400/30"
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-slate-500/40 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
});

// ─── HEATMAP ───
const ActivityHeatmap = memo(function ActivityHeatmap() {
  const weeks = 20;
  const rows = 5;

  const grid = useRef(
    Array.from({ length: rows }, (_, row) =>
      Array.from({ length: weeks }, (_, col) => {
        const seed = (row * weeks + col) * 2654435761;
        const hash = ((seed >>> 0) % 100);
        if (col < 5 && row < 3) return hash < 40 ? 3 : hash < 60 ? 2 : hash < 80 ? 1 : 0;
        if (col < 10) return hash < 20 ? 3 : hash < 40 ? 2 : hash < 55 ? 1 : 0;
        if (col < 15) return hash < 15 ? 3 : hash < 30 ? 2 : hash < 50 ? 1 : 0;
        return hash < 10 ? 2 : hash < 25 ? 1 : 0;
      })
    )
  ).current;

  const getColor = (level) => {
    switch (level) {
      case 3: return "bg-slate-200 border-slate-300/50";
      case 2: return "bg-slate-400/70 border-slate-400/40";
      case 1: return "bg-slate-500/40 border-slate-500/25";
      default: return "bg-slate-700/50 border-slate-600/20";
    }
  };

  const totalActivities = grid.flat().filter((l) => l > 0).length;

  return (
    <div
      className="flex-1 border border-slate-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden"
      style={{ background: "rgba(25, 30, 58, 0.65)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-400/15 via-slate-400/8 to-transparent pointer-events-none" />

      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-4">
        Activity
      </span>

      <div className="flex flex-col gap-[6px] sm:gap-2">
        {grid.map((row, ri) => (
          <div key={ri} className="flex gap-[6px] sm:gap-2">
            {row.map((level, ci) => (
              <div
                key={ci}
                className={`flex-1 aspect-square rounded-[5px] sm:rounded-md border ${getColor(level)} transition-colors`}
                style={{ maxHeight: "28px" }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-[10px] text-slate-500 font-medium">
          {totalActivities} activities in 2025
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-medium">Less</span>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-700/50 border border-slate-600/20" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-500/40 border border-slate-500/25" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-400/70 border border-slate-400/40" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-200 border border-slate-300/50" />
          <span className="text-[10px] text-slate-500 font-medium">More</span>
        </div>
      </div>
    </div>
  );
});

// ─── CALENDAR CARD ───
const CalendarCard = memo(function CalendarCard() {
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  const currentDay = today.getDate();
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(year, today.getMonth(), 1).getDay();

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full sm:w-auto sm:min-w-[220px] rounded-2xl p-5 sm:p-6 flex flex-col border-1 shadow-lg">
      <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
        Calendar
      </span>
      <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5 mb-3">
        {monthName} {year}
      </span>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d) => (
          <span key={d} className="text-[9px] font-bold text-slate-400 text-center">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <span
            key={day}
            className={`text-[10px] font-mono font-medium w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              day === currentDay
                ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30"
                : day < currentDay
                ? "text-slate-600"
                : "text-slate-300"
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
});

// ─── MAIN SECTION ───
export default function PerformanceDashboard() {
  return (
    <section className="w-full px-4 md:px-8 flex flex-col items-center pt-0 pb-12 sm:pb-16 overflow-hidden">
      
      <div className="mb-6 sm:mb-8 text-center w-full max-w-5xl px-2 sm:px-4 overflow-hidden overflow-x-auto no-scrollbar">
        <h2
          className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-200 leading-tight whitespace-nowrap flex items-center justify-center"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          <span className="text-black text-4xl sm:text-5xl md:text-7xl font-serif leading-none mt-2 sm:mt-0 mr-1 sm:mr-2 select-none" aria-hidden="true">&ldquo;</span>
          A personal dashboard for analysing your performance
          <span className="text-black text-4xl sm:text-5xl md:text-7xl font-serif leading-none mt-4 sm:mt-6 ml-1 sm:ml-2 select-none" aria-hidden="true">&rdquo;</span>
        </h2>
      </div>

      <div
        className="w-full max-w-5xl border border-slate-500/30 rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden"
        style={{
          background: "rgba(30, 35, 68, 0.55)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 40px rgba(10, 14, 35, 0.4), inset 0 1px 0 rgba(148,163,184,0.06)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-400/12 via-slate-400/6 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-400/12 via-slate-400/6 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 sm:mb-5">
          <BarChart />
          <Stopwatch />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <CalendarCard />
          <ActivityHeatmap />
        </div>
      </div>
    </section>
  );
}