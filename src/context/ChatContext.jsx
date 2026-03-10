import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';
import { useLanguage } from './LanguageContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const { tasks } = useTasks();
    const { language } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [activeChatId, setActiveChatId] = useState(() => sessionStorage.getItem('activeChatId') || null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [profilesMap, setProfilesMap] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState({});
    const [supportUserId, setSupportUserId] = useState(() => sessionStorage.getItem('supportUserId') || null);

    const PAGE_SIZE = 30;

    const fetchMessages = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let query = supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false }) // Get newest first for pagination
                .range(
                    isLoadMore ? messages.length : 0,
                    isLoadMore ? messages.length + PAGE_SIZE - 1 : PAGE_SIZE - 1
                );

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching messages:', error.message || error);
            } else {
                const newMessages = data || [];

                if (newMessages.length < PAGE_SIZE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                setMessages(prev => {
                    if (isLoadMore) {
                        // Merge and sort
                        const combined = [...prev, ...newMessages];
                        // Eliminate duplicates and sort ascending for the UI
                        const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                        return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    } else {
                        // Initial load, sort ascending
                        return [...newMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    }
                });

                const participantIds = new Set();
                newMessages.forEach(m => {
                    participantIds.add(m.sender_id);
                    participantIds.add(m.receiver_id);
                });

                if (participantIds.size > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', Array.from(participantIds));

                    if (profilesData) {
                        setProfilesMap(prev => {
                            const newMap = new Map(prev);
                            profilesData.forEach(p => newMap.set(p.id, p));
                            return newMap;
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Fetch Messages Network Error:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (!loadingMore && hasMore) {
            fetchMessages(true);
        }
    };

    // 1. Fetch initial message history
    useEffect(() => {
        fetchMessages();
    }, [user]);

    // 2. Realtime listener for incoming/outgoing messages
    useEffect(() => {
        if (!user) return;

        console.log('Mounting realtime listener for user', user.id);

        const channel = supabase.channel('room:messages');

        channel.on(
            'postgres_changes',
            {
                event: '*', // Listen to INSERT and UPDATE
                schema: 'public',
                table: 'messages'
            },
            (payload) => {
                console.log('Realtime message change received!', payload);
                const newMsg = payload.new;

                if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
                    if (payload.eventType === 'INSERT') {
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });

                        // Check if profile exists; if not, fetch it so UI renders names correctly
                        const otherUserId = newMsg.sender_id === user.id ? newMsg.receiver_id : newMsg.sender_id;
                        setProfilesMap(prevMap => {
                            if (!prevMap.has(otherUserId)) {
                                supabase.from('profiles').select('*').eq('id', otherUserId).single()
                                    .then(({ data }) => {
                                        if (data) {
                                            setProfilesMap(p => new Map(p).set(data.id, data));
                                        }
                                    });
                            }
                            return prevMap;
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(prev => prev.map(msg => msg.id === newMsg.id ? newMsg : msg));
                    }
                }
            }
        ).subscribe((status, err) => {
            console.log('Supabase Realtime Status:', status);
            if (err) console.error('Supabase Realtime connect error:', err);
        });

        return () => {
            console.log('Unmounting realtime listener...');
            channel.unsubscribe();
            // supabase.removeChannel(channel) can be too aggressive and break other sockets, 
            // channel.unsubscribe() is much safer for React's rapid mount/unmount cycle.
        };
    }, [user?.id]);

    // 3. User Presence logic
    useEffect(() => {
        if (!user) return;

        const onlineChannel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        onlineChannel
            .on('presence', { event: 'sync' }, () => {
                const newState = onlineChannel.presenceState();
                const presenceData = {};
                Object.keys(newState).forEach((key) => {
                    presenceData[key] = newState[key][0];
                });
                setOnlineUsers(presenceData);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await onlineChannel.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            onlineChannel.unsubscribe();
        };
    }, [user?.id]);

    const sendMessage = async (receiverId, text, jobId = null, customSenderId = null) => {
        if (!user) return { error: { message: 'User must be authenticated' } };

        const senderId = customSenderId || user.id;

        const newMessageData = {
            sender_id: senderId,
            receiver_id: receiverId,
            job_id: jobId,
            text: text,
            is_read: false
        };

        const { data, error } = await supabase
            .from('messages')
            .insert([newMessageData])
            .select();

        if (error) {
            console.error('Error sending message:', error.message || error);
            return { error };
        } else {
            // Optimistic update locally (duplicate check protects against realtime race condition)
            setMessages(prev => {
                if (prev.some(m => m.id === data[0].id)) return prev;
                return [...prev, data[0]];
            });
            return { data: data[0] };
        }
    };

    const getChats = () => {
        const chatsMap = new Map();

        const getProfileName = (profile) => {
            if (!profile) return null;
            if (profile.full_name && profile.full_name.trim()) return profile.full_name.trim();
            const first = profile.first_name || '';
            const last = profile.last_name || '';
            if (first || last) return `${first} ${last}`.trim();
            if (profile.username && !profile.username.includes('@')) return profile.username;
            return null;
        };

        messages.forEach(msg => {
            const otherPartyId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
            const chatId = otherPartyId;

            const otherProfile = profilesMap.get(otherPartyId);
            const otherName = getProfileName(otherProfile);

            if (!chatsMap.has(chatId)) {
                const job = tasks.find(t => t.id === msg.job_id);
                const isEmployer = user?.id === job?.user_id;

                // Special handling for Support Account name
                let displayName = otherName;
                if (otherProfile?.username === 'temur@gmail.com' || otherPartyId === supportUserId) {
                    displayName = language === 'uz' ? "IshMarkaz yordami" : "Поддержка IshMarkaz";
                    if (otherPartyId === supportUserId && !supportUserId) setSupportUserId(otherPartyId);
                }

                chatsMap.set(chatId, {
                    id: chatId,
                    otherPartyId,
                    jobId: msg.job_id,
                    messages: [],
                    company: displayName || (job ? job.company : (isEmployer ? "Соискатель" : "Работодатель")),
                    isEmployer: isEmployer,
                    otherPartyAvatar: otherProfile?.avatar_url || null,
                    isOnline: !!onlineUsers[otherPartyId]
                });
            }

            const chat = chatsMap.get(chatId);

            // Special: If this is support chat and it's empty in messages list, 
            // the loop won't even process it until the first user message. 
            // This case is handled below in the activeChatId section for new chats.
            const senderProfile = profilesMap.get(msg.sender_id);
            const senderName = getProfileName(senderProfile);

            chat.messages.push({
                id: msg.id,
                senderId: msg.sender_id,
                text: msg.text,
                jobId: msg.job_id,
                is_read: msg.is_read || false,
                date: new Date(msg.created_at).toISOString().split('T')[0],
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAtTs: new Date(msg.created_at).getTime(),
                senderName: msg.sender_id === user?.id
                    ? (user.user_metadata?.first_name || 'Я')
                    : (msg.sender_id === (profilesMap.get(otherPartyId)?.username === 'temur@gmail.com' || msg.sender_id === supportUserId ? msg.sender_id : null)
                        ? (language === 'uz' ? "IshMarkaz yordami" : "Поддержка IshMarkaz")
                        : (senderName || (chat.isEmployer ? 'Соискатель' : chat.company))),
                senderAvatar: senderProfile?.avatar_url || null
            });
        });

        if (activeChatId && !chatsMap.has(activeChatId)) {
            const otherPartyId = activeChatId;
            const otherProfile = profilesMap.get(otherPartyId);
            const otherName = getProfileName(otherProfile);

            let displayName = otherName;
            if (otherProfile?.username === 'temur@gmail.com' || otherPartyId === supportUserId) {
                displayName = language === 'uz' ? "IshMarkaz yordami" : "Поддержка IshMarkaz";
            }

            chatsMap.set(activeChatId, {
                id: activeChatId,
                otherPartyId,
                jobId: null,
                messages: [],
                company: displayName || "Работодатель",
                isEmployer: false,
                otherPartyAvatar: otherProfile?.avatar_url || null,
                isOnline: !!onlineUsers[activeChatId]
            });
        }

        // --- Injection: Add Welcome Message if Chat with Support is empty ---
        chatsMap.forEach((chat, id) => {
            const profile = profilesMap.get(chat.otherPartyId);
            const isSupport = profile?.username === 'temur@gmail.com' || chat.otherPartyId === supportUserId;

            if (isSupport && chat.messages.length === 0) {
                // Determine localized name for support
                const supportName = language === 'uz' ? "IshMarkaz yordami" : "Поддержка IshMarkaz";
                const welcomeText = language === 'ru'
                    ? "Здравствуйте! Это поддержка IshMarkaz. Напишите ваш вопрос или проблему, мы постараемся помочь."
                    : language === 'uz'
                        ? "Assalomu alaykum! Bu IshMarkaz qo'llab-quvvatlash xizmati. Savolingiz yoki muammoingizni yozing, biz yordam berishga harakat qilamiz."
                        : "Hello! This is IshMarkaz Support. Write your question, we'll try to help.";

                chat.messages.push({
                    id: 'welcome-system-msg',
                    senderId: chat.otherPartyId,
                    text: welcomeText,
                    is_read: true,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    senderName: supportName,
                    senderAvatar: profile?.avatar_url || null,
                    isVirtual: true // used to distinguish in UI if needed
                });
            }
        });
        // -------------------------------------------------------------------

        return Array.from(chatsMap.values()).sort((a, b) => {
            const lastA = a.messages[a.messages.length - 1]?.createdAtTs || 0;
            const lastB = b.messages[b.messages.length - 1]?.createdAtTs || 0;
            return lastB - lastA;
        });
    };

    const handleSetActiveChatId = (id) => {
        setActiveChatId(id);
        if (id) {
            sessionStorage.setItem('activeChatId', id);
        } else {
            sessionStorage.removeItem('activeChatId');
        }
    };

    const deleteMessagesWithUser = async (otherPartyId) => {
        await supabase.from('messages').delete().eq('sender_id', user.id).eq('receiver_id', otherPartyId);
        await supabase.from('messages').delete().eq('sender_id', otherPartyId).eq('receiver_id', user.id);

        setMessages(prev => prev.filter(msg =>
            !(msg.sender_id === user.id && msg.receiver_id === otherPartyId) &&
            !(msg.sender_id === otherPartyId && msg.receiver_id === user.id)
        ));
        if (activeChatId === otherPartyId) handleSetActiveChatId(null);
        return { success: true };
    };

    const markAsRead = async (chatId) => {
        if (!user || !chatId) return;

        // Find unread messages where user is receiver
        const unreadMsgIds = messages
            .filter(msg => msg.receiver_id === user.id && msg.sender_id === chatId && !msg.is_read)
            .map(msg => msg.id);

        if (unreadMsgIds.length === 0) return;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMsgIds);

        if (error) {
            console.error('Error marking messages as read:', error);
        } else {
            // Optimistic update
            setMessages(prev => prev.map(msg =>
                unreadMsgIds.includes(msg.id) ? { ...msg, is_read: true } : msg
            ));
        }
    };

    const startChat = (ownerId) => {
        handleSetActiveChatId(ownerId);

        // If we don't have the profile, fetch it
        if (!profilesMap.has(ownerId)) {
            supabase.from('profiles').select('*').eq('id', ownerId).single().then(({ data }) => {
                if (data) {
                    setProfilesMap(prev => new Map(prev).set(data.id, data));
                    // If this is support, remember the ID
                    if (data.username === 'temur@gmail.com') {
                        setSupportUserId(data.id);
                        sessionStorage.setItem('supportUserId', data.id);
                    }
                }
            });
        } else {
            // Check if existing profile in map is support
            const profile = profilesMap.get(ownerId);
            if (profile?.username === 'temur@gmail.com') {
                setSupportUserId(ownerId);
                sessionStorage.setItem('supportUserId', ownerId);
            }
        }
    };

    return (
        <ChatContext.Provider value={{
            messages,
            chats: getChats(),
            sendMessage,
            deleteChat: deleteMessagesWithUser,
            loading,
            loadingMore,
            hasMore,
            loadMoreMessages,
            refreshMessages: () => fetchMessages(false),
            markAsRead,
            onlineUsers,
            activeChatId,
            setActiveChatId: handleSetActiveChatId,
            startChat,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
