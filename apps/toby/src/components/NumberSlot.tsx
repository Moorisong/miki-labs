
import React, { useEffect, useState } from 'react';

interface NumberSlotProps {
    targetNumber: number | null; // The final number to show. If null, show '?' or 0
    isAnimating: boolean;
    onAnimationComplete?: () => void;
    index: number; // To add slight delay stagger if needed
}

const NumberSlot: React.FC<NumberSlotProps> = ({ targetNumber, isAnimating, onAnimationComplete, index }) => {
    const [currentNumber, setCurrentNumber] = useState<number | string>('?');

    useEffect(() => {
        if (isAnimating) {
            const interval = setInterval(() => {
                // Show random numbers during animation (1-99 for effect)
                setCurrentNumber(Math.floor(Math.random() * 99) + 1);
            }, 50 + index * 10); // Stagger speed slightly

            // Stop animation after some time
            const timeout = setTimeout(() => {
                clearInterval(interval);
                if (targetNumber !== null) {
                    setCurrentNumber(targetNumber);
                    onAnimationComplete?.();
                }
            }, 1500); // Constant 2s reveal time for all slots

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else {
            // If not animating, ensure target is shown if available
            if (targetNumber !== null) {
                setCurrentNumber(targetNumber);
            } else {
                setCurrentNumber('?');
            }
        }
    }, [isAnimating, targetNumber, index, onAnimationComplete]);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '110px',
                height: '140px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                boxShadow: isAnimating
                    ? '0 10px 25px rgba(74,144,226,0.15)'
                    : '0 8px 15px rgba(0,0,0,0.06)',
                fontSize: '4.2rem',
                fontWeight: '800',
                color: isAnimating ? '#4A90E2' : '#333',
                border: isAnimating ? '2px solid #4A90E2' : '1px solid #e2e2ea',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isAnimating ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
                fontVariantNumeric: 'tabular-nums',
                background: isAnimating
                    ? 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)'
                    : '#ffffff'
            }}
        >
            {currentNumber}
        </div>
    );
};

export default NumberSlot;
