import React, { useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import SocialProof from '../components/SocialProof';
import Services from '../components/Services';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import BeforeAfterGallery from '../components/BeforeAfterGallery';
import TreatmentsList from '../components/PriceList';
import Contact from '../components/Contact';
import { OutletContextType } from '../App';
import PerformanceSummary from '../components/PerformanceSummary';
import WhyChooseUs from '../components/WhyChooseUs';
import SpecialOffers from '../components/SpecialOffers';

export default function HomePage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const location = useLocation();

  useEffect(() => {
    document.title = "Horizon Medical Center | Gentle, Modern Dentistry";
  }, []);

  useEffect(() => {
    // Handles smooth scrolling when navigating from another page with a hash
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // A small timeout ensures the element is rendered before scrolling
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
        window.scrollTo(0, 0);
    }
  }, [location]);

  if (!fullData) {
    return null; // Loading is handled by App.tsx
  }

  const { content } = fullData;
  return (
    <>
        <Hero 
          heroImageUrl={content.heroImageUrl}
        />
        <SocialProof googleReviews={content.googleReviews} />
        {content.specialOffers && content.specialOffers.length > 0 && content.specialOffersEndDate && (
          <SpecialOffers 
            specialOffers={content.specialOffers} 
            endDate={content.specialOffersEndDate} 
          />
        )}
        <Services services={content.services} />
        {content.whyChooseUs && <WhyChooseUs whyChooseUs={content.whyChooseUs} />}
        {content.performanceSummary && <PerformanceSummary performanceSummary={content.performanceSummary} />}
        <About staff={content.staff} />
        <BeforeAfterGallery gallery={content.gallery} />
        <Testimonials testimonials={content.testimonials} googleReviews={content.googleReviews} />
        <TreatmentsList treatments={content.treatments} />
        <Contact 
          googleMapsUrl={content.googleMapsUrl}
          googleMapsDirectionsUrl={content.googleMapsDirectionsUrl}
          locationImages={content.locationImages}
        />
    </>
  );
}