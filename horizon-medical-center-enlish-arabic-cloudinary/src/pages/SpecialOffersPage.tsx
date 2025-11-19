import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import SpecialOffers from '../components/SpecialOffers';
import Contact from '../components/Contact';
import { OutletContextType, LanguageContext } from '../App';

export default function SpecialOffersPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.offersTitle} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.offersSubtitle);
      }
    }
  }, [langContext]);

  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      {content.specialOffers && content.specialOffers.length > 0 && content.specialOffersEndDate && (
        <SpecialOffers 
          specialOffers={content.specialOffers} 
          endDate={content.specialOffersEndDate} 
        />
      )}
      <Contact 
        googleMapsUrl={content.googleMapsUrl}
        googleMapsDirectionsUrl={content.googleMapsDirectionsUrl}
        locationImages={content.locationImages}
      />
    </div>
  );
}