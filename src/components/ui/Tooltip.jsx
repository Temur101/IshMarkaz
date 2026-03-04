import React, { useState } from 'react';

export const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-brand-gray',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-brand-gray',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-brand-gray',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-brand-gray',
    };

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <div className={`
                absolute z-50 px-2 py-1 text-xs font-medium text-white 
                bg-brand-gray border border-white/10 rounded-md whitespace-nowrap 
                shadow-xl pointer-events-none transition-all duration-200 
                ${positionClasses[position]}
                ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'}
            `}>
                {content}
                <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
            </div>
        </div>
    );
};
