import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion, useInView } from "framer-motion";
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

// Custom Label for Top of the Bars (Added animation classes and index)
const CustomBarLabel = (props) => {
  const { x, y, width, value, index } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#cbd5e1"
      fontSize={10}
      textAnchor="middle"
      className={`font-mono font-bold custom-label-anim custom-label-${index}`}
    >
      {value}hr
    </text>
  );
};

// Custom Tick for Bottom X-Axis
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

// ─── COMPLETELY TRANSPARENT WRAPPER (GEOMETRIC LINES REMOVED) ───
const OpenCard = ({ children, className = "" }) => (
  <div
    className={`w-full border border-slate-500/30 rounded-3xl p-5 sm:p-6 flex flex-col relative overflow-hidden bg-transparent ${className}`}
  >
    {children}
  </div>
);

// ─── 1. WEEKLY FOCUS HOURS (BAR CHART COMPONENT WITH SCROLL TRIGGER & CONTINUOUS ANIMATION) ───
const BarChart = memo(function BarChart() {
  // 1. Ref and useInView banaya taaki animation tabhi trigger ho jab user yahan tak scroll kare
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <OpenCard className="flex-1 min-h-[260px] justify-between relative">
      
      {/* CSS for continuous smooth breathing animation on Recharts Bars & Labels */}
      <style>
        {`
          /* Bar ki physical scale animation */
          @keyframes continuousPulse {
            0%, 100% { transform: scaleY(1); opacity: 1; filter: brightness(1); }
            50% { transform: scaleY(0.95); opacity: 0.75; filter: brightness(1.2); }
          }
          
          /* Labels ki up-down sync animation */
          @keyframes continuousLabelPulse {
            0%, 100% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(4px); opacity: 0.75; }
          }

          .recharts-bar-rectangle path {
            animation: continuousPulse 3s infinite ease-in-out;
            transform-box: fill-box;
            transform-origin: bottom;
          }
          
          .custom-label-anim {
            animation: continuousLabelPulse 3s infinite ease-in-out;
          }

          /* Match delays for both Bars and their Labels taaki perfect wave bane */
          .recharts-bar-rectangles g:nth-child(1) path, .custom-label-0 { animation-delay: 0.0s; }
          .recharts-bar-rectangles g:nth-child(2) path, .custom-label-1 { animation-delay: 0.2s; }
          .recharts-bar-rectangles g:nth-child(3) path, .custom-label-2 { animation-delay: 0.4s; }
          .recharts-bar-rectangles g:nth-child(4) path, .custom-label-3 { animation-delay: 0.6s; }
          .recharts-bar-rectangles g:nth-child(5) path, .custom-label-4 { animation-delay: 0.8s; }
          .recharts-bar-rectangles g:nth-child(6) path, .custom-label-5 { animation-delay: 1.0s; }
          .recharts-bar-rectangles g:nth-child(7) path, .custom-label-6 { animation-delay: 1.2s; }
        `}
      </style>

      {/* Ref yahan lagaya hai track karne ke liye */}
      <div ref={ref} className="w-full h-full flex flex-col justify-between flex-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6 block">
          Weekly Focus Hours
        </span>

        <div className="w-full flex-1 min-h-[140px] relative">
          
          {/* Chart ko tabhi render karna jab isInView true ho jaye */}
          {isInView && (
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={barData} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
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

                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} />

                <Bar
                  dataKey="hours"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={true}
                  animationDuration={1500}
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
          )}
        </div>
      </div>
    </OpenCard>
  );
});

// ─── 2. STOPWATCH COMPONENT ───
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
    <OpenCard className="items-center justify-center gap-4 w-full h-full">
      <div className="relative w-[160px] h-[160px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="3" />
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="rgba(129,140,248,0.6)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <span className="font-mono text-3xl font-bold tracking-widest text-blue-100 z-10">
          {mins}:{secs}
        </span>
      </div>

      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
        Stopwatch
      </span>

      <div className="flex items-center gap-2 w-full mt-2">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer ${
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
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border border-slate-500/40 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </OpenCard>
  );
});

// ─── 3. ACTIVITY HEATMAP COMPONENT ───
const ActivityHeatmap = memo(function ActivityHeatmap() {
  const weeks = 20;
  const rows = 5;

  const grid = useMemo(() => {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: weeks }, (_, col) => {
        const seed = (row * weeks + col) * 2654435761;
        const hash = (seed >>> 0) % 100;
        if (col < 5 && row < 3) return hash < 40 ? 3 : hash < 60 ? 2 : hash < 80 ? 1 : 0;
        if (col < 10) return hash < 20 ? 3 : hash < 40 ? 2 : hash < 55 ? 1 : 0;
        if (col < 15) return hash < 15 ? 3 : hash < 30 ? 2 : hash < 50 ? 1 : 0;
        return hash < 10 ? 2 : hash < 25 ? 1 : 0;
      })
    );
  }, []);

  const getColor = (level) => {
    switch (level) {
      case 3: return "bg-indigo-400 border-indigo-300/50";
      case 2: return "bg-slate-400/70 border-slate-400/40";
      case 1: return "bg-slate-500/40 border-slate-500/25";
      default: return "bg-slate-700/50 border-slate-600/20";
    }
  };

  const totalActivities = grid.flat().filter((l) => l > 0).length;

  return (
    <OpenCard className="w-full h-full justify-between">
      <div>
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-4">
          Activity
        </span>

        <div className="flex flex-col gap-[6px] sm:gap-2">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-[6px] sm:gap-2">
              {row.map((level, ci) => (
                <div
                  key={ci}
                  className={`flex-1 aspect-square rounded-[5px] sm:rounded-md border ${getColor(
                    level
                  )} transition-colors hover:scale-110 cursor-pointer`}
                  style={{ maxHeight: "28px" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-2">
        <span className="text-[10px] text-slate-500 font-medium">
          {totalActivities} activities in 2025
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-medium">Less</span>
          <div className="w-[12px] h-[12px] rounded-[3px] bg-slate-700/50 border border-slate-600/20" />
          <div className="w-[12px] h-[12px] rounded-[3px] bg-slate-500/40 border border-slate-500/25" />
          <div className="w-[12px] h-[12px] rounded-[3px] bg-slate-400/70 border border-slate-400/40" />
          <div className="w-[12px] h-[12px] rounded-[3px] bg-indigo-400 border border-indigo-300/50" />
          <span className="text-[10px] text-slate-500 font-medium">More</span>
        </div>
      </div>
    </OpenCard>
  );
});

// ─── 4. CALENDAR CARD COMPONENT ───
const CalendarCard = memo(function CalendarCard() {
  const today = new Date();
  const monthName = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  const currentDay = today.getDate();
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(year, today.getMonth(), 1).getDay();

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <OpenCard className="w-full h-full">
      <span className="text-lg font-bold text-slate-200 tracking-tight">
        Calendar
      </span>
      <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5 mb-4">
        {monthName} {year}
      </span>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <span key={d} className="text-[9px] font-bold text-slate-400 text-center">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 content-start">
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
                ? "text-slate-500"
                : "text-slate-300"
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </OpenCard>
  );
});

// ─── MAIN LAYOUT & ANIMATION SETUP ───
export default function PerformanceDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-transparent px-4 md:px-8 py-12 flex flex-col items-center overflow-x-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 text-center w-full max-w-6xl px-4"
      >
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-200 leading-tight flex items-center justify-center gap-1"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          <span className="text-slate-500/50 text-4xl sm:text-5xl font-serif leading-none select-none" aria-hidden="true">&ldquo;</span>
          A personal dashboard for analysing your performance
          <span className="text-slate-500/50 text-4xl sm:text-5xl font-serif leading-none select-none" aria-hidden="true">&rdquo;</span>
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 h-full flex">
          <BarChart />
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1 h-full flex">
          <Stopwatch />
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 h-full flex">
          <CalendarCard />
        </motion.div>
        
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 h-full flex">
          <ActivityHeatmap />
        </motion.div>

      </motion.div>
    </section>
  );
}