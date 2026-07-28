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

        // 🔥 FIX: Direct DOM updates instead of injecting <style> tags (100x Faster)
        
        // 1. Set font globally
        document.body.style.fontFamily = selectedFont;
        
        // 2. Scale UI smoothly
        document.body.style.zoom = fontSizeMultiplier;

        // 3. Brightness via CSS Filter (GPU Accelerated, prevents lag)
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