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
    <nav className="sticky top-[8px] mt-2 z-50 text-white max-w-7xl mx-auto w-[calc(100%-2rem)]">
      <div className="flex h-16 items-center justify-between px-6">
        
        <div
          onClick={() => handleScroll("hero-section")}
          className="cursor-pointer text-2xl font-bold text-white tracking-tight"
        >
          LockedIn
        </div>

        <div className="hidden md:flex items-center gap-16 text-zinc-400">
          <span
            onClick={() => handleScroll("hero-section")}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            Home
          </span>
          <span
            onClick={() => handleScroll("features-section")}
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
              <button className="bg-transparent hover:text-white text-zinc-200 font-medium rounded-lg px-4 py-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                Login
              </button>
            </motion.div>
          </div>

          <button className="rounded-md bg-white px-4 py-2 text-black font-medium hover:bg-zinc-200 transition-colors whitespace-nowrap">
            Signup
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-zinc-400 hover:text-white"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden px-6 py-4 absolute left-0 right-0 mt-2">
          <div className="flex flex-col gap-4">
            <span
              onClick={() => handleScroll("hero-section")}
              className="cursor-pointer font-medium text-zinc-400 hover:text-white"
            >
              Home
            </span>
            <span
              onClick={() => handleScroll("features-section")}
              className="cursor-pointer font-medium text-zinc-400 hover:text-white"
            >
              Features
            </span>
            <button className="rounded-md px-4 py-2 text-zinc-200 font-medium hover:text-white">
              Login
            </button>
            <button className="rounded-md bg-white px-4 py-2 text-black font-medium hover:bg-zinc-200">
              Signup
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;