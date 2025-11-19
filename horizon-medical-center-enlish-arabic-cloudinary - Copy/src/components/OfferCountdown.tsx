import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../App';

const OfferCountdown: React.FC = () => {
    const context = useContext(LanguageContext);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    if (!context) return null;
    const { text, content } = context;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const endDate = new Date(content.specialOffersEndDate || new Date().setDate(new Date().getDate() + 3));
            const difference = +endDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [content.specialOffersEndDate]);

    return (
        <div className="flex items-center gap-2 text-xs font-mono">
            {/* Timer Icon & Label */}
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold uppercase tracking-wide text-xs hidden sm:inline">{text.offersTimerTitle}:</span>
            </div>

            {/* Compact Timer Boxes */}
            <div className="flex gap-1.5">
                <div className="flex flex-col items-center bg-white/20 rounded px-1.5 py-0.5 min-w-[32px]">
                    <span className="font-bold text-sm leading-none">{timeLeft.days}</span>
                    <span className="text-[9px] uppercase opacity-80">{text.timerDays}</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 rounded px-1.5 py-0.5 min-w-[32px]">
                    <span className="font-bold text-sm leading-none">{timeLeft.hours}</span>
                    <span className="text-[9px] uppercase opacity-80">{text.timerHours}</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 rounded px-1.5 py-0.5 min-w-[32px]">
                    <span className="font-bold text-sm leading-none">{timeLeft.minutes}</span>
                    <span className="text-[9px] uppercase opacity-80">{text.timerMinutes}</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 rounded px-1.5 py-0.5 min-w-[32px]">
                    <span className="font-bold text-sm leading-none">{timeLeft.seconds}</span>
                    <span className="text-[9px] uppercase opacity-80">{text.timerSeconds}</span>
                </div>
            </div>
        </div>
    );
};

export default OfferCountdown;
