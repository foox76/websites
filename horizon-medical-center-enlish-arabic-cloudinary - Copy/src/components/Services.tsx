import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../App';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { Service } from '../types';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

interface ServicesProps {
  services: Service[];
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  const langContext = useContext(LanguageContext);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  if (!langContext) return null;
  const { text } = langContext;

  return (
    <section id="services" className="py-24 md:py-32 bg-brand-gray relative overflow-hidden" ref={ref}>
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-brand-teal/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div 
          className={`text-center max-w-3xl mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="text-brand-gold font-bold tracking-[0.2em] uppercase text-sm">{text.ourServices}</span>
          <h2 className="mt-3 text-4xl font-serif font-bold sm:text-6xl text-brand-dark">
            {text.servicesIntro}
          </h2>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out tappable ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-gold/30 rounded-2xl transition-all duration-500 z-20 pointer-events-none"></div>

              <div className="relative overflow-hidden aspect-[4/5]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                <img 
                  src={optimizeCloudinaryUrl(service.imageUrl)} 
                  alt={text[service.titleKey as keyof typeof text]} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                  loading="lazy"
                />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                        {text[service.titleKey as keyof typeof text]}
                    </h3>
                    <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {text[service.descriptionKey as keyof typeof text]}
                    </p>
                    <Link 
                        to={`/services/${service.id}`}
                        className="inline-block mt-4 text-brand-gold text-sm font-bold uppercase tracking-wider hover:text-white transition-colors"
                    >
                        {text.viewDetails} &rarr;
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;