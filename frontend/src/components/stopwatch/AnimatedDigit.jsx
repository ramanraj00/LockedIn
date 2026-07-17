import React from 'react';

const AnimatedDigit = ({ digit }) => {
    // Height 1.2em ensures numbers are fully visible and not sliced at top/bottom
    return (
        <div className="relative inline-flex flex-col h-[1.2em] overflow-hidden leading-[1.2em] w-[0.65em] items-center justify-start">
            <div 
                className="absolute top-0 left-0 flex flex-col w-full transition-transform duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)]"
                style={{ transform: `translateY(-${digit * 10}%)` }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <span key={num} className="h-[1.2em] flex items-center justify-center w-full text-center">
                        {num}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AnimatedDigit;