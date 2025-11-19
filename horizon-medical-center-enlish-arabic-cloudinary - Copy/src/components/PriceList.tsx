import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { TreatmentCategory } from '../types';

interface TreatmentsListProps {
    treatments: TreatmentCategory[];
}

const TreatmentsList: React.FC<TreatmentsListProps> = ({ treatments }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    if (!langContext) return null;
    const { text } = langContext;

    return (
        <section id="treatments" className="py-20 md:py-28 bg-white" ref={ref}>
            <div className="container mx-auto px-6">
                <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{text.treatmentsTitle}</h2>
                    <p className="mt-4 text-lg text-gray-600">{text.treatmentsSubtitle}</p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto space-y-12">
                    {treatments.map((category, index) => (
                        <div 
                            key={category.id}
                            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{ transitionDelay: `${index * 150}ms` }}
                        >
                            <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark mb-4 sm:mb-6 border-b-2 border-brand-teal pb-2 sm:pb-3">
                                {text[category.categoryKey as keyof typeof text]}
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {category.items.map((item) => (
                                    <li key={item.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:ring-1 hover:ring-brand-teal/50 hover:shadow-brand-teal/10">
                                        <span className="text-base sm:text-lg text-gray-800">{text[item.serviceKey as keyof typeof text]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TreatmentsList;
