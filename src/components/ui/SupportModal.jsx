import { useState } from 'react';
import { X, MessageSquare, Instagram, Send, LifeBuoy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useModal } from '../../context/ModalContext';

export const SupportModal = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { startChat, sendMessage, chats, setActiveChatId } = useChat();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { openAuthModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleWriteToSupport = async () => {
        if (!user) {
            onClose();
            openAuthModal();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Find support account by username (where email is stored)
            const { data: supportProfiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('username', 'temur@gmail.com')
                .limit(1);

            let supportUser = supportProfiles?.[0];

            if (!supportUser) {
                // Try fallback search by name if exact email search failed
                const { data: fallbackProfiles } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .ilike('full_name', '%Темур%')
                    .limit(1);

                supportUser = fallbackProfiles?.[0];
            }

            if (!supportUser) {
                throw new Error(
                    language === 'ru'
                        ? 'Аккаунт поддержки не найден. Пожалуйста, используйте Telegram.'
                        : language === 'uz'
                            ? 'Yordam hisobi topilmadi. Telegram orqali bog\'laning.'
                            : 'Support account not found. Please use Telegram/Instagram.'
                );
            }

            const supportId = supportUser.id;

            // 2. Check if a chat already exists with this user
            const existingChat = chats.find(c => c.otherPartyId === supportId);

            // 3. Just open the chat. The Welcome message will be shown via UI injection 
            // in ChatContext if the history is empty.

            // 4. Set active chat and redirect
            startChat(supportId);
            onClose();
            navigate('/messages');

        } catch (err) {
            console.error('Support Chat Error:', err);
            setError(err.message || 'Failed to open support chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-brand-gray border border-white/10 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-brand-muted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-orange/20 shadow-inner">
                        <LifeBuoy size={32} className="text-brand-orange" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6">
                        {t('support.title')}
                    </h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Send size={16} className="text-blue-400 rotate-[-20deg]" />
                                </div>
                                <span className="font-semibold text-white/90">Telegram</span>
                            </div>
                            <span className="text-brand-muted">—</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                    <Instagram size={16} className="text-pink-400" />
                                </div>
                                <span className="font-semibold text-white/90">Instagram</span>
                            </div>
                            <span className="text-brand-muted">—</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 text-xs text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full py-4 text-lg font-black rounded-2xl shadow-xl shadow-brand-orange/20 group"
                        onClick={handleWriteToSupport}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <MessageSquare size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                                {t('support.write')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
