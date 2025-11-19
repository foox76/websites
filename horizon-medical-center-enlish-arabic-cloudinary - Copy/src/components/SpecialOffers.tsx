import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { useCountdown } from '../hooks/useCountdown';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { SpecialOffer } from '../types';
import { TimerIcon } from './Icons';

interface SpecialOffersProps {
    specialOffers: SpecialOffer[];
    endDate: string;
}

const CountdownUnit: React.FC<{ value: number; label: string; prevValue: number }> = ({ value, label, prevValue }) => (
    <div className="flex flex-col items-center">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white bg-brand-teal/80 rounded-lg shadow-lg overflow-hidden">
            {/* Animate on change */}
            <span key={value} className={`absolute animate-tick-up ${value !== prevValue ? 'animate-tick-up' : ''}`}>
                {String(value).padStart(2, '0')}
            </span>
        </div>
        <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
    </div>
);

const usePrevious = <T extends unknown>(value: T): T => {
    const ref = React.useRef<T>(value);
    React.useEffect(() => {
      ref.current = value;
    });
    return ref.current;
};

const SpecialOffers: React.FC<SpecialOffersProps> = ({ specialOffers, endDate }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const { days, hours, minutes, seconds } = useCountdown(endDate);
    
    const prevDays = usePrevious(days);
    const prevHours = usePrevious(hours);
    const prevMinutes = usePrevious(minutes);
    const prevSeconds = usePrevious(seconds);

    if (!langContext) return null;
    const { text, openWhatsappModal } = langContext;

    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';

    return (
        <section id="offers" className="py-20 md:py-28 bg-gray-100 bg-opacity-50" ref={ref}>
            <div className="container mx-auto px-6">
                <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{text.offersTitle}</h2>
                    <p className="mt-4 text-lg text-gray-600">{text.offersSubtitle}</p>
                </div>
                
                {/* Countdown Timer */}
                <div 
                    className={`mt-12 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
                    style={{ transitionDelay: '200ms' }}
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <TimerIcon className="h-6 w-6 text-brand-gold"/>
                        <h3 className="text-xl font-bold text-brand-dark">{text.offersTimerTitle}</h3>
                    </div>
                    <div className="flex justify-center items-start gap-3 sm:gap-6">
                        <CountdownUnit value={days} label={text.timerDays} prevValue={prevDays} />
                        <span className="text-4xl font-bold text-brand-teal/80 pt-3">:</span>
                        <CountdownUnit value={hours} label={text.timerHours} prevValue={prevHours} />
                        <span className="text-4xl font-bold text-brand-teal/80 pt-3">:</span>
                        <CountdownUnit value={minutes} label={text.timerMinutes} prevValue={prevMinutes} />
                        <span className="text-4xl font-bold text-brand-teal/80 pt-3">:</span>
                        <CountdownUnit value={seconds} label={text.timerSeconds} prevValue={prevSeconds} />
                    </div>
                </div>

                {/* Offer Cards */}
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    {specialOffers.map((offer, index) => {
                        const offerName = text[offer.titleKey as keyof typeof text];
                        const servicePrefillTemplate = text.whatsappPrefillService || 'Hello! I\'m interested in your {serviceName} offer.';
                        const dynamicPrefillText = servicePrefillTemplate.replace('{serviceName}', offerName);
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(dynamicPrefillText)}`;
                        
                        const handleOfferClick = (e: React.MouseEvent) => {
                            e.preventDefault();
                            openWhatsappModal(dynamicPrefillText, whatsappUrl);
                        };

                        return (
                            <div
                                key={offer.id}
                                className={`relative bg-white rounded-lg shadow-lg overflow-hidden group transition-all duration-700 ease-out hover:shadow-2xl hover:-translate-y-2 border-2 ${offer.tagKey ? 'border-brand-gold' : 'border-transparent'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${400 + index * 100}ms` }}
                            >
                                {offer.tagKey && (
                                    <div className="absolute top-0 -right-0.5 rtl:-left-0.5 rtl:right-auto z-10">
                                        <div className="w-32 h-8 absolute top-4 -right-8 rtl:-left-8 rtl:right-auto transform rotate-45 rtl:-rotate-45 bg-brand-gold text-white text-xs font-bold uppercase flex items-center justify-center shadow-md">
                                            {text[offer.tagKey as keyof typeof text]}
                                        </div>
                                    </div>
                                )}
                                <div className="p-8 text-center flex flex-col h-full">
                                    <h3 className="text-xl font-bold text-brand-dark h-14 flex items-center justify-center">{text[offer.titleKey as keyof typeof text]}</h3>
                                    <div className="my-6">
                                        <span className="text-5xl font-serif font-extrabold text-brand-teal">{offer.newPrice}</span>
                                        <span className="text-lg font-bold text-brand-teal/80 ml-1 rtl:mr-1">{text[offer.currencyKey as keyof typeof text]}</span>
                                    </div>
                                    <p className="text-gray-500">
                                        <span className="line-through">{offer.oldPrice} {text[offer.currencyKey as keyof typeof text]}</span>
                                        {offer.subtextKey && <span className="block text-sm mt-1">{text[offer.subtextKey as keyof typeof text]}</span>}
                                    </p>
                                    <div className="mt-auto pt-6">
                                        <button
                                            onClick={handleOfferClick}
                                            className={`w-full inline-block px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${offer.tagKey ? 'bg-brand-gold text-white hover:bg-brand-gold-dark' : 'bg-brand-teal text-white hover:bg-brand-teal-light'}`}
                                        >
                                            {text.offerCta}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SpecialOffers;