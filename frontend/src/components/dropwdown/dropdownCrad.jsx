import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit2, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Typewriter Animation Component with INFINITE LOOP
function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const isTypingRef = useRef(true);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isTypingRef.current) {
        if (indexRef.current < text.length) {
          setDisplayedText((prev) => prev + text.charAt(indexRef.current));
          indexRef.current++;
        } else {
          // Animation complete - wait 4 seconds then restart
          isTypingRef.current = false;
          setTimeout(() => {
            setDisplayedText("");
            indexRef.current = 0;
            isTypingRef.current = true;
          }, 2000);
        }
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <span className="text-sm md:text-base text-gray-400 font-medium inline-flex items-center tracking-wide line-clamp-2">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-[2px] h-4 bg-blue-500 ml-1 inline-block flex-shrink-0"
      />
    </span>
  );
}

export default function InteractiveDropdownDashboard() {
  // Simple flat array state (No extra dropdown objects)
  const [tasks, setTasks] = useState([
    { id: 1, text: "Database migration completed successfully.", isAnimated: false },
    { id: 2, text: "API response time optimized by 40%.", isAnimated: false },
    { id: 3, text: "SSL certificate renewed for domain.", isAnimated: false },
    { id: 4, text: "I  will solve binary tree question from striver sheet.", isAnimated: true },
  ]);

  // Timer State
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Delete Handler
  const handleDelete = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  // Edit Handler
  const handleEdit = (id, currentText) => {
    const newText = prompt("Edit your work log:", currentText);
    if (newText && newText.trim() !== "") {
      setTasks(tasks.map((item) => (item.id === id ? { ...item, text: newText } : item)));
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 flex flex-col items-center">
      
      {/* 1. TOP HEADLINE (Big Quotes & Premium Spacing) */}
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
  
  <h1 className="text-2xl flex items-center justify-center bg-transparent border border-4 md:text-2xl font-extrabold text-center tracking-tight w-3xl h-12 mb-16 text-gray-400 shimmer-effect relative overflow-hidden" style={{transform: "skewX(-20deg)", wordSpacing: "8px"}}>
    &ldquo;Your daily work tracker with time and history&rdquo;
  </h1>
</>

      {/* MAIN CONTAINER */}
     <div 
  className="w-4xl max-w-5xl border border-1 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-8 items-start justify-between relative backdrop-blur-xl"
  style={{
    background: "rgba(20, 24, 54, 0.5)",
    backdropFilter: "blur(12px)",
    boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.2), 0px 8px 32px rgba(10, 11, 28, 0.3)"
  }}
>
  
  {/* LEFT SIDE: Clean Text Work List */}
  <div className="w-full lg:w-2/3 space-y-6">
    <div className="flex items-center justify-between border-b border-slate-900/50 pb-3 px-1">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Today's Tasks</h3>
      <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-md text-slate-300 border border-white/20 backdrop-blur-md">
        Total: {tasks.length}
      </span>
    </div>
    
    <AnimatePresence mode="popLayout">
      <div className="space-y-4">
        {tasks.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center justify-between py-2 border-b border-white/30 group hover:border-white/50 transition-colors"
          >
            {/* Index + Text Content Block */}
            <div className="flex items-center gap-4 flex-1 pr-4 min-w-0">
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
            <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(item.id, item.text)}
                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
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

        {/* RIGHT SIDE: Stopwatch Elements */}
        <div className="w-full lg:w-1/3 bg-slate-950/40 border border-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center space-y-5 lg:self-stretch">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Session Clock
          </span>
          
          {/* Digital Timer Block */}
          <div className="text-4xl font-mono font-bold tracking-widest text-blue-500 bg-black px-6 py-4 rounded-xl border border-slate-900 shadow-inner min-w-[160px] text-center">
            {formatTime(time)}
          </div>
          
          {/* Controls Hook */}
          <div className="flex items-center gap-3 w-full">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold h-9 transition rounded-lg ${
                isRunning 
                  ? "bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-600/30" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
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
              onClick={() => {
                setIsRunning(false);
                setTime(0);
              }}
              variant="outline"
              className="flex-1 border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold h-9 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}