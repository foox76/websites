import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../App';
import SchemaMarkup from './SchemaMarkup';

const Footer: React.FC = () => {
    const context = useContext(LanguageContext);
    if (!context) return null;
    const { text, content } = context;

    const callUrl = `tel:${text.phone?.replace(/\s/g, '') || ''}`;

    const dentistSchema = {
      "@context": "https://schema.org",
      "@type": "Dentist",
      "name": text.clinicName,
      "image": content.logoUrl,
      "url": "https://hoorizonmedical.com", 
      "telephone": text.phone,
      "email": text.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Flat 12, First Floor, Souq Al-Khoud",
        "addressLocality": "Seeb",
        "postalCode": "132",
        "addressCountry": "OM"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 23.632237,
        "longitude": 58.198057
      },
      "priceRange": "$$"
    };

    return (
        <footer className="bg-[#0a0a0a] text-gray-400 pt-20 pb-10 border-t border-white/5">
            <SchemaMarkup schema={dentistSchema} />
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 pr-10">
                        <h3 className="text-2xl font-serif font-bold text-white mb-6">{text.clinicName}</h3>
                        <p className="text-gray-500 leading-relaxed max-w-sm mb-8">{text.footerAbout}</p>
                        <div className="flex gap-4">
                            {/* Social placeholders could go here */}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">{text.quickLinks}</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">{text.navHome}</Link></li>
                            <li><Link to="/services" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">{text.navServices}</Link></li>
                            <li><Link to="/about" className="hover:text-brand-gold transition-colors block transform hover:translate-x-1 duration-300">{text.navAbout}</Link></li>
                            <li><Link to="/offers" className="text-brand-gold hover:text-white transition-colors block transform hover:translate-x-1 duration-300 font-semibold">{text.navOffers}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">{text.contactInfoTitle}</h4>
                        <address className="not-italic space-y-4">
                           <p className="leading-relaxed">{text.address}</p>
                           <p><a href={callUrl} className="text-white hover:text-brand-gold transition-colors font-medium text-lg" dir="ltr">{text.phone}</a></p>
                           <p><a href={`mailto:${text.email || ''}`} className="hover:text-brand-gold transition-colors">{text.email}</a></p>
                        </address>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} {text.clinicName}. {text.allRightsReserved}</p>
                    <div className="flex gap-6">
                        <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;