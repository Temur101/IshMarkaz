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
                    <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-8 shadow-inner border border-brand-orange/20">
                        <Lock size={36} className="animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                        {t('authModal.title')}
                    </h2>

                    <p className="text-brand-muted text-lg mb-10 leading-relaxed font-medium">
                        {t('authModal.actionText')}
                    </p>

                    <div className="flex flex-col w-full gap-4">
                        <Button
                            className="w-full py-5 text-lg font-black rounded-2xl shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                            onClick={() => {
                                onClose();
                                navigate('/login');
                            }}
                        >
                            <LogIn size={24} />
                            {t('authModal.login')}
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full py-5 text-lg font-black rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                            onClick={() => {
                                onClose();
                                navigate('/register');
                            }}
                        >
                            <UserPlus size={24} />
                            {t('authModal.register')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
