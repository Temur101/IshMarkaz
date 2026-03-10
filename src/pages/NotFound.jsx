import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
    const { language } = useLanguage();

    const t = {
        ru: {
            title: "Страница не найдена",
            description: "Похоже, эта вакансия уже занята или адрес был введен неверно. Но не волнуйтесь, на платформе еще много работы!",
            backHome: "Вернуться на главную",
            browseJobs: "Смотреть вакансии",
        },
        en: {
            title: "Page Not Found",
            description: "Looks like this vacancy is already taken or the URL is incorrect. Don't worry, there's plenty of other work on the platform!",
            backHome: "Back to Home",
            browseJobs: "Browse Vacancies",
        },
        uz: {
            title: "Sahifa topilmadi",
            description: "Aftidan, bu vakansiya allaqachon band qilingan yoki manzil noto'g'ri kiritilgan. Havotir olmang, platformada hali ko'p ish bor!",
            backHome: "Bosh sahifaga",
            browseJobs: "Vakansiyalarni ko'rish",
        }
    };

    const content = t[language] || t.en;

    return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-orange/5 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="z-10 text-center max-w-2xl px-4">
                <div className="mb-12 inline-block">
                    <Logo className="h-24 w-auto mb-8 opacity-50 hover:opacity-100 transition-opacity" />
                </div>

                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none text-white/5 select-none animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center border border-brand-orange/20 shadow-2xl shadow-brand-orange/20 animate-bounce cursor-help group">
                            <Search size={40} className="text-brand-orange group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                    {content.title}
                </h2>

                <p className="text-brand-muted text-lg mb-12 max-w-md mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700">
                    {content.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 delay-500 duration-700">
                    <Link to="/">
                        <Button variant="secondary" className="px-8 py-4 flex items-center gap-2 border-white/10 hover:bg-white/5 w-full sm:w-auto">
                            <ArrowLeft size={18} />
                            {content.backHome}
                        </Button>
                    </Link>
                    <Link to="/jobs/all">
                        <Button className="px-8 py-4 flex items-center gap-2 shadow-xl shadow-brand-orange/20 w-full sm:w-auto">
                            <Home size={18} />
                            {content.browseJobs}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Subtle floating elements */}
            <div className="absolute top-10 right-[10%] opacity-20 animate-float hidden md:block">
                <div className="w-2 h-2 bg-brand-orange rounded-full shadow-[0_0_10px_#FF6B00]" />
            </div>
            <div className="absolute bottom-20 left-[15%] opacity-10 animate-float-delayed hidden md:block">
                <div className="w-3 h-3 bg-white rounded-full" />
            </div>
        </div>
    );
};

export default NotFound;
