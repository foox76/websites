import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
// FIX: Use relative path for imports from parent directory
import { Service } from '../types';
import { LanguageContext } from '../App';
import SchemaMarkup from './SchemaMarkup';
import { WhatsAppIcon, MapPinIcon } from './Icons';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


interface ServicePageProps {
  service: Service;
}

const ServicePage: React.FC<ServicePageProps> = ({ service }) => {
    const context = useContext(LanguageContext);
    if (!context) return null;
    const { text, content, openWhatsappModal } = context;

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": text[service.titleKey as keyof typeof text],
        "provider": {
            "@type": "Dentist",
            "name": text.clinicName
        },
        "description": text[service.longDescriptionKey as keyof typeof text],
        "name": text[service.titleKey as keyof typeof text]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": service.faqs.map(faq => ({
            "@type": "Question",
            "name": text[faq.questionKey as keyof typeof text],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": text[faq.answerKey as keyof typeof text]
            }
        }))
    };

    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';
    
    // Context-aware WhatsApp message
    const serviceName = text[service.titleKey as keyof typeof text];
    const servicePrefillTemplate = text.whatsappPrefillService || '';
    const dynamicPrefillText = servicePrefillTemplate.replace('{serviceName}', serviceName);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(dynamicPrefillText)}`;

    const handleWhatsappClick = (e: React.MouseEvent) => {
        e.preventDefault();
        openWhatsappModal(dynamicPrefillText, whatsappUrl);
    };

    // Logic to map service to specialist
    // This is hardcoded logic based on the known staff, but improves conversion by 
    // showing the specific expert for the field.
    let specialistId = 1; // Default to Dr. Nihal (Lead Dentist)
    if (service.id === 'orthodontics') {
        specialistId = 2; // Dr. Iman (Orthodontist)
    }

    const specialist = content.staff.find(s => s.id === specialistId);


    return (
        <div className="animate-fade-in">
            <div style={{ display: 'none' }}>
                <SchemaMarkup schema={serviceSchema} />
                {service.faqs && service.faqs.length > 0 && <SchemaMarkup schema={faqSchema} />}
            </div>
            {/* Hero Section */}
            <section className="bg-brand-dark text-white pt-32 pb-20">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold">
                        {text[service.titleKey as keyof typeof text]}
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                        {text[service.descriptionKey as keyof typeof text]}
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Left/Main Column */}
                        <div className="md:col-span-2">
                            <h2 className="text-3xl font-serif font-bold text-brand-dark">{text[service.titleKey as keyof typeof text]}</h2>
                            <p className="mt-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                {text[service.longDescriptionKey as keyof typeof text]}
                            </p>
                             <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleWhatsappClick}
                                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-brand-whatsapp text-white px-6 sm:px-8 py-3 rounded-full font-bold text-base sm:text-lg hover:bg-brand-whatsapp-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-brand-whatsapp/40"
                                >
                                    <WhatsAppIcon className="h-6 w-6" />
                                    <span>{text.whatsappLabel}</span>
                                </button>
                                <a 
                                    href={content.googleMapsDirectionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-brand-teal text-white px-6 sm:px-8 py-3 rounded-full font-bold text-base sm:text-lg hover:bg-brand-teal-light transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-brand-teal/40"
                                >
                                    <MapPinIcon className="h-6 w-6" />
                                    <span>{text.getDirectionsButton}</span>
                                </a>
                            </div>
                        </div>
                        {/* Right/Benefits Column */}
                        <div className="space-y-8">
                            {/* Benefits Box */}
                            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
                                <h3 className="text-2xl font-serif font-bold text-brand-dark">{text.benefitsTitle}</h3>
                                <ul className="mt-6 space-y-4">
                                    {service.benefits.map((benefitKey, i) => (
                                        <li key={i} className="flex items-start">
                                            <svg className="h-6 w-6 text-green-500 shrink-0 mt-0.5 rtl:ml-3 ltr:mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            <span className="text-gray-700">{text[benefitKey as keyof typeof text]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Specialist Box - Marketing Injection */}
                            {specialist && (
                                <div className="bg-white border border-gray-100 p-6 rounded-lg shadow-xl">
                                    <h3 className="text-xl font-bold text-brand-dark mb-4">{text.meetSpecialistTitle}</h3>
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={optimizeCloudinaryUrl(specialist.imageUrl)} 
                                            alt={specialist.name} 
                                            className="w-16 h-16 rounded-full object-cover shadow-md"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">{specialist.name}</p>
                                            <p className="text-sm text-brand-teal">{text[specialist.titleKey as keyof typeof text]}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600 italic">
                                        "{text.meetSpecialistSubtitle}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* FAQ Section */}
            <section className="py-20 md:py-28 bg-gray-50">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center">
                        <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{text.faqTitle}</h2>
                    </div>
                    <div className="mt-12 space-y-4">
                        {service.faqs.map((faq, i) => (
                             <div key={i} className="border-b border-gray-200 py-4">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center text-left rtl:text-right">
                                    <h3 className="text-lg font-semibold text-brand-dark">{text[faq.questionKey as keyof typeof text]}</h3>
                                    <ChevronDownIcon className={`w-6 h-6 text-brand-teal transform transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                                    <p className="text-gray-600 leading-relaxed">{text[faq.answerKey as keyof typeof text]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             <div className="py-12 bg-white text-center">
                <Link to="/#services" className="text-brand-teal font-semibold hover:underline">
                   &larr; {text.backToServices}
                </Link>
            </div>
        </div>
    );
};

export default ServicePage;