import React, { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const loginRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const STRENGTH = 0.35;

  const handleMouseMove = (e) => {
    if (!loginRef.current) return;
    const { width, height, left, top } = loginRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * STRENGTH;
    const y = (e.clientY - (top + height / 2)) * STRENGTH;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    /* ⚠️ FIXED: Poori tarah bg-transparent kar diya hai bina kisi border ya background color ke */
    <nav className="absolute top-0 left-0 right-0 z-50 text-white bg-transparent">
    <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        
        <div
          onClick={() => handleScroll("hero-section")}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          className="cursor-pointer text-2xl font-black text-white tracking-tighter select-none"
        >
          LockedIn
        </div>

        <div className="hidden md:flex items-center gap-16 text-zinc-400">
          <span
            onClick={() => handleScroll("hero-section")}
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            Home
          </span>
          <span
            onClick={() => handleScroll("features-section")}
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            Features
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          
          {/* Magnetic Button with Dashed Border & Background */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="border border-dashed rounded-xl p-1 transition-all duration-200"
            style={{
              borderColor: position.x !== 0 || position.y !== 0 ? "rgba(255, 255, 255, 0.4)" : "transparent", 
              backgroundColor: position.x !== 0 || position.y !== 0 ? "rgba(255, 255, 255, 0.05)" : "transparent"
            }}
          >
            <motion.div
              ref={loginRef}
              animate={{ x: position.x, y: position.y }}
              transition={{ type: 'spring', stiffness: 150, damping: 25, mass: 0.3 }}
            >
              <button 
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                className="bg-transparent hover:text-white text-zinc-200 font-medium rounded-lg px-4 py-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Login
              </button>
            </motion.div>
          </div>

          <button 
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            className="rounded-xl bg-white px-5 py-2 text-black font-semibold hover:bg-zinc-200 transition-colors whitespace-nowrap text-sm tracking-wide shadow-md"
          >
            Signup
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-zinc-400 hover:text-white transition-colors p-1"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div className="md:hidden px-6 py-5 absolute left-0 right-0 mt-2 bg-[#0f1026]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl z-50">
          <div className="flex flex-col gap-4">
            <span
              onClick={() => handleScroll("hero-section")}
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              className="cursor-pointer font-medium text-zinc-400 hover:text-white transition-colors py-1"
            >
              Home
            </span>
            <span
              onClick={() => handleScroll("features-section")}
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              className="cursor-pointer font-medium text-zinc-400 hover:text-white transition-colors py-1"
            >
              Features
            </span>
            <hr className="border-white/[0.06] my-1" />
            <div className="flex flex-col gap-2.5 pt-1">
              <button 
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                className="w-full text-center py-2.5 text-zinc-300 font-medium hover:text-white rounded-xl border border-white/5 bg-white/5"
              >
                Login
              </button>
              <button 
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                className="w-full text-center py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 shadow-lg"
              >
                Signup
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;