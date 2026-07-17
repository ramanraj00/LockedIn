import React from 'react';

const AnimatedDigit = ({ digit }) => {
    return (
        <div 
            className="relative inline-flex flex-col overflow-hidden items-center justify-start"
            style={{ 
                height: '1.15em', 
                lineHeight: '1.15em', 
                width: '0.62em' 
            }}
        >
            <div 
                className="absolute top-0 left-0 flex flex-col w-full will-change-transform"
                style={{ 
                    transform: `translateY(-${digit * 10}%)`,
                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <span 
                        key={num} 
                        className="flex items-center justify-center w-full text-center"
                        style={{ height: '1.15em' }}
                    >
                        {num}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AnimatedDigit;