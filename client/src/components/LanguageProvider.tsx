import React, { createContext, useContext, useState } from 'react';

type Language = 'english' | 'hindi' | 'hinglish' | 'bengali';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  getLanguageDisplay: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageMap = {
  english: 'English',
  hindi: 'हिंदी (Hindi)',
  hinglish: 'Hinglish',
  bengali: 'বাংলা (Bengali)'
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('english');

  const getLanguageDisplay = (lang: Language) => languageMap[lang];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getLanguageDisplay }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
