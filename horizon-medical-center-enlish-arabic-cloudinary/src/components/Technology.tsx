import React, { useContext } from 'react';
// FIX: Use relative path for imports from parent directory
import { LanguageContext } from '../App';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { TechnologyItem } from '../types';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

interface TechnologyProps {
    technology: TechnologyItem[];
}

const Technology: React.FC<TechnologyProps> = ({ technology }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    if (!langContext) return null;
    const { text } = langContext;

    return (
        <section id="technology" className="py-20 md:py-28 bg-white" ref={ref}>
            <div className="container mx-auto px-6">
                <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-4xl font-serif font-bold text-brand-dark sm:text-5xl bg-gradient-to-br from-brand-dark to-gray-600 bg-clip-text text-transparent">{text.techTitle}</h2>
                    <p className="mt-4 text-lg text-gray-600">{text.techSubtitle}</p>
                </div>
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {technology.map((tech, index) => (
                        <div
                            key={tech.id}
                            className={`rounded-lg overflow-hidden shadow-lg group transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-56">
                                <img src={optimizeCloudinaryUrl(tech.imageUrl)} alt={text[tech.nameKey as keyof typeof text]} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                     <h3 className="text-xl font-bold text-white leading-tight">{text[tech.nameKey as keyof typeof text]}</h3>
                                </div>
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-base text-gray-600">
                                    {text[tech.descriptionKey as keyof typeof text]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Technology;
