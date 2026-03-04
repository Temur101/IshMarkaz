import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Send, User, Trash2, MessageSquare, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { UserProfileModal } from '../components/ui/UserProfileModal';

export default function Chat() {
    const { t, language } = useLanguage();
    const { chats, sendMessage, deleteChat, clearChat, activeChatId, setActiveChatId } = useChat();
    const { user } = useAuth();
    const { tasks } = useTasks();
    const [selectedChatId, setSelectedChatId] = useState(activeChatId || (chats.length > 0 && window.innerWidth > 1024 ? chats[0].id : null));
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(!!activeChatId);

    // Auto-scroll logic ref
    const messagesEndRef = useRef(null);

    // Profile modal state
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileUserId, setProfileUserId] = useState(null);
    const [profileFallbackName, setProfileFallbackName] = useState('');

    const selectedChat = chats.find(c => c.id === selectedChatId);

    // Update selected chat when activeChatId changes from outside
    useEffect(() => {
        if (activeChatId) {
            setSelectedChatId(activeChatId);
            setShowMobileChat(true);
        }
    }, [activeChatId]);

    // Cleanup active chat when navigating away or changing chat manually
    useEffect(() => {
        if (selectedChatId !== activeChatId) {
            setActiveChatId(selectedChatId);
        }
    }, [selectedChatId]);

    // Auto-select first chat if none selected and chats exist
    useEffect(() => {
        // Only auto-select on desktop
        if (!selectedChatId && chats.length > 0 && window.innerWidth > 1024) {
            setSelectedChatId(chats[0].id);
        }
    }, [chats, selectedChatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (selectedChat?.messages) {
            scrollToBottom();
        }
    }, [selectedChat?.messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Date grouping logic
    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            const msgDate = msg.date || new Date().toISOString().split('T')[0]; // Using date if available, or today simply
            if (!groups[msgDate]) groups[msgDate] = [];
            groups[msgDate].push(msg);
        });
        return groups;
    };

    const formatDateSeparator = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === today) return language === 'ru' ? 'Сегодня' : 'Bugun';
        if (dateStr === yesterday) return language === 'ru' ? 'Вчера' : 'Kecha';

        const date = new Date(dateStr);
        return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleSend = () => {
        if (newMessage.trim() && selectedChat && user) {
            sendMessage(
                selectedChat.otherPartyId,
                newMessage,
                selectedChat.jobId
            );
            setNewMessage('');
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openUserProfile = (e, userId, name = '') => {
        e.stopPropagation();
        if (userId && userId !== user?.id) {
            setProfileUserId(userId);
            setProfileFallbackName(name);
            setProfileModalOpen(true);
        }
    };

    return (
        <DashboardLayout>
            {/* User Profile Modal */}
            <UserProfileModal
                isOpen={profileModalOpen}
                onClose={() => {
                    setProfileModalOpen(false);
                    setProfileUserId(null);
                    setProfileFallbackName('');
                }}
                userId={profileUserId}
                fallbackName={profileFallbackName}
            />

            <div className={`flex h-[calc(100vh-160px)] lg:h-[calc(100vh-140px)] gap-0 lg:gap-6 bg-brand-black/40 rounded-2xl border border-white/5 overflow-hidden ${showMobileChat ? 'chat-container-mobile' : ''}`}>
                {/* Sidebar */}
                <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-[35%] xl:w-[30%] flex-col border-r border-white/5 p-4`}>
                    <div className="mb-4">
                        <Input
                            placeholder={t('chat.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredChats.length > 0 ? (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        setSelectedChatId(chat.id);
                                        setShowMobileChat(true);
                                    }}
                                    className={`p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors duration-200 border border-transparent group relative flex flex-col ${selectedChatId === chat.id ? 'bg-white/5 border-l-4 border-l-brand-orange border-y-transparent border-r-transparent' : 'border-b-white/5'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2 w-full">
                                        {/* Clickable avatar */}
                                        <button
                                            onClick={(e) => openUserProfile(e, chat.otherPartyId, chat.company)}
                                            title="Посмотреть профиль"
                                            className="w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center text-brand-orange border border-white/10 hover:border-brand-orange/50 hover:scale-105 transition-all flex-shrink-0 overflow-hidden"
                                        >
                                            {chat.otherPartyAvatar ? (
                                                <img src={chat.otherPartyAvatar} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
                                            {/* Top row: Name */}
                                            <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
                                                <button
                                                    onClick={(e) => openUserProfile(e, chat.otherPartyId, chat.company)}
                                                    className="font-bold text-sm truncate hover:text-brand-orange transition-colors text-left flex-1"
                                                    title="Посмотреть профиль"
                                                >
                                                    {chat.company}
                                                </button>
                                            </div>
                                            <div className="text-xs text-brand-orange/70 mt-0.5">
                                                {chat.messages.length > 0 ? (language === 'ru' ? 'Активный диалог' : 'Faol muloqot') : (language === 'ru' ? 'В сети' : 'Onlayn')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 w-full pl-14">
                                        <div className="text-sm text-brand-muted truncate flex-1">
                                            {chat.messages.length > 0
                                                ? chat.messages[chat.messages.length - 1].text
                                                : "Начните общение..."
                                            }
                                        </div>
                                        {chat.messages.length > 0 && (
                                            <span className="text-[10px] text-brand-muted flex-shrink-0">
                                                {chat.messages[chat.messages.length - 1].time}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.otherPartyId);
                                            if (selectedChatId === chat.id) setSelectedChatId(null);
                                        }}
                                        className="absolute top-4 right-4 p-2 text-danger opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all"
                                        title="Удалить чат"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-brand-muted text-center p-4">
                                <MessageSquare size={40} className="mb-2 opacity-20" />
                                <p className="text-sm">Сообщений пока нет</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                {selectedChat ? (
                    <div className={`${!showMobileChat ? 'hidden lg:flex' : 'flex'} flex-1 flex-col overflow-hidden bg-brand-black/20`}>
                        {/* Chat header */}
                        <div className="p-4 border-b border-white/5 bg-brand-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Back button for mobile */}
                                <button
                                    onClick={() => setShowMobileChat(false)}
                                    className="lg:hidden p-2 -ml-2 text-brand-muted hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                {/* Clickable avatar in header */}
                                <button
                                    onClick={(e) => openUserProfile(e, selectedChat.otherPartyId, selectedChat.company)}
                                    title="Посмотреть профиль"
                                    className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold hover:opacity-80 hover:scale-105 transition-all overflow-hidden"
                                >
                                    {selectedChat.otherPartyAvatar ? (
                                        <img src={selectedChat.otherPartyAvatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        selectedChat.company.charAt(0)
                                    )}
                                </button>
                                <div>
                                    {/* Clickable name in header */}
                                    <button
                                        onClick={(e) => openUserProfile(e, selectedChat.otherPartyId, selectedChat.company)}
                                        className="font-bold hover:text-brand-orange transition-colors"
                                        title="Посмотреть профиль"
                                    >
                                        {selectedChat.company}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-brand-muted hover:text-red-500"
                                    onClick={() => {
                                        deleteChat(selectedChat.otherPartyId);
                                        setSelectedChatId(null);
                                    }}
                                    title="Удалить чат"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                            {selectedChat.messages.length > 0 ? (
                                Object.entries(groupMessagesByDate(selectedChat.messages)).map(([date, dateMessages]) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex justify-center my-4 sticky top-0 z-10">
                                            <span className="px-3 py-1 bg-brand-black/60 backdrop-blur-md rounded-full text-[11px] text-white/50 font-medium tracking-wider shadow-sm">
                                                {formatDateSeparator(date)}
                                            </span>
                                        </div>
                                        {dateMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} message-appear`}
                                            >
                                                {/* Avatar for other user messages */}
                                                {msg.senderId !== user?.id && (
                                                    <button
                                                        onClick={(e) => openUserProfile(e, msg.senderId)}
                                                        title="Посмотреть профиль"
                                                        className="w-8 h-8 rounded-full bg-brand-gray border border-white/10 flex items-center justify-center text-brand-orange font-bold text-sm mr-2 flex-shrink-0 self-end mb-1 hover:border-brand-orange/50 hover:scale-105 transition-all overflow-hidden"
                                                    >
                                                        {msg.senderAvatar ? (
                                                            <img src={msg.senderAvatar} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            msg.senderName?.charAt(0)?.toUpperCase() || <User size={14} />
                                                        )}
                                                    </button>
                                                )}
                                                <div
                                                    className={`max-w-[85%] sm:max-w-[70%] text-sm px-4 py-2 rounded-2xl shadow-sm ${msg.senderId === user?.id
                                                        ? 'bg-brand-orange text-white rounded-br-sm'
                                                        : 'bg-brand-gray border border-white/10 text-brand-text rounded-bl-sm'
                                                        }`}
                                                >
                                                    {msg.senderId !== user?.id && (
                                                        <div className="text-[11px] font-bold opacity-80 mb-0.5">
                                                            <button
                                                                onClick={(e) => openUserProfile(e, msg.senderId)}
                                                                className="hover:underline cursor-pointer"
                                                                title="Посмотреть профиль"
                                                            >
                                                                {msg.senderName}
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                                                        <div className="break-words font-medium overflow-wrap-anywhere">
                                                            {msg.text}
                                                        </div>
                                                        <div className={`text-[10px] whitespace-nowrap opacity-70 ml-auto ${msg.senderId === user?.id ? 'text-white/90' : 'text-brand-muted'}`}>
                                                            {msg.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-brand-muted italic">
                                    Отправьте первое сообщение, чтобы начать диалог.
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="p-4 border-t border-white/5 bg-brand-black/40 flex gap-3 lg:gap-4 sticky bottom-0">
                            <Input
                                placeholder={t('chat.typeMessage')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="bg-brand-black border-white/10"
                            />
                            <Button onClick={handleSend} className="px-4 shrink-0">
                                <Send size={20} />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 text-center text-brand-muted bg-brand-black/20">
                        <MessageSquare size={64} className="mb-4 opacity-10" />
                        <h3 className="text-xl font-bold text-white mb-2">Выберите чат</h3>
                        <p>Начните общение с работодателем, нажав кнопку «Связаться» на странице вакансии.</p>
                    </div>
                )
                }
            </div >
        </DashboardLayout >
    );
}
