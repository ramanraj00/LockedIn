import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Heart } from 'lucide-react';

const SponsorSection = () => {
  return (
    <section className="w-full bg-[#FAF9F6] py-12 md:py-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[28px] overflow-hidden min-h-[280px] md:min-h-[320px]"
          style={{
            background: 'linear-gradient(135deg, rgba(220, 230, 245, 0.9) 0%, rgba(170, 210, 245, 0.85) 40%, rgba(100, 175, 240, 0.8) 70%, rgba(60, 150, 230, 0.75) 100%)'
          }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(/bheek.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              opacity: 0.45
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full p-8 md:p-12 gap-8">
            
            {/* Left Side - Text */}
            <div className="flex-1 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <Heart size={14} className="text-red-400 fill-red-400" />
                <span className="text-sm font-semibold text-[#1F2937]">Sponsor LockedIn</span>
              </div>

              <h2 className="text-3xl md:text-[42px] leading-tight font-bold text-[#1F2937] mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                Help us build the<br />ultimate workspace.
              </h2>

              <p className="text-[#4B5563] text-base md:text-lg leading-relaxed font-medium">
                LockedIn is indie-crafted and free of clutter. Your support keeps the servers running, funds new focus widgets, and helps us keep building a quieter web.
              </p>
            </div>

            {/* Right Side - Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[240px]">
              <a 
                href="https://github.com/sponsors/ramanraj00" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#0F172A] text-white px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:bg-[#1E293B] transition-colors"
                >
                  <span>GitHub Sponsors</span>
                  <ExternalLink size={16} />
                </motion.div>
              </a>
              <a 
                href="https://buymeacoffee.com/r02519625y" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/90 backdrop-blur-sm text-[#0F172A] border border-gray-200 px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-between gap-3 shadow-sm cursor-pointer hover:bg-white transition-colors"
                >
                  <span>Buy Me a Coffee</span>
                  <ExternalLink size={16} />
                </motion.div>
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorSection;
