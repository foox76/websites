import React, { useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import Testimonials from '../components/Testimonials';
import { OutletContextType, LanguageContext } from '../App';
import WhyChooseUs from '../components/WhyChooseUs';

export default function ReviewsPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const langContext = useContext(LanguageContext);

  useEffect(() => {
    if (langContext) {
      const { text } = langContext;
      document.title = `${text.navReviews} | ${text.clinicName}`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', text.reviewsSubtitle);
      }
    }
  }, [langContext]);

  if (!fullData || !langContext) {
    return null;
  }

  const { content } = fullData;
  return (
    <div className="pt-20">
      <Testimonials testimonials={content.testimonials} googleReviews={content.googleReviews} />
      {content.whyChooseUs && <WhyChooseUs whyChooseUs={content.whyChooseUs} />}
    </div>
  );
}