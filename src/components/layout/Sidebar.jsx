import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    CalendarClock,
    MessageSquare,
    User,
    PlusCircle,
    Building2,
    GraduationCap,
    Clock,
    LayoutGrid,
    Heart,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { Logo } from '../ui/Logo';
import { useLanguage } from '../../context/LanguageContext';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '../ui/Button';

export const Sidebar = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { openJobModal } = useModal();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const jobCategories = [
        { icon: LayoutGrid, label: t('dashboard.filters.all'), path: "/jobs/all" },
        { icon: CalendarClock, label: t('dashboard.filters.trialWeek'), path: "/jobs/trial-week" },
        { icon: Building2, label: t('dashboard.filters.fullTime'), path: "/jobs/full-time" },
        { icon: GraduationCap, label: t('dashboard.filters.noExperience'), path: "/jobs/no-experience" },
        { icon: Clock, label: t('dashboard.filters.temporary'), path: "/jobs/temporary" },
    ];

    const personalItems = [
        { icon: MessageSquare, label: t('nav.messages'), path: "/messages" },
        { icon: Briefcase, label: t('nav.myJobs'), path: "/my-jobs" },
        { icon: Heart, label: t('nav.interested'), path: "/interested" },
        { icon: User, label: t('nav.profile'), path: "/profile" },
    ];

    const renderNavItem = (item) => {
        const isActive = location.pathname === item.path || (item.path === '/jobs/all' && location.pathname === '/dashboard');
        return (
            <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive
                        ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                        : "text-brand-muted hover:bg-white/5 hover:text-white"
                )}
            >
                <item.icon size={20} className={isActive ? "text-white" : "text-brand-muted group-hover:text-white"} />
                <span className="font-medium">{item.label}</span>
            </Link>
        );
    };

    const handleSignOut = async () => {
        await signOut();
        setIsLogoutModalOpen(false);
        navigate('/');
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out"
                    onClick={onClose}
                />
            )}

            <aside className={clsx(
                "fixed left-0 top-0 h-[100vh] w-72 lg:w-64 bg-brand-black border-r border-white/5 flex flex-col p-6 overflow-y-auto hide-scrollbar z-50 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
                "lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="mb-8 pl-1">
                    <Link to="/" className="group" onClick={() => onClose && onClose()}>
                        <Logo className="h-20 w-auto object-contain transition-transform group-hover:scale-105" />
                    </Link>
                </div>

                <nav className="flex-1 space-y-6">
                    <div>
                        <h2 className="px-4 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                            Browse Jobs
                        </h2>
                        <div className="space-y-1">
                            {jobCategories.map(renderNavItem)}
                        </div>
                    </div>

                    <div>
                        <h2 className="px-4 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
                            Personal
                        </h2>
                        <div className="space-y-1">
                            {personalItems.map(renderNavItem)}
                        </div>
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                    <LanguageSwitcher />

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-brand-muted hover:bg-red-500/10 hover:text-red-400 group"
                    >
                        <LogOut size={20} className="text-brand-muted group-hover:text-red-400" />
                        <span className="font-medium">{language === 'ru' ? 'Выход' : 'Logout'}</span>
                    </button>
                </div>

                {/* Logout Confirmation Modal */}
                {isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setIsLogoutModalOpen(false)}
                        />
                        <div className="relative w-full max-w-sm bg-brand-gray border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                    <LogOut size={28} className="text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {language === 'ru' ? 'Выход из аккаунта' : 'Logout Confirmation'}
                                </h2>
                                <p className="text-brand-muted text-sm px-4">
                                    {language === 'ru' ? 'Вы уверены, что хотите выйти из аккаунта?' : 'Are you sure you want to log out of your account?'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setIsLogoutModalOpen(false)}
                                >
                                    {language === 'ru' ? 'Закрыть' : 'Close'}
                                </Button>
                                <Button
                                    className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 text-white font-bold"
                                    onClick={handleSignOut}
                                >
                                    {language === 'ru' ? 'Выйти' : 'Logout'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};
