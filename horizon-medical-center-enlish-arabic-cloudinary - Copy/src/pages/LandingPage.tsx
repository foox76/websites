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

// This component was created to fix a build error. 
// It mirrors the HomePage component. If this file is not needed,
// you can delete it from your project.
export default function LandingPage() {
  const { fullData } = useOutletContext<OutletContextType>();
  const location = useLocation();

  useEffect(() => {
    document.title = "Horizon Medical Center | Gentle, Modern Dentistry";
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
        window.scrollTo(0, 0);
    }
  }, [location]);

  if (!fullData) {
    return null;
  }

  const { content } = fullData;
  return (
    <>
        <Hero 
          heroImageUrl={content.heroImageUrl}
        />
        <SocialProof googleReviews={content.googleReviews} />
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