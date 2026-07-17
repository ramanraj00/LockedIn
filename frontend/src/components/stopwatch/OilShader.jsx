import React from 'react';

const OilShader = ({ className }) => {
    // 🚀 WebGL animation removed for 100% Optimization.
    // Now it returns a static, ultra-premium glass gradient that uses 0% GPU.
    
    return (
        <div 
            className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className || ''}`}
            style={{
                // Premium metallic dark gradient
                background: 'radial-gradient(circle at 50% -20%, #1a1a1a 0%, #080808 50%, #000000 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
        />
    );
};

export default OilShader;