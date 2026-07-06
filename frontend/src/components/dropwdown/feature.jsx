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

const CustomBarLabel = (props) => {
  const { x, y, width, value, index } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#e2e8f0" 
      fontSize={11} 
      textAnchor="middle"
      className={`font-mono font-bold custom-label-anim custom-label-${index}`}
    >
      {value}hr
    </text>
  );
};

const CustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y + 16}
      fill="#cbd5e1"
      fontSize={12} 
      textAnchor="middle"
      className="font-medium tracking-wide"
    >
      {payload.value}
    </text>
  );
};

// ─── 🌟 PREMIUM GLASSMORPHISM WRAPPER 🌟 ───
const OpenCard = ({ children, className = "" }) => (
  <div
    className={`w-full rounded-3xl p-5 sm:p-6 flex flex-col relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    style={{
      background: "rgba(20, 24, 54, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
      boxShadow: `
        8px 12px 32px rgba(0, 0, 0, 0.3), 
        inset 1px 1px 2px rgba(255, 255, 255, 0.1),
        inset -1px -1px 4px rgba(0, 0, 0, 0.2)
      `,
    }}
  >
    <div className="relative z-10 flex flex-col h-full w-full">{children}</div>
  </div>
);

// ─── BAR CHART STYLES ───
const barChartStyles = `
  @keyframes continuousPulse {
    0%, 100% { transform: scaleY(1); opacity: 1; }
    50% { transform: scaleY(0.96); opacity: 0.8; }
  }
  @keyframes continuousLabelPulse {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(3px); opacity: 0.8; }
  }
  .recharts-bar-rectangle path {
    animation: continuousPulse 3s infinite ease-in-out;
    transform-box: fill-box;
    transform-origin: bottom;
    will-change: transform, opacity;
  }
  .custom-label-anim {
    animation: continuousLabelPulse 3s infinite ease-in-out;
    will-change: transform, opacity;
  }
  .recharts-bar-rectangles g:nth-child(1) path, .custom-label-0 { animation-delay: 0.0s; }
  .recharts-bar-rectangles g:nth-child(2) path, .custom-label-1 { animation-delay: 0.2s; }
  .recharts-bar-rectangles g:nth-child(3) path, .custom-label-2 { animation-delay: 0.4s; }
  .recharts-bar-rectangles g:nth-child(4) path, .custom-label-3 { animation-delay: 0.6s; }
  .recharts-bar-rectangles g:nth-child(5) path, .custom-label-4 { animation-delay: 0.8s; }
  .recharts-bar-rectangles g:nth-child(6) path, .custom-label-5 { animation-delay: 1.0s; }
  .recharts-bar-rectangles g:nth-child(7) path, .custom-label-6 { animation-delay: 1.2s; }
`;

// ─── 1. WEEKLY FOCUS HOURS ───
const BarChart = memo(function BarChart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <OpenCard className="flex-1 min-h-[260px] justify-between relative">
      <style>{barChartStyles}</style>

      <div ref={ref} className="w-full h-full flex flex-col justify-between flex-1">
        <span className="text-xs font-bold tracking-widest text-slate-200 uppercase mb-6 block w-fit px-3 py-1.5 border border-white/10 rounded-2xl bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
          Weekly Focus Hours
        </span>

        <div className="w-full flex-1 min-h-[140px] relative">
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
const CIRCUMFERENCE = 2 * Math.PI * 72;

const Stopwatch = memo(function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");

  const handleToggle = useCallback(() => setIsRunning((p) => !p), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  const progress = (time % 60) / 60;
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  return (
    <OpenCard className="flex flex-col w-full h-full p-2">
      <div className="flex justify-start w-full mb-2">
        <span className="text-xs font-bold tracking-widest text-slate-200 uppercase px-3 py-1.5 border border-white/10 rounded-2xl bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] w-fit">
          Stopwatch
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-[160px] h-[160px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="80"
              cy="80"
              r="72"
              fill="none"
              stroke="rgba(129,140,248,0.8)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{
                transition: "stroke-dashoffset 0.3s ease",
                willChange: "stroke-dashoffset",
              }}
            />
          </svg>
          <span className="font-mono text-4xl font-extrabold tracking-widest text-white z-10 drop-shadow-md">
            {mins}:{secs}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full mt-auto pt-2">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors ${
            isRunning
              ? "bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
              : "bg-indigo-500/80 hover:bg-indigo-500 text-white border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </OpenCard>
  );
});

// ─── 3. ACTIVITY HEATMAP COMPONENT ───
const HEATMAP_COLORS = [
  "bg-slate-700/30 border-white/5",
  "bg-slate-500/40 border-slate-500/25",
  "bg-slate-400/70 border-slate-400/40",
  "bg-indigo-400 border-indigo-300/50",
];

const ActivityHeatmap = memo(function ActivityHeatmap() {
  const weeks = 20;
  const rows = 5;

  const { grid, totalActivities } = useMemo(() => {
    let count = 0;
    const g = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: weeks }, (_, col) => {
        const seed = (row * weeks + col) * 2654435761;
        const hash = (seed >>> 0) % 100;
        let level;
        if (col < 5 && row < 3) level = hash < 40 ? 3 : hash < 60 ? 2 : hash < 80 ? 1 : 0;
        else if (col < 10) level = hash < 20 ? 3 : hash < 40 ? 2 : hash < 55 ? 1 : 0;
        else if (col < 15) level = hash < 15 ? 3 : hash < 30 ? 2 : hash < 50 ? 1 : 0;
        else level = hash < 10 ? 2 : hash < 25 ? 1 : 0;
        if (level > 0) count++;
        return level;
      })
    );
    return { grid: g, totalActivities: count };
  }, []);

  return (
    <OpenCard className="w-full h-full justify-between p-4 sm:p-5">
      <div>
        <span className="text-xs font-bold tracking-widest text-slate-200 uppercase px-3 py-1.5 border border-white/10 rounded-2xl bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] w-fit mb-4 block">
          Activity
        </span>

        <div className="flex flex-col gap-[6px] sm:gap-2 mt-4">
          {grid.map((row, ri) => (
            <div key={ri} className="flex gap-[6px] sm:gap-2">
              {row.map((level, ci) => (
                <div
                  key={ci}
                  className={`flex-1 aspect-square rounded-[5px] sm:rounded-md border ${HEATMAP_COLORS[level]} transition-transform hover:scale-110 cursor-pointer`}
                  style={{ maxHeight: "28px" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-2">
        <span className="text-[11px] text-slate-300 font-semibold tracking-wide">
          {totalActivities} activities in 2025
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 font-semibold">Less</span>
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-700/30 border border-white/5" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-500/40 border border-slate-500/25" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-slate-400/70 border border-slate-400/40" />
          <div className="w-[14px] h-[14px] rounded-[3px] bg-indigo-400 border border-indigo-300/50" />
          <span className="text-[11px] text-slate-300 font-semibold">More</span>
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
    <OpenCard className="w-full h-full flex flex-col p-4 sm:p-5">
      <div className="flex justify-start w-full mb-2">
        <span className="text-xs font-bold tracking-widest text-slate-200 uppercase px-3 py-1.5 border border-white/10 rounded-2xl bg-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] w-fit">
          Calendar
        </span>
      </div>

      <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase mt-2 mb-3 block">
        {monthName} {year}
      </span>

      <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.15] via-white/[0.05] to-transparent mb-3"></div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <span key={d} className="text-[10px] font-extrabold text-slate-300 text-center uppercase">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 content-start mt-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <span
            key={day}
            className={`text-[11px] font-mono font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md transition-colors ${
              day === currentDay
                ? "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                : day < currentDay
                ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                : "text-slate-200 hover:bg-white/10"
            }`}
          >
            {day}
          </span>
        ))}
      </div>
    </OpenCard>
  );
});

// ─── ANIMATION VARIANTS ───
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

// ─── MAIN LAYOUT ───
export default function PerformanceDashboard() {
  return (
    <section className="relative w-full px-4 md:px-8 py-12 flex flex-col items-center overflow-x-hidden bg-transparent">
      
     {/* ─── REFINED & ELEGANT HEADER ─── */}
      <div className="mb-10 w-full max-w-6xl z-10 flex flex-col items-start">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl tracking-tight text-left"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          <span className="font-medium text-slate-400">A personal dashboard for</span>{" "}
          <span className="font-extrabold text-slate-100">analysing your performance.</span>
        </h2>
        
        {/* Divider with breathing room (mt-6) and smooth fade */}
        <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.2] via-white/[0.05] to-transparent mt-6"></div>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10"
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