import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#FAF9F6] pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">

        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          
          {/* Brand */}
          <h3 className="text-xl font-bold text-[#1F2937] tracking-tight mb-4 md:mb-0" style={{ fontFamily: "'Inter', sans-serif" }}>
            LockedIn
          </h3>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            {/* X (Twitter) */}
            <a 
              href="https://x.com/r1zzdev?s=20" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1F2937] hover:text-[#5C9EAD] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* GitHub */}
            <a 
              href="https://github.com/ramanraj00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#1F2937] hover:text-[#5C9EAD] transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-6 mb-8">
          <span onClick={() => { document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" }); }} className="cursor-pointer text-sm text-[#6B7280] hover:text-[#5C9EAD] transition-colors font-medium">Home</span>
          <span onClick={() => { document.getElementById("dashboard-section")?.scrollIntoView({ behavior: "smooth" }); }} className="cursor-pointer text-sm text-[#6B7280] hover:text-[#5C9EAD] transition-colors font-medium">Features</span>
          <span onClick={() => { document.getElementById("leaderboard-section")?.scrollIntoView({ behavior: "smooth" }); }} className="cursor-pointer text-sm text-[#6B7280] hover:text-[#5C9EAD] transition-colors font-medium">More</span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E5E7EB] mb-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-sm text-[#9CA3AF] font-medium">
            © 2026 LockedIn. All rights reserved.
          </p>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Built with <span className="text-red-500">❤️</span> by{' '}
            <a 
              href="https://x.com/r1zzdev?s=20" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#5C9EAD] hover:underline font-semibold italic font-serif-elegant"
            >
              Raman Raj
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
