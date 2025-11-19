import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import BeforeAfterGallery from '../components/BeforeAfterGallery';
import { OutletContextType, LanguageContext } from '../App';
import Testimonials from '../components/Testimonials';

export default function GalleryPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navGallery} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.gallerySubtitle);
      }
    }
  }, [langContext]);
  
  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <BeforeAfterGallery gallery={content.gallery} />
      <Testimonials testimonials={content.testimonials} googleReviews={content.googleReviews} />
    </div>
  );
}