import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit2, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── CSS-ONLY BLINK (replaces motion.span to avoid React re-renders) ───
const cursorBlinkStyle = `
  @keyframes cursorBlink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  .blink-cursor {
    animation: cursorBlink 0.8s infinite;
  }
`;

// ─── MOBILE DETECT HOOK ───
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

// ─── TYPEWRITER (ZERO RE-RENDERS — direct DOM + requestAnimationFrame) ───
// On mobile: renders static text, no animation at all
const TypewriterText = memo(function TypewriterText({ text }) {
  const textRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Skip animation entirely on mobile
    if (isMobile) return;

    const node = textRef.current;
    if (!node) return;

    let index = 0;
    let isTyping = true;
    let timeoutId = null;
    let rafId = null;
    let lastTime = 0;
    const CHAR_DELAY = 50;

    const step = (timestamp) => {
      if (!isTyping) return;

      if (timestamp - lastTime >= CHAR_DELAY) {
        if (index < text.length) {
          index++;
          node.textContent = text.slice(0, index);
          lastTime = timestamp;
        } else {
          // Done typing — wait 2s then restart
          isTyping = false;
          timeoutId = setTimeout(() => {
            index = 0;
            node.textContent = "";
            isTyping = true;
            lastTime = performance.now();
            rafId = requestAnimationFrame(step);
          }, 2000);
          return;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    lastTime = performance.now();
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [text, isMobile]);

  // Mobile — plain static text, no animation, no cursor
  if (isMobile) {
    return (
      <span className="text-sm text-gray-400 font-medium tracking-wide line-clamp-2 block">
        {text}
      </span>
    );
  }

  // Desktop — animated typewriter with CSS cursor
  return (
    <span className="relative block">
      {/* Invisible full text to permanently reserve space */}
      <span className="text-sm md:text-base font-medium tracking-wide line-clamp-2 block invisible" aria-hidden="true">
        {text}
      </span>
      {/* Visible animated text — updated via ref, not state */}
      <span className="absolute top-0 left-0 right-0 text-sm md:text-base text-gray-400 font-medium inline-flex items-center tracking-wide line-clamp-2">
        <span ref={textRef} />
        <span className="blink-cursor w-[2px] h-4 bg-blue-500 ml-1 inline-block flex-shrink-0" />
      </span>
    </span>
  );
});

// ─── SINGLE TASK ROW (memoized — only re-renders when its own data changes) ───
const TaskItem = memo(function TaskItem({ item, index, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex items-center justify-between py-2 border-b border-white/10 group hover:border-white/30 transition-colors"
    >
      {/* Index + Text Content Block */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 pr-2 sm:pr-4 min-w-0">
        <span className="font-mono text-xs text-slate-400 w-4 flex-shrink-0">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          {item.isAnimated ? (
            <TypewriterText text={item.text} />
          ) : (
            <span className="text-sm md:text-base text-gray-300 font-medium tracking-wide line-clamp-2 block">
              {item.text}
            </span>
          )}
        </div>
      </div>

      {/* Edit & Delete Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item.id, item.text)}
          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </motion.div>
  );
});

// ─── SESSION CLOCK (fully isolated — timer ticks DON'T re-render parent) ───
const SessionClock = memo(function SessionClock() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleToggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  return (
    <div
      className="w-full lg:w-1/3 border border-slate-700/50 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center space-y-5 lg:self-stretch relative backdrop-blur-xl overflow-hidden"
      style={{
        background: "rgba(20, 24, 54, 0.5)",
        backdropFilter: "blur(12px)",
        boxShadow: "0px 8px 32px rgba(10, 11, 28, 0.3)",
      }}
    >
      {/* Top/Left Subtle Dark Overlays */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-600/30 via-slate-600/10 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-slate-600/30 via-slate-600/10 to-transparent pointer-events-none z-10" />

      <span className="text-xs font-bold tracking-widest text-slate-500 uppercase relative z-20">
        Session Clock
      </span>

      {/* Digital Timer Block */}
      <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-blue-200 bg-slate-900/40 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-700/40 shadow-inner min-w-[140px] sm:min-w-[160px] text-center relative z-20">
        {formatTime(time)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full relative z-20">
        <Button
          onClick={handleToggle}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold h-9 transition rounded-2xl ${
            isRunning
              ? "bg-transparent hover:bg-white/5 text-white border border-slate-600"
              : "bg-white hover:bg-gray-200 text-black"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Start
            </>
          )}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1 border-slate-700 text-white bg-black hover:bg-slate-900 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold h-9 rounded-lg"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
});

// ─── MAIN DASHBOARD ───
export default function InteractiveDropdownDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Database migration completed successfully.", isAnimated: false },
    { id: 2, text: "API response time optimized by 40%.", isAnimated: false },
    { id: 3, text: "SSL certificate renewed for domain.", isAnimated: false },
    { id: 4, text: "I will solve binary tree question from striver sheet.", isAnimated: true },
  ]);

  // Stable references — won't cause child re-renders
  const handleDelete = useCallback((id) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleEdit = useCallback((id, currentText) => {
    const newText = prompt("Edit your work log:", currentText);
    if (newText && newText.trim() !== "") {
      setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, text: newText } : item)));
    }
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-8 flex flex-col items-center">
      {/* Inject CSS-only cursor blink */}
      <style>{cursorBlinkStyle}</style>

      {/* 1. TOP HEADLINE */}
      <>
        <style>{`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 4s infinite;
            pointer-events: none;
          }
        `}</style>

        <h1
          className="text-xl sm:text-2xl md:text-2xl flex items-center justify-center bg-transparent border-4 font-extrabold text-center tracking-tight w-full max-w-3xl px-3 sm:px-8 py-2.5 mb-16 text-gray-400 shimmer-effect relative overflow-hidden"
          style={{ transform: "skewX(-20deg)", wordSpacing: "8px" }}
        >
          &ldquo;Your daily work tracker with time and history&rdquo;
        </h1>
      </>

      {/* MAIN CONTAINER */}
      <div
        className="w-full max-w-5xl border border-slate-700/50 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-6 sm:gap-8 items-start justify-between relative backdrop-blur-xl"
        style={{
          background: "rgba(20, 24, 54, 0.5)",
          backdropFilter: "blur(12px)",
          boxShadow: "0px 8px 32px rgba(10, 11, 28, 0.3)",
        }}
      >
        {/* LEFT SIDE: Task List */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3 px-1 sm:px-3">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Today's Tasks</h3>
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-md text-slate-300 border border-white/20 backdrop-blur-md">
              Total: {tasks.length}
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {tasks.map((item, index) => (
                <TaskItem
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </AnimatePresence>

          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-600 text-sm font-mono tracking-wide"
            >
              No work items logs tracked for this session.
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDE: Isolated Clock (timer state lives here, not in parent) */}
        <SessionClock />
      </div>
    </div>
  );
}