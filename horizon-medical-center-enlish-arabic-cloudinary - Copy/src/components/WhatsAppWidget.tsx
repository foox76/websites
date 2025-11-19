import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { WhatsAppIcon } from './Icons';

interface WhatsAppWidgetProps {
    isStickyCtaVisible: boolean;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ isStickyCtaVisible }) => {
    const context = useContext(LanguageContext);
    if (!context) return null;
    const { text } = context;

    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';
    if (!phoneNumber) return null;

    const prefillText = encodeURIComponent(text.whatsappPrefill || '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${prefillText}`;

    const baseClasses = "fixed rtl:left-6 ltr:right-6 z-40 bg-brand-whatsapp text-white p-4 rounded-full shadow-lg hover:bg-brand-whatsapp-dark transform animate-pulse-whatsapp";
    const positionClasses = isStickyCtaVisible
        ? 'bottom-24' // Raised position: 6rem from bottom
        : 'bottom-6';  // Default position: 1.5rem from bottom

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${positionClasses} transition-all duration-500 ease-in-out`}
            aria-label={text.chatOnWhatsApp || 'Chat on WhatsApp'}
        >
            <WhatsAppIcon className="h-8 w-8" />
        </a>
    );
};

export default WhatsAppWidget;