import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('app_fontFamily') || 'Inter');
    const [fontSizeMultiplier, setFontSizeMultiplier] = useState(() => parseFloat(localStorage.getItem('app_fontSize')) || 1);
    const [textBrightness, setTextBrightness] = useState(() => parseFloat(localStorage.getItem('app_textBrightness')) || 1);

    useEffect(() => {
        localStorage.setItem('app_fontFamily', fontFamily);
        localStorage.setItem('app_fontSize', fontSizeMultiplier);
        localStorage.setItem('app_textBrightness', textBrightness);

        // Map fonts for the entire App (All 10 unique styles)
        const fontMap = {
            'Inter': "'Inter', sans-serif",
            'Playfair': "'Playfair Display', serif",
            'SpaceMono': "'Space Mono', monospace",
            'Righteous': "'Righteous', cursive",
            'Cinzel': "'Cinzel', serif",
            'Bangers': "'Bangers', cursive",
            'Caveat': "'Caveat', cursive",
            'ChakraPetch': "'Chakra Petch', sans-serif",
            'Milkshake': "'Milkshake', cursive",
            'Pixeloid': "'Pixeloid', sans-serif"
        };
        
        const selectedFont = fontMap[fontFamily] || fontMap['Inter'];

        // Inject global style to load fonts and forcefully override inline hardcoded fonts across pages
        let styleEl = document.getElementById('global-app-font-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'global-app-font-style';
            document.head.appendChild(styleEl);
        }
        
        styleEl.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Righteous&family=Space+Mono:wght@700&family=Cinzel:wght@700&family=Bangers&family=Caveat:wght@700&family=Chakra+Petch:wght@600&display=swap');
            @font-face {
                font-family: 'Milkshake';
                src: url('/font/Milkshake.otf');
            }
            body, div:not(.keep-font), span:not(.keep-font), p:not(.keep-font), h1:not(.keep-font), h2:not(.keep-font), h3:not(.keep-font), h4:not(.keep-font), h5:not(.keep-font), h6:not(.keep-font), button:not(.keep-font), input:not(.keep-font), textarea:not(.keep-font) {
                font-family: ${selectedFont} !important;
            }
            /* Exclude Pixeloid font classes from being overridden so the logo stays intact */
            .pixel-gradient-text, [style*="Pixeloid"] {
                font-family: 'Pixeloid', sans-serif !important;
            }
        `;

        // Scale UI smoothly
        document.body.style.zoom = fontSizeMultiplier;

        // Brightness via CSS Filter (GPU Accelerated, prevents lag)
        document.body.style.filter = `brightness(${textBrightness})`;

    }, [fontFamily, fontSizeMultiplier, textBrightness]);

    return (
        <SettingsContext.Provider value={{
            fontFamily, setFontFamily,
            fontSizeMultiplier, setFontSizeMultiplier,
            textBrightness, setTextBrightness
        }}>
            {children}
        </SettingsContext.Provider>
    );
};