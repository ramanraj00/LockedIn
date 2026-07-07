import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 👈 1. Naya Import Add kiya

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const loginRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const STRENGTH = 0.35;

  const navigate = useNavigate(); // 👈 2. Router ka Hook initialize kiya

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      element.scrollIntoView({ behavior: "auto" });
      setIsOpen(false);
    }
  };

  // 👇 3. Yahan 'window.location.href' ko hata kar 'navigate' laga diya hai
  const navigateToSignup = () => {
    navigate("/signup"); 
    setIsOpen(false); // Mobile menu auto-close
  };

  const navigateToLogin = () => {
    navigate("/login");
    setIsOpen(false); // Mobile menu auto-close
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[999] bg-transparent transition-all duration-300 pointer-events-none`}>
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 pointer-events-auto">
        
        {/* LOGO */}
        <div
          onClick={() => handleScroll("hero-section")}
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          className={`cursor-pointer text-2xl font-black tracking-tighter select-none transition-all duration-300 text-white ${
            scrolled
              ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:bg-white md:text-black md:rounded-2xl md:px-4 md:py-1.5 md:shadow-lg"
              : "opacity-100"
          }`}
        >
          LockedIn
        </div>
        
        {/* Desktop Navigation links */}
        <div
          className={`hidden md:flex items-center gap-16 text-zinc-400 transition-all duration-300 ${
            scrolled ? "opacity-0 pointer-events-none translate-y-[-10px]" : "opacity-100 translate-y-0"
          }`}
        >
          <span
            onClick={() => handleScroll("hero-section")}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            Home
          </span>
          <span
            onClick={() => handleScroll("dashboard-section")}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            Features
          </span>
          <span
            onClick={() => handleScroll("leaderboard-section")}
            className="cursor-pointer font-medium hover:text-white transition-colors duration-200"
          >
            More
          </span>
        </div>
        
        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`border border-dashed rounded-xl p-1 transition-all duration-300 ${
              scrolled ? "opacity-0 pointer-events-none translate-y-[-10px]" : "opacity-100 translate-y-0"
            }`}
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
                onClick={navigateToLogin}
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                className="bg-transparent hover:text-white text-zinc-200 font-medium rounded-lg px-4 py-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Login
              </button>
            </motion.div>
          </div>
          
          <button 
            onClick={navigateToSignup}
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            className={`text-sm font-bold text-[#fafafa] uppercase px-4 py-1.5 rounded-lg border-2 border-[#fafafa] bg-[#252525] shadow-[2px_2px_#fafafa] cursor-pointer transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] whitespace-nowrap ${
              scrolled ? "pointer-events-auto" : ""
            }`}
          >
            Signup
          </button>
        </div>
        
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className={`md:hidden text-zinc-400 hover:text-white transition-all duration-300 p-2 rounded-full pointer-events-auto ${
            scrolled ? "bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]" : ""
          }`}
        >
          <Menu size={24} />
        </button>
        
      </div>
      
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden pointer-events-auto"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[290px] sm:w-[320px] bg-white/[0.01] backdrop-blur-2xl border-l border-white/[0.04] rounded-l-3xl p-6 z-50 md:hidden flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-auto"
            >
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/0 via-white/25 via-white/10 to-white/0 pointer-events-none z-20" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/25 to-white/0 pointer-events-none z-20" />
              
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.038] mix-blend-overlay z-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-[#141633]/80 via-[#0a0c1f]/90 to-[#050614]/98 pointer-events-none z-0" />
              
              <div className="flex flex-col gap-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    className="text-xl font-black text-white tracking-tighter select-none"
                  >
                    LockedIn
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/5 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <span
                    onClick={() => handleScroll("hero-section")}
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-white bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 transition-all duration-200 block shadow-inner"
                  >
                    Home
                  </span>
                  <span
                    onClick={() => handleScroll("dashboard-section")}
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-white bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 transition-all duration-200 block shadow-inner"
                  >
                    Features
                  </span>
                  <span
                    onClick={() => handleScroll("leaderboard-section")}
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                    className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-white bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3.5 transition-all duration-200 block shadow-inner"
                  >
                    More
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mb-4 relative z-10">
                <button 
                  onClick={navigateToLogin}
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  className="w-full text-center py-3 text-white font-medium rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] transition-all text-sm"
                >
                  Login
                </button>
                
                <button 
                  onClick={navigateToSignup}
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  className="w-full text-center text-sm font-bold text-[#fafafa] uppercase px-4 py-2.5 rounded-lg border-2 border-[#fafafa] bg-[#252525] shadow-[2px_2px_#fafafa] cursor-pointer transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  Signup
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;