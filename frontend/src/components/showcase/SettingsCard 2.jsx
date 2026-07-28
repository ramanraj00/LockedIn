import React, { useState } from "react";

const SettingsCard = () => {
  const [selectedFont, setSelectedFont] = useState("Inter");
  
  const fonts = ["Inter", "Playfair", "Space Mono", "Righteous"];

  return (
    <div className="w-full h-full flex flex-col p-6 bg-[#0a0a0a]">
      <h3 className="text-xl font-bold text-white mb-6">Settings</h3>

      <div className="flex-1 flex flex-col gap-4">
        <div className="mb-2">
          <h4 className="text-sm font-medium text-white mb-1">Typography</h4>
          <p className="text-[10px] text-zinc-500">Choose the primary font family.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fonts.map(font => (
            <div 
              key={font}
              onClick={() => setSelectedFont(font)}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all
                ${selectedFont === font 
                  ? 'bg-zinc-900 border-white text-white shadow-lg' 
                  : 'bg-[#111] border-white/5 text-zinc-400 hover:border-white/20'}`}
            >
              <span className="text-2xl font-serif mb-1">Aa</span>
              <span className="text-[9px] font-bold">{font}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
