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
        <div className="flex w-fit mx-auto bg-white/5 rounded-full p-1.5 border border-white/5 backdrop-blur-sm gap-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={clsx(
                        "min-w-[56px] py-1.5 px-3 rounded-full text-xs font-bold transition-all tracking-widest",
                        language === lang.code
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                            : "text-brand-muted hover:text-white hover:bg-white/5"
                    )}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};
