'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentLanguage, setStoredLanguage, getTranslation, Language, DEFAULT_LANGUAGE } from '../i18n/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLanguage = DEFAULT_LANGUAGE
}: {
    children: ReactNode;
    initialLanguage?: Language;
}) {
    const [language, setLanguageState] = useState<Language>(initialLanguage);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only access localStorage on client mount
        const current = getCurrentLanguage();
        setLanguageState(current);
        setIsLoaded(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setStoredLanguage(lang);
    };

    const t = (key: string, params?: Record<string, string | number>) => {
        return getTranslation(language, key, params);
    };

    const value = {
        language,
        setLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
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
