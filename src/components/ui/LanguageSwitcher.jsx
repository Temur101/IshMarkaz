import { useLanguage } from '../../context/LanguageContext';
import { clsx } from 'clsx';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'ru', label: 'RU' },
        { code: 'uz', label: 'UZ' }
    ];

    return (
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-sm">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                        language === lang.code
                            ? "bg-brand-orange text-white shadow-lg shadow-orange-500/20"
                            : "text-brand-muted hover:text-white hover:bg-white/5"
                    )}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};
