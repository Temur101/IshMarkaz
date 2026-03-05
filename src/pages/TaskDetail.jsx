import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Clock, Briefcase, Zap, CheckCircle2, Building, Flag, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useModal } from '../context/ModalContext';

export default function TaskDetail() {
    const { id } = useParams();
    const { t, language } = useLanguage();
    const { tasks } = useTasks();
    const { user } = useAuth();
    const { startChat } = useChat();
    const { openAuthModal } = useModal();
    const { interests, toggleInterest } = useTasks();
    const navigate = useNavigate();
    const [isInterestedLoading, setIsInterestedLoading] = useState(false);

    const task = tasks.find(t => t.id === parseInt(id) || t.id.toString() === id);

    const handleContact = () => {
        if (!user) {
            openAuthModal();
            return;
        }
        if (task) {
            startChat(task.user_id || task.creatorId, task.id);
            navigate('/messages');
        }
    };

    const handleToggleInterest = async () => {
        if (!user) {
            openAuthModal();
            return;
        }
        if (!task) return;
        setIsInterestedLoading(true);
        await toggleInterest(task.id);
        setIsInterestedLoading(false);
    };

    const isInterested = interests.includes(task.id);
    const isOwner = user?.id === (task.user_id || task.creatorId);

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    if (!task) {
        return <DashboardLayout>Task not found</DashboardLayout>;
    }

    const evaluationList = Array.isArray(t('task.evaluationList'))
        ? t('task.evaluationList')
        : [];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <Link to="/dashboard" className="flex items-center gap-2 text-brand-muted hover:text-white mb-8 group transition-colors">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    {t('task.backToDashboard')}
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Badge variant={(task.original_type || task.originalType || task.type) === "Trial Week" ? "orange" : "default"}>
                                {getLocalizedContent(task.type)}
                            </Badge>
                            <span className="text-brand-muted">{getLocalizedContent(task.posted)}</span>
                            {task.category && (
                                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">
                                    {getLocalizedContent(task.category)}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{getLocalizedContent(task.title)}</h1>
                        <div className="flex items-center gap-6 text-brand-muted">
                            <span className="flex items-center gap-2">
                                <Building size={18} />
                                {task.company}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={18} />
                                {getLocalizedContent(task.time_required || task.timeRequired)}
                            </span>
                        </div>
                    </div>
                    <div className="md:text-right flex flex-col md:items-end gap-4 w-full md:w-auto">
                        <div className="flex items-center justify-between md:justify-end w-full gap-4">
                            <div className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                                <Zap size={24} className="text-brand-orange" />
                                {task.payment}
                            </div>

                            {task.interest_count > 0 && (
                                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange/10 border border-brand-orange/20 rounded-full">
                                    <Heart size={14} className="text-brand-orange" fill="currentColor" />
                                    <span className="text-sm font-bold text-brand-orange">
                                        {task.interest_count} {language === 'ru' ? 'проявили интерес' : (language === 'uz' ? 'qiziqish bildirdi' : 'interested')}
                                    </span>
                                </div>
                            )}

                            {/* Mobile Action Icons */}
                            {!isOwner && (
                                <div className="flex items-center gap-3 md:hidden">
                                    <button
                                        onClick={handleToggleInterest}
                                        disabled={isInterestedLoading}
                                        className={`p-2.5 rounded-full transition-all ${isInterested
                                            ? 'bg-brand-orange/20 text-brand-orange'
                                            : 'bg-white/5 text-white/40 border border-white/5'
                                            }`}
                                    >
                                        <Heart size={20} fill={isInterested ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={handleContact}
                                        className="p-2.5 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                    >
                                        <MessageSquare size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isOwner ? (
                            <div className="hidden md:block px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-brand-muted text-sm font-medium w-full md:w-auto text-center">
                                {language === 'ru' ? 'Это ваша вакансия' : language === 'uz' ? 'Bu sizning vakansiyangiz' : 'This is your vacancy'}
                            </div>
                        ) : (
                            <div className="hidden md:flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <Button
                                    size="lg"
                                    variant={isInterested ? "secondary" : "ghost"}
                                    className={`flex-1 sm:flex-none px-8 ${isInterested ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-white/10'}`}
                                    onClick={handleToggleInterest}
                                    disabled={isInterestedLoading}
                                >
                                    {isInterestedLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                                    ) : (
                                        isInterested ? (t('task.interestedDone') || "Вы заинтересованы") : (t('task.interest') || "Заинтересовался")
                                    )}
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 sm:flex-none px-10 shadow-xl shadow-brand-orange/20"
                                    onClick={handleContact}
                                >
                                    {t('task.acceptChallenge')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="md:col-span-2 space-y-8">
                    <Card className="p-8">
                        <h2 className="text-2xl font-bold mb-4">{t('task.description')}</h2>
                        <div className="text-brand-muted text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                            {getLocalizedContent(task.description)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(task.tags) && task.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-brand-muted">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </Card>

                    {((task.evaluation_list || task.evaluationList) && (task.evaluation_list || task.evaluationList).length > 0) && (
                        <Card className="p-8 border-brand-orange/20 bg-brand-orange/5">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-brand-orange" />
                                {t('task.evaluation')}
                            </h3>
                            <ul className="space-y-3 text-brand-muted list-disc pl-5">
                                {(task.evaluation_list || task.evaluationList).map((item, index) => (
                                    <li key={index}>{getLocalizedContent(item)}</li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">{t('task.aboutCompany')} {task.company}</h3>
                        <p className="text-brand-muted text-sm mb-4">
                            {t('task.companyDesc')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-brand-muted">
                            <Flag size={14} />
                            {t('task.verifiedEmployer')}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">{t('task.similarTasks')}</h3>
                        <div className="space-y-4">
                            {tasks.filter(t => t.id !== task.id).slice(0, 2).map(t => (
                                <Link key={t.id} to={`/task/${t.id}`} className="block group">
                                    <div className="text-sm font-medium group-hover:text-brand-orange transition-colors mb-1">
                                        {getLocalizedContent(t.title)}
                                    </div>
                                    <div className="text-xs text-brand-muted">{t.payment} • {getLocalizedContent(t.time_required || t.timeRequired)}</div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
