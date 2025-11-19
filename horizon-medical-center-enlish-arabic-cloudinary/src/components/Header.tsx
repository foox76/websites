import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import { LanguageContext } from '../App';
import { View } from '../types';

const Header: React.FC = () => {
    const context = useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);
    
    if (!context) return null;
    const { text, openWhatsappModal } = context;

    const navLinks = [
        { id: View.Home, label: text.navHome, href: '/' },
        { id: View.Services, label: text.navServices, href: '/services' },
        { id: View.About, label: text.navAbout, href: '/about' },
        { id: View.Gallery, label: text.navGallery, href: '/gallery' },
        { id: View.Reviews, label: text.navReviews, href: '/reviews' },
        { id: View.Treatments, label: text.navTreatments, href: '/treatments' },
        { id: View.Offers, label: text.navOffers, href: '/offers' },
        { id: View.Contact, label: text.navContact, href: '/contact' }
    ];

    const handleLinkClick = () => {
        setIsOpen(false);
    };
    
    const isDarkBg = isScrolled || isOpen;
    
    const navLinkClasses = `font-medium transition-colors duration-300 ${isDarkBg ? 'text-white hover:text-brand-teal' : 'text-brand-dark hover:text-brand-teal'}`;
    const activeNavLinkClasses = "!text-brand-teal font-bold";

    const renderDesktopLink = (link: typeof navLinks[0]) => (
        <NavLink 
            key={link.id} 
            to={link.href}
            onClick={handleLinkClick}
            className={({ isActive }) => `${navLinkClasses} ${isActive && link.href !== '/' ? activeNavLinkClasses : ''}`}
        >
            {link.label}
        </NavLink>
    );

    const renderMobileLink = (link: typeof navLinks[0], index: number) => (
        <Link 
            key={link.id} 
            to={link.href}
            onClick={handleLinkClick}
            className="text-3xl font-serif text-white opacity-0 animate-menu-link-slide hover:text-brand-teal transition-colors duration-300 tappable"
            style={{ animationDelay: `${150 + index * 75}ms` }}
        >
            {link.label}
        </Link>
    );

    const phoneNumber = text.phone?.replace(/\s|\+/g, '') || '';
    const prefillText = text.whatsappPrefillGeneral || '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefillText)}`;

    const handleWhatsappClick = (e: React.MouseEvent) => {
        e.preventDefault();
        openWhatsappModal(prefillText, whatsappUrl);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDarkBg ? 'bg-brand-dark shadow-lg' : 'bg-transparent'}`}>
                {/* Announcement Bar - FOMO Trigger */}
                <div className="bg-brand-gold text-white text-center py-2 px-4 text-sm font-medium cursor-pointer relative z-50">
                    <Link to="/offers" className="hover:underline flex items-center justify-center gap-2">
                        <span>{text.announcementBarText || "Special Offers Available!"}</span>
                        <span className="bg-white text-brand-gold px-2 py-0.5 rounded-full text-xs font-bold uppercase">{text.announcementBarLinkText || "View"}</span>
                    </Link>
                </div>

                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" onClick={handleLinkClick} className={`text-2xl font-serif font-bold transition-colors duration-300 ${isDarkBg ? 'text-white' : 'text-brand-dark'}`}>
                            {text.clinicName}
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center space-x-6">
                            {navLinks.map(renderDesktopLink)}
                            <LanguageToggle />
                            {/* Permanent CTA - Always Visible */}
                            <button
                                onClick={handleWhatsappClick}
                                className="bg-brand-whatsapp text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-whatsapp-dark transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg tappable flex items-center gap-2"
                            >
                                <span>{text.whatsappLabel}</span>
                            </button>
                        </nav>

                        {/* Mobile Nav Toggle */}
                        <div className="lg:hidden flex items-center gap-4">
                             <LanguageToggle />
                             <button onClick={() => setIsOpen(!isOpen)} className={`focus:outline-none transition-colors duration-300 ${isDarkBg ? 'text-white' : 'text-brand-dark'}`}>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isOpen ? (
                                        <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Menu Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 bg-brand-dark/95 backdrop-blur-sm z-40 animate-menu-fade-in pt-20">
                    <nav className="h-full flex flex-col items-center justify-center space-y-8">
                        {navLinks.map(renderMobileLink)}
                    </nav>
                </div>
            )}
        </>
    );
};

export default Header;