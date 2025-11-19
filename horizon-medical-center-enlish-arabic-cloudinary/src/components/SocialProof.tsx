import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { GoogleReviews } from '../types';
import { GoogleIcon, StarIcon } from './Icons';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface SocialProofProps {
    googleReviews: GoogleReviews;
}

const SocialProof: React.FC<SocialProofProps> = ({ googleReviews }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

    if (!langContext) return null;
    const { text } = langContext;

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={`full-${i}`} className="h-5 w-5 text-brand-gold" />);
        }
        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative h-5 w-5">
                    <StarIcon className="absolute text-gray-300" />
                    <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                        <StarIcon className="text-brand-gold" />
                    </div>
                </div>
            );
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
        }
        return stars;
    };

    return (
        <section ref={ref} className="bg-white relative z-10 -mt-20 rounded-t-3xl shadow-2xl pt-16 pb-16">
            <div className="container mx-auto px-6">
                 <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'}`}>
                    <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                        {text.socialProofTitle}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">{text.socialProofSubtitle}</p>
                </div>

                 <div 
                    className={`transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: '200ms' }}
                 >
                    <a 
                        href={googleReviews.reviewsPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg shadow-lg transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl w-full max-w-sm mx-auto tappable"
                    >
                        <div className="flex items-center text-4xl md:text-5xl font-bold text-brand-dark">
                            <GoogleIcon className="h-8 w-8 mr-2" />
                            <span>{googleReviews.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex mt-2">{renderStars(googleReviews.averageRating)}</div>
                        <p className="mt-2 text-sm md:text-base text-gray-600 font-medium">
                            {text.basedOnReviews.replace('{total}', googleReviews.totalReviews.toString())}
                        </p>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default SocialProof;