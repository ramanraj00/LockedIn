import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Signin = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2; 
        const y = (e.clientY / window.innerHeight - 0.5) * 2; 
        setMousePos({ x, y });
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617]"
        >
            
            {/* 1. BASE BACKGROUND */}
            <motion.img 
                src="/login.png" 
                alt="Sky Background" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                animate={{
                    x: mousePos.x * -10, // Bahut hi subtle mouse movement
                    y: mousePos.y * -10,
                    scale: 1.02 // Screen se bahar na nikle isliye
                }}
                transition={{ type: "tween", ease: "easeOut", duration: 2 }} // Smooth damping
            />
            
            {/* 2. THE MOON (Small, Slow, and Natural) */}
            {/* Moon ki position (top, right) ko aap apne hisaab se tweak kar sakte ho */}
            <motion.img 
                src="/moon.png" 
                alt="Moon" 
                className="absolute z-10 w-24 h-24 md:w-32 md:h-32 object-contain"
                style={{ top: '25%', right: '20%' }} 
                
                animate={{
                    // Parallax (mouse movement)
                    x: mousePos.x * -25, 
                    
                    // Natural Levitation (Bohot ahista se upar-neeche)
                    y: [mousePos.y * -25, (mousePos.y * -25) - 8, mousePos.y * -25], 
                    
                    // Ekdum invisible sa natural glow
                    filter: [
                        "drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.03))", 
                        "drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.12))", 
                        "drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.03))"  
                    ]
                }}
                transition={{
                    // 12 aur 15 seconds ka duration (Bohot slow aur premium feel ke liye)
                    y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
                    filter: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                    x: { type: "tween", ease: "easeOut", duration: 1.5 }
                }}
            />
           
        </div>
    );
}

export default Signin;