import React from 'react';

const Footer = () => {
  return (
    <footer 
      className="relative w-full mt-24 pt-16 overflow-hidden flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, rgba(20, 24, 54, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.15)"
      }}
    >
      <div className="w-full px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center z-10 gap-6 mb-8 md:mb-12">
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          © {new Date().getFullYear()} LockedIn. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="w-full flex justify-center items-end select-none pointer-events-none mt-auto overflow-hidden">
        <h1 
          className="font-eurostile text-transparent bg-clip-text w-full text-center uppercase"
          style={{ 
            backgroundImage: "linear-gradient(to bottom, #94A3B8 20%, #475569 100%)",
            fontSize: "clamp(120px, 18.5vw, 400px)", 
            fontWeight: 900,          // FORCE BOLD/BLACK WEIGHT
            letterSpacing: "-0.04em", // Letters ko thoda paas (tight) karne ke liye
            lineHeight: "0.75", 
            marginBottom: "-3.5%", 
            WebkitFontSmoothing: "antialiased", // Edges ko crisp rakhne ke liye
          }}
        >
          LOCKEDIN
        </h1>
      </div>
    </footer>
  );
};

export default Footer;