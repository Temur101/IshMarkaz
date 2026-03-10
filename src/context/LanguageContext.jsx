import { createContext, useState, useContext, useEffect } from 'react';
import { en } from '../translations/en';
import { ru } from '../translations/ru';
import { uz } from '../translations/uz';

const LanguageContext = createContext();

const translations = { en, ru, uz };

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if translation missing
                let fallback = translations['en'];
                for (const fbK of keys) {
                    if (fallback && fallback[fbK]) {
                        fallback = fallback[fbK];
                    } else {
                        return key; // Return key if absolutely nothing found
                    }
                }
                return fallback;
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
