import { X, Lock, LogIn, UserPlus } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AuthRequiredModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-6">
                        <Lock size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        {t('authModal.title') || "Authorization Required"}
                    </h2>

                    <p className="text-brand-muted text-lg mb-8 leading-relaxed">
                        {t('authModal.text') || "You need to log in or create an account to view jobs."}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <Button
                            className="w-full flex items-center justify-center gap-2"
                            size="lg"
                            onClick={() => {
                                onClose();
                                navigate('/login');
                            }}
                        >
                            <LogIn size={20} />
                            {t('nav.login') || "Login"}
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full flex items-center justify-center gap-2"
                            size="lg"
                            onClick={() => {
                                onClose();
                                navigate('/register');
                            }}
                        >
                            <UserPlus size={20} />
                            {t('nav.getStarted') || "Register"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
