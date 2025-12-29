"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'English' | '한국어' | '日本語';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('English');
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect browser language
  const detectBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'English';

    // Get browser language (e.g., "ko-KR", "ja-JP", "en-US")
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);

    if (!browserLang) return 'English';

    // Extract language code (ko, ja, en, etc.)
    const langCode = browserLang.toLowerCase().split('-')[0];

    // Map to our supported languages
    if (langCode === 'ko') return '한국어';
    if (langCode === 'ja') return '日本語';
    return 'English';
  };

  // Load language from localStorage on mount, or detect from browser
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['English', '한국어', '日本語'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // No saved preference, use browser language
      const detectedLanguage = detectBrowserLanguage();
      setLanguageState(detectedLanguage);
    }
    setIsHydrated(true);
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Don't render children until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
