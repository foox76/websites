import React, { useContext, useState } from 'react';
// FIX: Use relative path for imports from parent directory
import { LanguageContext } from '../App';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { WhatsAppIcon } from './Icons';
import { LocationImage } from '../types';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

interface ContactProps {
    googleMapsUrl: string;
    googleMapsDirectionsUrl: string;
    locationImages: LocationImage[];
}

const Contact: React.FC<ContactProps> = ({ googleMapsUrl, googleMapsDirectionsUrl, locationImages }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!langContext) return null;
    const { text, openWhatsappModal } = langContext;

    const clinicExteriorImageUrl = locationImages?.find(img => img.altKey === 'altClinicExterior')?.imageUrl || '';
    const clinicEntranceImageUrl = locationImages?.find(img => img.altKey === 'altClinicEntrance')?.imageUrl || '';
    
    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';
    const prefillText = text.whatsappPrefillGeneral || '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefillText)}`;
    const callUrl = `tel:${text.phone?.replace(/\s/g, '') || ''}`;

    const handleWhatsappClick = (e: React.MouseEvent) => {
        e.preventDefault();
        openWhatsappModal(prefillText, whatsappUrl);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formState);
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormState({ name: '', email: '', message: '' });
            // Reset success message after a few seconds
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 1000);
    };

    return (
        <section id="contact" className="py-20 md:py-28 bg-gray-50" ref={ref}>
            <div className="container mx-auto px-6">
                <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{text.contactTitle}</h2>
                    <p className="mt-4 text-lg text-gray-600">{text.contactSubtitle}</p>
                </div>

                <div className="mt-16 grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
                    {/* Contact Info */}
                    <div className={`lg:col-span-2 bg-white p-8 rounded-lg shadow-xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                        <h3 className="text-2xl font-serif font-bold text-brand-dark">{text.contactInfoTitle}</h3>
                        <p className="mt-2 text-gray-600">{text.contactInfoSubtitle}</p>
                        
                        <div className="mt-8">
                            <h4 className="font-bold text-brand-dark">{text.locationImagesTitle}</h4>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <img 
                                    src={optimizeCloudinaryUrl(clinicExteriorImageUrl)} 
                                    alt={text.altClinicExterior} 
                                    className="rounded-lg shadow-md aspect-square object-cover w-full h-full transition-transform duration-300 hover:scale-105" 
                                    loading="lazy"
                                />
                                <img 
                                    src={optimizeCloudinaryUrl(clinicEntranceImageUrl)} 
                                    alt={text.altClinicEntrance} 
                                    className="rounded-lg shadow-md aspect-square object-cover w-full h-full transition-transform duration-300 hover:scale-105" 
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-bold text-brand-dark">{text.locationMapTitle}</h4>
                            <div className="mt-4 rounded-lg shadow-md overflow-hidden border">
                                <iframe
                                    src={googleMapsUrl}
                                    width="100%"
                                    height="250"
                                    style={{ border: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Horizon Medical Center Location Map"
                                ></iframe>
                            </div>
                            <a 
                                href={googleMapsDirectionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 block w-full text-center bg-brand-teal text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-teal-light transition-all duration-300 shadow-sm"
                            >
                                {text.getDirectionsButton}
                            </a>
                        </div>

                        <div className="mt-8 space-y-6 text-gray-700">
                            <div>
                                <h4 className="font-bold text-brand-dark">{text.addressLabel}</h4>
                                <p className="mt-1">{text.address}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-brand-dark">{text.phoneLabel}</h4>
                                <a href={callUrl} className="mt-1 block text-brand-teal hover:underline text-left rtl:text-right">
                                    <span dir="ltr">{text.phone}</span>
                                </a>
                                <button
                                    onClick={handleWhatsappClick}
                                    className="mt-2 inline-flex items-center gap-2 bg-brand-whatsapp text-white px-4 py-2 rounded-full font-semibold hover:bg-brand-whatsapp-dark transition-colors duration-300 text-sm"
                                >
                                    <WhatsAppIcon className="h-4 w-4" />
                                    <span>{text.whatsappLabel}</span>
                                </button>
                            </div>
                             <div>
                                <h4 className="font-bold text-brand-dark">{text.emailLabel}</h4>
                                <a href={`mailto:${text.email || ''}`} className="mt-1 block text-brand-teal hover:underline">{text.email}</a>
                            </div>
                             <div>
                                <h4 className="font-bold text-brand-dark">{text.hoursLabel}</h4>
                                <p className="mt-1 whitespace-pre-line">{text.hours}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={`lg:col-span-3 bg-white p-8 rounded-lg shadow-xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                         <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">{text.contactFormTitle}</h3>
                         {isSubmitted ? (
                             <div className="flex items-center justify-center h-full text-center p-4 bg-green-50 text-green-800 rounded-md">
                                 <div>
                                     <h4 className="font-bold text-lg">{text.formSuccessTitle}</h4>
                                     <p>{text.formSuccessMessage}</p>
                                 </div>
                             </div>
                         ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 sr-only">{text.formNameLabel}</label>
                                    <input type="text" name="name" id="name" placeholder={text.formNameLabel} required value={formState.name} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-brand-teal/30" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">{text.formEmailLabel}</label>
                                    <input type="email" name="email" id="email" placeholder={text.formEmailLabel} required value={formState.email} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-brand-teal/30" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 sr-only">{text.formMessageLabel}</label>
                                    <textarea name="message" id="message" rows={5} placeholder={text.formMessageLabel} required value={formState.message} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-brand-teal/30"></textarea>
                                </div>
                                <div>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-teal text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-teal-light transition-all duration-300 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg hover:shadow-brand-teal/40">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {text.formSubmittingButton}
                                            </>
                                        ) : (
                                            text.formSubmitButton
                                        )}
                                    </button>
                                </div>
                            </form>
                         )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;