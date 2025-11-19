import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import About from '../components/About';
import { OutletContextType, LanguageContext } from '../App';
import WhyChooseUs from '../components/WhyChooseUs';
import PerformanceSummary from '../components/PerformanceSummary';
import Testimonials from '../components/Testimonials';

export default function AboutPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navAbout} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.aboutSubtitle);
      }
    }
  }, [langContext]);

  if (!fullData || !langContext) {
    return null; 
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <About staff={content.staff} />
      {content.whyChooseUs && <WhyChooseUs whyChooseUs={content.whyChooseUs} />}
      {content.performanceSummary && <PerformanceSummary performanceSummary={content.performanceSummary} />}
      <Testimonials testimonials={content.testimonials} googleReviews={content.googleReviews} />
    </div>
  );
}