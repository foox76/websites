import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import Services from '../components/Services';
import { OutletContextType, LanguageContext } from '../App';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';

export default function ServicesPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navServices} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.servicesIntro);
      }
    }
  }, [langContext]);
  
  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <Services services={content.services} />
      <Testimonials testimonials={content.testimonials} googleReviews={content.googleReviews} />
      <Contact 
        googleMapsUrl={content.googleMapsUrl}
        googleMapsDirectionsUrl={content.googleMapsDirectionsUrl}
        locationImages={content.locationImages}
      />
    </div>
  );
}