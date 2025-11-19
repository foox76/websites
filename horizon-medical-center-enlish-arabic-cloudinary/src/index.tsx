import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/index'));
const ServiceDetailsPage = lazy(() => import('./pages/services/[id]'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const TreatmentsPage = lazy(() => import('./pages/TreatmentsPage'));
const SpecialOffersPage = lazy(() => import('./pages/SpecialOffersPage'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
    Loading...
  </div>
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="treatments" element={<TreatmentsPage />} />
            <Route path="offers" element={<SpecialOffersPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);