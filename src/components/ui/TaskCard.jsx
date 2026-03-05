import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import { Clock, Briefcase, Zap, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useModal } from '../../context/ModalContext';

export const TaskCard = ({ task }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { interests, toggleInterest } = useTasks();
    const { startChat } = useChat();
    const { openAuthModal } = useModal();
    const navigate = useNavigate();
    const [isInterestedLoading, setIsInterestedLoading] = useState(false);

    const isInterested = interests.includes(task.id);
    const isOwner = user?.id === (task.user_id || task.creatorId);

    const handleToggleInterest = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            openAuthModal();
            return;
        }
        setIsInterestedLoading(true);
        await toggleInterest(task.id);
        setIsInterestedLoading(false);
    };

    const handleContact = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            openAuthModal();
            return;
        }
        if (task) {
            startChat(task.user_id || task.creatorId, task.id);
            navigate('/messages');
        }
    };

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    const getRelativeTime = (date) => {
        if (!date) return "";
        const now = new Date();
        const postedDate = new Date(date);
        const diffInSeconds = Math.floor((now - postedDate) / 1000);

        if (diffInSeconds < 60) return t('task.justNow');

        if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}${t('task.minutes')} ${t('task.ago')}`;
        }
        if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}${t('task.hours')} ${t('task.ago')}`;
        }
        if (diffInSeconds < 604800) {
            return `${Math.floor(diffInSeconds / 86400)}${t('task.days')} ${t('task.ago')}`;
        }

        return `${Math.floor(diffInSeconds / 604800)}${t('task.week')} ${t('task.ago')}`;
    };

    return (
        <Card hover className="relative flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
            <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
                    <span className="flex items-center gap-1.5 font-medium text-white">
                        <Briefcase size={14} className="text-brand-orange" />
                        {task.company}
                    </span>
                    {task.category && (
                        <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-white/80">{getLocalizedContent(task.category)}</span>
                        </>
                    )}
                    <span className="hidden sm:inline">•</span>
                    <span>{task.created_at ? getRelativeTime(task.created_at) : getLocalizedContent(task.posted)}</span>
                    <span className="hidden sm:inline">•</span>
                    <Badge variant={(task.original_type || task.originalType || task.type) === "Trial Week" ? "orange" : "default"}>
                        {getLocalizedContent(task.type)}
                    </Badge>
                    {(task.status === 'closed' || task.workers_needed === 0) && (
                        <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">
                            {t('task.closed') || "Closed"}
                        </Badge>
                    )}
                    {task.interest_count > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded border border-brand-orange/10">
                            <Heart size={10} fill="currentColor" />
                            {task.interest_count} {language === 'ru' ? 'проявили интерес' : (language === 'uz' ? 'qiziqish bildirdi' : 'interested')}
                        </span>
                    )}
                </div>

                {task.created_at && (new Date() - new Date(task.created_at)) < 86400000 && (
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                        <span className="px-3 py-1 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-orange/30 border border-white/20">
                            NEW
                        </span>
                    </div>
                )}

                <h3 className="text-xl font-bold group-hover:text-brand-orange transition-colors">
                    {getLocalizedContent(task.title)}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-3 text-sm text-brand-muted">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {getLocalizedContent(task.time_required || task.timeRequired)}
                            </span>
                            <span className="flex items-center gap-1.5 text-brand-text font-bold">
                                <Zap size={14} className="text-yellow-500" />
                                {task.payment}
                            </span>
                        </div>

                        {/* Mobile Action Icons */}
                        {!isOwner && (
                            <div className="flex items-center gap-2 md:hidden">
                                <button
                                    onClick={handleToggleInterest}
                                    disabled={isInterestedLoading}
                                    className={`p-2 rounded-full transition-all ${isInterested
                                        ? 'bg-brand-orange/20 text-brand-orange'
                                        : 'bg-white/5 text-white/40 border border-white/5'
                                        }`}
                                >
                                    <Heart size={18} fill={isInterested ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={handleContact}
                                    className="p-2 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                >
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded text-white/70 w-fit">
                        {t('task.workersNeededLabel') || "Employees needed"}: {task.workers_needed || 1}
                        {(task.workers_hired > 0) && (
                            <span className="ml-1 text-brand-orange drop-shadow-sm font-semibold">
                                ({t('task.hired') || "Hired"}: {task.workers_hired} / {task.workers_needed || 1})
                            </span>
                        )}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(task.tags) && task.tags.map(tag => (
                        <span key={tag} className="text-xs bg-white/5 px-2 py-1 rounded text-brand-muted">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <Link to={`/task/${task.id}`} className="w-full md:w-auto">
                    <Button variant="secondary" className="w-full md:w-auto whitespace-nowrap">
                        {t('task.viewDetails')}
                    </Button>
                </Link>
            </div>
        </Card>
    );
};
