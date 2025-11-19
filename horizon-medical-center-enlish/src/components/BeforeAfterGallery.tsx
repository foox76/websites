import React, { useContext, useState, useRef } from 'react';
// FIX: Use relative path for imports from parent directory
import { LanguageContext } from '../App';
import { Language, GalleryItem, TextContent } from '../types';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

const BeforeAfterCard: React.FC<{ item: GalleryItem, text: TextContent }> = ({ item, text }) => {
    const context = useContext(LanguageContext);
    if (!context) return null;
    const { lang } = context;
    const isRtl = lang === Language.AR;

    const [revealPercent, setRevealPercent] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate cursor position as a percentage from the left edge of the container.
        const rawPercent = (clientX - rect.left) / rect.width;
        
        // The reveal percentage should directly correspond to the cursor's
        // horizontal position, making the drag direction feel natural.
        // RTL/LTR differences are now handled purely in the CSS styles.
        const newRevealPercent = rawPercent * 100;
        
        setRevealPercent(Math.max(0, Math.min(100, newRevealPercent)));
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        handleMove(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // The clipper now reveals the "after" image, which is on the top layer.
    // LTR: "after" is on the right, so we clip the top layer from the left, revealing its right side.
    // RTL: "after" is on the left, so we clip the top layer from the right, revealing its left side.
    const clipperStyle = {
        clipPath: isRtl
            ? `inset(0 ${100 - revealPercent}% 0 0)`
            : `inset(0 0 0 ${revealPercent}%)`
    };

    // The handle position should directly follow the cursor percentage.
    const handleContainerStyle = {
        left: `${revealPercent}%`,
    };
    

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl overflow-hidden group">
            <div 
                ref={containerRef}
                className="relative w-full aspect-[4/3] rounded-md overflow-hidden select-none cursor-ew-resize"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
            >
                {/* The "before" image is now the base layer. */}
                <img src={optimizeCloudinaryUrl(item.beforeImageUrl)} alt="Before treatment" className="absolute inset-0 w-full h-full object-cover" draggable="false" loading="lazy" />
                {/* The "after" image is the top layer, which gets clipped to reveal the base layer. */}
                <div className="absolute inset-0 w-full h-full" style={clipperStyle}>
                    <img src={optimizeCloudinaryUrl(item.afterImageUrl)} alt="After treatment" className="absolute inset-0 w-full h-full object-cover" draggable="false" loading="lazy" />
                </div>
                
                {/* The vertical slider line and handle. */}
                <div className="absolute top-0 bottom-0 bg-white w-1 pointer-events-none -translate-x-1/2" style={handleContainerStyle}>
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white h-10 w-10 rounded-full shadow-lg flex items-center justify-center border-2 border-brand-teal animate-subtle-pulse">
                        <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                    </div>
                </div>

                 <div className={`absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full transition-opacity duration-300 pointer-events-none ${isDragging ? 'opacity-0' : 'opacity-100'}`}>BEFORE</div>
                 <div className={`absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full transition-opacity duration-300 pointer-events-none ${isDragging ? 'opacity-0' : 'opacity-100'}`}>AFTER</div>
            </div>
            <h3 className="mt-5 text-xl font-bold text-brand-dark text-center">{text[item.treatmentKey as keyof typeof text]}</h3>
        </div>
    )
}

interface BeforeAfterGalleryProps {
    gallery: GalleryItem[];
}

const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({ gallery }) => {
    const langContext = useContext(LanguageContext);
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    if (!langContext) return null;
    const { text } = langContext;

    return (
        <section id="gallery" className="py-20 md:py-28 bg-gray-50 section-divider-bottom" ref={ref}>
            <div className="container mx-auto px-6 relative z-10">
                <div className={`transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'} text-center max-w-3xl mx-auto`}>
                    <h2 className="text-4xl font-serif font-bold sm:text-5xl bg-gradient-to-r from-brand-dark via-brand-teal to-gray-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">{text.galleryTitle}</h2>
                    <p className="mt-4 text-lg text-gray-600">{text.gallerySubtitle}</p>
                </div>
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
                    {gallery.map((item, index) => (
                        <div 
                            key={item.id}
                            className={`transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'}`}
                            style={{ transitionDelay: `${150 + index * 150}ms` }}
                        >
                           <BeforeAfterCard item={item} text={text} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterGallery;
