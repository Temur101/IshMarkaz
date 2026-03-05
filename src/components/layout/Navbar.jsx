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
        <>
            <nav className="fixed w-full z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5 py-1">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
                    <Link to="/" className="flex items-center group z-10">
                        <Logo className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                    </Link>

                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium text-brand-muted">
                        <Link to="/jobs/all" className="hover:text-white transition-colors">{t('nav.allTasks')}</Link>
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
            </nav>

            {/* Logout Confirmation Modal - Moved outside nav to fix centering and improved design */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsLogoutModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-brand-gray border border-white/10 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/10">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-inner">
                                <LogOut size={32} className="text-red-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3">
                                {language === 'ru' ? 'Выход из аккаунта' : 'Logout Confirmation'}
                            </h2>
                            <p className="text-brand-muted text-base leading-relaxed px-2">
                                {language === 'ru' ? 'Вы уверены, что хотите выйти из аккаунта?' : 'Are you sure you want to log out of your account?'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="flex-1 py-4 px-6 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all order-2 sm:order-1"
                            >
                                {language === 'ru' ? 'Закрыть' : 'Close'}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-lg shadow-lg shadow-red-500/20 transition-all order-1 sm:order-2"
                            >
                                {language === 'ru' ? 'Выйти' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
