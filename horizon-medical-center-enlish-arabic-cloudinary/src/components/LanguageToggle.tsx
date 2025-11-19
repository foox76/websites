import React, { useContext } from 'react';
// FIX: Use relative path for imports from parent directory
import { LanguageContext } from '../App';
import { Language } from '../types';

const LanguageToggle: React.FC = () => {
  const context = useContext(LanguageContext);
  if (!context) return null;
  const { lang, toggleLang } = context;

  const isEnglishActive = lang === Language.EN;

  return (
    <div
      onClick={toggleLang}
      className="relative w-16 h-8 flex items-center bg-gray-200 rounded-full cursor-pointer"
    >
      {/* The slider now uses left/right positioning to avoid transform bugs in RTL */}
      <div
        className={`absolute w-8 h-8 bg-brand-teal rounded-full shadow-md transition-all duration-300 ease-in-out ${
          isEnglishActive ? 'left-0' : 'right-0'
        }`}
      />
      {/* Text labels are layered on top */}
      <div className="w-full flex justify-around items-center">
        <span className={`z-10 font-bold text-sm transition-colors duration-300 ${isEnglishActive ? 'text-white' : 'text-gray-700'}`}>
          EN
        </span>
        <span className={`z-10 font-bold text-sm transition-colors duration-300 ${!isEnglishActive ? 'text-white' : 'text-gray-700'}`}>
          AR
        </span>
      </div>
    </div>
  );
};

export default LanguageToggle;
