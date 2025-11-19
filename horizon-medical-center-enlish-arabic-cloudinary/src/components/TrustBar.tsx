import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { ShieldCheckIcon, ClockIcon, HeartPulseIcon } from './Icons';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const TrustBar: React.FC = () => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    if (!langContext) return null;
    const { text } = langContext;

    const features = [
        { icon: ShieldCheckIcon, label: text.trustQuality, sub: "ISO Certified Clinic" },
        { icon: HeartPulseIcon, label: text.trustComfort, sub: "Pain-Free Dentistry" },
        { icon: ClockIcon, label: text.trustTech, sub: "Latest Digital Tech" },
    ];

    return (
        <div className="relative z-30 px-6 -mt-20 mb-12">
            <div 
                ref={ref}
                className={`container mx-auto max-w-6xl glass-panel bg-white/80 shadow-glass rounded-3xl p-8 md:p-10 transform transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200/50 rtl:divide-x-reverse">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-center sm:justify-start gap-5 pt-4 md:pt-0 px-4 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand-teal/10 rounded-full transform group-hover:scale-110 transition-transform duration-500"></div>
                                <feature.icon className="relative w-12 h-12 text-brand-teal p-2.5" />
                            </div>
                            <div className="text-left rtl:text-right">
                                <h3 className="font-serif font-bold text-lg text-brand-dark group-hover:text-brand-teal transition-colors duration-300">{feature.label}</h3>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mt-0.5 font-semibold">{feature.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustBar;