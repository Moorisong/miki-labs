
import en from './en';
import ko from './ko';

export type Language = 'en' | 'ko';
export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ko'];
export const DEFAULT_LANGUAGE: Language = 'ko';

const translations = { en, ko };

export const getCurrentLanguage = (): Language => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    const stored = localStorage.getItem('lang') as Language;
    if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
    return DEFAULT_LANGUAGE;
};

export const setStoredLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('lang', lang);
        document.cookie = `lang=${lang};path=/;max-age=31536000`; // 1 year
    }
};

export const getTranslation = (lang: Language, key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Fallback to key if not found
        }
    }

    let text = typeof value === 'string' ? value : key;

    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
        });
    }

    return text;
};
