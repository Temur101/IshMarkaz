import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Briefcase, Building, Clock, ChevronRight } from 'lucide-react';

export default function InterestedJobs() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [interestedJobs, setInterestedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInterestedJobs = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('job_interests')
                .select(`
                    job_id,
                    jobs (*)
                `)
                .eq('user_id', user.id);

            if (error) throw error;
            setInterestedJobs(data.map(item => item.jobs));
        } catch (err) {
            console.error('Error fetching interested jobs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInterestedJobs();
    }, [user]);

    const getLocalizedContent = (content) => {
        if (typeof content === 'object' && content !== null) {
            return content[language] || content['en'] || Object.values(content)[0] || "";
        }
        return content || "";
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {language === 'ru' ? 'Мои интересы' : language === 'uz' ? 'Mening qiziqishlarim' : 'My Interests'}
                </h1>
                <p className="text-brand-muted">
                    {language === 'ru' ? 'Вакансии, которыми вы заинтересовались' : language === 'uz' ? 'Sizni qiziqtirgan vakansiyalar' : 'Jobs you are interested in'}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                </div>
            ) : interestedJobs.length === 0 ? (
                <Card className="p-12 text-center bg-white/5 border-dashed border-white/10">
                    <div className="mb-4 flex justify-center text-brand-muted">
                        <Briefcase size={48} />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                        {language === 'ru' ? 'Список пуст' : language === 'uz' ? 'Ro\'yxat bo\'sh' : 'List is empty'}
                    </h3>
                    <p className="text-brand-muted mb-6">
                        {language === 'ru' ? 'Вы еще не проявляли интерес к вакансиям.' : language === 'uz' ? 'Siz hali vakansiyalarga qiziqish bildirmadingiz.' : 'You haven\'t expressed interest in any jobs yet.'}
                    </p>
                    <Link to="/dashboard" className="text-brand-orange hover:underline font-medium">
                        {t('hero.startWorking')}
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {interestedJobs.map(job => (
                        <Link key={job.id} to={`/task/${job.id}`}>
                            <Card className="p-6 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant={job.status === 'closed' ? 'secondary' : 'default'} className={job.status === 'closed' ? 'bg-white/5' : ''}>
                                                {job.status === 'closed' ? t('task.closed') : 'OPEN'}
                                            </Badge>
                                            <span className="text-xs text-brand-muted">
                                                {getLocalizedContent(job.type)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 group-hover:text-brand-orange transition-colors">
                                            {getLocalizedContent(job.title)}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-brand-muted">
                                            <div className="flex items-center gap-1">
                                                <Building size={14} />
                                                {job.company}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {getLocalizedContent(job.time_required || job.timeRequired)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className="font-bold text-white mb-1">{job.payment}</div>
                                            <div className="text-xs text-brand-muted">
                                                {job.workers_hired} / {job.workers_needed} {t('task.hired')}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-brand-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
