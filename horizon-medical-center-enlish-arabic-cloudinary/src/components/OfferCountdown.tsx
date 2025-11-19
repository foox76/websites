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
        <div className="bg-brand-dark text-white py-3 px-4 text-center shadow-inner">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                <div className="flex items-center gap-2 text-brand-gold font-bold uppercase tracking-wider text-sm sm:text-base animate-pulse-soft">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{text.offersTimerTitle}</span>
                </div>

                <div className="flex gap-3 text-xs sm:text-sm font-mono">
                    <div className="flex flex-col items-center bg-white/10 rounded p-1.5 min-w-[50px]">
                        <span className="font-bold text-lg sm:text-xl leading-none text-white">{timeLeft.days}</span>
                        <span className="text-gray-400 text-[10px] uppercase">{text.timerDays}</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded p-1.5 min-w-[50px]">
                        <span className="font-bold text-lg sm:text-xl leading-none text-white">{timeLeft.hours}</span>
                        <span className="text-gray-400 text-[10px] uppercase">{text.timerHours}</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded p-1.5 min-w-[50px]">
                        <span className="font-bold text-lg sm:text-xl leading-none text-white">{timeLeft.minutes}</span>
                        <span className="text-gray-400 text-[10px] uppercase">{text.timerMinutes}</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 rounded p-1.5 min-w-[50px]">
                        <span className="font-bold text-lg sm:text-xl leading-none text-brand-gold">{timeLeft.seconds}</span>
                        <span className="text-gray-400 text-[10px] uppercase">{text.timerSeconds}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferCountdown;
