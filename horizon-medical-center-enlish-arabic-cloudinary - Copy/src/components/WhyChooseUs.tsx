import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { WhyChooseUsItem } from '../types';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { CertifiedDentistIcon, TechnologyIcon, ComfortableAmbianceIcon } from './Icons';

interface WhyChooseUsProps {
  whyChooseUs: WhyChooseUsItem[];
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
    'TechnologyIcon': TechnologyIcon,
    'CertifiedDentistIcon': CertifiedDentistIcon,
    'ComfortableAmbianceIcon': ComfortableAmbianceIcon
};

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ whyChooseUs }) => {
  const langContext = useContext(LanguageContext);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  if (!langContext) return null;
  const { text, content } = langContext;

  return (
    <section ref={ref} id="why-us" className="relative py-24 md:py-32 overflow-hidden">
      {/* Parallax Background */}
      {content.whyChooseUsBgUrl && (
         <div className="absolute inset-0 z-0">
            <div 
                className="w-full h-full parallax-bg" 
                style={{ backgroundImage: `url(${optimizeCloudinaryUrl(content.whyChooseUsBgUrl)})` }}
            ></div>
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[2px]"></div>
         </div>
      )}

      <div className="container mx-auto px-6 relative z-10">
        <div className={`mb-16 md:mb-24 max-w-3xl transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight">
            <span className="block text-brand-gold text-2xl font-sans font-bold tracking-widest uppercase mb-4">{text.whyChooseUsTitle}</span>
            {text.whyChooseUsSubtitle}
          </h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {whyChooseUs.map((item, index) => {
            const Icon = iconMap[item.icon] || TechnologyIcon;
            // Make the second item span 2 columns for visual interest (Bento style)
            const isWide = index === 1; 
            
            return (
              <div 
                key={item.id} 
                className={`
                    relative overflow-hidden rounded-3xl p-8 md:p-10 
                    bg-white/5 border border-white/10 backdrop-blur-md 
                    hover:bg-white/10 transition-all duration-500 ease-out group
                    ${isWide ? 'md:col-span-2' : 'md:col-span-1'}
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-gold/20 rounded-full blur-2xl group-hover:bg-brand-gold/30 transition-colors duration-500"></div>
                
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-teal/70 flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-3">{text[item.titleKey as keyof typeof text]}</h3>
                    <p className="text-gray-300 leading-relaxed">{text[item.descriptionKey as keyof typeof text]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;