import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import Contact from '../components/Contact';
import { OutletContextType, LanguageContext } from '../App';

export default function ContactPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navContact} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.contactSubtitle);
      }
    }
  }, [langContext]);

  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <Contact 
        googleMapsUrl={content.googleMapsUrl}
        googleMapsDirectionsUrl={content.googleMapsDirectionsUrl}
        locationImages={content.locationImages}
      />
    </div>
  );
}
