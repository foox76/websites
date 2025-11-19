import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { StarIcon, QuoteIcon, GoogleIcon } from './Icons';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { Review, GoogleReviews, TextContent } from '../types';
import SchemaMarkup from './SchemaMarkup';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

interface TestimonialsProps {
    testimonials: Review[];
    googleReviews: GoogleReviews;
}

const TestimonialCard: React.FC<{ testimonial: Review, text: TextContent, isVisible: boolean, index: number }> = ({ testimonial, text, isVisible, index }) => {
    return (
        <div 
            className={`glass-panel-dark p-8 rounded-2xl relative flex flex-col hover:-translate-y-2 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${300 + index * 150}ms` }}
        >
            <div className="absolute -top-6 left-8 bg-brand-gold p-3 rounded-xl shadow-lg">
                <QuoteIcon className="h-6 w-6 text-white" />
            </div>
            
            <div className="mt-6 mb-6 flex-grow">
                <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 text-brand-gold fill-current" />
                    ))}
                </div>
                <p className="text-lg text-gray-200 font-serif italic leading-relaxed">“{text[testimonial.quoteKey as keyof typeof text]}”</p>
            </div>
            
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
               <img src={optimizeCloudinaryUrl(testimonial.avatarUrl)} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover border-2 border-brand-gold" loading="lazy" />
                <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-xs text-brand-gold uppercase tracking-wider">Verified Patient</div>
                </div>
            </div>
        </div>
    );
};

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials, googleReviews }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    if (!langContext) return null;
    const { text, content } = langContext;

    return (
        <section id="reviews" className="py-24 md:py-32 relative bg-brand-dark overflow-hidden" ref={ref}>
             {/* Parallax Background */}
            {content.testimonialsBgUrl && (
                <div className="absolute inset-0 z-0 opacity-40">
                    <div 
                        className="w-full h-full parallax-bg grayscale" 
                        style={{ backgroundImage: `url(${optimizeCloudinaryUrl(content.testimonialsBgUrl)})` }}
                    ></div>
                </div>
            )}
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className={`max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                        <span className="text-brand-teal font-bold tracking-[0.2em] uppercase text-sm block mb-4">{text.socialProofTitle}</span>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white">{text.testimonialsTitle}</h2>
                    </div>

                    <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <a 
                            href={googleReviews.reviewsPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 group"
                        >
                            <GoogleIcon className="h-6 w-6" />
                            <div className="text-left">
                                <div className="text-white font-bold leading-none">{googleReviews.averageRating} Stars</div>
                                <div className="text-gray-400 text-xs">Based on {googleReviews.totalReviews} Reviews</div>
                            </div>
                            <span className="text-white group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </a>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
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

export default Testimonials;