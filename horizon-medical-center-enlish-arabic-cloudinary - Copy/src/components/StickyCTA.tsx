import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../App';
import { WhatsAppIcon } from './Icons';
import { trackEvent, CONVERSION_EVENTS } from '../utils/analytics';

interface StickyCTAProps {
    isVisible: boolean;
    pulseTrigger: number;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ isVisible, pulseTrigger }) => {
    const context = useContext(LanguageContext);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (pulseTrigger > 1) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [pulseTrigger]);

    if (!context) return null;
    const { text, openWhatsappModal } = context;

    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';
    const prefillText = text.whatsappPrefillGeneral || '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefillText)}`;

    const handleWhatsappClick = (e: React.MouseEvent) => {
        e.preventDefault();
        trackEvent(CONVERSION_EVENTS.WHATSAPP_CLICK, { location: 'sticky_cta' });
        openWhatsappModal(prefillText, whatsappUrl);
    };

    const handleCallClick = () => {
        trackEvent(CONVERSION_EVENTS.CALL_CLICK, { location: 'sticky_cta' });
        window.location.href = `tel:${phoneNumber}`;
    };

    return (
        <div
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
            aria-hidden={!isVisible}
        >
            <div className="flex gap-3">
                <button
                    onClick={handleCallClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-brand-dark border border-gray-200 px-4 py-3 rounded-full font-bold text-sm active:scale-95 transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{text.heroCtaSecondary}</span>
                </button>

                <button
                    onClick={handleWhatsappClick}
                    className={`flex-[2] flex items-center justify-center gap-2 bg-brand-whatsapp text-white px-4 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform ${isAnimating ? 'animate-subtle-pulse-whatsapp ring-4 ring-brand-whatsapp/30' : ''}`}
                >
                    <WhatsAppIcon className="h-5 w-5" />
                    <span>{text.bookAppointment || "Book Offer"}</span>
                </button>
            </div>
        </div>
    );
};

export default StickyCTA;