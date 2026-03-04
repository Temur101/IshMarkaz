import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export const Navbar = () => {
    const { t, language } = useLanguage();
    const { user, signOut } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        await signOut();
        setIsLogoutModalOpen(false);
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5 py-1">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
                <Link to="/" className="flex items-center group z-10">
                    <Logo className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                </Link>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-brand-muted">
                    <Link to="/how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</Link>
                    <Link to="/formats" className="hover:text-white transition-colors">{t('nav.workFormats')}</Link>
                    <Link to="/for-employers" className="hover:text-white transition-colors">{t('nav.forEmployers')}</Link>
                </div>

                <div className="flex items-center gap-4 z-10">


                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-white truncate max-w-[150px]">
                                    {user.user_metadata?.first_name || user.user_metadata?.last_name
                                        ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
                                        : 'Пользователь'}
                                </span>
                                <span className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">
                                    Online
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-muted overflow-hidden">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={16} />
                                )}
                            </div>
                            <button
                                onClick={handleLogoutClick}
                                className="p-2 text-brand-muted hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-brand-muted hover:text-white">
                                    {t('nav.login')}
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
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
                                onClick={confirmLogout}
                            >
                                {language === 'ru' ? 'Выйти' : 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
