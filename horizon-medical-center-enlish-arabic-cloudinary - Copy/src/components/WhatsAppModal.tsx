import React, { useContext } from 'react';
import { WhatsAppIcon, PhoneIcon } from './Icons';
import { LanguageContext } from '../App';
import { trackEvent, CONVERSION_EVENTS } from '../utils/analytics';

interface WhatsAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    whatsappUrl: string;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, message, whatsappUrl }) => {
    const langContext = useContext(LanguageContext);

    if (!isOpen || !langContext) {
        return null;
    }

    const { text } = langContext;
    const phoneNumberRaw = text.phone?.replace(/\s/g, '') || '';
    const callUrl = `tel:${phoneNumberRaw}`;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-modal-title"
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto p-6 text-center transform transition-all duration-300 ease-out scale-95 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-brand-whatsapp text-white p-3 rounded-full">
                        <WhatsAppIcon className="h-8 w-8" />
                    </div>
                </div>
                <h2 id="whatsapp-modal-title" className="text-2xl font-serif font-bold text-brand-dark">{text.whatsappModalTitle}</h2>
                <p className="mt-2 text-gray-600">{text.whatsappModalSubtitle}</p>

                <div className="mt-6 p-4 bg-gray-100 rounded-md text-left rtl:text-right text-sm text-gray-800 border">
                    {message}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href={callUrl}
                        onClick={() => trackEvent(CONVERSION_EVENTS.CALL_CLICK, { location: 'whatsapp_modal' })}
                        className="inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors duration-300"
                    >
                        <PhoneIcon className="h-5 w-5" />
                        <span>{text.whatsappModalCtaSecondary}</span>
                    </a>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent(CONVERSION_EVENTS.WHATSAPP_CLICK, { location: 'whatsapp_modal' })}
                        className="inline-flex items-center justify-center gap-2 bg-brand-whatsapp text-white px-4 py-3 rounded-full font-semibold hover:bg-brand-whatsapp-dark transition-colors duration-300"
                    >
                        <WhatsAppIcon className="h-5 w-5" />
                        <span>{text.whatsappModalCtaPrimary}</span>
                    </a>
                </div>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-300" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default WhatsAppModal;