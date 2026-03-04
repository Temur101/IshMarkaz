import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MapPin, Briefcase, Award, Phone, Edit2, User, ChevronRight, X, UserCheck2, Clock, DollarSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { EditProfileModal } from '../components/ui/EditProfileModal';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { t, language } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentJobs, setCurrentJobs] = useState([]);
    const [isCurrentJobLoading, setIsCurrentJobLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);

    if (authLoading || !user) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Пользователь';
    const displayInitial = firstName ? firstName.charAt(0) : (user.email?.charAt(0) || 'U');

    const role = user.user_metadata?.role || 'Профессия не указана';
    const location = user.user_metadata?.location || 'Местоположение не указано';
    const phone = user.user_metadata?.phone || 'Телефон не указан';
    const skillsString = user.user_metadata?.skills || '';
    const skills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];
    const socialLinks = user.user_metadata?.social_links || [];

    const [workHistory, setWorkHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setIsHistoryLoading(true);
            try {
                const { data, error } = await supabase
                    .from('work_history')
                    .select(`
                        id,
                        event_type,
                        created_at,
                        jobs:job_id (title)
                    `)
                    .eq('worker_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    if (error.code !== 'PGRST116' && error.code !== '42P01') {
                        console.error('History Fetch Error:', error);
                    }
                    setWorkHistory([]);
                } else {
                    setWorkHistory(data || []);
                }
            } catch (err) {
                console.error('Work History Catch:', err);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    useEffect(() => {
        const fetchCurrentJobs = async () => {
            if (!user) return;
            setIsCurrentJobLoading(true);
            try {
                const { data: hireData, error: hireError } = await supabase
                    .from('job_hires')
                    .select(`
                        job_id,
                        hired_at,
                        status,
                        employment_type,
                        expected_end_date,
                        jobs (*)
                    `)
                    .eq('worker_id', user.id)
                    .eq('status', 'active')
                    .order('hired_at', { ascending: false });

                if (hireError) {
                    console.error('Database Error:', hireError);
                    if (hireError.code === 'PGRST116' || hireError.code === '42P01') {
                        console.warn('Database table job_hires might be missing or empty');
                    } else {
                        throw hireError;
                    }
                }

                if (hireData && hireData.length > 0) {
                    const jobsWithDetails = await Promise.all(hireData.map(async (h) => {
                        const job = { ...h.jobs };
                        job.hire_details = h;

                        // Fetch owner name
                        const { data: ownerData } = await supabase
                            .from('profiles')
                            .select('first_name, last_name, full_name')
                            .eq('id', job.user_id)
                            .single();

                        if (ownerData) {
                            job.owner_name = ownerData.full_name || `${ownerData.first_name} ${ownerData.last_name}`.trim() || 'Работодатель';
                        } else {
                            job.owner_name = 'Владелец вакансии';
                        }
                        return job;
                    }));

                    setCurrentJobs(jobsWithDetails);
                } else {
                    setCurrentJobs([]);
                }
            } catch (err) {
                console.error('Error fetching current jobs:', err);
                setCurrentJobs([]);
            } finally {
                setIsCurrentJobLoading(false);
            }
        };

        fetchCurrentJobs();
    }, [user]);

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    return (
        <DashboardLayout>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            {/* Current Job Detail Modal */}
            {isJobModalOpen && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsJobModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-brand-gray border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{getLocalizedContent(selectedJob.title)}</h2>
                                <p className="text-brand-orange font-medium">{selectedJob.company}</p>
                            </div>
                            <button onClick={() => setIsJobModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex flex-wrap gap-4 text-sm text-brand-muted">
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Clock size={16} className="text-brand-orange" />
                                    {getLocalizedContent(selectedJob.time_required || selectedJob.timeRequired)}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <DollarSign size={16} className="text-brand-orange" />
                                    {selectedJob.payment}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-white font-bold mb-2 text-sm uppercase tracking-wider opacity-60">Описание</h4>
                                <p className="text-brand-muted leading-relaxed">
                                    {getLocalizedContent(selectedJob.description)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setIsJobModalOpen(false)}>
                                Закрыть
                            </Button>
                            <Link to={`/task/${selectedJob.id}`} className="flex-1">
                                <Button className="w-full">
                                    Подробнее
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative mb-32 md:mb-24 px-1 lg:px-0">
                <div className="h-40 md:h-48 bg-gradient-to-r from-brand-orange/20 to-brand-black/50 rounded-2xl" />
                <div className="absolute -bottom-24 md:-bottom-16 left-4 md:left-8 flex items-center md:items-end gap-4 md:gap-6 flex-wrap md:flex-nowrap w-[calc(100%-32px)] md:w-auto">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-black border-4 border-brand-black flex items-center justify-center text-3xl md:text-4xl font-bold text-brand-orange shadow-2xl uppercase overflow-hidden shrink-0">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            displayInitial
                        )}
                    </div>
                    <div className="mb-2 flex-1 min-w-[200px]">
                        <h1 className="text-2xl md:text-3xl font-bold truncate">{fullName}</h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-brand-muted">
                            <span className="flex items-center gap-1.5 text-sm md:text-base"><Briefcase size={16} className="text-brand-orange" /> {role}</span>
                        </div>
                    </div>
                    <div className="w-full md:w-auto mt-2 md:mt-0 md:mb-4">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex items-center justify-center gap-2 w-full md:w-auto"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Edit2 size={16} />
                            Редактировать профиль
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Current Job Block */}
                    <Card className="p-8 border-l-4 border-brand-orange">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <UserCheck2 className="text-brand-orange" />
                            Нынешняя Работа
                        </h2>
                        {isCurrentJobLoading ? (
                            <div className="flex items-center gap-3 text-brand-muted animate-pulse">
                                <div className="w-10 h-10 bg-white/5 rounded-lg" />
                                <div className="h-4 w-32 bg-white/5 rounded" />
                            </div>
                        ) : currentJobs.length > 0 ? (
                            <div className="grid gap-4">
                                {currentJobs.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => { setSelectedJob(job); setIsJobModalOpen(true); }}
                                        className="group relative bg-white/5 border border-white/5 rounded-xl p-5 hover:border-brand-orange/30 hover:bg-white/[0.07] transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-brand-orange/10 transition-colors" />

                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition-colors">
                                                    {job.company}
                                                </h3>
                                                <p className="text-brand-muted flex items-center gap-2 text-sm">
                                                    {getLocalizedContent(job.title)}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {job.hire_details?.employment_type === 'trial' && (
                                                        <Badge variant="orange" className="text-[10px] py-0 px-2 h-5">Trial Week</Badge>
                                                    )}
                                                    {job.hire_details?.employment_type === 'temporary' && (
                                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 bg-blue-500/10 text-blue-400 border-blue-500/20">Temporary</Badge>
                                                    )}
                                                    {job.hire_details?.employment_type === 'trial' && job.hire_details?.expected_end_date && (
                                                        <div className="flex items-center gap-1 text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0 border border-brand-orange/20 rounded-full h-5">
                                                            <Clock size={10} />
                                                            {Math.ceil((new Date(job.hire_details.expected_end_date) - new Date()) / (1000 * 60 * 60 * 24))} дн. осталось
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="text-brand-muted group-hover:text-white transition-colors group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center">
                                <p className="text-brand-muted italic text-lg">Нигде не работает</p>
                            </div>
                        )}
                    </Card>

                    <Card className="p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Briefcase className="text-brand-orange" />
                            {language === 'ru' ? 'История работ' : 'Work History'}
                        </h2>
                        <div className="space-y-4">
                            {isHistoryLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-16 bg-white/5 rounded-xl" />
                                    <div className="h-16 bg-white/5 rounded-xl" />
                                </div>
                            ) : workHistory.length > 0 ? workHistory.map((item) => (
                                <div key={item.id} className="group flex justify-between items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.event_type === 'hired' ? 'bg-green-500/10 text-green-400' :
                                            item.event_type === 'fired' ? 'bg-red-500/10 text-red-400' :
                                                'bg-brand-orange/10 text-brand-orange'
                                            }`}>
                                            {item.event_type === 'hired' ? <UserCheck2 size={20} /> : <Briefcase size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">
                                                {item.event_type === 'hired' ? (language === 'ru' ? 'Принят на работу' : 'Hired') :
                                                    item.event_type === 'trial_completed' ? (language === 'ru' ? 'Завершил пробную неделю' : 'Trial week completed') :
                                                        item.event_type === 'completed' ? (language === 'ru' ? 'Выполнил временную работу' : 'Worked temporary job') :
                                                            (language === 'ru' ? 'Закончил работу' : 'Work ended')}
                                            </h3>
                                            <p className="text-brand-muted text-sm">
                                                {getLocalizedContent(item.jobs?.title) || "Вакансия"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge
                                            variant={item.event_type === 'hired' ? 'success' : item.event_type === 'fired' ? 'danger' : 'orange'}
                                            className={`mb-1 ${item.event_type === 'fired' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}`}
                                        >
                                            {item.event_type === 'hired' ? (language === 'ru' ? 'Принят' : 'Hired') :
                                                item.event_type === 'trial_completed' ? (language === 'ru' ? 'Успешно' : 'Completed') :
                                                    item.event_type === 'completed' ? (language === 'ru' ? 'Выполнено' : 'Finished') :
                                                        (language === 'ru' ? 'Завершено' : 'Ended')}
                                        </Badge>
                                        <p className="text-[10px] text-brand-muted uppercase tracking-wider">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                    <Briefcase size={32} className="mx-auto text-white/10 mb-2" />
                                    <p className="text-brand-muted italic">История работ пуста</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <User size={18} className="text-brand-orange" />
                            Личная информация
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex flex-col gap-1">
                                <span className="text-xs text-brand-muted uppercase tracking-wider">Местоположение</span>
                                <span className="text-sm flex items-center gap-2 font-medium">
                                    <MapPin size={14} className="text-brand-orange" />
                                    {location}
                                </span>
                            </li>
                            <li className="flex flex-col gap-1">
                                <span className="text-xs text-brand-muted uppercase tracking-wider">Телефон</span>
                                <span className="text-sm flex items-center gap-2 font-medium">
                                    <Phone size={14} className="text-brand-orange" />
                                    {phone}
                                </span>
                            </li>
                            {socialLinks.length > 0 && (
                                <li className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                    <span className="text-xs text-brand-muted uppercase tracking-wider">Социальные сети</span>
                                    <div className="grid gap-2">
                                        {socialLinks.map((link, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between border border-white/5 group transition-colors hover:border-brand-orange/30">
                                                <span className="text-xs font-bold text-brand-orange">{link.platform}</span>
                                                <span className="text-xs text-white/80">{link.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            )}
                        </ul>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Award size={18} className="text-brand-orange" />
                            {t('profile.verifiedSkills')}
                        </h3>
                        {skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {skills.map(skill => (
                                    <Badge key={skill} variant="orange" className="text-xs py-1 px-2">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-brand-muted italic text-sm">Навыки не указаны</p>
                        )}
                    </Card>

                    {user?.user_metadata?.about && (
                        <Card className="p-6 bg-brand-orange/5 border-brand-orange/20">
                            <p className="text-sm text-brand-muted italic">
                                "{user?.user_metadata?.about}"
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
