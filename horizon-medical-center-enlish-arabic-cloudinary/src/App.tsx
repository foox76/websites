import React, { useState, useEffect, createContext, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Language, TextContent, LanguageContextType, Data, ContentData } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyCTA from './components/StickyCTA';
import WhatsAppModal from './components/WhatsAppModal';
import OfferCountdown from './components/OfferCountdown';

export const LanguageContext = createContext<LanguageContextType | null>(null);

// We define this type here for the data passed down to child routes.
export type OutletContextType = {
  fullData: Data;
};

function App() {
  const [lang, setLang] = useState<Language>(Language.EN);
  const [fullData, setFullData] = useState<Data | null>(null);
  const [isStickyCtaVisible, setIsStickyCtaVisible] = useState(false);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const inactivityTimer = useRef<number | null>(null);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappModalConfig, setWhatsappModalConfig] = useState({ message: '', url: '' });

  const openWhatsappModal = (message: string, url: string) => {
    setWhatsappModalConfig({ message, url });
    setIsWhatsappModalOpen(true);
  };

  const closeWhatsappModal = () => {
    setIsWhatsappModalOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/content.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Data = await response.json();
        setFullData(data);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      const isVisible = window.scrollY > window.innerHeight * 0.8;
      setIsStickyCtaVisible(isVisible);

      // Clear previous timer on scroll
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      // Set a new timer to detect scroll stop
      inactivityTimer.current = window.setTimeout(() => {
        // Only trigger pulse if the CTA is visible and user is inactive
        if (window.scrollY > window.innerHeight * 0.8) {
          setPulseTrigger(prev => prev + 1);
        }
      }, 3000); // 3 seconds of inactivity
    };
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  const isRtl = lang === Language.AR;

  useEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
    if (document.documentElement.dir !== (isRtl ? 'rtl' : 'ltr')) {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [lang, isRtl]);

  const toggleLang = () => {
    setLang(prevLang => (prevLang === Language.EN ? Language.AR : Language.EN));
  };


  if (!fullData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        Loading...
      </div>
    );
  }

  const text = lang === Language.EN ? fullData.en : fullData.ar;
  const languageContextValue = { lang, toggleLang, text, isRtl, content: fullData.content, openWhatsappModal };

  return (
    <LanguageContext.Provider value={languageContextValue}>
      <OfferCountdown />
      <Header />
      <main>
        <Outlet context={{ fullData } satisfies OutletContextType} />
      </main>
      <Footer />
      <StickyCTA isVisible={isStickyCtaVisible} pulseTrigger={pulseTrigger} />
      <WhatsAppModal
        isOpen={isWhatsappModalOpen}
        onClose={closeWhatsappModal}
        message={whatsappModalConfig.message}
        whatsappUrl={whatsappModalConfig.url}
      />
    </LanguageContext.Provider>
  );
}

export default App;