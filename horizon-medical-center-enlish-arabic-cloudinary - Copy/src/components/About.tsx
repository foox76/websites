import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import useTilt from '../hooks/useTilt';
import { StaffMember, TextContent } from '../types';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

interface AboutProps {
  staff: StaffMember[];
}

const StaffCard: React.FC<{ staffMember: StaffMember, text: TextContent, isVisible: boolean, index: number }> = ({ staffMember, text, isVisible, index }) => {
    const { ref, style, handleMouseMove, handleMouseLeave } = useTilt();
    return (
        <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...style, transitionDelay: `${400 + index * 100}ms` }}
            className={`bg-white p-8 rounded-lg shadow-xl flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left rtl:sm:text-right tilt-card hover:shadow-2xl hover:shadow-brand-teal/20 tappable transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'}`}
        >
            <img className="h-40 w-40 rounded-full object-cover shadow-lg shrink-0" src={optimizeCloudinaryUrl(staffMember.imageUrl)} alt={staffMember.name} loading="lazy" />
            <div>
                <h3 className="text-2xl font-serif font-bold text-brand-dark">{staffMember.name}</h3>
                <p className="text-brand-teal font-semibold mt-1">{text[staffMember.titleKey as keyof typeof text]}</p>
                <p className="mt-3 text-gray-600">{text[staffMember.bioKey as keyof typeof text]}</p>
            </div>
        </div>
    );
};


const About: React.FC<AboutProps> = ({ staff }) => {
  const langContext = useContext(LanguageContext);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  if (!langContext) return null;
  const { text, content } = langContext;

  return (
    <section id="about" className="relative py-20 md:py-28 overflow-hidden" ref={ref}>
      {/* Parallax Background with Overlay */}
      {content.aboutBgUrl && (
         <div className="absolute inset-0 z-0">
            <div 
                className="w-full h-full parallax-bg" 
                style={{ backgroundImage: `url(${optimizeCloudinaryUrl(content.aboutBgUrl)})` }}
            ></div>
            {/* Marketing Upgrade: Frosted Glass Effect */}
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
         </div>
      )}
      <div className="container mx-auto px-6 relative z-10">
        <div className={`transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'} text-center max-w-3xl mx-auto`}>
          <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
            {text.aboutTitle}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{text.aboutSubtitle}</p>
        </div>
        
        <div className={`mt-16 max-w-4xl mx-auto bg-gray-50/90 backdrop-blur-sm p-10 rounded-lg shadow-xl text-center transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'}`} style={{ transitionDelay: '200ms' }}>
            <h3 className="text-3xl font-serif font-bold text-brand-dark">{text.clinicPhilosophy}</h3>
            <div className="w-20 h-1 bg-brand-gold mx-auto my-6"></div>
            <p className="text-gray-700 leading-relaxed">{text.clinicPhilosophyText}</p>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-2 max-w-5xl mx-auto">
          {staff.map((staffMember, index) => (
            <StaffCard 
              key={staffMember.id}
              staffMember={staffMember}
              text={text}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;