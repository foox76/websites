import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import TreatmentsList from '../components/PriceList';
import { OutletContextType, LanguageContext } from '../App';
import Contact from '../components/Contact';

export default function TreatmentsPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navTreatments} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.treatmentsSubtitle);
      }
    }
  }, [langContext]);
  
  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <TreatmentsList treatments={content.treatments} />
      <Contact 
        googleMapsUrl={content.googleMapsUrl}
        googleMapsDirectionsUrl={content.googleMapsDirectionsUrl}
        locationImages={content.locationImages}
      />
    </div>
  );
}