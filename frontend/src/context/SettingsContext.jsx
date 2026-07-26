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

        // Map fonts
        const fontMap = {
            'Inter': "'Inter', sans-serif",
            'Outfit': "'Outfit', sans-serif",
            'Pixeloid': "'Pixeloid', sans-serif",
            'Instrument Sans': "'Instrument Sans', sans-serif"
        };
        const selectedFont = fontMap[fontFamily] || fontMap['Inter'];

        // 🔥 INJECT GLOBAL STYLES AGGRESSIVELY SO IT APPLIES EVERYWHERE
        let styleTag = document.getElementById('global-settings-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'global-settings-style';
            document.head.appendChild(styleTag);
        }

        // Calculate a text-shadow or opacity trick for brightness without affecting layout
        // For size, we use CSS 'zoom' on the body, or transform on root, or just set html font-size
        styleTag.innerHTML = `
            /* 1. FORCE FONT ACROSS ALL TEXT ELEMENTS */
            * {
                font-family: ${selectedFont} !important;
            }
            
            /* 2. SCALE OVERALL UI / TEXT SIZE */
            /* Note: Zoom works great in Chrome/Safari to scale everything proportionally */
            body {
                zoom: ${fontSizeMultiplier};
            }

            /* 3. TEXT BRIGHTNESS CONTROL */
            /* We target common text tags to lower their opacity (brightness) */
            h1, h2, h3, h4, h5, h6, p, span, a, label, button, input {
                opacity: ${textBrightness} !important;
            }
        `;

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