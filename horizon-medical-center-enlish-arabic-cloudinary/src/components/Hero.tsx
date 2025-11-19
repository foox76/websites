import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from '../App';
import { WhatsAppIcon, PhoneIcon, StarIcon, GoogleIcon } from './Icons';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { Link } from 'react-router-dom';

interface HeroProps {
    heroImageUrl: string;
}

const Hero: React.FC<HeroProps> = ({ heroImageUrl }) => {
    const langContext = useContext(LanguageContext);
    const [isLoaded, setIsLoaded] = useState(false);

    if (!langContext) return null;

    const { text, openWhatsappModal } = langContext;
    const optimizedImageUrl = optimizeCloudinaryUrl(heroImageUrl);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const phoneNumberRaw = text.phone?.replace(/\s/g, '') || '';
    const prefillText = text.whatsappPrefillGeneral || '';
    const whatsappUrl = `https://wa.me/${phoneNumberRaw.replace('+', '')}?text=${encodeURIComponent(prefillText)}`;
    const callUrl = `tel:${phoneNumberRaw}`;

    const handleWhatsappClick = (e: React.MouseEvent) => {
        e.preventDefault();
        openWhatsappModal(prefillText, whatsappUrl);
    };

    return (
        <section id="home" className="relative h-[110vh] min-h-[700px] flex items-end justify-start overflow-hidden pb-32 md:pb-40">
            {/* Parallax Background */}
            <div className="absolute inset-0 z-0">
                <div
                    className="w-full h-full parallax-bg transform scale-105 transition-transform duration-[20s] ease-out"
                    style={{
                        backgroundImage: `url(${optimizedImageUrl})`,
                    }}
                    aria-label={text.altClinicExterior || 'Clinic exterior'}
                    role="img"
                ></div>
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 md:px-12">
                <div className="max-w-3xl">
                    {/* Social Proof Badge */}
                    <div className={`inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="bg-white p-1 rounded-full">
                            <GoogleIcon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex text-brand-gold">
                                {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-3.5 h-3.5 fill-current" />)}
                            </div>
                            <span className="text-white text-xs font-bold tracking-wide ml-2 border-l border-white/20 pl-2">{text.socialProofSubtitle?.split('on Google')[0] || "Rated 4.9/5"}</span>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold leading-[0.9] text-white mb-6 tracking-tight">
                        {text.heroTitle.split(' ').map((word, i) => (
                            <span
                                key={i}
                                className={`inline-block transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                {i === 1 ? <span className="text-gradient-gold italic pr-2">{word}</span> : `${word} `}
                            </span>
                        ))}
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`mt-6 text-lg sm:text-xl text-gray-200 max-w-xl leading-relaxed transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        {text.heroSubtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className={`mt-10 flex flex-col sm:flex-row gap-5 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <button
                            onClick={handleWhatsappClick}
                            className="group relative overflow-hidden bg-brand-gold text-white px-8 py-4 rounded-full font-bold text-lg shadow-glow-gold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <WhatsAppIcon className="h-5 w-5" />
                                {text.whatsappLabel}
                            </span>
                            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                        </button>

                        <a
                            href={callUrl}
                            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                        >
                            <PhoneIcon className="h-5 w-5 text-brand-gold" />
                            {text.heroCtaSecondary}
                        </a>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 right-10 md:right-20 hidden md:flex items-center gap-4 animate-fade-in-up delay-1000">
                <span className="text-white/60 text-sm uppercase tracking-widest transform -rotate-90 origin-right translate-x-full">Scroll Down</span>
                <div className="w-[1px] h-24 bg-gradient-to-b from-brand-gold to-transparent"></div>
            </div>
        </section>
    );
};

export default Hero;